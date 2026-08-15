/**
 * [INPUT]: 依赖 obsidian 公开 requestUrl 与 DataAdapter；依赖 core/types 的 ZiminosContext；
 *          依赖 ./holidaySnapshot 的离线底座与 ./holidayTypes 的数据契约
 * [OUTPUT]: 对外提供 HolidayService（按日查询、年度状态、按需无感更新）与
 *           parseHolidayDataset（远端/缓存共用的严格验形器）
 * [POS]: calendar 模块唯一联网与落缓存的地方。它把“数据从哪来”关在一个出口：
 *        界面永远先读内存中的最后正确版本，更新成功才原子替换；CDN、Raw 或磁盘损坏
 *        都只能让数据停在旧版，不能让日历空白、更不能伪造下一年的调休
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { requestUrl } from 'obsidian';
import type { ZiminosContext } from '../../core/types';
import { BUILT_IN_HOLIDAY_DATASETS } from './holidaySnapshot';
import type { HolidayDataset, HolidayDay, HolidayYearStatus } from './holidayTypes';

const CACHE_SCHEMA_VERSION = 1;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FAILED_RETRY_MS = 5 * 60 * 1000;
const CACHE_FILE = 'holiday-cache.json';

const SOURCES: readonly ((year: number) => string)[] = [
    (year) => `https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/${year}.json`,
    (year) => `https://fastly.jsdelivr.net/gh/NateScarlet/holiday-cn@master/${year}.json`,
    (year) => `https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/${year}.json`,
];

interface NoticeRecord {
    readonly checkedAt: number;
    readonly dataset: HolidayDataset;
}

interface CacheEnvelope {
    readonly schemaVersion: number;
    readonly notices: readonly NoticeRecord[];
}

type Listener = () => void;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() + 1 === month &&
        date.getUTCDate() === day
    );
}

function isGovernmentPaper(value: string): boolean {
    try {
        const url = new URL(value);

        return url.protocol === 'https:' && (url.hostname === 'gov.cn' || url.hostname.endsWith('.gov.cn'));
    } catch {
        return false;
    }
}

/**
 * 把不可信 JSON 收敛成年度数据。任何一日有问题就整份拒绝：
 * “少显示一个补班日”不会报错，却会直接误导人的安排，半份真相比没有更危险。
 */
export function parseHolidayDataset(input: unknown, expectedYear: number): HolidayDataset | null {
    if (!isRecord(input) || input.year !== expectedYear) return null;
    if (!Array.isArray(input.papers) || !Array.isArray(input.days)) return null;

    const papers: string[] = [];

    for (const paper of input.papers) {
        if (typeof paper !== 'string' || !isGovernmentPaper(paper)) return null;
        papers.push(paper);
    }

    const days: HolidayDay[] = [];
    const seen = new Set<string>();

    for (const item of input.days) {
        if (!isRecord(item)) return null;

        const name = typeof item.name === 'string' ? item.name.trim() : '';
        const date = typeof item.date === 'string' ? item.date : '';
        const dateYear = Number(date.slice(0, 4));

        if (!name || !isIsoDate(date) || typeof item.isOffDay !== 'boolean') return null;
        // 下一年通知可能反向影响上一年 12 月；只接受这两个合理年份，挡住串年污染
        if (dateYear !== expectedYear && dateYear !== expectedYear - 1) return null;
        if (seen.has(date)) return null;

        seen.add(date);
        days.push({ name, date, isOffDay: item.isOffDay });
    }

    if (days.length > 0 && papers.length === 0) return null;

    days.sort((left, right) => left.date.localeCompare(right.date));

    return { year: expectedYear, papers, days };
}

/**
 * 国务院调休数据服务。
 * 无定时器、无轮询：日历视图打开或切年时调用 refreshCalendarYear，24 小时内直接命中缓存。
 */
export class HolidayService {
    private readonly ctx: ZiminosContext;
    private readonly records = new Map<number, NoticeRecord>();
    private readonly days = new Map<string, HolidayDay>();
    private readonly listeners = new Set<Listener>();
    private readonly inflight = new Map<number, Promise<void>>();
    private readonly lastAttempt = new Map<number, number>();
    private readonly cachePath: string;
    private readonly ready: Promise<void>;

    constructor(ctx: ZiminosContext) {
        this.ctx = ctx;
        this.cachePath = `${ctx.app.vault.configDir}/plugins/${ctx.plugin.manifest.id}/${CACHE_FILE}`;

        for (const dataset of BUILT_IN_HOLIDAY_DATASETS) {
            this.records.set(dataset.year, { checkedAt: 0, dataset });
        }

        this.rebuildDays();
        this.ready = this.loadCache();
    }

    /** 取某一天的官方覆盖；没有即按普通工作日/周末解释 */
    day(date: string): HolidayDay | null {
        return this.days.get(date) ?? null;
    }

