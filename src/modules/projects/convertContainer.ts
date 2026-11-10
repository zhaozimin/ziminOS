/**
 * [INPUT]: 依赖 Obsidian 文件与弹窗、core 的目录/属性文本/命令，
 *          同目录容器规格、共享目录事务、互斥锁与项目归属问答。选人能力由 main 注入。
 * [OUTPUT]: 提供 registerContainerConversionCommand 与 runContainerConversion。
 * [POS]: 项目、领域、资源六种方向的分类转换入口。先选类型和项目归属，再预览整目录迁移。
 *        正文和身份字段保留；type/status/archived/client/with 与引用进入同一事务。
 *        专用人脉/客户总控台与书籍不参与；归档项目先重新开始。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { ButtonComponent, Modal, Notice, TFile, TFolder, normalizePath } from 'obsidian';
import type { App } from 'obsidian';
import { PROJECT_COMMANDS } from '../../core/commands';
import { CONTACT_FOLDER, CLIENT_FOLDER, FIELDS, FOLDERS, NOTE_TYPES } from '../../core/constants';
import { isInFolder, normalizeFolderPath } from '../../core/folders';
import { yamlOf } from '../../core/markdownProperties';
import { ChoiceModal } from '../../core/modals';
import type { ZiminosContext } from '../../core/types';
import { AREA_KIND, PROJECT_KIND, RESOURCE_KIND } from './createContainer';
import type { ContainerKind } from './createContainer';
import { buildPlan, applyPlan, messageOf, saveAllDisplayedMarkdownViews } from './containerMutation';
import type { ContainerIdentity, RenamePlan } from './containerMutation';
import { pendingContainerChanges } from './containerLock';
import { resolveMocPath } from './moc';
import { requestProjectOwnership } from './projectOwnership';
import type { PersonPicker } from './projectOwnership';

const KINDS: readonly ContainerKind[] = [PROJECT_KIND, AREA_KIND, RESOURCE_KIND];

function rootOf(ctx: ZiminosContext, kind: ContainerKind): string {
    return normalizeFolderPath(kind.folderKey ? ctx.settings[kind.folderKey] : kind.folderFallback, kind.folderFallback);
}

interface ConversionIdentity extends ContainerIdentity { readonly type: string }

export function registerContainerConversionCommand(ctx: ZiminosContext, pickPerson: PersonPicker): void {
    ctx.commands.register(PROJECT_COMMANDS.convert, () => { void runContainerConversion(ctx, pickPerson); });
}

export async function runContainerConversion(ctx: ZiminosContext, pickPerson?: PersonPicker): Promise<void> {
    let locked: TFolder | undefined;
    try {
        await saveAllDisplayedMarkdownViews(ctx.app);
        const identity = await resolveIdentity(ctx);
        if (!identity) return;
        if (pendingContainerChanges.has(identity.folder)) throw new Error('当前容器已有改名、转换或归档操作正在进行。');
        locked = identity.folder;
        pendingContainerChanges.add(locked);

        const target = await new ChoiceModal(ctx.app, {
            title: `将“${identity.name}”从${identity.label}转换为`,
            items: KINDS.filter(kind => kind.type !== identity.type),
            labelOf: kind => kind.label,
        }).openAndGetChoice();
        if (!target) return;

        // 项目归属必须先问完。任何取消都不进入目录和属性写入。
        const ownership = target.asksOwnership ? await requestProjectOwnership(ctx.app, pickPerson, true) : {};
        if (!ownership) return;
        const patch: Record<string, unknown> = {
            [FIELDS.type]: target.type,
            [FIELDS.status]: target.status,
            [FIELDS.archived]: undefined,
            [FIELDS.client]: undefined,
            [FIELDS.with]: undefined,
        };
        if (ownership.relation) patch[ownership.relation.field] = `[[${ownership.relation.target}]]`;
        const change = { root: rootOf(ctx, target), patch };
        const plan = await buildPlan(ctx, identity, identity.name, change);
        if (!await new Promise<boolean>(resolve => new ConversionPreviewModal(ctx.app, plan, target, patch, resolve).open())) return;

        await saveAllDisplayedMarkdownViews(ctx.app);
        const live = await resolveIdentity(ctx, identity.folder);
        if (!live || live.moc !== identity.moc || live.type !== identity.type || rootOf(ctx, target) !== change.root) {
            throw new Error('确认期间容器身份或目录设置已改变，请重新转换。');
        }
        const livePlan = await buildPlan(ctx, live, identity.name, change);
        if (livePlan.fingerprint !== plan.fingerprint ||
            livePlan.pathPairs.some((pair, index) => pair.file !== plan.pathPairs[index]?.file) ||
            livePlan.snapshots.some((snapshot, index) => snapshot.file !== plan.snapshots[index]?.file)) {
            throw new Error('确认期间文件或双链已变化，请重新执行命令查看新预览。');
        }
        await applyPlan(ctx, livePlan);
        let revealWarning = '';
        try {
            await ctx.app.workspace.getLeaf(false).openFile(identity.moc, { active: true });
        } catch (error) {
            revealWarning = `；总览未能打开：${messageOf(error)}`;
        }
        new Notice(`已转换：${identity.name}（${identity.label} → ${target.label}）${revealWarning}`);
    } catch (error) {
        new Notice(`转换类型失败：${messageOf(error)}`, 12000);
    } finally {
        if (locked) pendingContainerChanges.delete(locked);
    }
}

async function resolveIdentity(ctx: ZiminosContext, expected?: TFolder): Promise<ConversionIdentity | null> {
    const active = ctx.app.workspace.getActiveFile();
    if (!(active instanceof TFile) || active.extension !== 'md') throw new Error('请先打开项目、领域或资源中的一篇笔记。');
    const roots = KINDS.map(kind => ({ kind, path: rootOf(ctx, kind) }));
    if (roots.some((a, i) => roots.some((b, j) => i !== j && isInFolder(a.path, b.path)))) {
        throw new Error('项目、领域和资源目录必须彼此独立，不能相同或互相嵌套。');
    }
    for (const { kind, path } of roots) {
        if (!isInFolder(active.path, path) || active.path === path) continue;
        const name = active.path.slice(path.length + 1).split('/')[0];
        const folder = ctx.app.vault.getAbstractFileByPath(normalizePath(`${path}/${name}`));
        if (!(folder instanceof TFolder) || expected && folder !== expected) throw new Error('当前容器位置已改变。');
        const special = [normalizeFolderPath(ctx.settings.contactFolder, CONTACT_FOLDER), normalizeFolderPath(ctx.settings.clientFolder, CLIENT_FOLDER)];
        if (special.some(root => isInFolder(folder.path, root) || isInFolder(root, folder.path))) {
            throw new Error('人脉与客户是专用总控台，不能转换为普通项目、领域或资源。');
        }
        const moc = ctx.app.vault.getAbstractFileByPath(resolveMocPath(ctx.app, folder.path, name));
        if (!(moc instanceof TFile)) throw new Error('当前容器缺少 MOC 总览。');
        const properties = yamlOf(await ctx.app.vault.cachedRead(moc));
        const type = String(properties[FIELDS.type] ?? '').trim();
        if (type === NOTE_TYPES.book) throw new Error('书籍保留读书流程，不能转换为普通容器。');
        if (type !== kind.type) throw new Error(`MOC 的 type 与目录不一致；当前目录要求 type: ${kind.type}。`);
        return { folder, moc, name, root: path, label: kind.label, type };
    }
    if (isInFolder(active.path, normalizeFolderPath(ctx.settings.archiveFolder, FOLDERS.archives))) {
        throw new Error('归档项目请先执行“重新开始项目”，再转换类型。');
    }
    throw new Error('当前笔记不在项目、领域或资源的第一层容器中。');
}

class ConversionPreviewModal extends Modal {
    private settled = false;
    constructor(
        app: App,
        private readonly plan: RenamePlan,
        private readonly target: ContainerKind,
        private readonly patch: Readonly<Record<string, unknown>>,
        private readonly resolveResult: (value: boolean) => void,
    ) { super(app); }

    onOpen(): void {
        this.modalEl.style.width = 'min(800px, calc(100vw - 32px))';
        this.contentEl.style.maxHeight = '70vh';
        this.contentEl.style.overflowY = 'auto';
        this.titleEl.setText(`确认转换为${this.target.label}`);
        this.contentEl.createEl('p', { text: `${this.plan.identity.name}：${this.plan.identity.label} → ${this.target.label}` });
        this.contentEl.createEl('p', { text: `${this.plan.facts.oldFolderPath} → ${this.plan.newFolderPath}` });
        this.contentEl.createEl('p', { text: `type: ${this.target.type}；status: ${this.target.status}；清除旧 archived。` });
        const relation = this.patch[FIELDS.client] ? `客户：${this.patch[FIELDS.client]}`
            : this.patch[FIELDS.with] ? `协作者：${this.patch[FIELDS.with]}`
            : this.target.asksOwnership ? '归属：自己做，不挂任何人。' : '清除项目专用的 client / with 归属字段。';
        this.contentEl.createEl('p', { text: relation });
        this.contentEl.createEl('p', { text: `迁移 ${this.plan.pathPairs.length} 个文件；更新 ${this.plan.edits.length} 篇笔记的属性或引用。正文、UID 和创建时间保留。` });
        const list = this.contentEl.createEl('ul');
        for (const edit of this.plan.edits) list.createEl('li', { text: edit.pathAtPreview });
        this.contentEl.createEl('p', { text: 'Eagle 按容器名称归档，名称不变，附件继续使用原文件夹。取消不写入；提交失败时尝试恢复原路径和原文。' });
        const bar = this.contentEl.createDiv();
        new ButtonComponent(bar).setButtonText('取消').onClick(() => this.close());
        new ButtonComponent(bar).setButtonText('确认转换').setCta().onClick(() => { this.settle(true); this.close(); });
    }
    onClose(): void { this.settle(false); this.contentEl.empty(); }
    private settle(value: boolean): void {
        if (this.settled) return;
        this.settled = true;
        this.resolveResult(value);
    }
}
