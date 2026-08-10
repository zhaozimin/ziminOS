/**
 * [INPUT]: 依赖 core/constants 的灵感默认值与插入位置类型；接收用户输入、模板时间变量和 Markdown 原文
 * [OUTPUT]: 对外提供输入/标题/格式规范化、灵感模板渲染、Dataview 未完成任务查询、
 *           新笔记正文生成与四种安全插入算法
 * [POS]: inspiration 模块的纯文本引擎，不接触 Obsidian、磁盘或设置落盘；capture.ts 只负责编排，
 *        所有会改变 Markdown 字符串的规则集中在这里，便于无笔记库环境下做确定性回归验证
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { INSPIRATION_DEFAULTS } from '../../core/constants';
import type { InspirationInsertPosition } from '../../core/constants';
import type { LocalDateTimeParts } from '../../core/time';

/** 灵感模板的四个公开占位符；未知占位符原样保留，避免擅自吞掉用户文本 */
const TEMPLATE_TOKENS = {
    content: '{{content}}',
    date: '{{date}}',
    time: '{{time}}',
    datetime: '{{datetime}}',
} as const;

/** 把输入压缩成一行，避免用户换行意外破坏 Markdown 任务结构 */
export function normalizeInspiration(input: string | null): string {
    if (input === null) return '';

    return input.replace(/\s+/g, ' ').trim();
}

/**
 * 标题允许写「灵感集」或完整的「## 灵感集」。
 * 运行时统一补成合法 Markdown 标题；空值回落默认标题。
 */
