/**
 * [INPUT]: 依赖 obsidian 的 Platform/Notice/requestUrl（后者是公开 API，可自定义请求头与携带 Cookie）；
 *          运行时按需 require('@electron/remote') 取 BrowserWindow（登录窗口，仅桌面端）；
 *          依赖 core/types 的 ZiminosContext、parsers 的 ParsedHighlight
 * [OUTPUT]: 对外提供 wereadAvailable、loginWeread、listWereadBooks、readWereadBookHighlights
 * [POS]: 划线来源之一：微信读书。三个来源里唯一需要登录的一个，也因此是唯一会失效的一个。
 *        它与另两个来源的分工写在这里：苹果图书与 Kindle 的数据在本机，读它们是确定的；
 *        微信读书的数据在腾讯的服务器上，只能带着登录态去要。
 *        登录只做一次且不碰账号密码——开一个真正的浏览器窗口让学员用微信扫码，
 *        成功后从那个窗口的会话里取走 Cookie。这是 Obsidian 生态里这类插件的通行做法，
 *        也是唯一不必让学员去开发者工具里手抄一长串 Cookie 的做法。
 *        取数三个接口各司其职：书架（哪些书有笔记）、划线、想法；章节名单独取一次，
 *        因为划线接口只给 chapterUid 不给章节名，而章节是「全部划线」小节的骨架
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Platform, requestUrl } from 'obsidian';
import type { ZiminosContext } from '../../core/types';
import type { ParsedHighlight } from './parsers';

// ============================================================
// 契约
// ============================================================

/** 微信读书书架里的一本有笔记的书 */
export interface WereadBook {
    readonly id: string;
    readonly title: string;
    readonly author: string;
}

const BASE = 'https://weread.qq.com';

/** 登录成功的判据：这两个 Cookie 同时在，就是登录态 */
const REQUIRED_COOKIES = ['wr_vid', 'wr_skey'];

// ============================================================
// 登录
// ============================================================

/** 已经连上微信读书了没有。判据是设置里存着 Cookie，真假由第一次取数去验 */
export function wereadAvailable(ctx: ZiminosContext): boolean {
    return Platform.isDesktopApp && !!ctx.settings.wereadCookie.trim();
}

/**
 * 开一个窗口让学员扫码登录，成功后把 Cookie 收进设置。
 *
 * 用真正的浏览器窗口而不是自己实现扫码：微信的登录协议会变，而那个窗口里跑的
 * 就是微信读书官方的登录页，它变它自己的，我们只负责在登录成功后取走 Cookie。
 * 插件全程不碰账号密码，也不接触二维码本身。
 *
 * 返回 true 表示拿到了登录态。窗口被关掉、或超时未登录都返回 false 而不抛错——
 * 「我又不想登了」是一个正当选择，不该以异常收场。
 */
export async function loginWeread(ctx: ZiminosContext): Promise<boolean> {
    const BrowserWindow = resolveBrowserWindow();

    if (!BrowserWindow) return false;

    return new Promise<boolean>((resolve) => {
        const win = new BrowserWindow({
            width: 480,
            height: 660,
            title: '登录微信读书（用微信扫码）',
            autoHideMenuBar: true,
            webPreferences: { nodeIntegration: false, contextIsolation: true },
        });

        let settled = false;
        const finish = (ok: boolean): void => {
            if (settled) return;

            settled = true;
            window.clearInterval(timer);

            try {
                if (!win.isDestroyed()) win.close();
            } catch {
                // 窗口已经被用户关掉了，正是我们要的结果之一
            }

            resolve(ok);
        };

        /**
         * 轮询会话里的 Cookie 而不是监听某个跳转地址：
         * 微信读书登录成功后的落地页改过不止一次，而「Cookie 里有没有 wr_skey」
         * 是这件事本身，不随页面结构变。这个轮询只活在登录窗口开着的那几十秒里，
         * 与「插件内无后台轮询」那条纪律说的不是一回事——它有明确的起止与用户在场。
         */
        const timer = window.setInterval(() => {
            void (async () => {
                try {
                    if (win.isDestroyed()) {
                        finish(false);

                        return;
                    }

                    const cookies = await win.webContents.session.cookies.get({
                        domain: '.weread.qq.com',
                    });
                    const names = cookies.map((cookie: { name: string }) => cookie.name);

                    if (!REQUIRED_COOKIES.every((name) => names.includes(name))) return;

                    ctx.settings.wereadCookie = cookies
                        .map((cookie: { name: string; value: string }) => `${cookie.name}=${cookie.value}`)
                        .join('; ');
                    await ctx.saveSettings();
                    finish(true);
                } catch {
                    finish(false);
                }
            })();
        }, 1000);

        win.on('closed', () => finish(false));
        void win.loadURL(`${BASE}/#login`);
    });
}

/**
 * 取 Electron 的 BrowserWindow。
 *
 * 它住在 Obsidian 自带的 `@electron/remote` 里（桌面版 app.asar 内实测存在）。
 * 全程 try/catch 且返回可空：移动端没有 require、Obsidian 日后换掉这个模块，
 * 都只该让「连接微信读书」这一条命令失灵，而不是让插件加载失败。
 */
