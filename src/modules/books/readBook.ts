/**
 * [INPUT]: 依赖 obsidian 的 Notice/TFile；依赖 core/commands 的 BOOK_COMMANDS、
 *          core/constants 的 BOOK_HEADINGS、core/modals 的 TextInputModal/ChoiceModal、
 *          core/types 的 ZiminosContext；依赖同目录 douban 的搜索与详情、
 *          sources 的 collectHighlightsFor、importHighlights 的 mergeHighlights、
 *          createBook 的 BookContainerCreator 洞
 * [OUTPUT]: 对外提供 registerReadBookCommand（命令 read-book：一步建书并把划线灌进去）
 * [POS]: 读书笔记模块的主干命令，也是整个模块存在的理由。
 *        它取代的是学员原本的三步：豆瓣插件建档 → 划线插件导到某个文件夹 → 手工复制粘贴汇总。
 *        那三步里有两步是机器该干的活儿：书目字段（出版社、ISBN、页数、评分）机器查得到，
 *        划线在哪台设备上机器也查得到；只有「是不是这一本」必须人来指认。
 *        因此这条命令只问两件事——书名叫什么、候选里哪一本——其余全自动：
 *        抓详情 → 建《书名》文件夹与 MOC（YAML 与书籍信息小节都已填好）→
 *        遍历本机可用的划线来源 → 按书名认出这本书 → 划线直接落进「全部划线」小节。
 *        中间不产生任何需要学员再搬一次的中转文件，这正是「一步」的全部含义
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Notice } from 'obsidian';
import type { TFile } from 'obsidian';
import { BOOK_COMMANDS } from '../../core/commands';
import { BOOK_HEADINGS } from '../../core/constants';
import { ChoiceModal, TextInputModal } from '../../core/modals';
import type { ZiminosContext } from '../../core/types';
import type { BookContainerCreator } from './createBook';
import { doubanFetcher, fetchBookDetail, searchBooks } from './douban';
import type { DoubanBook, DoubanCandidate } from './douban';
import { mergeHighlights } from './importHighlights';
import { availableSourceLabels, collectHighlightsFor } from './sources';
import { loginWeread } from './sourceWeread';
import { allBookMocs, bookNameOf, isBookMoc } from './identity';

const MESSAGES = {
    namePrompt: '想读哪本书？',
    namePlaceholder: '书名，例如：卡片笔记写作法',
    nameMissing: '没有输入书名，操作已取消。',
    searching: '正在豆瓣上找这本书……',
    searchFailed: '没能连上豆瓣。检查一下网络，或者用「新建读书笔记」手动建一本。',
    noResult: '豆瓣上没找到这本书。换个书名再试，或者用「新建读书笔记」手动建一本。',
    pickBook: '是这一本吗？',
    detailFailed: '取书籍详情失败：',
    pulling: '书建好了，正在找这本书的划线……',
    noSource: '这台机器上没找到划线来源（苹果图书要在本机读过，Kindle 要插上或有 My Clippings.txt）。用「导入读书划线」粘贴也行。',
    noHighlights: '没在设备里找到这本书的划线。读一阵子再回来跑「同步这本书的划线」。',
} as const;

/** 注册「读一本书」命令 */
export function registerReadBookCommand(
    ctx: ZiminosContext,
    create: BookContainerCreator,
): void {
    ctx.commands.register(BOOK_COMMANDS.read, () => {
        void readBook(ctx, create);
    });
}

/**
 * 一步读一本书：问书名 → 选一本 → 建档 → 灌划线。
 * 任何一步失败都以中文 Notice 收场，且已经建出来的东西不回滚——
 * 书建好了但划线没拉到，那本书仍然是有用的。
 */
