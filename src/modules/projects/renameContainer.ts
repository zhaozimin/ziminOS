/**
 * [INPUT]: 依赖 obsidian 的 Modal/ButtonComponent/Notice/TFile/TFolder/normalizePath，
 *          core/commands 的 PROJECT_COMMANDS，core/constants 的 FIELDS/FOLDERS/NOTE_TYPES，
 *          core/folders 的路径归属，core/modals 的 TextInputModal，core/types 的 ZiminosContext，
 *          依赖同目录 containerMutation/containerLock/moc/nameConflict；日记语义记录与 Eagle 同步由 main 通过函数洞注入
 * [OUTPUT]: 对外提供 EagleContainerRenamer/ContainerRenameRecorder 两个能力洞、registerContainerRenameCommand 与
 *           runContainerRename（当前项目/领域的双确认事务改名）
 * [POS]: projects 的容器身份变更编排层。从容器内任意笔记发起，第一窗预填当前名，
 *        第二窗展示整棵文件树、MOC、所有引用改写与 Eagle 影响面；确认后再次构建计划，
 *        现场与预览中受影响正文、文件对象或跨 PARA 名称占用不同就停；引用范围由公开元数据给出。
 *        本地目录与引用事务由 containerMutation 执行，与类型转换共用快照、提交和回滚。
 *        一项恢复失败不阻断其余恢复；Eagle 是本地提交后的可选副作用，不能反向撤销已安全落盘的笔记
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { ButtonComponent, Modal, Notice, TFile, TFolder, normalizePath } from 'obsidian';
import type { App } from 'obsidian';
import { PROJECT_COMMANDS } from '../../core/commands';
import { FIELDS, FOLDERS, NOTE_TYPES } from '../../core/constants';
import { isInFolder, normalizeFolderPath } from '../../core/folders';
import { TextInputModal } from '../../core/modals';
import type { ZiminosContext } from '../../core/types';
import { resolveMocPath } from './moc';
import { findContainerNameConflicts } from './nameConflict';
import { buildPlan, applyPlan, saveAllDisplayedMarkdownViews, messageOf } from './containerMutation';
import type { ContainerIdentity, RenamePlan } from './containerMutation';
import { pendingContainerChanges as pendingRenames } from './containerLock';

export type EagleContainerRenamer = (oldName: string, newName: string) => Promise<'renamed' | 'missing' | 'skipped'>;
export type ContainerRenameRecorder = (oldName: string, newName: string, newMocPath: string) => Promise<void>;

export function registerContainerRenameCommand(
    ctx: ZiminosContext,
    renameEagle?: EagleContainerRenamer,
    recordRename?: ContainerRenameRecorder,
): void {
    ctx.commands.register(PROJECT_COMMANDS.rename, () => {
        void runContainerRename(ctx, renameEagle, recordRename);
    });
}

export async function runContainerRename(
    ctx: ZiminosContext,
    renameEagle?: EagleContainerRenamer,
    recordRename?: ContainerRenameRecorder,
): Promise<void> {
    let locked: TFolder | null = null;

    try {
        await saveAllDisplayedMarkdownViews(ctx.app);

        const identity = resolveCurrentContainer(ctx);
        if (!identity) return;
        if (pendingRenames.has(identity.folder)) {
            new Notice(`这个${identity.label}已有改名操作正在进行。`);
            return;
        }

        locked = identity.folder;
        pendingRenames.add(locked);

        const answer = await new TextInputModal(ctx.app, {
            title: `修改当前${identity.label}名称`,
            hint: '下一步会列出所有文件、内容改写与双链，此时尚不会写入。',
            initial: identity.name,
            required: '新名称不能为空。',
        }).openAndGetValue();
        if (answer === null) return;

        const newName = answer.trim();
        const invalid = validateName(identity.name, newName);
        if (invalid) {
            new Notice(invalid, 8000);
            return;
        }

        const conflicts = findContainerNameConflicts(ctx.app, ctx.settings, newName);
        if (conflicts.length) {
            new Notice(`新名称已被占用：${conflicts.map((item) => item.path).join('、')}`, 8000);
            return;
        }

        const plan = await buildPlan(ctx, identity, newName);
        const confirmed = await showRenamePreview(ctx.app, plan, Boolean(ctx.settings.eagleEnabled));
        if (!confirmed) return;

        await saveAllDisplayedMarkdownViews(ctx.app);
        const liveIdentity = resolveCurrentContainer(ctx, identity.folder);
        if (!liveIdentity || liveIdentity.moc !== identity.moc) throw new Error('确认期间容器身份已改变，本次操作已停止。');
        const livePlan = await buildPlan(ctx, liveIdentity, newName);
        if (livePlan.fingerprint !== plan.fingerprint ||
            livePlan.pathPairs.some((pair, index) => pair.file !== plan.pathPairs[index]?.file) ||
            livePlan.snapshots.some((snapshot, index) => snapshot.file !== plan.snapshots[index]?.file)) {
            throw new Error('确认期间文件或双链已变化，请重新执行命令查看新预览。');
        }

        await applyPlan(ctx, livePlan);

        let eagleWarning = '';
        if (renameEagle) {
            try {
                const result = await renameEagle(identity.name, newName);
                if (result === 'missing') eagleWarning = '；Eagle 中没有同名附件文件夹，未作改动';
            } catch (error) {
                eagleWarning = `；但 Eagle 文件夹未同步：${messageOf(error)}`;
            }
        }

        try {
            await recordRename?.(identity.name, newName, livePlan.newMocPath);
        } catch (error) {
            new Notice(`${identity.label}改名已完成，但日记记录失败：${messageOf(error)}`, 10000);
            return;
        }

        const movedMoc = ctx.app.vault.getAbstractFileByPath(livePlan.newMocPath);
        if (movedMoc instanceof TFile) await ctx.app.workspace.getLeaf(false).openFile(movedMoc, { active: true });
        new Notice(`${identity.label}已改名：${identity.name} → ${newName}${eagleWarning}`, eagleWarning ? 12000 : 5000);
    } catch (error) {
        new Notice(`修改名称失败：${messageOf(error)}`, 12000);
    } finally {
        if (locked) pendingRenames.delete(locked);
    }
}

function resolveCurrentContainer(ctx: ZiminosContext, expectedFolder?: TFolder): ContainerIdentity | null {
    const active = ctx.app.workspace.getActiveFile();
    if (!(active instanceof TFile)) {
        new Notice('请先打开项目或领域中的任意一篇笔记。');
        return null;
    }

    const roots = [
        { path: normalizeFolderPath(ctx.settings.projectFolder, FOLDERS.projects), label: '项目' as const },
        { path: normalizeFolderPath(ctx.settings.areaFolder, FOLDERS.areas), label: '领域' as const },
        { path: normalizeFolderPath(ctx.settings.archiveFolder, FOLDERS.archives), label: '项目' as const },
    ];

    for (const root of roots) {
        if (!isInFolder(active.path, root.path) || active.path === root.path) continue;
        const name = active.path.slice(root.path.length + 1).split('/')[0];
        const folderPath = normalizePath(`${root.path}/${name}`);
        const folder = ctx.app.vault.getAbstractFileByPath(folderPath);
        if (!(folder instanceof TFolder) || (expectedFolder && folder !== expectedFolder)) continue;

        const mocPath = resolveMocPath(ctx.app, folderPath, name);
        const moc = ctx.app.vault.getAbstractFileByPath(mocPath);
        if (!(moc instanceof TFile)) {
            new Notice(`当前文件夹缺少 MOC：${mocPath}`);
            return null;
        }

        const type = String(ctx.app.metadataCache.getFileCache(moc)?.frontmatter?.[FIELDS.type] ?? '').trim();
        if (type === NOTE_TYPES.book) {
            new Notice('当前容器是一本书。本命令只修改项目或领域名称。');
            return null;
        }
        if (root.label === '项目' && type !== NOTE_TYPES.project) {
            new Notice('当前 MOC 不是项目（type: project）。');
            return null;
        }
        if (root.label === '领域' && type !== NOTE_TYPES.area) {
            new Notice('当前 MOC 不是领域（type: area）。');
            return null;
        }

        return { folder, moc, name, label: root.label, root: root.path };
    }

    new Notice('当前笔记不在项目、归档项目或领域的第一层容器中。');
    return null;
}

function validateName(oldName: string, newName: string): string | null {
    if (!newName) return '新名称不能为空。';
    if (newName === oldName) return '新名称与当前名称相同，没有需要修改的内容。';
    if (/[\\/]/.test(newName) || newName === '.' || newName === '..') return '名称不能包含斜杠、反斜杠，也不能是 . 或 ..。';
    if (/[:*?"<>]/.test(newName)) return '名称不能包含 :、*、?、"、< 或 >，这些字符无法安全用于文件路径或 YAML 属性。';
    if (newName.includes(']') || newName.includes('|') || newName.includes('#') || /[\u0000-\u001F\u007F]/.test(newName)) {
        return '名称不能包含 ]、|、# 或控制字符，否则无法安全生成双链。';
    }
    return null;
}

function showRenamePreview(app: App, plan: RenamePlan, eagleEnabled: boolean): Promise<boolean> {
    return new Promise((resolve) => new RenamePreviewModal(app, plan, eagleEnabled, resolve).open());
}

class RenamePreviewModal extends Modal {
    private settled = false;

    constructor(
        app: App,
        private readonly plan: RenamePlan,
        private readonly eagleEnabled: boolean,
        private readonly resolveResult: (value: boolean) => void,
    ) {
        super(app);
    }

    onOpen(): void {
        this.modalEl.style.width = 'min(880px, calc(100vw - 32px))';
        this.contentEl.style.maxHeight = '70vh';
        this.contentEl.style.overflowY = 'auto';
        this.titleEl.setText(`确认修改${this.plan.identity.label}名称`);
        this.contentEl.createEl('p', { text: `${this.plan.identity.name} → ${this.plan.newName}` });
        this.section('文件与目录', [
            `${this.plan.facts.oldFolderPath} → ${this.plan.newFolderPath}`,
            ...this.plan.pathPairs.map((pair) => `${pair.oldPath} → ${pair.newPath}`),
        ]);
        this.section('内容、属性、双链与 MOC 查询', this.plan.edits.length
            ? this.plan.edits.map((edit) => `${edit.pathAtPreview}（${edit.replacements} 处）`)
            : ['无外部引用需要改写']);
        this.section('Eagle', [this.eagleEnabled
            ? `项目/${this.plan.identity.name} → 项目/${this.plan.newName}${this.plan.identity.label === '领域' ? '（Eagle 将领域与项目统一归档在这个根目录）' : ''}`
            : '未启用：不改 Eagle']);

        const warning = this.contentEl.createEl('p', {
            text: '确认后会执行以上修改。失败时会尝试恢复原状，并列出未能恢复的项目。',
        });
        warning.style.fontWeight = '600';

        const bar = this.contentEl.createDiv();
        bar.style.display = 'flex';
        bar.style.justifyContent = 'flex-end';
        bar.style.gap = '8px';
        new ButtonComponent(bar).setButtonText('取消').onClick(() => this.close());
        new ButtonComponent(bar).setButtonText('确认全部修改').setWarning().onClick(() => {
            this.settle(true);
            this.close();
        });
    }

    onClose(): void {
        this.settle(false);
        this.contentEl.empty();
    }

    private section(title: string, items: readonly string[]): void {
        this.contentEl.createEl('h3', { text: title });
        const list = this.contentEl.createEl('ul');
        for (const item of items) list.createEl('li', { text: item });
    }

    private settle(value: boolean): void {
        if (this.settled) return;
        this.settled = true;
        this.resolveResult(value);
    }
}
