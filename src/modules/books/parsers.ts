/**
 * [INPUT]: 无。本文件不 import 任何东西——解析器必须是纯函数，同一段文本永远解析出同一批划线
 * [OUTPUT]: 对外提供 ParsedHighlight/ParsedBook/ParseResult 三个契约与 parseHighlightExport
 *           （识别并解析微信读书 / Kindle / 苹果图书三种官方导出文本）
 * [POS]: books 模块的读入口，「导入读书划线」认识外部世界的唯一方式。
 *        三个 App 的网络 API 全是私有接口，碰它们就打穿零网络红线；
 *        但三家都有官方纯文本导出（微信读书「分享→复制到剪贴板」、Kindle 的 My Clippings.txt、
 *        苹果图书的选中复制），格式确定、离线可得——本文件只认这三种文本。
 *        格式规则逐条对照真实导出样本与三个生产级开源解析器核实过（2026-08，
 *        微信读书三代版式、Kindle 中英两界面四类条目、苹果图书带/不带商店链接），
 *        不是凭印象写的正则。识别顺序按标记的无歧义程度排：
 *        先 Kindle（========== 分隔行独一无二），再苹果图书（「摘录来自」出处块），
 *        最后微信读书；都认不出返回 null，由调用方讲清支持哪三种，绝不猜
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================
// 契约
// ============================================================

/** 一条解析出来的划线。text 为空而 thoughts 非空 = 一条不依附划线的独立笔记 */
export interface ParsedHighlight {
    /** 所属章节，来源没给就是空串（Kindle 与苹果图书都不带章节） */
    readonly chapter: string;
    /** 划线原文 */
    readonly text: string;
    /**
     * 学员写在这条划线上的想法，可以有好几条。
     *
     * 是数组而不是一个字符串，因为同一句话被想两次是真事：隔半年重读，
     * 微信读书里会出现两个「发表想法」条目共用同一段「原文：」。
     * 用单值的话，第二次的体会在解析阶段就没了——合并与确认框都没有机会知道它存在过，
     * 而那恰恰是整份导出里最贵的东西。
     */
    readonly thoughts: readonly string[];
}

/** 一本书的解析结果 */
export interface ParsedBook {
    readonly title: string;
    readonly author: string;
    readonly highlights: readonly ParsedHighlight[];
}

/** 三种来源的机器标识 */
export type HighlightSource = 'weread' | 'kindle' | 'apple';

/**
 * 一次解析的完整结果。微信读书与苹果图书通常只有一本；My Clippings.txt 天然含全部书。
 *
 * books 为空是**合法结果**，与「认不出来源」不是一回事：
 * 一份只含书签的 My Clippings 认得出是 Kindle，只是没有可导入的东西。
 * 两者混为一谈，学员会得到一句「认不出这段文本的来源」，然后去怀疑自己复制错了。
 */
export interface ParseResult {
    readonly source: HighlightSource;
    readonly sourceLabel: string;
    readonly books: readonly ParsedBook[];
}

// ============================================================
// 识别与分发
// ============================================================

/** Kindle 条目之间的分隔行：设备写的是恰好十个等号，这里放宽到六个起，容忍手工截断 */
const KINDLE_SEPARATOR = /^={6,}\s*$/;

/** 苹果图书的出处行（旧版带冒号的单行写法一并认） */
const APPLE_MARKER = /^(?:摘录来自|Excerpt From)[:：]?\s*(.*)$/;

/**
 * 识别来源并解析。三种都认不出返回 null——认不出就明说，绝不把随便一段文本猜成划线。
 */
