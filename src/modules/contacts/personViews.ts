/**
 * [INPUT]: 依赖 obsidian 的 TFile 类型；依赖 core/codeblock 的 ViewContext/ViewDefinition，
 *          core/constants 的 FIELDS/NOTE_TYPES/STATUS_LABELS，core/table 的渲染原语，
 *          core/time 的 dayOfTitle，core/vaultIndex 的 extractLinks/toText；
 *          依赖 ./ledger 的 collectLedger/mentions/isLedgerLine/diaryNotes
 * [OUTPUT]: 对外提供 personViews（相关项目、人情账本、关键事件、待办四个视图定义）
 * [POS]: 长在人物档案上的四个视图，人脉与客户档案共用同一套——两类档案守同一条法：
 *        稳定事实进 frontmatter，发生的事写进当天日记，档案自动检索。
 *        因此客户档案里没有手写的「他的问题」「交付记录」小节：
 *        那些本来就是某天发生的事，学员不该维护任何一份档案的正文。
 *        「关键事件」刻意排除档案之间的互链——两份档案互相提到对方是常事，
 *        把它算成一次事件会让两个人的时间线上凭空多出一条谁也没做过的记录
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { TFile } from 'obsidian';
import type { ViewContext, ViewDefinition } from '../../core/codeblock';
import { FIELDS, NOTE_TYPES, STATUS_LABELS } from '../../core/constants';
import { noteLink, renderEmpty, renderNote, renderSummary, renderTable } from '../../core/table';
import type { Cell } from '../../core/table';
import { dayOfTitle } from '../../core/time';
import { extractLinks, toText } from '../../core/vaultIndex';
import { collectLedger, isLedgerLine, mentions } from './ledger';

/** 一张表最多列多少行 */
const MAX_ROWS = 20;

// ============================================================
// 相关项目
// ============================================================

/**
 * 他委托的、以及和他一起做的项目。
 *
 * 两个键分工严格：client 是商业契约标记，写下它等于宣告「我欠这个人一个交付」，
 * 客户名录直接用它反推身份；with 只是同行，没有交付债务。
 * 同一项目两个键都指向他时按委托计——债务重的那一层优先。
 */
const relatedProjects: ViewDefinition = {
    name: '相关项目',
    render: async (view: ViewContext): Promise<void> => {
        if (!view.host) {
            renderEmpty(view.el, '这个视图要长在人物档案上才有内容。');

            return;
        }

        const rows: Cell[][] = [];

        for (const project of view.index.notesOfType(NOTE_TYPES.project)) {
            const relation = relationOf(view, project, view.host);

            if (!relation) continue;

            const status = toText(view.index.fieldOf(project, FIELDS.status));

            rows.push([noteLink(project), relation, STATUS_LABELS[status] ?? status ?? '—']);
        }

        if (!rows.length) {
            renderEmpty(
                view.el,
                `还没有和他相关的项目。在项目 MOC 的属性里写 \`${FIELDS.client}: "[[${view.host.basename}]]"\`（他委托的）或 \`${FIELDS.with}\`（一起做的）。`,
            );

            return;
        }

        renderTable(view.ctx.app, view.el, view.sourcePath, ['项目', '关系', '状态'], rows);
    },
};

/** 项目与这个人的关系；两个键都指向他时按委托计 */
function relationOf(view: ViewContext, project: TFile, person: TFile): string | null {
    if (fieldPointsTo(view, project, FIELDS.client, person)) return '委托';

    if (fieldPointsTo(view, project, FIELDS.with, person)) return '同行';

    return null;
}

/** 某个 frontmatter 字段里的链接是否指向这个人 */
function fieldPointsTo(view: ViewContext, note: TFile, field: string, target: TFile): boolean {
    const raw = view.index.fieldOf(note, field);
    const values = Array.isArray(raw) ? raw : [raw];

    for (const value of values) {
        for (const link of extractLinks(String(value ?? ''))) {
            if (view.index.resolve(link, note.path)?.path === target.path) return true;
        }
    }

    return false;
}

// ============================================================
// 人情账本
// ============================================================

