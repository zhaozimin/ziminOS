/**
 * [INPUT]: 依赖 ./constants 的 CARD_FIELDS 与 CardField 类型
 * [OUTPUT]: 对外提供 Frontmatter/CardValues 类型，以及 hasValue、isCardInitialized、
 *           isMocFrontmatter、reorderFrontmatter 四个纯判定/重排函数
 * [POS]: core 的 YAML 语义层，自 initialize-card-note.js 移植。
 *        它只回答「这份 YAML 是什么、够不够完整、该怎么排」，不碰文件、不碰 App，
 *        因此可被卡片初始化与 updated 维护共用，也让「MOC 还是卡片」这条判据在全仓库只有一份
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { CARD_FIELDS } from './constants';
import type { CardField } from './constants';

/** 一份 YAML frontmatter 的通用形态：字段名到任意值 */
export type Frontmatter = Record<string, unknown>;

/** 卡片十字段的完整取值，交给 reorderFrontmatter 落盘 */
export type CardValues = Record<CardField, unknown>;

/**
 * 判断 YAML 值是否已经包含有效内容。
 * 空字符串、null、undefined 和空数组均视为空值。
 */
export function hasValue(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;

    return true;
}

/** 把来源不明的缓存值收敛为可索引对象，非对象一律当作「没有 YAML」 */
function asFrontmatter(frontmatter: unknown): Frontmatter | null {
    if (!frontmatter || typeof frontmatter !== 'object') return null;

    return frontmatter as Frontmatter;
}

/**
 * 判断卡片字段是否已经完整，避免在每次保存后重复写盘。
 * 十个字段必须全部存在，且 created / UID / up 三个身份字段必须有值。
 */
export function isCardInitialized(frontmatter: unknown): boolean {
    const fm = asFrontmatter(frontmatter);

    if (!fm) return false;

    const hasEveryField = CARD_FIELDS.every((key) =>
        Object.prototype.hasOwnProperty.call(fm, key),
    );

    return (
        hasEveryField &&
        hasValue(fm.created) &&
        hasValue(fm.UID) &&
        hasValue(fm.up)
    );
}

/**
 * 判断这份 YAML 属于 MOC（导航笔记）而非卡片；即使 MOC 被改名，也不会误套用卡片模板。
 *
 * 【规格授权的刻意偏离】原脚本判定为「type 是 project 或 area」，
 * 此处放宽为「type 有值即是 MOC」。课程约定只有 MOC 才写 type，
 * 而 type 允许 book 等自定义值，按原判定会把 type: book 的 MOC 误当卡片改写。
 */
export function isMocFrontmatter(frontmatter: unknown): boolean {
    const fm = asFrontmatter(frontmatter);

    if (!fm) return false;

    return hasValue(fm.type);
}

/**
 * 按 CARD_FIELDS 的固定顺序重建 YAML 字段，同时把脚本不认识的其他字段原样追加在后面。
 * 直接在传入对象上原地增删，是因为 processFrontMatter 的回调要求就地修改同一个引用。
 */
export function reorderFrontmatter(frontmatter: Frontmatter, cardValues: CardValues): void {
    const knownFields: readonly string[] = CARD_FIELDS;

    const extraEntries = Object.entries(frontmatter).filter(
        ([key]) => !knownFields.includes(key),
    );

    for (const key of Object.keys(frontmatter)) {
        delete frontmatter[key];
    }

    for (const key of CARD_FIELDS) {
        frontmatter[key] = cardValues[key];
    }

    for (const [key, value] of extraEntries) {
        frontmatter[key] = value;
    }
}