export function parseHighlightExport(raw: string): ParseResult | null {
    // BOM 可能出现在文件头，也可能出现在 My Clippings 追加条目的书名行前；
    // 旧版微信读书的划线里图片位置残留 U+FFFC 对象替换符；Windows 剪贴板是 CRLF——一并归一
    const text = raw.replace(/[﻿￼]/g, '').replace(/\r\n?/g, '\n');
    const lines = text.split('\n');

    // 认出来源之后一律返回结果，哪怕一条划线都没解析到——
    // 「认不出这是什么」与「认得出但里面没东西」是两句不同的话，得让调用方分得开
    if (lines.some((line) => KINDLE_SEPARATOR.test(line.trim()))) {
        return {
            source: 'kindle',
            sourceLabel: 'Kindle（My Clippings）',
            books: parseKindle(lines),
        };
    }

    if (lines.some((line) => APPLE_MARKER.test(line.trim()))) {
        return { source: 'apple', sourceLabel: '苹果图书', books: parseApple(lines) };
    }

    const books = parseWeread(lines).filter((book) => book.highlights.length);

    // 微信读书没有独一无二的分隔标记，只能靠解析出东西来反证它是微信读书的导出；
    // 一条都没有时不能硬认，否则任何一段文字都会被当成微信读书
    return books.length ? { source: 'weread', sourceLabel: '微信读书', books } : null;
}

// ============================================================
// 微信读书
// ============================================================

/** 「118个笔记」那一行 */
const WEREAD_COUNT = /^\d+个笔记$/;

/** 现行版式的想法头：「◆ 2024/09/04发表想法」，日期补零、与「发表想法」之间无空格 */
const WEREAD_THOUGHT_NEW = /^◆\s*\d{4}\/\d{1,2}\/\d{1,2}发表想法[:：]?$/;

/** 旧版式的想法头：「2023/2/26 发表想法」，不补零、有空格、无 ◆ 前缀 */
const WEREAD_THOUGHT_OLD = /^\d{4}\/\d{1,2}\/\d{1,2}\s+发表想法[:：]?$/;

/** 现行版式的点评行：「◆ 2024/09/09 认为好看」，日期后有空格。是评分不是划线，跳过 */
const WEREAD_RATING = /^◆\s*\d{4}\/\d{1,2}\/\d{1,2}\s+认为/;

/** 想法条目里的「原文：被评论的那句」，全角冒号为主、半角一并认 */
const WEREAD_QUOTE = /^原文[:：]\s*(.*)$/;

/** 现行版式的固定落款 */
const WEREAD_SIGNATURE = /^--\s*来自微信读书$/;

/**
 * 微信读书「分享 → 复制到剪贴板」的产物。多本书可连排粘贴，每本以《书名》头重新开始。
 *
 * 版式有两代，靠 `>>` 是否出现区分，两代都认：
 * 旧版（约 v7.1–v8.2）：`◆` 行是章节，`>> ` 行是划线（诗行续行无前缀直接换行），
 * 想法头「YYYY/M/D 发表想法」独行、正文紧随、被评论的原文是下一条 `>>`。
 * 现行（约 v8.3 起）：`◆ ` 行是划线，章节是**无任何标记的纯文本行**，
 * 只能靠「前面至少两个连续空行」认出来（头部之后的第一个章节例外）；
 * 跨段划线的后续段落以只隔一个空行的无标记块续接在同一条划线下——
 * 把无标记行一律当章节，正是解析这个格式最常见的错法。
 * 想法条目「◆ YYYY/MM/DD发表想法」的原文往往还会重复出现为一条独立划线，
 * 解析完按文本归一去重，想法挂回被评论的那条。
 */
