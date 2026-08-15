/**
 * [INPUT]: 依赖 ./holidayTypes 的 HolidayDataset 契约；数据逐日取自国务院办公厅
 *          《关于2026年部分节假日安排的通知》，经 holiday-cn 同形 JSON 复核
 * [OUTPUT]: 对外提供 BUILT_IN_HOLIDAY_DATASETS，作为首次联网前与网络失败时的离线保底
 * [POS]: calendar 模块的最后可用事实底座。这里只收已经发布且人工核过的稀疏覆盖日，
 *        普通周末、农历与节气均由本地算法生成，不在这里复制第二份
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { HolidayDataset } from './holidayTypes';

const NOTICE_2026 =
    'https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm';

/**
 * 内置快照不是更新渠道，只是离线底座。联网成功后的数据会落进 holiday-cache.json，
 * 同一年优先使用缓存；下一年尚未公布时保持空态，不拿农历规则猜调休。
 */
export const BUILT_IN_HOLIDAY_DATASETS: readonly HolidayDataset[] = [
    {
        year: 2026,
        papers: [NOTICE_2026],
        days: [
            { name: '元旦', date: '2026-01-01', isOffDay: true },
            { name: '元旦', date: '2026-01-02', isOffDay: true },
            { name: '元旦', date: '2026-01-03', isOffDay: true },
            { name: '元旦', date: '2026-01-04', isOffDay: false },
            { name: '春节', date: '2026-02-14', isOffDay: false },
            { name: '春节', date: '2026-02-15', isOffDay: true },
            { name: '春节', date: '2026-02-16', isOffDay: true },
            { name: '春节', date: '2026-02-17', isOffDay: true },
            { name: '春节', date: '2026-02-18', isOffDay: true },
            { name: '春节', date: '2026-02-19', isOffDay: true },
            { name: '春节', date: '2026-02-20', isOffDay: true },
            { name: '春节', date: '2026-02-21', isOffDay: true },
            { name: '春节', date: '2026-02-22', isOffDay: true },
            { name: '春节', date: '2026-02-23', isOffDay: true },
            { name: '春节', date: '2026-02-28', isOffDay: false },
            { name: '清明节', date: '2026-04-04', isOffDay: true },
            { name: '清明节', date: '2026-04-05', isOffDay: true },
            { name: '清明节', date: '2026-04-06', isOffDay: true },
            { name: '劳动节', date: '2026-05-01', isOffDay: true },
            { name: '劳动节', date: '2026-05-02', isOffDay: true },
            { name: '劳动节', date: '2026-05-03', isOffDay: true },
            { name: '劳动节', date: '2026-05-04', isOffDay: true },
            { name: '劳动节', date: '2026-05-05', isOffDay: true },
            { name: '劳动节', date: '2026-05-09', isOffDay: false },
            { name: '端午节', date: '2026-06-19', isOffDay: true },
            { name: '端午节', date: '2026-06-20', isOffDay: true },
            { name: '端午节', date: '2026-06-21', isOffDay: true },
            { name: '国庆节', date: '2026-09-20', isOffDay: false },
            { name: '中秋节', date: '2026-09-25', isOffDay: true },
            { name: '中秋节', date: '2026-09-26', isOffDay: true },
            { name: '中秋节', date: '2026-09-27', isOffDay: true },
            { name: '国庆节', date: '2026-10-01', isOffDay: true },
            { name: '国庆节', date: '2026-10-02', isOffDay: true },
            { name: '国庆节', date: '2026-10-03', isOffDay: true },
            { name: '国庆节', date: '2026-10-04', isOffDay: true },
            { name: '国庆节', date: '2026-10-05', isOffDay: true },
            { name: '国庆节', date: '2026-10-06', isOffDay: true },
            { name: '国庆节', date: '2026-10-07', isOffDay: true },
            { name: '国庆节', date: '2026-10-10', isOffDay: false },
        ],
    },
];
