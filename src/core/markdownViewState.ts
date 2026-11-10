/**
 * [INPUT]: 依赖 obsidian 的 App/MarkdownView/TFile 公开视图契约；依赖 ./lineDiff 的逐行差异
 * [OUTPUT]: 对外提供 withPreservedMarkdownScroll（后台写入时保住所有已加载分栏的滚动位置）、
 *           processDisplayedNoteByHunks（对仍显示着的笔记按差异块逐处改写）与 HunkedProcessPlan 类型
 * [POS]: core 的 Markdown 视图稳定层。Vault.process 与 processFrontMatter 负责文件一致性，
 *        本文件只修补它们从磁盘回推到已打开 MarkdownView 时可能丢失的滚动状态；
 *        业务模块因此不需要各自认识分栏、实时预览或阅读视图。
 *        同一篇的多次写入共用一份视口快照：排版、updated 在同一次走开里接连落盘，
 *        后一次若自己拍快照，拍到的正是前一次刚塌下来的位置，再把它「恢复」回去
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { MarkdownView } from 'obsidian';
import type { App, MarkdownViewModeType, TFile } from 'obsidian';
import { diffLineHunks, hunksToOffsetChanges } from './lineDiff';

interface MarkdownScrollMark {
    readonly view: MarkdownView;
    readonly path: string;
    readonly mode: MarkdownViewModeType;
    readonly scroll: number;
}

/**
 * 同一篇笔记的一段连续写入期：从第一次写入开始，到最后一次写入之后那一帧恢复完为止。
 * 期间所有写入都用第一次拍下的快照——只有那一刻的视口还是用户留下的样子。
 */
interface ScrollSession {
    readonly marks: readonly MarkdownScrollMark[];
    /** 正在进行的写入数 */
    writers: number;
    /** 每次写入收尾递增；只有最后一次收尾排下的那一帧才结束这段写入期 */
    epoch: number;
}

const sessions = new Map<string, ScrollSession>();

/**
 * 执行一次文件写入，并保住这篇笔记在每个已加载 Markdown 分栏中的滚动位置。
 *
 * 立即恢复处理同步回推，下一帧再恢复一次处理 CodeMirror/阅读视图的延后排版。
 * 只认仍在显示同一路径、且模式没变的原视图：写入期间用户若换了文件或切了模式，
 * 新选择比旧滚动位置优先。
 *
 * 写入期内的第二次写入不重新拍快照。真机日志（v0.40.0，左右分栏、实时预览）：
 * 从左栏点进右栏的同一拍里，排版与 updated 两笔欠账先后落盘；排版的整篇回推把视口
 * 塌到文首附近，updated 在下一帧恢复之前拍快照，拍到的就是那个塌缩值，
 * 它最后一个恢复，于是把左栏钉在了文首。
 */
export async function withPreservedMarkdownScroll<T>(
    app: App,
    file: TFile,
    write: () => Promise<T>,
): Promise<T> {
    const path = file.path;
    let session = sessions.get(path);

    if (!session) {
        const marks = captureMarkdownScroll(app, path);

        if (marks.length === 0) return write();

        session = { marks, writers: 0, epoch: 0 };
        sessions.set(path, session);
    }

    const current = session;

    current.writers += 1;

    try {
        return await write();
    } finally {
        current.writers -= 1;
        current.epoch += 1;

        const epoch = current.epoch;

        restoreMarkdownScroll(current.marks);

        // 外部写入触发的视图重排可能晚于 Promise 完成，下一帧再把视口放回去。
        // 这一帧之前又开始的写入会推进 epoch，由它收尾时排下的那一帧接着收尾
        window.requestAnimationFrame(() => {
            restoreMarkdownScroll(current.marks);

            if (current.writers === 0 && current.epoch === epoch && sessions.get(path) === current) {
                sessions.delete(path);
            }
        });
    }
}