function parseWeread(lines: string[]): ParsedBook[] {
    const trimmed = lines.map((line) => line.trim());
    const headerIndexes: number[] = [];

    // 一本书的头：《书名》行，且其后四行内出现「N个笔记」行
    for (let cursor = 0; cursor < trimmed.length; cursor += 1) {
        if (!/^《.+》$/.test(trimmed[cursor])) continue;

        const lookahead = trimmed.slice(cursor + 1, cursor + 5);

        if (lookahead.some((line) => WEREAD_COUNT.test(line))) headerIndexes.push(cursor);
    }

    // 没有一个规范书头时，整段按单本无头处理——只要有 ◆ 或 >> 标记就仍然值得解析
    if (!headerIndexes.length) {
        const hasMarkers = trimmed.some((line) => line.startsWith('◆') || line.startsWith('>>'));

        return hasMarkers ? [parseWereadBook(trimmed, 0, trimmed.length, '', '')] : [];
    }

    const books: ParsedBook[] = [];

    for (let index = 0; index < headerIndexes.length; index += 1) {
        const start = headerIndexes[index];
        const end = headerIndexes[index + 1] ?? trimmed.length;
        const title = trimmed[start].replace(/^《|》$/g, '').trim();

        // 作者：书头与「N个笔记」之间的那行非空文字（现行版式隔一个空行，旧版紧邻）
        let author = '';
        let bodyStart = start + 1;

        for (let cursor = start + 1; cursor < end; cursor += 1) {
            const line = trimmed[cursor];

            if (!line) continue;

            if (WEREAD_COUNT.test(line)) {
                bodyStart = cursor + 1;
                break;
            }

            if (!author) author = line;
        }

        books.push(parseWereadBook(trimmed, bodyStart, end, title, author));
    }

    return books;
}

/** 解析一本书的正文区（书头之后、下一书头之前） */
function parseWereadBook(
    trimmed: readonly string[],
    start: number,
    end: number,
    title: string,
    author: string,
): ParsedBook {
    const oldStyle = hasOldStyleMarkers(trimmed, start, end);
    const highlights = oldStyle
        ? parseWereadOld(trimmed, start, end)
        : parseWereadNew(trimmed, start, end);

    return { title, author, highlights: dedupeWereadHighlights(highlights) };
}

/** 这段正文里是否出现旧版式的 `>>` 划线标记 */
function hasOldStyleMarkers(trimmed: readonly string[], start: number, end: number): boolean {
    for (let cursor = start; cursor < end; cursor += 1) {
        if (trimmed[cursor].startsWith('>>')) return true;
    }

    return false;
}

/** 旧版式：◆ 章节、>> 划线、「YYYY/M/D 发表想法」想法头 */
function parseWereadOld(
    trimmed: readonly string[],
    start: number,
    end: number,
): ParsedHighlight[] {
    const highlights: ParsedHighlight[] = [];
    let chapter = '';
    let inRatingSection = false;
    let pendingThought: string[] = [];
    let current: string[] | null = null;

    const flush = (): void => {
        if (!current) return;

        const thought = pendingThought.join(' ').trim();

        highlights.push({
            chapter,
            text: current.join(' ').trim(),
            thoughts: thought ? [thought] : [],
        });
        pendingThought = [];
        current = null;
    };

    for (let cursor = start; cursor < end; cursor += 1) {
        const line = trimmed[cursor];

        if (!line || WEREAD_SIGNATURE.test(line)) {
            flush();
            continue;
        }

        if (line.startsWith('◆')) {
            flush();

            const body = line.replace(/^◆\s*/, '');

            // 「◆ 点评」区放的是评分，不是划线；直到下一个章节为止整段跳过
            inRatingSection = body === '点评';

            if (!inRatingSection) chapter = body;
            continue;
        }

        if (inRatingSection) continue;

        if (WEREAD_THOUGHT_OLD.test(line)) {
            // 想法头：正文紧随其后，被评论的原文是下一条 >>
            flush();
            continue;
        }

        if (line.startsWith('>>')) {
            flush();
            current = [line.replace(/^>>\s*/, '')];
            continue;
        }

        // 无标记行：>> 之后是诗行续行，>> 之前是想法正文
        if (current) current.push(line);
        else pendingThought.push(line);
    }

    flush();

    return highlights;
}

