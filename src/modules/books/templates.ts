/**
 * [INPUT]: 依赖 ../../core/constants 的 BOOK_CHAPTER_PREFIX/BOOK_THOUGHT_PREFIX 与
 *          CARD_FIELDS/CardField（卡片十字段的权威顺序）；依赖 ./parsers 的 ParsedHighlight 类型
 * [OUTPUT]: 对外提供 highlightLines/chapterHeadingLine（划线的行形态）、
 *           ExcerptCardOptions 与 excerptCardContent（摘卡的完整正文）
 * [POS]: books 模块的文本工厂，「写进笔记的字长什么样」的唯一出处，
 *        与 projects/templates 在各自模块里担同一职：其他文件一律不拼字符串。
 *        书的 MOC 骨架不在这里——那份文本属于容器流程，由 projects/templates 按
 *        BOOK_KIND 生成；这里只管两样 books 自己写下的东西：划线行与摘出来的卡片。
 *        卡片十字段严格按 CARD_FIELDS 序生成，与 cardInit 自动登记的排列完全一致，
 *        于是「摘出来的卡」与「手建的卡」在属性面板里长得一模一样
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { BOOK_CHAPTER_PREFIX, BOOK_THOUGHT_PREFIX, CARD_FIELDS } from '../../core/constants';
import type { CardField } from '../../core/constants';
import type { ParsedHighlight } from './parsers';

// ============================================================
// 划线的行形态
// ============================================================

/**
 * 一条划线渲染成的行：顶层列表行是划线本身，想法各缩进一层挂在它名下。
 * 没有划线只有想法（Kindle 的独立笔记）时，想法自己顶层成行。
 * 这个形态同时被合并去重按同一规则读取——写与读一旦分叉，同一条划线每次导入都是「新的」。
 */
export function highlightLines(highlight: ParsedHighlight): string[] {
    if (!highlight.text) {
        return highlight.thoughts.map((thought) => `- ${BOOK_THOUGHT_PREFIX}${thought}`);
    }

    return [
        `- ${highlight.text}`,
        ...highlight.thoughts.map((thought) => `\t- ${BOOK_THOUGHT_PREFIX}${thought}`),
    ];
}

/** 章节在「全部划线」小节里的样子：三级标题，比小节自身低一级 */
export function chapterHeadingLine(chapter: string): string {
    return `${BOOK_CHAPTER_PREFIX}${chapter}`;
}

// ============================================================
// 摘成卡片
// ============================================================

/** 一张摘出来的卡片的全部可变量 */
export interface ExcerptCardOptions {
    /** 概述，允许为空——空时字段留键不留值，与卡片模板一致 */
    readonly description: string;
    /** 创建时间戳，格式由调用方按设置决定 */
    readonly created: string;
    /** 14 位本地时间 UID，数字类型，落盘不带引号 */
    readonly uid: number;
    /** up 双链全文（含路径与显示名），由调用方按 cardInit 的同一公式拼好递进来 */
    readonly upLink: string;
    /** 选中的划线原文，可多行 */
    readonly quote: string;
}

/**
 * 把文本转换为 YAML 兼容的双引号字符串。
 * 与 projects/templates 的同名函数同法：借 JSON.stringify 完成转义，中文与冒号都能安全落盘。
 * 不跨模块共享那份实现——模块之间彼此不认识，三行代码不值得为此打洞。
 */
function toYamlString(value: string): string {
    return JSON.stringify(String(value));
}

/**
 * 生成一张摘出来的卡片：十字段 YAML + 划线原文的引用块 + 留给学员写字的空行。
 * 引用块是卡片的原料，学员的拓展写在它下面——数据在上、发挥在下。
 * 正文零提示注释（v0.5.1 纪律）：引用块是数据不是提示，之外一个字都不多给。
 */
export function excerptCardContent(options: ExcerptCardOptions): string {
    const values: Readonly<Record<CardField, string>> = {
        aliases: 'aliases:',
        description: options.description
            ? `description: ${toYamlString(options.description)}`
            : 'description:',
        created: `created: ${options.created}`,
        updated: 'updated:',
        tags: 'tags:',
        UID: `UID: ${options.uid}`,
        rating: 'rating:',
        author: 'author:',
        source: 'source:',
        // up 是列表类型（一张卡片可以同时属于多个 MOC），与 cardInit 首次登记同形
        up: `up:\n  - ${toYamlString(options.upLink)}`,
    };

    const quoteLines = options.quote
        .split('\n')
        .map((line) => (line.trim() ? `> ${line.trim()}` : '>'));

    return [
        '---',
        ...CARD_FIELDS.map((field) => values[field]),
        '---',
        '',
        ...quoteLines,
        '',
        '',
    ].join('\n');
}
