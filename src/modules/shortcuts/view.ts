/**
 * [INPUT]: 依赖 Obsidian 的 ItemView、MarkdownView、Menu、Notice、setIcon；
 *          依赖 core/commands 的命令身份与注册台；
 *          依赖 core/shortcutSettings 的当前笔记清单，
 *          preferences 的共享配置与 customize 的按需配置弹窗。
 * [OUTPUT]: 提供 QUICK_ACTIONS_VIEW_TYPE 与 registerQuickActions。
 * [POS]: 右侧快捷操作的纯按钮呈现层，不画标题、简介或说明。
 *        常用配置独立于左侧边栏，业务写入仍归原命令。
 *        点击先恢复主区上下文，避免侧栏焦点截断编辑命令。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { ItemView, MarkdownView, Menu, Notice, setIcon } from 'obsidian';
import type { WorkspaceLeaf } from 'obsidian';
import { GROUP_COLORS, QUICK_ACTIONS_COMMAND } from '../../core/commands';
import type { RegisteredCommand } from '../../core/commands';
import { NOTE_QUICK_ACTION_COMMANDS } from '../../core/shortcutSettings';
import type { ZiminosContext } from '../../core/types';
import { QuickActionCustomizeModal, renameQuickAction } from './customize';
import { QuickActionPreferences } from './preferences';

export const QUICK_ACTIONS_VIEW_TYPE = 'ziminos-quick-actions';

// ============================================================
// 装配与常用清单
// ============================================================

export function registerQuickActions(ctx: ZiminosContext): void {
    const preferences = new QuickActionPreferences(ctx);
    // 宿主注册视图时会暂时清空旧叶子。必须在此之前判断，见日历 §67。
    const hostWillRestore = ctx.app.workspace.getLeavesOfType(QUICK_ACTIONS_VIEW_TYPE).length > 0;
    let disposed = false;
    let revealing: Promise<unknown> | null = null;
    ctx.plugin.register(() => { disposed = true; });

    const reveal = (active: boolean): void => {
        if (disposed || revealing) return;
        revealing = ctx.app.workspace.ensureSideLeaf(QUICK_ACTIONS_VIEW_TYPE, 'right', {
            active, reveal: active, split: false,
        }).catch(() => {
            if (active && !disposed) new Notice('快捷操作未能打开，请重试。');
        }).finally(() => { revealing = null; });
    };

    ctx.plugin.registerView(QUICK_ACTIONS_VIEW_TYPE,
        leaf => new QuickActionsView(leaf, ctx, preferences));
    ctx.commands.register(QUICK_ACTIONS_COMMAND, () => reveal(true));
    ctx.app.workspace.onLayoutReady(() => {
        if (!hostWillRestore) reveal(false);
    });
}

// ============================================================
// 右侧页签
// ============================================================

class QuickActionsView extends ItemView {
    private favoriteEl: HTMLElement | null = null;
    private noteEl: HTMLElement | null = null;
    private unsubscribe: (() => void) | null = null;
    private customization: QuickActionCustomizeModal | null = null;

    constructor(
        leaf: WorkspaceLeaf,
        private readonly ctx: ZiminosContext,
        private readonly preferences: QuickActionPreferences,
    ) {
        super(leaf);
        this.addAction('sliders-horizontal', '自定义按钮', () => this.openCustomization());
    }

    getViewType(): string { return QUICK_ACTIONS_VIEW_TYPE; }
    getDisplayText(): string { return '快捷操作'; }
    getIcon(): string { return 'layout-grid'; }

    async onOpen(): Promise<void> {
        const root = this.contentEl;
        root.empty();
        root.addClass('ziminos-quick-actions');
        this.favoriteEl = root.createDiv({ cls: 'ziminos-quick-grid' });
        this.noteEl = root.createDiv({ cls: 'ziminos-quick-grid ziminos-quick-note-grid' });
        this.unsubscribe = this.preferences.subscribe(() => {
            this.paintFavorites();
            this.paintNote();
        });

        this.registerDomEvent(root, 'contextmenu', event => {
            event.preventDefault();
            const menu = new Menu();
            this.customizeMenuItem(menu);
            menu.showAtMouseEvent(event);
        });

        this.registerEvent(this.app.workspace.on('file-open', () => this.paintNote()));
        this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.paintNote()));
        this.registerEvent(this.app.vault.on('rename', () => this.paintNote()));
        this.registerEvent(this.app.vault.on('delete', () => this.paintNote()));
        this.paintFavorites();
        this.paintNote();
    }

    async onClose(): Promise<void> {
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.favoriteEl = this.noteEl = null;
        this.customization?.close();
        this.customization = null;
        this.contentEl.empty();
    }

    onPaneMenu(menu: Menu, source: string): void {
        super.onPaneMenu(menu, source);
        this.customizeMenuItem(menu);
    }

    private openCustomization(): void {
        this.customization?.close();
        this.customization = new QuickActionCustomizeModal(this.ctx, this.preferences);
        this.customization.open();
    }

    private customizeMenuItem(menu: Menu): void {
        menu.addItem(item => item.setTitle('自定义按钮').setIcon('sliders-horizontal')
            .onClick(() => this.openCustomization()));
    }

    private availableCommands(): readonly RegisteredCommand[] {
        return this.ctx.commands.list().filter(command => command.spec.id !== QUICK_ACTIONS_COMMAND.id);
    }

    private commandsById(ids: readonly string[]): RegisteredCommand[] {
        const byId = new Map(this.availableCommands().map(command => [command.spec.id, command]));
        return ids.flatMap(id => {
            const command = byId.get(id);
            return command ? [command] : [];
        });
    }

    private paintFavorites(): void {
        if (!this.favoriteEl) return;
        this.favoriteEl.empty();
        const commands = this.commandsById(this.ctx.settings.quickActionCommands)
            .filter(command => !NOTE_QUICK_ACTION_COMMANDS.includes(command.spec.id));
        for (const command of commands) this.commandButton(this.favoriteEl, command);
    }

    private paintNote(): void {
        if (!this.noteEl) return;
        // 侧栏也能打开文件。展示与执行都以同一主区叶子为准。
        const leaf = this.app.workspace.getMostRecentLeaf();
        const file = leaf?.view instanceof MarkdownView ? leaf.view.file : null;
        const hasNote = file?.extension === 'md';
        this.noteEl.empty();
        for (const command of this.commandsById(NOTE_QUICK_ACTION_COMMANDS)) {
            const button = this.commandButton(this.noteEl, command);
            button.disabled = !hasNote;
            button.title = `${command.spec.name}\n${hasNote ? file.path : '先打开一篇 Markdown 笔记'}`;
        }
    }

    private commandButton(parent: HTMLElement, command: RegisteredCommand): HTMLButtonElement {
        const button = parent.createEl('button', {
            cls: 'ziminos-quick-command',
            attr: { type: 'button', title: command.spec.name, 'data-command-id': command.spec.id },
        });
        const icon = button.createSpan({ cls: 'ziminos-quick-command-icon' });
        icon.style.color = GROUP_COLORS[command.spec.group];
        setIcon(icon, command.spec.icon);
        button.createSpan({ text: this.preferences.labelOf(command.spec) });
        button.addEventListener('contextmenu', event => {
            event.preventDefault();
            event.stopPropagation();
            const menu = new Menu();
            menu.addItem(item => item.setTitle('修改按钮名称').setIcon('pencil')
                .setDisabled(this.preferences.saving)
                .onClick(() => { void renameQuickAction(this.ctx, this.preferences, command); }));
            if (this.ctx.settings.quickActionLabels[command.spec.id]) {
                menu.addItem(item => item.setTitle('恢复原名').setIcon('rotate-ccw')
                    .setDisabled(this.preferences.saving)
                    .onClick(() => { void this.preferences.rename(command.spec, ''); }));
            }
            menu.addSeparator();
            this.customizeMenuItem(menu);
            menu.showAtMouseEvent(event);
        });
        button.addEventListener('click', () => {
            // 侧栏成为活动叶子后，编辑命令会找不到 MarkdownView。
            // 恢复主区叶子身份但不强抢焦点，原选区仍交给命令读取。
            const leaf = this.app.workspace.getMostRecentLeaf();
            if (leaf?.view instanceof MarkdownView) {
                this.app.workspace.setActiveLeaf(leaf, { focus: false });
            }
            command.run();
        });
        return button;
    }
}
