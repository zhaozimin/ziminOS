/**
 * [INPUT]: 依赖 obsidian 的 TFile 类型；依赖 core/codeblock 的 ViewContext，core/constants 的 LEDGER，
 *          core/time 的 dayOfTitle，core/vaultIndex 的 ListLine/extractLinks
 * [OUTPUT]: 对外提供 LedgerEntry 类型、diaryNotes（全库日记）、collectLedger（全库账本行）、
 *           mentions（某一行是否提到某篇档案）与 isLedgerLine（形态判定）
 * [POS]: 日记里那三类记录的解析层，被档案侧与 MOC 侧的视图共用。
 *        三类记录同一个入口（当天日记），靠一行的形态自动分流——
 *        带全角竖线且第二段是去/来的是账本行，任务行是待办，其余提到人名的是关键事件。
 *        形态分流是这套系统最省事的地方：学员不需要记住三种语法，
 *        他只是在写日记，而档案自己会把该拿的拿走。
 *        债主只认首段的链接，这条判据必须与记账命令的写法严格对偶——
 *        否则「[[张三]]｜去｜替 [[李四]] 带的话」会让李四凭空背上一笔债
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { TFile } from 'obsidian';
import type { ViewContext } from '../../core/codeblock';
import { LEDGER } from '../../core/constants';
import { dayOfTitle } from '../../core/time';
import { extractLinks } from '../../core/vaultIndex';
import type { ListLine } from '../../core/vaultIndex';

/** 一条已归属到人的账本记录 */
export interface LedgerEntry {
    readonly diary: TFile;
    readonly day: string;
    readonly person: TFile;
    readonly kind: string;
    readonly item: string;
    readonly status: string;
    /** 状态是否是合法取值；非法值以 ⚠️ 暴露而不是静默吞掉 */
    readonly legal: boolean;
}

/** 全库日记：只认文件名是日期，不认文件夹 */
export function diaryNotes(view: ViewContext): { file: TFile; day: string }[] {
    const found: { file: TFile; day: string }[] = [];

    for (const file of view.index.allNotes()) {
        const day = dayOfTitle(file.basename);

        if (day) found.push({ file, day });
    }

    return found;
}

/** 这一行提到了那篇档案吗？链接一律解析成文件再比对，别名与子路径写法都认得 */
export function mentions(view: ViewContext, line: ListLine, diaryPath: string, target: TFile): boolean {
    return line.links.some((link) => view.index.resolve(link, diaryPath)?.path === target.path);
}

/** 账本行的形态：至少三段，第二段是「去」或「来」 */
export function isLedgerLine(line: ListLine): boolean {
    if (line.isTask) return false;

    const segments = line.text.split(LEDGER.separator);

    return segments.length >= 3 && (LEDGER.kinds as readonly string[]).includes(segments[1].trim());
}

/**
 * 扫出全库的账本行并归属到人。
 *
 * 只在 MOC 侧的「人情余额」与档案侧的「人情账本」用；两者都只读不写。
 * 读盘走的是带 mtime 校验的缓存，改一篇日记不会让另外几百篇重新读。
 */
export async function collectLedger(
    view: ViewContext,
    resolvePerson: (file: TFile) => boolean,
): Promise<LedgerEntry[]> {
    const entries: LedgerEntry[] = [];

    for (const { file, day } of diaryNotes(view)) {
        for (const line of await view.index.listLinesOf(file)) {
            if (!isLedgerLine(line)) continue;

            const segments = line.text.split(LEDGER.separator).map((part) => part.trim());
            // 债主只认首段：事项里顺带提到的人不算欠债
            const owner = firstResolved(view, segments[0], file.path);

            if (!owner || !resolvePerson(owner)) continue;

            const status = segments[3] || LEDGER.defaultStatus;

            entries.push({
                diary: file,
                day,
                person: owner,
                kind: segments[1],
                item: segments[2],
                status,
                legal: (LEDGER.statuses as readonly string[]).includes(status),
            });
        }
    }

    return entries.sort((left, right) => right.day.localeCompare(left.day));
}

/** 取一段文字里第一个能解析成笔记的链接 */
function firstResolved(view: ViewContext, segment: string, sourcePath: string): TFile | null {
    for (const link of extractLinks(segment)) {
        const resolved = view.index.resolve(link, sourcePath);

        if (resolved) return resolved;
    }

    return null;
}