/** 这个人名下的全部账本行，按日期倒序 */
const personLedger: ViewDefinition = {
    name: '人情账本',
    render: async (view: ViewContext): Promise<void> => {
        const host = view.host;

        if (!host) {
            renderEmpty(view.el, '这个视图要长在人物档案上才有内容。');

            return;
        }

        const entries = await collectLedger(view, (owner) => owner.path === host.path);

        if (!entries.length) {
            renderEmpty(
                view.el,
                `还没有账。命令面板运行「记人情」，或在当天日记里写一行：\`- [[${host.basename}]]｜去｜事项｜两清\``,
            );

            return;
        }

        renderTable(
            view.ctx.app,
            view.el,
            view.sourcePath,
            ['日期', '去/来', '事项', '状态'],
            entries.map((entry): Cell[] => [
                noteLink(entry.diary, entry.day),
                entry.kind,
                entry.item,
                entry.legal ? entry.status : `⚠️ ${entry.status}`,
            ]),
        );
    },
};

// ============================================================
// 关键事件
// ============================================================

/** 日记里提到他的普通行——不是账本、不是任务的那些 */
const keyEvents: ViewDefinition = {
    name: '关键事件',
    render: async (view: ViewContext): Promise<void> => {
        const host = view.host;

        if (!host) {
            renderEmpty(view.el, '这个视图要长在人物档案上才有内容。');

            return;
        }

        const rows: Cell[][] = [];
        let total = 0;

        for (const source of mentionSources(view, host)) {
            for (const line of await view.index.listLinesOf(source.file)) {
                if (line.isTask || isLedgerLine(line)) continue;
                if (!mentions(view, line, source.file.path, host)) continue;

                total += 1;

                if (rows.length < MAX_ROWS) rows.push([noteLink(source.file, source.day), line.text]);
            }
        }

        if (!rows.length) {
            renderEmpty(
                view.el,
                `还没有和他有关的事。在当天日记里写一行提到 \`[[${host.basename}]]\`，这里就会长出来。`,
            );

            return;
        }

        renderTable(view.ctx.app, view.el, view.sourcePath, ['日期', '发生了什么'], rows);

        if (total > rows.length) renderNote(view.el, `…另有 ${total - rows.length} 条更早的记录`);
    },
};

// ============================================================
// 待办
// ============================================================

/** 日记里跟他有关、还没勾掉的任务行 */
const openTasks: ViewDefinition = {
    name: '待办',
    render: async (view: ViewContext): Promise<void> => {
        const host = view.host;

        if (!host) {
            renderEmpty(view.el, '这个视图要长在人物档案上才有内容。');

            return;
        }

        const rows: Cell[][] = [];
        let done = 0;

        for (const source of mentionSources(view, host)) {
            for (const line of await view.index.listLinesOf(source.file)) {
                if (!line.isTask) continue;
                if (!mentions(view, line, source.file.path, host)) continue;

                if (line.checked) done += 1;
                else rows.push([noteLink(source.file, source.day), line.text]);
            }
        }

        if (!rows.length) {
            renderEmpty(
                view.el,
                done
                    ? `跟他有关的事都办完了（已完成 ${done} 件）。`
                    : `没有待办。需要跟进的共识写成任务行：\`- [ ] 出方案给 [[${host.basename}]]\``,
            );

            return;
        }

        renderSummary(view.el, `还欠 **${rows.length}** 件事${done ? `（已完成 ${done} 件）` : ''}`);
        renderTable(view.ctx.app, view.el, view.sourcePath, ['日期', '待办'], rows);
    },
};

// ============================================================
// 共用
// ============================================================

/**
 * 可能提到这个人的日记，按日期倒序。
 *
 * 只走反链而不扫全库：链到他的笔记通常只有几十篇。
 * 同时排除另一份档案——两份档案互相提到对方是常事（「张三把李四介绍给我」会写进日记，
 * 但档案正文里的互相引用不是一次事件），把它算进去等于凭空造出一条记录。
 */
function mentionSources(view: ViewContext, host: TFile): { file: TFile; day: string }[] {
    const sources: { file: TFile; day: string }[] = [];

    for (const file of view.index.backlinksOf(host)) {
        const day = dayOfTitle(file.basename);

        if (!day) continue;

        const type = toText(view.index.fieldOf(file, FIELDS.type));

        if (type === NOTE_TYPES.person || type === NOTE_TYPES.client) continue;

        sources.push({ file, day });
    }

    return sources.sort((left, right) => right.day.localeCompare(left.day));
}

/** 长在人物档案上的四个视图 */
export const personViews: readonly ViewDefinition[] = [
    relatedProjects,
    personLedger,
    keyEvents,
    openTasks,
];
