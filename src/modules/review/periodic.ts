/**
 * [INPUT]: 依赖 obsidian 的 Notice/TFile 与 App 类型；依赖 core/commands 的 PERIOD_COMMANDS，
 *          core/constants 的 PERIODS/FIELDS/FOLDERS，
 *          core/folders 的 ensureFolderPath/normalizeFolderPath，core/time 的 currentPeriodTitle/
 *          periodStartOf/dayText，core/types 的 ZiminosContext；依赖 ./templates 的 periodNoteContent
 * [OUTPUT]: 对外提供 registerPeriodicCommands（五条打开命令，可注入「日记打开后」回调）、
 *           openPeriodNote（定位或创建某一级笔记）、
 *           periodFolderOf/diaryFolders（目录解析）、periodOfFile/periodStartOfNote（周期归属判定）
 * [POS]: 复盘模块的入口与坐标系。它替代的是 Templater + 日历插件那一套：
 *        五级笔记的文件名、目录、导航链接、周期锚点全部由日期算术确定性地推出，
 *        同输入同结果，无网络、无模板引擎。
 *        「不存在就按模板创建，存在但是空文件就补齐内容」是它的幂等姿态——
 *        学员用别的方式建过一个空日记，命令不会拒绝也不会覆盖，只把该有的骨架填进去。
 *        「打开今天的日记」所需的缺失主题提示通过回调注入，底层 openPeriodNote 仍保持纯粹；
 *        记人情等只想静默确保日记存在的流程，不会被弹窗抢走焦点。
 *        它刻意不写 daily-notes.json：核心日记插件会建出不带模板的空文件，
 *        播种那份配置等于给学员造一条通向空白笔记的岔路
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Notice, TFile } from 'obsidian';
import type { App } from 'obsidian';
import { PERIOD_COMMANDS } from '../../core/commands';
import { FIELDS, FOLDERS, PERIODS } from '../../core/constants';
import type { PeriodDefinition, PeriodKey } from '../../core/constants';
import { ensureFolderPath, normalizeFolderPath } from '../../core/folders';
import { currentPeriodTitle, dayText, periodStartOf, shiftDay } from '../../core/time';
import type { ZiminosContext } from '../../core/types';
import { periodNoteContent } from './templates';

// ============================================================
// 目录解析
// ============================================================

/**
 * 某一级复盘笔记该住的目录。
 * 五个子目录名固定，根目录取自设置——学员把 05-diary 改名或整体搬走，
 * 只改设置页那一个输入框，五条命令与四个视图跟着走。
 */
export function periodFolderOf(ctx: ZiminosContext, period: PeriodDefinition): string {
    const root = normalizeFolderPath(ctx.settings.diaryFolder, FOLDERS.diary);
    const leaf = period.folder.slice(FOLDERS.diary.length + 1);

    return `${root}/${leaf}`;
}

/** 复盘时间轴的全部目录，父目录先于子目录，供开荒贡献使用 */
export function diaryFolders(ctx: ZiminosContext): string[] {
    const root = normalizeFolderPath(ctx.settings.diaryFolder, FOLDERS.diary);

    return [root, ...Object.values(PERIODS).map((period) => periodFolderOf(ctx, period))];
}

// ============================================================
// 周期归属判定
// ============================================================

/**
 * 这篇笔记是哪一级复盘？不是复盘笔记返回 null。
 *
 * 先认 type 再认文件名：type 是笔记自己声明的身份，最可信；
 * 文件名解析是给「用别的工具建出来、还没来得及有 type」的笔记留的后路。
 * 两条都用严格解析，2026-13-45 这类看着像日期的名字不会蒙混过关。
 */
export function periodOfFile(app: App, file: TFile): PeriodDefinition | null {
    const declaredType = String(
        app.metadataCache.getFileCache(file)?.frontmatter?.[FIELDS.type] ?? '',
    ).trim();

    for (const period of Object.values(PERIODS)) {
        if (period.type === declaredType) return period;
    }

    for (const period of Object.values(PERIODS)) {
        if (periodStartOf(period, file.basename) !== null) return period;
    }

    return null;
}

/**
 * 一篇复盘笔记的周期锚点。
 * 优先读声明的 period_start，读不到才从标题推——日记本来就没有这个字段，
 * 它的锚点永远是文件名，这不是缺失而是设计。
 */