/** 现行版式：◆ 划线、无标记章节行（前置 ≥2 空行）、「◆ YYYY/MM/DD发表想法」想法条目 */
function parseWereadNew(
    trimmed: readonly string[],
    start: number,
    end: number,
): ParsedHighlight[] {
    const highlights: ParsedHighlight[] = [];
    let chapter = '';
    /** 头部之后还没见过章节：第一个无标记块前面只有一个空行，也照样是章节 */
    let beforeFirstChapter = true;
    /** 正在收拢的划线段落；现行版式跨段划线以只隔一个空行的无标记块续接 */
    let current: string[] | null = null;
    /** 正在收拢的想法条目 */
    let thought: { paragraphs: string[]; quote: string[] } | null = null;
    let blanks = 0;

    const flushHighlight = (): void => {
        if (!current) return;

        highlights.push({ chapter, text: current.join(' ').trim(), thoughts: [] });
        current = null;
    };

    const flushThought = (): void => {
        if (!thought) return;

        const written = thought.paragraphs.join(' ').trim();

        highlights.push({
            chapter,
            text: thought.quote.join(' ').trim(),
            thoughts: written ? [written] : [],
        });
        thought = null;
    };

    for (let cursor = start; cursor < end; cursor += 1) {
        const line = trimmed[cursor];

        if (!line) {
            blanks += 1;
            continue;
        }

        const leadingBlanks = blanks;

        blanks = 0;

        if (WEREAD_SIGNATURE.test(line)) {
            flushHighlight();
            flushThought();
            continue;
        }

        // 「点评」独行与「◆ 日期 认为好看」评分行都不是划线
        if (line === '点评' || WEREAD_RATING.test(line)) {
            flushHighlight();
            flushThought();
            continue;
        }

        if (WEREAD_THOUGHT_NEW.test(line)) {
            flushHighlight();
            flushThought();
            thought = { paragraphs: [], quote: [] };
            continue;
        }

        if (line.startsWith('◆')) {
            flushHighlight();
            flushThought();
            current = [line.replace(/^◆\s*/, '')];
            continue;
        }

        const quoteMatch = WEREAD_QUOTE.exec(line);

        if (thought) {
            // 想法条目内部：先是想法正文（可多段，段间空一行），撞到「原文：」后开始收被评论的原文；
            // 双语书会连排两个原文块（原句与译文），一并收进同一条。
            //
            // 但一个想法条目**是会结束的**，而它的结束没有任何标记——下一行可能就是新章节。
            // 判据只能是空行数：想法正文的段间空一行，原文的段间一行不空（导出格式如此），
            // 而章节前面隔着两个以上空行。不看空行数的话，紧跟在想法条目后面的那个章节名
            // 会被当成原文的续段吞进去，而且连带让那一章的划线全部记到上一章名下——
            // 归错章不报错，只是让人日后翻到时以为自己记错了书。
            const continues = quoteMatch
                ? true
                : thought.quote.length
                  ? leadingBlanks === 0
                  : leadingBlanks <= 1;

            if (continues) {
                if (quoteMatch) thought.quote.push(quoteMatch[1]);
                else if (thought.quote.length) thought.quote.push(line);
                else thought.paragraphs.push(line);
                continue;
            }

            // 想法条目到此为止，这一行归下面的无标记行裁决（十有八九是个章节）
            flushThought();
        }

        // 无标记行的裁决是这个版式的全部难点：
        // 前面只隔一个空行且上一条划线还开着 → 跨段划线的续段；
        // 前面隔了两个以上空行（或还没见过第一个章节）→ 章节标题
        if (current && leadingBlanks <= 1) {
            current.push(line);
            continue;
        }

        if (leadingBlanks >= 2 || beforeFirstChapter) {
            flushHighlight();
            chapter = line;
            beforeFirstChapter = false;
            continue;
        }

        // 隔一个空行却没有开着的划线：来历不明的散行，宁可放过也不猜成章节
        flushHighlight();
    }

    flushHighlight();
    flushThought();

    return highlights;
}

/**
 * 书内去重：想法条目的「原文」往往还会以独立划线重复出现一次。
 * 按去除全部空白的文本归一合并，想法挂回被评论的那条，先出现者定位置。
 *
 * 想法是**并进去**而不是「谁先谁算数」：同一句话隔半年重读、写下第二条体会，
 * 微信读书会导出两个共用同一段「原文：」的想法条目。丢掉后来那条，
 * 学员第二次读的收获在解析阶段就没了，合并与确认框都没有机会知道它存在过。
 */
