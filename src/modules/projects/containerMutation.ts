/**
 * [INPUT]: 依赖 Obsidian 的文件、元数据与 MarkdownView，core 的目录、属性文本边界，
 *          以及同目录 containerRenameText/moc/nameConflict。
 * [OUTPUT]: 提供 ContainerIdentity/RenamePlan、buildPlan/applyPlan 与分栏保存、异常文案能力。
 * [POS]: 改名与类型转换共用的目录事务。先计算引用和原文快照，再按对象与字节复核提交。
 *        失败逆序恢复正文与目录；类型转换的属性修改进入同一份预览和回滚清单。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { MarkdownView, TFile, Vault, normalizePath } from 'obsidian';
import type { App, CachedMetadata, TFolder } from 'obsidian';
import { ensureFolderPath, isInFolder } from '../../core/folders';
import { patchProperties } from '../../core/markdownProperties';
import type { ZiminosContext } from '../../core/types';
import { rewriteContainerReferences } from './containerRenameText';
import type { ContainerLinkSpan, ContainerRenameFacts } from './containerRenameText';
import { mocPathOf } from './moc';
import { findContainerNameConflicts } from './nameConflict';

export interface ContainerIdentity {
    readonly folder: TFolder;
    readonly moc: TFile;
    readonly name: string;
    readonly label: string;
    readonly root: string;
}

interface ContentSnapshot {
    readonly file: TFile;
    readonly pathAtPreview: string;
    readonly before: string;
}

interface ContentEdit extends ContentSnapshot {
    readonly after: string;
    readonly replacements: number;
}

export interface RenamePlan {
    readonly identity: ContainerIdentity;
    readonly newName: string;
    readonly newFolderPath: string;
    readonly newMocPath: string;
    readonly pathPairs: readonly { file: TFile; oldPath: string; newPath: string }[];
    readonly snapshots: readonly ContentSnapshot[];
    readonly edits: readonly ContentEdit[];
    readonly facts: ContainerRenameFacts;
    readonly fingerprint: string;
}

export async function buildPlan(
    ctx: ZiminosContext,
    identity: ContainerIdentity,
    newName: string,
    change?: { root: string; patch: Readonly<Record<string, unknown>> },
): Promise<RenamePlan> {
    const targetRoot = change?.root ?? identity.root;
    const conflicts = findContainerNameConflicts(ctx.app, ctx.settings, newName)
        .filter(conflict => conflict.path !== identity.folder.path);
    if (conflicts.length) throw new Error(`新名称已被占用：${conflicts.map((item) => item.path).join('、')}`);
    const occupant = ctx.app.vault.getAbstractFileByPath(normalizePath(`${targetRoot}/${newName}`));
    if (occupant && occupant !== identity.folder) {
        throw new Error(`目标位置已存在：${targetRoot}/${newName}`);
    }

    const newFolderPath = normalizePath(`${targetRoot}/${newName}`);
    const newMocPath = change
        ? normalizePath(`${newFolderPath}/${identity.moc.name}`)
        : mocPathOf(newFolderPath, newName);
    const mocOccupant = ctx.app.vault.getAbstractFileByPath(`${identity.folder.path}/${newMocPath.split('/').pop()}`);
    if (mocOccupant && mocOccupant !== identity.moc) throw new Error(`新 MOC 名已被占用：${mocOccupant.path}`);
    const pairs: { file: TFile; oldPath: string; newPath: string }[] = [];

    Vault.recurseChildren(identity.folder, (child) => {
        if (child instanceof TFile) {
            const relative = child.path.slice(identity.folder.path.length + 1);
            const target = child === identity.moc ? newMocPath : normalizePath(`${newFolderPath}/${relative}`);
            pairs.push({ file: child, oldPath: child.path, newPath: target });
        }
    });
    pairs.sort((left, right) => left.oldPath.localeCompare(right.oldPath));

    const paths = new Map(pairs.map((pair) => [pair.oldPath, pair.newPath]));
    const facts: ContainerRenameFacts = {
        oldName: identity.name,
        newName,
        oldFolderPath: identity.folder.path,
        newFolderPath,
        oldMocPath: identity.moc.path,
        newMocPath,
        paths,
    };
    const edits: ContentEdit[] = [];
    const snapshots: ContentSnapshot[] = [];

    for (const file of ctx.app.vault.getMarkdownFiles()) {
        const before = await ctx.app.vault.cachedRead(file);
        const referenceRewrite = rewriteContainerReferences(before, file.path, facts, (linkpath, sourcePath) =>
            ctx.app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath)?.path ?? null,
            linkSpans(ctx.app.metadataCache.getFileCache(file), before, file.path),
        );
        const rewritten = {
            ...referenceRewrite,
            content: change && file === identity.moc
                ? patchProperties(referenceRewrite.content, change.patch) : referenceRewrite.content,
        };
        if (isInFolder(file.path, identity.folder.path) || rewritten.content !== before) {
            snapshots.push({ file, pathAtPreview: file.path, before });
        }
        if (rewritten.content === before) continue;
        edits.push({ file, pathAtPreview: file.path, before, after: rewritten.content, replacements: rewritten.replacements });
    }

    edits.sort((left, right) => left.pathAtPreview.localeCompare(right.pathAtPreview));
    snapshots.sort((left, right) => left.pathAtPreview.localeCompare(right.pathAtPreview));
    const fingerprint = JSON.stringify({
        folder: identity.folder.path,
        moc: identity.moc.path,
        newName,
        pairs: pairs.map((pair) => [pair.oldPath, pair.newPath]),
        snapshots: snapshots.map((snapshot) => [snapshot.pathAtPreview, snapshot.before]),
        edits: edits.map((edit) => [edit.pathAtPreview, edit.before, edit.after]),
    });

    return { identity, newName, newFolderPath, newMocPath, pathPairs: pairs, snapshots, edits, facts, fingerprint };
}

function linkSpans(cache: CachedMetadata | null, content: string, path: string): readonly ContainerLinkSpan[] {
    if (!cache) throw new Error(`笔记元数据尚未就绪，请稍后重试：${path}`);
    const spans: ContainerLinkSpan[] = [...(cache.links ?? []), ...(cache.embeds ?? [])].map((link) => ({
        start: link.position.start.offset,
        end: link.position.end.offset,
        original: link.original,
    }));
    if (cache.frontmatterPosition) spans.push({
        start: cache.frontmatterPosition.start.offset,
        end: cache.frontmatterPosition.end.offset,
    });
    if (spans.some((span) => span.original !== undefined && content.slice(span.start, span.end) !== span.original)) {
        throw new Error(`笔记元数据与正文尚未同步，请稍后重试：${path}`);
    }
    return spans;
}

export async function applyPlan(ctx: ZiminosContext, plan: RenamePlan): Promise<void> {
    const { app, guard } = ctx;
    const applied: ContentEdit[] = [];

    const targetRoot = plan.newFolderPath.slice(0, plan.newFolderPath.lastIndexOf('/'));
    if (targetRoot !== plan.identity.root) await ensureFolderPath(app, targetRoot);
    // 目录创建会让出执行权；首次搬移前再核对对象、目标与全部原文。
    if (app.vault.getAbstractFileByPath(plan.facts.oldFolderPath) !== plan.identity.folder ||
        app.vault.getAbstractFileByPath(plan.facts.oldMocPath) !== plan.identity.moc) {
        throw new Error('提交前容器身份已改变。');
    }
    const occupant = app.vault.getAbstractFileByPath(plan.newFolderPath);
    if (occupant && occupant !== plan.identity.folder) throw new Error(`目标位置已存在：${plan.newFolderPath}`);
    for (const snapshot of plan.snapshots) {
        if (snapshot.file.path !== snapshot.pathAtPreview ||
            app.vault.getAbstractFileByPath(snapshot.pathAtPreview) !== snapshot.file ||
            await app.vault.cachedRead(snapshot.file) !== snapshot.before) {
            throw new Error(`提交前内容或身份已改变：${snapshot.pathAtPreview}`);
        }
    }
    markPlan(ctx, plan);

    try {
        if (plan.identity.folder.path !== plan.newFolderPath) {
            await app.vault.rename(plan.identity.folder, plan.newFolderPath);
        }
        const movedMocPath = normalizePath(`${plan.newFolderPath}/${plan.identity.moc.name}`);
        if (plan.identity.moc.path !== movedMocPath || app.vault.getAbstractFileByPath(movedMocPath) !== plan.identity.moc) {
            throw new Error('文件夹改名后 MOC 身份已改变。');
        }
        if (plan.identity.moc.path !== plan.newMocPath) {
            await app.vault.rename(plan.identity.moc, plan.newMocPath);
        }

        for (const edit of plan.edits) {
            try {
                const expectedPath = plan.facts.paths.get(edit.pathAtPreview) ?? edit.pathAtPreview;
                if (edit.file.path !== expectedPath || app.vault.getAbstractFileByPath(expectedPath) !== edit.file) {
                    throw new Error(`写入前文件身份已改变：${expectedPath}`);
                }
                await app.vault.process(edit.file, (content) => {
                    if (content !== edit.before) throw new Error(`写入前内容已改变：${edit.file.path}`);
                    guard.mark(edit.file.path);
                    return edit.after;
                });
                applied.push(edit);
            } catch (error) {
                const current = await app.vault.cachedRead(edit.file);
                if (current === edit.after) applied.push(edit);
                throw error;
            }
        }
    } catch (operationError) {
        markPlan(ctx, plan);
        const rollbackErrors: string[] = [];

        for (const edit of [...applied].reverse()) {
            try {
                await app.vault.process(edit.file, (content) => {
                    if (content !== edit.after) throw new Error(`回滚时内容又被修改：${edit.file.path}`);
                    guard.mark(edit.file.path);
                    return edit.before;
                });
            } catch (error) {
                rollbackErrors.push(messageOf(error));
            }
        }

        try {
            if (plan.identity.moc.path === plan.newMocPath && plan.facts.oldMocPath.split('/').pop() !== plan.identity.moc.name) {
                const oldMocName = plan.facts.oldMocPath.split('/').pop() ?? plan.identity.moc.name;
                const oldNameAtNewFolder = normalizePath(`${plan.newFolderPath}/${oldMocName}`);
                await app.vault.rename(plan.identity.moc, oldNameAtNewFolder);
            }
        } catch (error) {
            rollbackErrors.push(messageOf(error));
        }

        try {
            if (plan.identity.folder.path === plan.newFolderPath && plan.newFolderPath !== plan.facts.oldFolderPath) {
                await app.vault.rename(plan.identity.folder, plan.facts.oldFolderPath);
            }
        } catch (error) {
            rollbackErrors.push(messageOf(error));
        }

        const rollback = rollbackErrors.length ? `；自动回滚也失败：${rollbackErrors.join('、')}` : '';
        throw new Error(`${messageOf(operationError)}${rollback}`);
    }
}

function markPlan(ctx: ZiminosContext, plan: RenamePlan): void {
    ctx.guard.mark(plan.facts.oldFolderPath);
    ctx.guard.mark(plan.newFolderPath);
    for (const pair of plan.pathPairs) {
        ctx.guard.mark(pair.oldPath);
        ctx.guard.mark(pair.newPath);
    }
    for (const edit of plan.edits) ctx.guard.mark(edit.file.path);
}

export async function saveAllDisplayedMarkdownViews(app: App): Promise<void> {
    const saves: Promise<void>[] = [];
    app.workspace.iterateAllLeaves((leaf) => {
        if (leaf.view instanceof MarkdownView) saves.push(leaf.view.save());
    });
    await Promise.all(saves);
}

export function messageOf(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
