/**
 * [INPUT]: 无运行时依赖；字段形态逐字对应 holiday-cn 的年度 JSON
 * [OUTPUT]: 对外提供节假日年度数据、单日覆盖与日历年度状态契约
 * [POS]: calendar 模块的数据边界。远端响应、内置快照、磁盘缓存与界面只通过这组结构交流，
 *        任何来源先被收敛成同一种事实，界面因此不认识 CDN、GitHub 或缓存文件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/** 国务院年度安排里明确点名的一天；普通周末不在其中，由日历本地计算 */
export interface HolidayDay {
    readonly name: string;
    readonly date: string;
    /** true＝放假，false＝周末补班 */
    readonly isOffDay: boolean;
}

/** 一份以国务院通知标题年份命名的 holiday-cn 数据 */
export interface HolidayDataset {
    readonly year: number;
    readonly papers: readonly string[];
    readonly days: readonly HolidayDay[];
}

/** 界面底部对某个公历年的数据状态说明 */
export interface HolidayYearStatus {
    readonly hasSchedule: boolean;
    readonly lastCheckedAt: number | null;
    readonly papers: readonly string[];
}