async function readBook(ctx: ZiminosContext, create: BookContainerCreator): Promise<void> {
    // ============================================================
    // 1. 问书名（学员的第一次、也是仅有的两次输入之一）
    // ============================================================

    const input = await new TextInputModal(ctx.app, {
        title: MESSAGES.namePrompt,
        placeholder: MESSAGES.namePlaceholder,
    }).openAndGetValue();

    if (input === null || !input.trim()) {
        new Notice(MESSAGES.nameMissing);

        return;
    }

    // ============================================================
    // 2. 搜豆瓣，让他指认哪一本（第二次、也是最后一次输入）
    // ============================================================

    const searching = new Notice(MESSAGES.searching, 0);
    let candidates: readonly DoubanCandidate[];

    try {
        candidates = await searchBooks(doubanFetcher, input.trim());
    } catch (error) {
        searching.hide();
        // 反爬拦截与断网是两回事，解析层已经把前者说成一句人话，原样转出去
        new Notice(describe(error) || MESSAGES.searchFailed, 10000);

        return;
    }

    searching.hide();

    if (!candidates.length) {
        new Notice(MESSAGES.noResult, 8000);

        return;
    }

    const chosen = await new ChoiceModal(ctx.app, {
        title: MESSAGES.pickBook,
        items: candidates,
        // 摘要那一行是豆瓣给的「作者 / 译者 / 出版社 / 年份 / 定价」，同名书全靠它分辨
        labelOf: (item) => (item.abstract ? `${item.title}　—　${item.abstract}` : item.title),
    }).openAndGetChoice();

    if (!chosen) return;

    // ============================================================
    // 3. 抓详情并建档：YAML 与书籍信息小节都已填好，学员一个字不用打
    // ============================================================

    let detail: DoubanBook;

    try {
        detail = await fetchBookDetail(doubanFetcher, chosen.id, chosen.title, chosen.abstract);
    } catch (error) {
        new Notice(MESSAGES.detailFailed + describe(error), 8000);

        return;
    }

    const moc = await create({
        name: `《${detail.title}》`,
        description: detail.summary.slice(0, 120),
        ...(detail.authors.length ? { author: detail.authors[0] } : {}),
        ...(fullTitleOf(detail) ? { aliases: [fullTitleOf(detail)] } : {}),
        source: detail.url,
        sections: [
            { heading: BOOK_HEADINGS.info, body: bookInfoBody(detail) },
            { heading: BOOK_HEADINGS.highlights },
        ],
    });

    // 建档失败（重名、名称非法、用户取消）已由容器流程给出中文 Notice，这里不再补刀
    if (!moc) return;

    // ============================================================
    // 4. 自动找划线：不问他在哪个 App 里读的，机器自己查
    // ============================================================

    await pullHighlights(ctx, moc, detail.title, detail.authors[0] ?? '');
}

/**
 * 从本机可用来源取这本书的划线并合并进 MOC。
 *
 * 单独成函数是因为它还要服务第二条命令（「同步这本书的划线」）——
 * 读到一半再拉一次是常事，而那次不该重新建档。
 */
export async function pullHighlights(
    ctx: ZiminosContext,
    moc: TFile,
    title: string,
    author: string,
): Promise<void> {
    const labels = availableSourceLabels(ctx);

    if (!labels.length) {
        new Notice(MESSAGES.noSource, 10000);

        return;
    }

    const pulling = new Notice(MESSAGES.pulling, 0);
    const hits = await collectHighlightsFor(ctx, title, author);

    pulling.hide();

    if (!hits.length) {
        new Notice(`${MESSAGES.noHighlights}（已查过：${labels.join('、')}）`, 8000);

        return;
    }

    // 多个来源的划线一次性合并：mergeHighlights 按归一文本去重，
    // 同一句话在手机和 Kindle 上各划过一次也只会写进去一条
    const all = hits.flatMap((hit) => [...hit.highlights]);

    ctx.guard.mark(moc.path);
    await ctx.app.vault.process(moc, (content) => mergeHighlights(content, all).content);

    const outcome = mergeHighlights(await ctx.app.vault.read(moc), all);
    const from = hits.map((hit) => `${hit.label} ${hit.highlights.length} 条`).join('、');

    new Notice(
        outcome.skipped && !outcome.added
            ? `划线已是最新（${from}）。`
            : `已从 ${from} 取回划线，写进《${title}》。`,
        6000,
    );
}

