/**
 * [INPUT]: 依赖同目录 sourceAppleBooks 与 sourceKindle 的探测与取数函数，
 *          以及 parsers 的 ParsedHighlight 类型
 * [OUTPUT]: 对外提供 SourceBook/SourceHit 契约、collectHighlightsFor（按书名从全部可用来源取划线）
 *           与 availableSourceLabels（这台机器上此刻有哪些来源）
 * [POS]: 划线来源的汇流处。它存在的理由是「一步」这个目标本身：
 *        学员不该被问「你这本书的划线在哪个 App 里」——那是他刚刚做完的事，机器自己能查。
 *        于是本文件把「有哪些来源、这台机器上哪些能用、哪一本对得上」收成一个问题，
 *        建书流程只管拿结果。三条纪律：
 *        其一，**探测不抛异常**——某个来源坏了（设备拔了、库文件锁着）不该拖垮整条流程，
 *        它只是这次没有贡献而已；
 *        其二，**书名匹配从严到宽**——先逐字，再去标点空白，最后互相包含；
 *        宁可漏一本让学员手动指，也不能把《人类简史》的划线倒进《未来简史》；
 *        其三，来源之间**不去重**——那是 mergeHighlights 的活儿，它按归一文本去重，
 *        同一句话从两个设备来也只会写进去一次
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { ParsedHighlight } from './parsers';
import type { ZiminosContext } from '../../core/types';
import { listWereadBooks, readWereadBookHighlights, wereadAvailable } from './sourceWeread';
import {
    appleBooksAvailable,
    listAppleBooks,
    readAppleBookHighlights,
} from './sourceAppleBooks';
import { kindleAvailable, listKindleBooks, readKindleBookHighlights } from './sourceKindle';

// ============================================================
// 契约
// ============================================================

/** 某个来源里的一本书 */
export interface SourceBook {
    readonly label: string;
    readonly id: string;
    readonly title: string;
    readonly author: string;
}

/** 一次命中：哪个来源、哪本书、多少条划线 */
export interface SourceHit {
    readonly label: string;
    readonly title: string;
    readonly highlights: readonly ParsedHighlight[];
}

// ============================================================
// 探测
// ============================================================

/** 这台机器此刻能用的来源名，用于在提示里如实交代「查过哪几处」 */
export function availableSourceLabels(ctx: ZiminosContext): readonly string[] {
    const labels: string[] = [];

    if (wereadAvailable(ctx)) labels.push('微信读书');
    if (appleBooksAvailable()) labels.push('苹果图书');
    if (kindleAvailable()) labels.push('Kindle');

    return labels;
}

// ============================================================
// 按书名取划线
// ============================================================

/**
 * 从全部可用来源里，把这本书的划线都取回来。
 *
 * 每个来源各自 try/catch：读苹果图书要起一个 sqlite3 子进程、读 Kindle 要碰一个
 * 随时可能被拔掉的卷宗，任何一处失手都只是少一个来源，不该让整条建书流程失败——
 * 学员此刻要的是那本书建出来，划线是锦上添花。
 */
export async function collectHighlightsFor(
    ctx: ZiminosContext,
    title: string,
    author = '',
): Promise<readonly SourceHit[]> {
    const hits: SourceHit[] = [];

    try {
        if (wereadAvailable(ctx)) {
            const books = (await listWereadBooks(ctx)).map((book) => ({ ...book, label: '微信读书' }));
            const matched = matchBook(books, title, author);

            if (matched) {
                const highlights = await readWereadBookHighlights(ctx, matched.id);

                if (highlights.length) {
                    hits.push({ label: '微信读书', title: matched.title, highlights });
                }
            }
        }
    } catch {
        // 登录过期或接口变了：少一个来源，另两个照常
    }

    try {
        if (appleBooksAvailable()) {
            const books = (await listAppleBooks()).map((book) => ({ ...book, label: '苹果图书' }));
            const matched = matchBook(books, title, author);

            if (matched) {
                const highlights = await readAppleBookHighlights(matched.id);

                if (highlights.length) {
                    hits.push({ label: '苹果图书', title: matched.title, highlights });
                }
            }
        }
    } catch {
        // 苹果图书这一支失手：少一个来源而已
    }

    try {
        if (kindleAvailable()) {
            const books = listKindleBooks().map((book) => ({
                label: 'Kindle',
                id: book.title,
                title: book.title,
                author: book.author,
            }));
            const matched = matchBook(books, title, author);

            if (matched) {
                const highlights = readKindleBookHighlights(matched.title);

                if (highlights.length) {
                    hits.push({ label: 'Kindle', title: matched.title, highlights });
                }
            }
        }
    } catch {
        // 同上
    }

    return hits;
}

// ============================================================
// 书名匹配
// ============================================================

/**
 * 在一批书里找出「就是这一本」。
 *
 * 三轮从严到宽：逐字 → 去掉书名号标点空白后逐字 → 互相包含。
 * 最后那一轮是为副标题准备的：豆瓣叫《卡片笔记写作法》，
 * 苹果图书里可能叫《卡片笔记写作法：如何实现从阅读到写作》。
 * 但互相包含也要求较短的那个不少于四个字——两个字的书名（《活着》）
 * 会包含进太多别的书里，那种误配比漏配难发现得多。
 * 有作者信息时，第三轮还要求作者也对得上一半，再收一道口。
 */
function matchBook<T extends SourceBook>(
    books: readonly T[],
    title: string,
    author: string,
): T | null {
    const exact = books.find((book) => book.title === title);

    if (exact) return exact;

    const key = normalize(title);
    const normalized = books.find((book) => normalize(book.title) === key);

    if (normalized) return normalized;

    if (key.length < 4) return null;

    const authorKey = normalize(author);

    return (
        books.find((book) => {
            const candidate = normalize(book.title);
            const overlaps =
                candidate.length >= 4 && (candidate.includes(key) || key.includes(candidate));

            if (!overlaps) return false;
            if (!authorKey) return true;

            // 作者对得上一半即可：豆瓣写「[德] 申克·阿伦斯」，设备里可能只有「申克·阿伦斯」
            const bookAuthor = normalize(book.author);

            return !bookAuthor || bookAuthor.includes(authorKey) || authorKey.includes(bookAuthor);
        }) ?? null
    );
}

/** 归一：剥书名号、去掉全部空白与常见标点，只留「是不是同一本书」这件事 */
function normalize(value: string): string {
    return value
        .replace(/^《|》$/g, '')
        .replace(/[\s：:，,。.、·・\-—_()（）[\]【】"'"'?？!！]/g, '')
        .toLowerCase();
}