function resolveBrowserWindow(): (new (options: unknown) => WereadWindow) | null {
    if (!Platform.isDesktopApp) return null;

    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const remote = require('@electron/remote') as { BrowserWindow?: unknown };

        return typeof remote?.BrowserWindow === 'function'
            ? (remote.BrowserWindow as new (options: unknown) => WereadWindow)
            : null;
    } catch {
        return null;
    }
}

/** 登录窗口用到的那几样能力，只声明我们真正碰的部分 */
interface WereadWindow {
    isDestroyed(): boolean;
    close(): void;
    loadURL(url: string): Promise<void>;
    on(event: string, listener: () => void): void;
    webContents: {
        session: {
            cookies: {
                get(filter: { domain: string }): Promise<{ name: string; value: string }[]>;
            };
        };
    };
}

// ============================================================
// 取数
// ============================================================

/** 带着登录态请求一个接口，返回解析后的 JSON */
async function api(ctx: ZiminosContext, path: string): Promise<Record<string, unknown>> {
    const response = await requestUrl({
        url: `${BASE}${path}`,
        method: 'GET',
        headers: {
            Cookie: ctx.settings.wereadCookie,
            Referer: `${BASE}/`,
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        throw: false,
    });

    if (response.status === 401) throw new Error('微信读书的登录已过期，重新运行「连接微信读书」。');
    if (response.status >= 400) throw new Error(`微信读书接口返回 ${response.status}`);

    return (response.json ?? {}) as Record<string, unknown>;
}

/** 书架上全部有笔记的书 */
export async function listWereadBooks(ctx: ZiminosContext): Promise<readonly WereadBook[]> {
    const payload = await api(ctx, '/api/user/notebook');
    const books: WereadBook[] = [];

    for (const raw of asArray(payload.books)) {
        const entry = raw as Record<string, unknown>;
        const book = entry.book as Record<string, unknown> | undefined;

        if (!book) continue;

        const id = text(book.bookId);
        const title = text(book.title);

        if (id && title) books.push({ id, title, author: text(book.author) });
    }

    return books;
}

/**
 * 一本书的全部划线与想法。
 *
 * 三个接口合成一条：划线给正文与 chapterUid，章节接口把 uid 翻译成章节名，
 * 想法接口给学员自己写的评论。想法按 chapterUid + 划线文本挂回对应的划线——
 * 微信读书的想法本来就是「对着某一段写的」，挂不回去就作为独立条目留下。
 */
export async function readWereadBookHighlights(
    ctx: ZiminosContext,
    bookId: string,
): Promise<readonly ParsedHighlight[]> {
    const marks = await api(ctx, `/web/book/bookmarklist?bookId=${encodeURIComponent(bookId)}`);
    const chapterNames = chapterMapOf(marks);
    const highlights: ParsedHighlight[] = [];

    for (const raw of asArray(marks.updated)) {
        const mark = raw as Record<string, unknown>;
        const content = text(mark.markText);

        if (!content) continue;

        highlights.push({
            chapter: chapterNames.get(text(mark.chapterUid)) ?? '',
            text: content,
            thoughts: [],
        });
    }

    // 想法单独一趟：接口不同、失败也不该让划线跟着丢
    try {
        const reviews = await api(
            ctx,
            `/web/review/list?bookId=${encodeURIComponent(bookId)}&listType=11&mine=1&syncKey=0`,
        );

        for (const raw of asArray(reviews.reviews)) {
            const wrapper = raw as Record<string, unknown>;
            const review = (wrapper.review ?? wrapper) as Record<string, unknown>;
            const written = text(review.content);

            if (!written) continue;

            const quoted = text(review.abstract);
            const hostIndex = quoted
                ? highlights.findIndex(
                      (item) => item.text.replace(/\s+/g, '') === quoted.replace(/\s+/g, ''),
                  )
                : -1;

            // thoughts 是只读数组（契约如此），因此重建那一条而不是原地追加
            if (hostIndex >= 0) {
                const host = highlights[hostIndex];

                highlights[hostIndex] = { ...host, thoughts: [...host.thoughts, written] };
            } else {
                highlights.push({
                    chapter: chapterNames.get(text(review.chapterUid)) ?? '',
                    text: quoted,
                    thoughts: [written],
                });
            }
        }
    } catch {
        // 想法拿不到就只交划线：少一半好过一条都没有
    }

    return highlights;
}

/** 划线接口自带的章节表：chapterUid → 章节名 */
function chapterMapOf(payload: Record<string, unknown>): Map<string, string> {
    const names = new Map<string, string>();

    for (const raw of asArray(payload.chapters)) {
        const chapter = raw as Record<string, unknown>;
        const uid = text(chapter.chapterUid);
        const title = text(chapter.title);

        if (uid && title) names.set(uid, title);
    }

    return names;
}

/** 接口返回的数组字段可能缺席，收敛成数组 */
function asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

/** 把来路不明的 JSON 值收敛成字符串 */
function text(value: unknown): string {
    if (value === null || value === undefined) return '';

    return String(value).trim();
}
