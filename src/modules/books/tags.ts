/**
 * [INPUT]: 依赖 core/constants 的 BOOK_TAG_COUNTS 与 BOOK_TAG_DEFAULTS
 * [OUTPUT]: 对外提供 bookTags（把豆瓣的分类词变成 Obsidian 认的标签）
 * [POS]: 「豆瓣怎么分类这本书」到「库里怎么标这本书」之间的那道翻译。
 *        分类不让学员自己填，理由与书目字段同源：他填的是他此刻想到的词，
 *        而豆瓣给的是几万人读完之后投票投出来的词——后者才是这本书在知识地图上的真实位置，
 *        也才可能与他书架上另外二十本书对得上（两本书都被打上「方法论」，它们才连得起来）。
 *        本文件只解决翻译中最容易出错的那一段：**豆瓣的分类词不一定是合法的 Obsidian 标签**。
 *        标签里不能有空格、点号、括号，而豆瓣的分类里「尤瓦尔·赫拉利」「2017 书单」比比皆是；
 *        非法字符不会报错，Obsidian 只会在那个字符处把标签截断——
 *        `#书籍/尤瓦尔·赫拉利` 悄悄变成 `#书籍/尤瓦尔`，一个谁也不会去核对的半截词。
 *        因此这里走白名单而不是黑名单：认字母、数字、下划线与连字符（Unicode 字母含中文），
 *        其余一律换成连字符。宁可标签长得朴素一点，也不要它在别处断掉。
 *        bookTags 是**全函数**：设置里的前缀与条数都是学员敲进去的自由文本，
 *        空串、怪数、手改 data.json 写进来的东西一律在这里回落到默认值，
 *        与 core/folders 的 normalizeFolderPath 担同一职——校验集中在读取侧，
 *        调用方把设置原值递进来即可，不存在「某个读取点忘了兜底」的可能
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { BOOK_TAG_COUNTS, BOOK_TAG_DEFAULTS } from '../../core/constants';

/** 标签里允许原样保留的字符：Unicode 字母（含汉字）、数字、下划线、连字符 */
const TAG_SAFE = /[^\p{L}\p{N}_-]+/gu;

/**
 * 生成一本书的标签清单，形如 `书籍/写作`。
 *
 * 落进 YAML 的 `tags` 时不带井号——那是 Obsidian 的规矩：井号是正文里的写法，
 * 属性里写的是标签本身。渲染出来仍是 `#书籍/写作`。
 *
 * `count` 为 0 即整段不写标签，那是学员在设置里选的「不写标签」。取前 N 条而不是全取，
 * 是因为豆瓣的分类按投票数从高到低排，前几条是这本书的公认位置，
 * 往后很快滑向个人化的碎语（「知识要转化成生产力啊」真的在榜上）。
 * 截断本身就是筛选，不需要再发明一条「多长算废话」的规则。
 */
export function bookTags(
    categories: readonly string[],
    prefix: string,
    count: number,
): readonly string[] {
    const limit = normalizeCount(count);

    if (limit <= 0) return [];

    const root = normalizePrefix(prefix);
    const tags: string[] = [];
    // 归一之后可能撞车（「科普 / 科幻」与「科普-科幻」会变成同一个），撞了只留第一个
    const seen = new Set<string>();

    for (const category of categories) {
        const leaf = sanitize(category);

        if (!leaf || seen.has(leaf)) continue;

        seen.add(leaf);
        tags.push(`${root}/${leaf}`);

        if (tags.length >= limit) break;
    }

    return tags;
}

// ============================================================
// 归一：设置里的自由文本进来，合法的标签片段出去
// ============================================================

/**
 * 条数归一。
 *
 * 判据是「在不在候选清单里」而不是「大不大于零」：`NaN <= 0` 是 false、`n >= NaN` 恒为 false，
 * 于是一个 NaN 会一路穿过守卫与截断，变成「豆瓣给几条写几条」——
 * 而设置页的下拉框此时仍然显示着「前 5 个」。0 在清单里，所以「不写标签」照旧是它自己。
 */
function normalizeCount(count: number): number {
    return BOOK_TAG_COUNTS.includes(count) ? count : BOOK_TAG_DEFAULTS.count;
}

/**
 * 前缀归一。它比分类词多认一个斜杠——写「阅读/书籍」是想把书挂在阅读下面第二层，那是正当用法。
 *
 * 做法是**按斜杠切段、每段各自归一、再拼回去**，而不是把斜杠也放进白名单里。
 * 后者看着更省事，却会留下一类看不见的坏结果：「阅读 / 书籍」这种在斜杠两边敲了空格的写法，
 * 空格变成连字符之后紧贴着斜杠，而掐头去尾只掐整串的两头，于是拼出 `阅读-/-书籍/写作`。
 * 更狠的是「书籍 /」——整个书架的根从 `书籍` 变成 `书籍-`，
 * 标签面板里 `书籍/` 一展开什么都没有，而那正是这个设置存在的全部理由。
 * 按段归一之后，斜杠是分层符这件事在代码里也成立，而不只写在注释里。
 *
 * 全部段都被清空（前缀是「///」或纯标点）时回落默认值：设置页的每一个文本框都承诺
 * 「留空即用占位符里那个默认」，只有这一处把「空」解释成「关掉整个功能」的话，
 * 学员清空输入框会得到一个静默失效的功能——而「关掉」已经有专门的控件了。
 */
function normalizePrefix(prefix: string): string {
    const segments = prefix
        .split('/')
        .map((segment) => sanitize(segment))
        .filter(Boolean);

    return segments.length ? segments.join('/') : BOOK_TAG_DEFAULTS.prefix;
}

/** 非法字符换成连字符，再把连字符收拢成一个、掐掉两头。全被换掉就返回空串，由调用方丢弃 */
function sanitize(value: string): string {
    return value
        .trim()
        .replace(TAG_SAFE, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
}