function captureMarkdownScroll(app: App, path: string): MarkdownScrollMark[] {
    const marks: MarkdownScrollMark[] = [];

    // Obsidian 1.7.2 起后台页签可能是 DeferredView；instanceof 是官方要求的边界。
    app.workspace.iterateAllLeaves((leaf) => {
        if (!(leaf.view instanceof MarkdownView) || leaf.view.file?.path !== path) return;

        const mode = leaf.view.getMode();
        const scroll = leaf.view.currentMode.getScroll();

        if (!Number.isFinite(scroll) || scroll < 0) return;

        marks.push({ view: leaf.view, path, mode, scroll });
    });

    return marks;
}

function restoreMarkdownScroll(marks: readonly MarkdownScrollMark[]): void {
    for (const mark of marks) {
        if (mark.view.file?.path !== mark.path || mark.view.getMode() !== mark.mode) continue;

        mark.view.currentMode.applyScroll(mark.scroll);
    }
}

// ============================================================
// 按差异块逐处改写
// ============================================================

export interface HunkedProcessPlan {
    /** 纯变换：同输入同输出，不带副作用 */
    readonly transform: (content: string) => string;
    /** 每一次真正写盘之前问一次；返回 false 就停下，剩下的改动留给下一次 */
    readonly mayWrite: () => boolean;
    /** 确定要写的那一刻调用（声明自写之类）；每一处改动各调一次 */
    readonly willWrite: () => void;
}

/**
 * 改写一篇笔记，返回是否写过盘。
 *
 * 没有分栏显示它：一次 `vault.process` 写完。
 * 有分栏显示它：把改动拆成逐行差异块，**从下往上**每块单独写一次。
 * 原因在宿主：Obsidian 把磁盘改动回推进编辑器时，只做一次「第一处差异到最后一处差异」的整段替换
 * （1.14 的 MarkdownEditView.set）。排版若同时改了第 10 行与第 400 行，中间几百行连同图片都被销毁重建，
 * 已测高度清零、版面塌缩，图片异步回来时滚动恢复早已结束——真机日志里视口从 6362 塌到 4763 后停在文首。
 * 逐块写，每次回推只替换那一小段，其余行与图片原封不动，CodeMirror 自己的滚动锚点就能保住视口。
 * 不走 `Editor.transaction`：它固定带 scrollIntoView，会把不在前台的分栏滚到光标处，又是一次跳动。
 *
 * 从下往上写，上方差异块的行号与偏移在写下方时不变，所以全部改动都能用最初那一版的坐标。
 * 每一步都核对磁盘内容仍是上一步写下的样子；对不上说明用户或别的写入插了进来，剩下的放弃，
 * 下一次结算会从新内容重新算起。
 */
export async function processDisplayedNoteByHunks(
    app: App,
    file: TFile,
    plan: HunkedProcessPlan,
): Promise<boolean> {
    let written = false;

    if (!isDisplayed(app, file.path)) {
        await app.vault.process(file, (content) => {
            if (!plan.mayWrite()) return content;

            const next = plan.transform(content);

            if (next === content) return content;

            plan.willWrite();
            written = true;

            return next;
        });

        return written;
    }

    let pending: { from: number; to: number; text: string }[] = [];
    let expected: string | null = null;

    await app.vault.process(file, (content) => {
        if (!plan.mayWrite()) return content;

        const next = plan.transform(content);

        if (next === content) return content;

        const before = content.split('\n');
        const after = next.split('\n');

        pending = hunksToOffsetChanges(before, after, diffLineHunks(before, after));
        // 计划以这一版为准；第一块写入前它若已变，整批放弃
        expected = content;

        return content;
    });

    // 自下而上：每一步只动一块
    for (let index = pending.length - 1; index >= 0; index -= 1) {
        const change = pending[index];
        let applied = false;

        await app.vault.process(file, (content) => {
            if (content !== expected) return content;
            if (!plan.mayWrite()) return content;

            const next = content.slice(0, change.from) + change.text + content.slice(change.to);

            if (next === content) {
                expected = content;
                applied = true;

                return content;
            }

            plan.willWrite();
            expected = next;
            applied = true;
            written = true;

            return next;
        });

        if (!applied) break;
    }

    return written;
}

function isDisplayed(app: App, path: string): boolean {
    let displayed = false;

    app.workspace.iterateAllLeaves((leaf) => {
        if (leaf.view instanceof MarkdownView && leaf.view.file?.path === path) displayed = true;
    });

    return displayed;
}