function dedupeWereadHighlights(highlights: readonly ParsedHighlight[]): ParsedHighlight[] {
    const seen = new Map<string, number>();
    const merged: ParsedHighlight[] = [];

    for (const highlight of highlights) {
        const key = highlight.text.replace(/\s+/g, '');

        if (!key && !highlight.thoughts.length) continue;

        const existingIndex = key ? seen.get(key) : undefined;

        if (existingIndex === undefined) {
            if (key) seen.set(key, merged.length);

            merged.push(highlight);
            continue;
        }

        const existing = merged[existingIndex];
        // 逐字相同的想法不重复收（同一份导出里想法条目与独立划线本就重复出现）
        const fresh = highlight.thoughts.filter(
            (candidate) => !existing.thoughts.some((had) => had === candidate),
        );

        if (fresh.length) {
            merged[existingIndex] = { ...existing, thoughts: [...existing.thoughts, ...fresh] };
        }
    }

    return merged;
}

// ============================================================
// Kindle：My Clippings.txt
// ============================================================

/** 一条 Kindle 条目的类别 */
type KindleKind = 'highlight' | 'note' | 'bookmark';

/**
 * 一条条目在书里的坐标区间。取不到时是 null，绝不退化成 [0, 0]——
 * 那会让全书条目的区间都相等，于是每条笔记都「覆盖」第一条划线，一律挂错人。
 */
interface KindleSpan {
    readonly start: number;
    readonly end: number;
}

/** 解析出的一条 Kindle 条目 */
interface KindleEntry {
    readonly title: string;
    readonly author: string;
    readonly kind: KindleKind;
    /** 位置区间（Kindle 的 location），个人文档与 PDF 往往没有 */
    readonly location: KindleSpan | null;
    /** 页码区间。PDF 与个人文档只有它，正规电子书两者都有 */
    readonly page: KindleSpan | null;
    readonly text: string;
}

/**
 * 元数据行的类别词，中英与新旧两代中文界面都认：
 * 「- 您在位置 #x-y的标注」「- 我的标注 位置x-y | 已添加至…」「- Your Highlight on Location x-y」。
 * 「剪贴文章」是老固件的整页剪贴，内容同样是书里的文字，按标注收。
 */
const KINDLE_KINDS: readonly { pattern: RegExp; kind: KindleKind }[] = [
    { pattern: /的标注|我的标注|Highlight|剪贴文章/i, kind: 'highlight' },
    { pattern: /的笔记|我的笔记|Note/i, kind: 'note' },
    { pattern: /的书签|我的书签|Bookmark/i, kind: 'bookmark' },
];

/** DRM 书达到出版商剪贴上限后的占位句，中英都是一对尖括号包一句话 */
const KINDLE_CLIP_LIMIT = /^[<＜].+[>＞]$/;

/**
 * My Clippings.txt：`==========` 分隔的条目流。
 * 文件天然含设备上全部书的条目，且中英文条目会混在同一个文件里
 * （语言取决于划线当时的界面语言），这里按书分组交出去，选哪本由调用方（人）决定。
 * 书签没有内容，跳过；笔记按位置挂到区间覆盖它的相邻标注上——
 * Kindle 的笔记就是对着某段标注写的，拆开呈现等于把批注和它批的话分了家；
 * 条目按时间顺序追加，笔记可能先于也可能后于它的标注，所以两个方向都找。
 */
function parseKindle(lines: string[]): ParsedBook[] {
    const entries: KindleEntry[] = [];
    let block: string[] = [];

    for (const line of lines) {
        if (KINDLE_SEPARATOR.test(line.trim())) {
            const entry = parseKindleBlock(block);

            if (entry) entries.push(entry);
            block = [];
            continue;
        }

        block.push(line);
    }

    // 最后一个条目之后若没有分隔行（手工截断的粘贴），照样收下
    const tail = parseKindleBlock(block);

    if (tail) entries.push(tail);

    return groupKindleEntries(entries);
}

