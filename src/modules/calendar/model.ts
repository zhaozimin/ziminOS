/**
 * [INPUT]: 依赖 lunar-typescript 的 Solar→Lunar 确定性换算；只用农历、传统节日与节气能力，
 *          明确不依赖它的 HolidayUtil 静态调休表
 * [OUTPUT]: 对外提供 monthGrid（月视图的 ISO 周行）、lunarLabel（单日农历文案与节日/节气分类）、
 *           shiftMonth 与 isoDay（界面导航所需的纯日期能力）
 * [POS]: calendar 模块的纯计算层。它不知道 Obsidian、网络、缓存和笔记，给定年月永远吐出同一张日历；
 *        调休属于国务院年度事实，刻意留给 holidays.ts，避免算法与会变的数据纠缠
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Solar } from 'lunar-typescript';

const DAY_MILLIS = 24 * 60 * 60 * 1000;

export interface LunarLabel {
    readonly short: string;
    readonly full: string;
    /** 节日与节气需要在月历里形成第二视觉层级 */
    readonly kind: 'festival' | 'solar-term' | 'month' | 'day' | 'none';
}

export interface CalendarDay {
    readonly date: string;
    readonly year: number;
    readonly month: number;
    readonly day: number;
    /** ISO：1＝周一，7＝周日 */
    readonly weekday: number;
    readonly inMonth: boolean;
    readonly isToday: boolean;
    readonly lunar: LunarLabel;
}

export interface CalendarWeek {
    readonly weekYear: number;
    readonly weekNumber: number;
    /** 本周周一，点周数时以它为复盘锚点 */
    readonly anchor: string;
    readonly days: readonly CalendarDay[];
}

/** 以本地日期构造正午时刻，避开夏令时切换附近的午夜歧义 */
function localDate(year: number, month: number, day: number): Date {
    return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

/** Date → YYYY-MM-DD；只在本模块内部对已经验形的本地 Date 使用 */
export function isoDay(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 月份平移，返回规范化后的年月；负数与跨年由 Date 统一处理 */
export function shiftMonth(year: number, month: number, amount: number): { year: number; month: number } {
    const shifted = localDate(year, month + amount, 1);

    return { year: shifted.getFullYear(), month: shifted.getMonth() + 1 };
}

/**
 * 单日农历短标签。
 * 优先级与人扫日历的识别成本一致：传统节日 > 节气 > 初一显示月份 > 普通农历日。
 */
export function lunarLabel(year: number, month: number, day: number): LunarLabel {
    try {
        const lunar = Solar.fromYmd(year, month, day).getLunar();
        const festival = lunar.getFestivals()[0] ?? '';
        const solarTerm = lunar.getJieQi();
        const monthText = `${lunar.getMonthInChinese()}月`;
        const dayText = lunar.getDayInChinese();
        const isMonthStart = lunar.getDay() === 1;
        const short = festival || solarTerm || (isMonthStart ? monthText : dayText);
        const kind = festival
            ? 'festival'
            : solarTerm
                ? 'solar-term'
                : isMonthStart
                    ? 'month'
                    : 'day';

        return { short, full: `${monthText}${dayText}`, kind };
    } catch {
        // 超出上游算法可表达范围时，公历仍应可用；农历只是这一格的增强信息
        return { short: '', full: '', kind: 'none' };
    }
}

/** 标准 ISO 周坐标，使用 UTC 做中间计算，彻底绕开本地夏令时 */
function isoWeek(date: Date): { year: number; week: number } {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const weekday = target.getUTCDay() || 7;

    target.setUTCDate(target.getUTCDate() + 4 - weekday);

    const weekYear = target.getUTCFullYear();
    const yearStart = new Date(Date.UTC(weekYear, 0, 1));
    const week = Math.ceil(((target.getTime() - yearStart.getTime()) / DAY_MILLIS + 1) / 7);

    return { year: weekYear, week };
}

/**
 * 一个月的完整周行。首尾补到周一/周日，但不强塞固定六行——
 * 二月只有四行时就只画四行，侧栏的垂直空间应当留给笔记而不是空格子。
 */
export function monthGrid(year: number, month: number): readonly CalendarWeek[] {
    const first = localDate(year, month, 1);
    const last = localDate(year, month + 1, 0);
    const firstIsoWeekday = first.getDay() || 7;
    const lastIsoWeekday = last.getDay() || 7;
    const start = localDate(year, month, 1 - (firstIsoWeekday - 1));
    const end = localDate(year, month, last.getDate() + (7 - lastIsoWeekday));
    const today = isoDay(new Date());
    const weeks: CalendarWeek[] = [];

    for (let cursor = start; cursor.getTime() <= end.getTime(); ) {
        const anchor = new Date(cursor.getTime());
        const coordinate = isoWeek(anchor);
        const days: CalendarDay[] = [];

        for (let offset = 0; offset < 7; offset += 1) {
            const date = new Date(anchor.getTime());

            date.setDate(anchor.getDate() + offset);

            const dateText = isoDay(date);
            const dateMonth = date.getMonth() + 1;

            days.push({
                date: dateText,
                year: date.getFullYear(),
                month: dateMonth,
                day: date.getDate(),
                weekday: offset + 1,
                inMonth: date.getFullYear() === year && dateMonth === month,
                isToday: dateText === today,
                lunar: lunarLabel(date.getFullYear(), dateMonth, date.getDate()),
            });
        }

        weeks.push({
            weekYear: coordinate.year,
            weekNumber: coordinate.week,
            anchor: isoDay(anchor),
            days,
        });

        cursor = new Date(anchor.getTime());
        cursor.setDate(anchor.getDate() + 7);
    }

    return weeks;
}
