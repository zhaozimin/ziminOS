/**
 * [INPUT]: 依赖 obsidian 导出的 moment，依赖 ./constants 的 UID_FORMAT 与 DEFAULT_DATETIME_FORMAT
 * [OUTPUT]: 对外提供 nowStamp（按设置格式取当前时间）、nowUid（17 位本地时间 UID）、
 *           nowStampAndUid（同一时刻同时派生时间戳与 UID）及其返回类型 StampAndUid
 * [POS]: core 的时间口径统一处，同时是 dateTimeFormat 设置项的守门人——
 *        设置页刻意不做校验，空值回落在此收敛为唯一一处，调用方传原值即可，无从遗漏。
 *        原始三份脚本里存在两套实现（手写 padStart 与 moment），此处统一为 moment 一种
 *        （输出字符串完全一致，属消重而非行为改变）；原脚本「同一时刻派生 created 与 UID」
 *        的原子性由 nowStampAndUid 承载，跨秒边界下两个字段不会各说各话。
 *        全仓库禁止再就地 new Date() 拼时间，格式必须走这里，dateTimeFormat 设置才真正生效
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { moment } from 'obsidian';
import { DEFAULT_DATETIME_FORMAT, UID_FORMAT } from './constants';

/** 本模块只用得到 format，按接口隔离原则不引入 moment 的完整类型 */
interface MomentLike {
    format(format: string): string;
}

/** 同一时刻派生出的两个时间身份：人读的时间戳与机器认的永久 UID */
export interface StampAndUid {
    /** 按 dateTimeFormat 格式化的可读时间，写入 created */
    readonly stamp: string;
    /** 17 位本地时间 UID，写入 UID */
    readonly uid: string;
}

/**
 * obsidian 把 moment 作为「命名空间」导出，而 tsconfig 开启了 esModuleInterop，
 * 命名空间类型不携带调用签名，因此需要在此还原它本来的函数形态。
 * 运行时拿到的就是 Obsidian 内置的 moment 本体，本断言只修类型不改行为，且全仓库仅此一处。
 */
const momentFactory = moment as unknown as () => MomentLike;

/**
 * 把设置页里的自由文本收敛成可用的 moment 格式串：空串、纯空白、非字符串一律回落默认格式。
 * 这道兜底刻意不外露——nowStamp 与 nowStampAndUid 内部各走一次，
 * 调用方直接把 settings.dateTimeFormat 原值递进来即可，不存在「某个读取点忘了兜底」的可能。
 * 若把空串透传给 moment，它会改用自己的 ISO 默认格式，同一个库里就会分叉出两种时间写法。
 */
function normalizeDateTimeFormat(value: string | undefined): string {
    const candidate = typeof value === 'string' ? value.trim() : '';

    return candidate || DEFAULT_DATETIME_FORMAT;
}

/**
 * 按设置的时间格式取当前本地时间。
 * 传入原始设置值即可，空值回落由本函数负责。
 */
export function nowStamp(format: string): string {
    return momentFactory().format(normalizeDateTimeFormat(format));
}

/**
 * 取 17 位本地时间 UID（YYYYMMDDHHmmssSSS）。
 * UID 是笔记的永久身份，格式固定不可配置，因此不接受参数。
 * 当前两个写 UID 的地方都要同时写 created，故都走 nowStampAndUid；本函数是规格第 4 节
 * 明列的 core/time 公开接口，为「只需要一个 UID」的调用点保留，不因暂无引用而删除。
 */
export function nowUid(): string {
    return momentFactory().format(UID_FORMAT);
}

/**
 * 在同一时刻同时取出时间戳与 UID。
 * 原脚本 create-project-moc.js 与 initialize-card-note.js 都先取一个 now 再派生两个字段，
 * 分成两次调用会在跨秒边界上让 created 与 UID 相差一秒——同一张卡片的两个时间身份必须一致，
 * 因此凡是要同时写 created 与 UID 的地方一律走这里，不得各调一次。
 */
export function nowStampAndUid(format: string): StampAndUid {
    const now = momentFactory();

    return {
        stamp: now.format(normalizeDateTimeFormat(format)),
        uid: now.format(UID_FORMAT),
    };
}