/** 解析一个分隔行之间的条目块 */
function parseKindleBlock(block: string[]): KindleEntry | null {
    const meaningful = block.map((line) => line.trim()).filter((line) => line.length > 0);

    if (meaningful.length < 2) return null;

    const [titleLine, metaLine, ...content] = meaningful;

    if (!metaLine.startsWith('- ')) return null;

    const kind = KINDLE_KINDS.find((candidate) => candidate.pattern.test(metaLine))?.kind;

    if (!kind) return null;

    // 书名行的末尾括号是作者：中文导出用全角括号，英文用半角，两种都认
    const authorMatch = /^(.*?)[（(]([^（()）]*)[)）]\s*$/.exec(titleLine);
    const title = (authorMatch ? authorMatch[1] : titleLine).trim();
    const author = (authorMatch ? authorMatch[2] : '').trim();

    const text = content.join(' ').trim();

    // 达到出版商剪贴上限时内容是一句占位提示，不是书里的文字
    if (KINDLE_CLIP_LIMIT.test(text)) return null;

    return {
        title,
        author,
        kind,
        // 「位置 #100-102」「位置100-102」「Location 100-102」「at location 98-99」都认
        location: spanOf(/(?:位置\s*#?\s*|location\s+)(\d+)(?:\s*-\s*(\d+))?/i, metaLine),
        // 「第 25 页」「on page ix」「page 14-14」；罗马数字页码取不到数值，按「没有页码」处理
        page: spanOf(/(?:第\s*(\d+)(?:\s*-\s*(\d+))?\s*页|page\s+(\d+)(?:\s*-\s*(\d+))?)/i, metaLine),
        text,
    };
}

/** 从元数据行里抽一个区间；抽不到返回 null。单点位置的起止相同 */
function spanOf(pattern: RegExp, metaLine: string): KindleSpan | null {
    const matched = pattern.exec(metaLine);

    if (!matched) return null;

    // 中文与英文的页码各占一对捕获组，取先命中的那一对
    const rawStart = matched[1] ?? matched[3];
    const rawEnd = matched[2] ?? matched[4];

    if (rawStart === undefined) return null;

    const start = Number(rawStart);

    return { start, end: rawEnd === undefined ? start : Number(rawEnd) };
}

/** 按书分组，把笔记挂到位置覆盖它的标注上，书签丢弃 */
function groupKindleEntries(entries: readonly KindleEntry[]): ParsedBook[] {
    const books = new Map<string, { author: string; entries: KindleEntry[] }>();

    for (const entry of entries) {
        if (entry.kind === 'bookmark' || !entry.text) continue;

        const bucket = books.get(entry.title) ?? { author: entry.author, entries: [] };

        if (!books.has(entry.title)) books.set(entry.title, bucket);
        if (!bucket.author && entry.author) bucket.author = entry.author;

        bucket.entries.push(entry);
    }

    return [...books.entries()].map(([title, bucket]) => ({
        title,
        author: bucket.author,
        highlights: attachKindleNotes(bucket.entries),
    }));
}

/**
 * 把一本书的笔记挂到区间覆盖它的标注上；挂不上就独立成行。
 *
 * 优先按 location 比，两边都没有 location 时才退到页码——正规电子书两样都有，
 * PDF 与个人文档只有页码。两边都没有坐标就**不挂**：宁可让这条笔记独立成行，
 * 也不能按顺序猜一个主人。猜错不报错，学员看到的是一条挂在别人名下的批注。
 */
function attachKindleNotes(entries: readonly KindleEntry[]): ParsedHighlight[] {
    const highlights: { chapter: string; text: string; thoughts: string[] }[] = [];
    /** 标注在 highlights 里的下标，与 entries 顺序对齐，供笔记按位置回查 */
    const slots: { entry: KindleEntry; slot: number }[] = [];
    const notes: KindleEntry[] = [];

    for (const entry of entries) {
        if (entry.kind === 'note') {
            notes.push(entry);
            continue;
        }

        highlights.push({ chapter: '', text: entry.text, thoughts: [] });
        slots.push({ entry, slot: highlights.length - 1 });
    }

    for (const note of notes) {
        const host = slots.find((candidate) => covers(candidate.entry, note));

        if (host) highlights[host.slot].thoughts.push(note.text);
        else highlights.push({ chapter: '', text: '', thoughts: [note.text] });
    }

    return highlights;
}

/** 这条标注的坐标区间是不是罩住了那条笔记 */
function covers(highlight: KindleEntry, note: KindleEntry): boolean {
    if (highlight.location && note.location) return within(highlight.location, note.location.start);

    // 两边都没有 location 才退到页码；一边有一边没有说明它们不是同一套坐标，不比
    if (!highlight.location && !note.location && highlight.page && note.page) {
        return within(highlight.page, note.page.start);
    }

    return false;
}

/** 单点落在区间内（含端点）。起止倒挂时按较大的那端算 */
function within(span: KindleSpan, point: number): boolean {
    return point >= span.start && point <= Math.max(span.end, span.start);
}

// ============================================================
// 苹果图书
// ============================================================

/** 版权尾行，中英两种（中文带「可能」，英文带句点） */
const APPLE_COPYRIGHT = /此材料(?:可能)?受版权保护|This material may be protected by copyright/;

/**
 * 苹果图书（Apple Books）在 Mac 上复制划线的产物，一段一块，粘贴多段就是多块：
 * 弯引号包住的正文（可跨多行）→ 一个空行 → 「摘录来自」/「Excerpt From」独行 →
 * 书名行 → 作者行 →（商店购买的书多一行 books.apple.com 链接）→ 版权尾行。
 * 全部块按书名分组；学员一次通常只处理一本书的摘录。
 */
function parseApple(lines: string[]): ParsedBook[] {
    const trimmed = lines.map((line) => line.trim());
    const books = new Map<string, { author: string; highlights: ParsedHighlight[] }>();
    let pending: string[] = [];

    for (let cursor = 0; cursor < trimmed.length; cursor += 1) {
        const line = trimmed[cursor];
        const marker = APPLE_MARKER.exec(line);

        if (!marker) {
            if (line) pending.push(line);
            continue;
        }

        // 出处块：单行旧写法直接带书名；多行写法的书名、作者、可选商店链接、版权行在后续各行
        let title = marker[1].trim();
        let author = '';

        while (cursor + 1 < trimmed.length) {
            const candidate = trimmed[cursor + 1];

            // 出处块内的空行跳过；版权行是块的终点
            if (!candidate) {
                cursor += 1;
                continue;
            }

            if (APPLE_COPYRIGHT.test(candidate)) {
                cursor += 1;
                break;
            }

            // 商店书的 books.apple.com 链接行不是作者
            if (/^https?:\/\//.test(candidate)) {
                cursor += 1;
                continue;
            }

            if (!title) {
                title = candidate;
                cursor += 1;
                continue;
            }

            if (!author) {
                author = candidate;
                cursor += 1;
                continue;
            }

            break;
        }

        const text = stripQuotes(pending.join(' ').trim());

        pending = [];

        if (!text) continue;

        const key = stripBookBraces(title);
        const bucket = books.get(key) ?? { author, highlights: [] };

        if (!books.has(key)) books.set(key, bucket);
        if (!bucket.author && author) bucket.author = author;

        // 苹果图书的拷贝只带正文，学员写的批注不在里面
        bucket.highlights.push({ chapter: '', text, thoughts: [] });
    }

    return [...books.entries()].map(([title, bucket]) => ({
        title,
        author: bucket.author,
        highlights: bucket.highlights,
    }));
}

/** 剥掉内容两头的引号：苹果图书中英文正文都用弯引号 U+201C/U+201D 包裹 */
function stripQuotes(text: string): string {
    return text.replace(/^[“”"'「『]+/, '').replace(/[“”"'」』]+$/, '').trim();
}

/** 剥掉书名两头可能带的《》，与建书命令的包法对齐 */
function stripBookBraces(title: string): string {
    const inner = /^《(.+)》$/.exec(title.trim());

    return inner ? inner[1].trim() : title.trim();
}