export function normalizeInspirationHeading(value: string | undefined): string {
    const candidate = typeof value === 'string' ? value.trim() : '';

    if (!candidate) return INSPIRATION_DEFAULTS.heading;

    const headingMatch = candidate.match(/^(#{1,6})\s*(.+)$/);

    if (headingMatch) return `${headingMatch[1]} ${headingMatch[2].trim()}`;

    return `# ${candidate}`;
}

/** 空格式回落默认值；缺少 content 会直接拒绝，防止看似成功却把用户输入丢掉 */
export function normalizeInspirationFormat(value: string | undefined): string {
    const candidate = typeof value === 'string' ? value : '';
    const format = candidate.trim() ? candidate : INSPIRATION_DEFAULTS.format;

    if (!format.includes(TEMPLATE_TOKENS.content)) {
        throw new Error('灵感格式必须包含 {{content}}，否则输入内容无处写入。');
    }

    return format;
}

/** 用显式白名单替换模板变量；不执行代码，不解释未知语法 */
export function renderInspirationEntry(
    format: string,
    inspiration: string,
    timeParts: LocalDateTimeParts,
): string {
    const replacements: Readonly<Record<string, string>> = {
        [TEMPLATE_TOKENS.content]: inspiration,
        [TEMPLATE_TOKENS.date]: timeParts.date,
        [TEMPLATE_TOKENS.time]: timeParts.time,
        [TEMPLATE_TOKENS.datetime]: timeParts.datetime,
    };

    return normalizeInspirationFormat(format).replace(
        /\{\{(?:content|date|time|datetime)\}\}/g,
        (token) => replacements[token] ?? token,
    );
}

/** 目标文件不存在时，只创建 Dataview 筛选页眉与当前灵感所需的最小正文 */
export function buildInitialInspirationContent(
    entry: string,
    position: InspirationInsertPosition,
    heading: string,
    targetPath: string,
): string {
    const filter = buildDataviewTaskQuery(targetPath);

    if (isHeadingPosition(position)) return `${filter}\n\n${heading}\n${entry}\n`;

    return `${filter}\n\n${entry}\n`;
}

/**
 * 生成与当前自定义目标文件绑定的 Dataview TASK 查询。
 * 路径带 .md 时 Dataview 会强制按单文件解析；双引号与反斜杠先转义，避免破坏 DQL。
 */
export function buildDataviewTaskQuery(targetPath: string): string {
    const escapedPath = targetPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    return [
        '```dataview',
        'task',
        'from',
        `    "${escapedPath}"`,
        'where',
        '    !completed',
        '```',
    ].join('\n');
}

/**
 * 把一条已渲染的灵感插入既有 Markdown。
 * 标题模式找不到标题时抛错且不返回新文本；正文顶部会越过 YAML 围栏，绝不把条目塞进 frontmatter。
 */
export function insertInspiration(
    content: string,
    entry: string,
    position: InspirationInsertPosition,
    heading: string,
): string {
    const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
    const lines = content.split(/\r?\n/);
    const entryLines = entry.split(/\r?\n/);

    switch (position) {
        case 'heading-top': {
            const headingIndex = findHeadingIndex(lines, heading);

            lines.splice(headingIndex + 1, 0, ...entryLines);
            break;
        }
        case 'heading-bottom': {
            const headingIndex = findHeadingIndex(lines, heading);
            const headingLevel = heading.match(/^#+/)?.[0].length ?? 1;
            let insertionIndex = findHeadingSectionEnd(lines, headingIndex, headingLevel);

            while (insertionIndex > headingIndex + 1 && !lines[insertionIndex - 1]?.trim()) {
                insertionIndex -= 1;
            }

            lines.splice(insertionIndex, 0, ...entryLines);
            break;
        }
        case 'file-top': {
            const insertionIndex = findBodyStart(lines);

            lines.splice(insertionIndex, 0, ...entryLines);
            break;
        }
        case 'file-bottom': {
            let insertionIndex = lines.length;

            while (insertionIndex > 0 && !lines[insertionIndex - 1]?.trim()) {
                insertionIndex -= 1;
            }

            lines.splice(insertionIndex, 0, ...entryLines);
            break;
        }
    }

    return lines.join(lineEnding);
}

function isHeadingPosition(position: InspirationInsertPosition): boolean {
    return position === 'heading-top' || position === 'heading-bottom';
}

/** 精确匹配规范化标题，避免相似标题之间串写 */
function findHeadingIndex(lines: readonly string[], heading: string): number {
    const index = lines.findIndex((line) => line.trim() === heading);

    if (index === -1) {
        throw new Error(`没有找到定位标题“${heading}”，未写入任何内容。`);
    }

    return index;
}

/** 标题区结束于下一条同级或更高级标题；更低级标题仍属于当前区块 */
function findHeadingSectionEnd(lines: readonly string[], headingIndex: number, headingLevel: number): number {
    for (let index = headingIndex + 1; index < lines.length; index += 1) {
        const nextHeading = lines[index]?.match(/^(#{1,6})\s+/);

        if (nextHeading && nextHeading[1].length <= headingLevel) return index;
    }

    return lines.length;
}

/** YAML 合法闭合时返回正文起点；未闭合时拒绝写入，避免把灵感混进损坏的 YAML */
function findBodyStart(lines: readonly string[]): number {
    let bodyStart = 0;

    if (lines[0]?.trim() === '---') {
        const closingIndex = lines.findIndex(
            (line, index) => index > 0 && (line.trim() === '---' || line.trim() === '...'),
        );

        if (closingIndex === -1) {
            throw new Error('目标笔记的 YAML 头部没有闭合，未写入任何内容。');
        }

        bodyStart = closingIndex + 1;
    }

    while (bodyStart < lines.length && !lines[bodyStart]?.trim()) bodyStart += 1;

    // Dataview 筛选块是系统页眉：「正文顶部」指它的下方，绝不能把灵感插到筛选块上面
    if (lines[bodyStart]?.trim().toLowerCase() === '```dataview') {
        const closingIndex = lines.findIndex(
            (line, index) => index > bodyStart && line.trim() === '```',
        );

        if (closingIndex === -1) {
            throw new Error('目标笔记顶部的 Dataview 查询没有闭合，未写入任何内容。');
        }

        bodyStart = closingIndex + 1;
        while (bodyStart < lines.length && !lines[bodyStart]?.trim()) bodyStart += 1;
    }

    return bodyStart;
}