// ============================================================
// 文本
// ============================================================

/** 带副标题的全名，用作别名；没有副标题就返回空串 */
function fullTitleOf(book: DoubanBook): string {
    return book.subtitle ? `${book.title}：${book.subtitle}` : '';
}

/**
 * 「书籍信息」小节的正文。
 *
 * 只写机器查得到、且学员会想看的那几项；封面单独一行图片——
 * 它是这一页唯一的视觉锚点，翻到这本书时一眼认得出。
 * 空字段整行不写：一行「ISBN：」比没有这一行更让人以为是自己漏填了。
 */
function bookInfoBody(book: DoubanBook): string {
    const rows: string[] = [];
    const add = (label: string, value: string): void => {
        if (value) rows.push(`- ${label}：${value}`);
    };

    add('作者', book.authors.join('、'));
    add('译者', book.translators.join('、'));
    add('出版社', book.publisher);
    add('出版年', book.publishDate);
    add('页数', book.pages);
    add('ISBN', book.isbn);
    add('豆瓣评分', book.rating);
    rows.push(`- 豆瓣：${book.url}`);

    if (book.cover) rows.push('', `![封面|140](${book.cover})`);

    return rows.join('\n');
}

/** 把任意异常转成一句可读的中文尾巴 */
function describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

// ============================================================
// 同步：读到一半再拉一次
// ============================================================

/**
 * 注册「同步这本书的划线」。
 * 站在某本书的 MOC 上按它即可；站在别处会先让他选一本——
 * 与导入命令同一条待客之道，不因为「你站错了」就拒绝办事。
 */
export function registerSyncHighlightsCommand(ctx: ZiminosContext): void {
    ctx.commands.register(BOOK_COMMANDS.sync, () => {
        void syncCurrentBook(ctx);
    });
}

async function syncCurrentBook(ctx: ZiminosContext): Promise<void> {
    const active = ctx.app.workspace.getActiveFile();
    const target =
        active && isBookMoc(ctx, active)
            ? active
            : await pickBook(ctx);

    if (!target) return;

    const name = stripBraces(bookNameOf(target));
    const author = firstAuthorOf(ctx, target);

    await pullHighlights(ctx, target, name, author);
}

/** 从全库的书里选一本 */
async function pickBook(ctx: ZiminosContext): Promise<TFile | null> {
    const books = allBookMocs(ctx);

    if (!books.length) {
        new Notice('还没有任何读书笔记。先运行「读一本书」。');

        return null;
    }

    return new ChoiceModal(ctx.app, {
        title: '同步哪本书的划线？',
        items: books,
        labelOf: (file) => bookNameOf(file),
    }).openAndGetChoice();
}

/** 书的 MOC 上写着的第一位作者，用来给书名匹配再收一道口 */
function firstAuthorOf(ctx: ZiminosContext, moc: TFile): string {
    const raw = ctx.app.metadataCache.getFileCache(moc)?.frontmatter?.author;
    const list = Array.isArray(raw) ? raw : [raw];

    return String(list[0] ?? '').trim();
}

/** 《书名》→ 书名 */
function stripBraces(name: string): string {
    const inner = /^《(.+)》$/.exec(name);

    return inner ? inner[1] : name;
}

// ============================================================
// 连接微信读书
// ============================================================

/**
 * 注册「连接微信读书」。
 * 一辈子按一次：扫码之后，「读一本书」与「同步这本书的划线」就会自动去微读取数。
 */
export function registerConnectWereadCommand(ctx: ZiminosContext): void {
    ctx.commands.register(BOOK_COMMANDS.connectWeread, () => {
        void (async () => {
            const ok = await loginWeread(ctx);

            new Notice(
                ok
                    ? '微信读书已连上。以后「读一本书」会自动把你在微读上的划线一并取回来。'
                    : '没有连上微信读书。窗口关掉了、或者还没扫码；随时可以再按一次。',
                8000,
            );
        })();
    });
}