export function periodStartOfNote(
    app: App,
    file: TFile,
    period: PeriodDefinition,
): string | null {
    const declared = dayText(app.metadataCache.getFileCache(file)?.frontmatter?.[FIELDS.periodStart]);

    return declared ?? periodStartOf(period, file.basename);
}

/** 「范围」参数到周期的映射；学员在代码块里写「范围: 周」 */
const SCOPE_ALIASES: Readonly<Record<string, PeriodKey>> = {
    周: 'weekly',
    月: 'monthly',
    季: 'quarterly',
    年: 'yearly',
};

/** 一次视图渲染所处的时间坐标：哪一级、从哪天到哪天（右端开区间） */
export interface PeriodScope {
    readonly period: PeriodDefinition;
    readonly start: string;
    readonly end: string;
}

/**
 * 解出一个视图该看哪段时间。
 *
 * 以宿主笔记自己的身份为准，认不出来才看块里写的「范围」——
 * 笔记的 type 是它自己声明的事实，比代码块里的一行参数可信；
 * 参数存在的意义是给那些还没有 type 的笔记留一条明路，而不是覆盖事实。
 * 区间一律取左闭右开，五级共用同一条比较式，不存在「月末那天算不算」这类边界分歧。
 */
export function resolveScope(
    app: App,
    host: TFile | null,
    params: Readonly<Record<string, string>>,
): PeriodScope | null {
    const aliasKey = SCOPE_ALIASES[params['范围'] ?? ''];
    const period = (host ? periodOfFile(app, host) : null) ?? (aliasKey ? PERIODS[aliasKey] : null);

    if (!period || !host) return null;

    const start = periodStartOfNote(app, host, period);

    if (!start) return null;

    return { period, start, end: shiftDay(start, 1, period.stepUnit) };
}

// ============================================================
// 打开或创建
// ============================================================

/**
 * 打开当下所属的那一篇复盘笔记，不存在就按模板创建。
 *
 * 三种情形三种姿态，都不覆盖用户内容：
 * 文件不存在 → 建；文件在但是空的 → 把骨架填进去（别的工具建的空壳也能用起来）；
 * 文件在且有内容 → 一个字不动，直接打开。
 */
export async function openPeriodNote(
    ctx: ZiminosContext,
    period: PeriodDefinition,
    options?: { readonly reveal?: boolean },
): Promise<TFile | null> {
    try {
        const title = currentPeriodTitle(period);
        const folder = periodFolderOf(ctx, period);
        const path = `${folder}/${title}.md`;
        const existing = ctx.app.vault.getAbstractFileByPath(path);

        if (existing && !(existing instanceof TFile)) {
            new Notice(`同名的不是笔记而是文件夹：${path}`);

            return null;
        }

        const content = periodNoteContent(period, title, ctx.settings.dateTimeFormat);
        let file = existing as TFile | null;

        if (!file) {
            await ensureFolderPath(ctx.app, folder);
            ctx.guard.mark(path);
            file = await ctx.app.vault.create(path, content);
        } else if (file.stat.size === 0) {
            ctx.guard.mark(path);
            await ctx.app.vault.process(file, () => content);
        }

        // reveal 为 false 时只保证笔记存在，不抢走学员当前的视野——
        // 记人情这类「顺手记一笔」的动作不该把他正在读的笔记顶掉
        if (options?.reveal !== false) await ctx.app.workspace.getLeaf(false).openFile(file);

        return file;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        new Notice(`打开${period.label}失败：${message}`);

        return null;
    }
}

/**
 * 注册五条打开命令。
 *
 * 五条而不是「一条命令再选周期」：每一条都能各自绑快捷键，
 * 而日记是每天要开的高频入口，让它多经过一层选择是把成本加在最高频的动作上。
 */
export function registerPeriodicCommands(
    ctx: ZiminosContext,
    onDailyOpened?: (file: TFile) => Promise<void>,
): void {
    for (const period of Object.values(PERIODS)) {
        ctx.commands.register(PERIOD_COMMANDS[period.key], () => {
            void (async () => {
                const file = await openPeriodNote(ctx, period);

                if (file && period.key === 'daily') await onDailyOpened?.(file);
            })();
        });
    }
}