    /** 当前显示年是否已经有正式安排，以及最近一次无感检查时间 */
    status(year: number): HolidayYearStatus {
        const relevant = [this.records.get(year), this.records.get(year + 1)].filter(
            (record): record is NoticeRecord => record !== undefined,
        );
        const papers = new Set<string>();
        let lastCheckedAt: number | null = null;

        for (const record of relevant) {
            for (const paper of record.dataset.papers) papers.add(paper);
            if (record.checkedAt > 0) lastCheckedAt = Math.max(lastCheckedAt ?? 0, record.checkedAt);
        }

        const hasSchedule = [...this.days.keys()].some((date) => date.startsWith(`${year}-`));

        return { hasSchedule, lastCheckedAt, papers: [...papers] };
    }

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);

        return () => this.listeners.delete(listener);
    }

    /**
     * 显示某公历年时同时检查“本年通知”和“下一年通知”。后者可能写入本年 12 月的补班，
     * 少查它会让跨年元旦附近静默出错。
     */
    async refreshCalendarYear(year: number): Promise<void> {
        await this.ready;
        await Promise.all([this.refreshNotice(year), this.refreshNotice(year + 1)]);
    }

    private async refreshNotice(year: number): Promise<void> {
        const now = Date.now();
        const cached = this.records.get(year);

        if (cached && cached.checkedAt > 0 && now - cached.checkedAt < CACHE_TTL_MS) return;
        if (now - (this.lastAttempt.get(year) ?? 0) < FAILED_RETRY_MS) return;

        const running = this.inflight.get(year);

        if (running) return running;

        const task = this.fetchAndStore(year, now).finally(() => this.inflight.delete(year));

        this.inflight.set(year, task);

        return task;
    }

    private async fetchAndStore(year: number, checkedAt: number): Promise<void> {
        this.lastAttempt.set(year, checkedAt);

        const incoming = await this.fetchDataset(year);

        if (!incoming) return;

        const current = this.records.get(year)?.dataset;
        // 空数据表示“尚未公布”。它可以记住检查时间，但不能冲掉已经存在的正式安排
        const dataset = incoming.days.length === 0 && current && current.days.length > 0 ? current : incoming;

        this.records.set(year, { checkedAt, dataset });
        this.rebuildDays();

        try {
            await this.saveCache();
        } catch {
            // 内存中的新数据仍可用；下次启动回到旧缓存，比用 Notice 打断写作更诚实
        }

        this.emit();
    }

    private async fetchDataset(year: number): Promise<HolidayDataset | null> {
        for (const source of SOURCES) {
            try {
                const response = await requestUrl({ url: source(year), throw: false });

                if (response.status !== 200) continue;

                const parsed = parseHolidayDataset(response.json as unknown, year);

                if (parsed) return parsed;
            } catch {
                // 镜像故障即试下一个；全部失败时保留最后正确版本，不抛到界面
            }
        }

        return null;
    }

    private rebuildDays(): void {
        this.days.clear();

        // 标题年份越新的通知越可信，升序覆盖可让下一年通知修正上一年 12 月
        const records = [...this.records.values()].sort(
            (left, right) => left.dataset.year - right.dataset.year,
        );

        for (const record of records) {
            for (const day of record.dataset.days) this.days.set(day.date, day);
        }
    }

    private async loadCache(): Promise<void> {
        const adapter = this.ctx.app.vault.adapter;

        try {
            if (!(await adapter.exists(this.cachePath))) return;

            const raw = JSON.parse(await adapter.read(this.cachePath)) as unknown;

            if (!isRecord(raw) || raw.schemaVersion !== CACHE_SCHEMA_VERSION || !Array.isArray(raw.notices)) {
                return;
            }

            for (const item of raw.notices) {
                if (!isRecord(item) || typeof item.checkedAt !== 'number' || !Number.isFinite(item.checkedAt)) {
                    continue;
                }
                if (!isRecord(item.dataset)) continue;

                const year = item.dataset.year;

                if (typeof year !== 'number' || !Number.isInteger(year)) continue;

                const dataset = parseHolidayDataset(item.dataset, year);

                if (!dataset) continue;

                const builtIn = this.records.get(year)?.dataset;
                const chosen = dataset.days.length === 0 && builtIn && builtIn.days.length > 0
                    ? builtIn
                    : dataset;

                this.records.set(year, { checkedAt: item.checkedAt, dataset: chosen });
            }

            this.rebuildDays();
            this.emit();
        } catch {
            // 缓存可删可重建；损坏时直接退回编译进 main.js 的官方快照
        }
    }

    private async saveCache(): Promise<void> {
        const notices = [...this.records.values()]
            .filter((record) => record.checkedAt > 0)
            .sort((left, right) => left.dataset.year - right.dataset.year);
        const envelope: CacheEnvelope = { schemaVersion: CACHE_SCHEMA_VERSION, notices };

        await this.ctx.app.vault.adapter.write(this.cachePath, `${JSON.stringify(envelope, null, 2)}\n`);
    }

    private emit(): void {
        for (const listener of this.listeners) listener();
    }
}
