/**
 * [INPUT]: 依赖 Obsidian 的 Modal/setIcon、core/modals 的文本问答；
 *          依赖命令台、快捷操作默认清单与 preferences 的配置写入口。
 * [OUTPUT]: 提供 QuickActionCustomizeModal 与 renameQuickAction。
 * [POS]: 按需打开的按钮配置界面，不占右侧面板空间。
 *        检索与改名使用自定义名称，执行身份始终使用原命令 id。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Modal, setIcon } from 'obsidian';
import { GROUP_COLORS, QUICK_ACTIONS_COMMAND } from '../../core/commands';
import type { RegisteredCommand } from '../../core/commands';
import { TextInputModal } from '../../core/modals';
import { DEFAULT_QUICK_ACTION_COMMANDS, NOTE_QUICK_ACTION_COMMANDS } from '../../core/shortcutSettings';
import type { ZiminosContext } from '../../core/types';
import { QuickActionPreferences } from './preferences';

export async function renameQuickAction(
    ctx: ZiminosContext, preferences: QuickActionPreferences, command: RegisteredCommand,
): Promise<void> {
    const prompt = new TextInputModal(ctx.app, {
        title: '修改按钮名称', initial: preferences.labelOf(command.spec),
        placeholder: `留空使用「${command.spec.name}」`,
    });
    ctx.plugin.register(() => prompt.close());
    const name = await prompt.openAndGetValue();
    if (name !== null) await preferences.rename(command.spec, name);
}

export class QuickActionCustomizeModal extends Modal {
    private searchEl: HTMLInputElement | null = null;
    private resultsEl: HTMLElement | null = null;
    private unsubscribe: (() => void) | null = null;

    constructor(private readonly ctx: ZiminosContext, private readonly preferences: QuickActionPreferences) {
        super(ctx.app);
    }

    onOpen(): void {
        this.titleEl.setText('自定义按钮');
        this.contentEl.empty();
        this.contentEl.addClass('ziminos-quick-customize');
        const tools = this.contentEl.createDiv({ cls: 'ziminos-quick-catalog-tools' });
        this.searchEl = tools.createEl('input', {
            type: 'search', placeholder: '搜索按钮…', attr: { 'aria-label': '搜索快捷命令' },
        });
        this.searchEl.addEventListener('input', () => this.paintCommands());
        const reset = tools.createEl('button', { text: '恢复默认组合' });
        reset.addEventListener('click', () => { void this.preferences.replace(DEFAULT_QUICK_ACTION_COMMANDS); });
        this.resultsEl = this.contentEl.createDiv({ cls: 'ziminos-quick-catalog' });
        this.unsubscribe = this.preferences.subscribe(() => {
            reset.disabled = this.preferences.saving;
            this.paintCommands();
        });
        this.paintCommands();
        this.searchEl.focus();
    }

    onClose(): void {
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.searchEl = null;
        this.resultsEl = null;
        this.contentEl.empty();
    }

    private paintCommands(): void {
        if (!this.resultsEl) return;
        const terms = (this.searchEl?.value ?? '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        const commands = this.ctx.commands.list().filter(({ spec }) =>
            spec.id !== QUICK_ACTIONS_COMMAND.id && terms.every(term =>
                `${this.preferences.labelOf(spec)} ${spec.name} ${spec.group} ${spec.id}`.toLocaleLowerCase().includes(term)),
        );
        this.resultsEl.empty();
        if (!commands.length) this.resultsEl.createEl('p', { text: '无匹配命令' });
        const groups = new Map<string, RegisteredCommand[]>();
        for (const command of commands) {
            const members = groups.get(command.spec.group) ?? [];
            members.push(command);
            groups.set(command.spec.group, members);
        }
        for (const [group, members] of groups) {
            this.resultsEl.createEl('h4', { text: group });
            for (const command of members) this.commandRow(command);
        }
    }

    private commandRow(command: RegisteredCommand): void {
        if (!this.resultsEl) return;
        const { spec } = command;
        const row = this.resultsEl.createDiv({ cls: 'ziminos-quick-command-row' });
        const name = row.createDiv({ cls: 'ziminos-quick-command-label', attr: { title: spec.name } });
        const icon = name.createSpan({ cls: 'ziminos-quick-command-icon' });
        icon.style.color = GROUP_COLORS[spec.group];
        setIcon(icon, spec.icon);
        name.createSpan({ text: this.preferences.labelOf(spec) });
        const edit = this.iconButton(row, 'pencil', `修改按钮名称：${this.preferences.labelOf(spec)}`, 'ziminos-quick-rename');
        edit.addEventListener('click', () => { void renameQuickAction(this.ctx, this.preferences, command); });

        const noteButton = NOTE_QUICK_ACTION_COMMANDS.includes(spec.id);
        const pinned = noteButton || this.ctx.settings.quickActionCommands.includes(spec.id);
        const label = noteButton ? '笔记按钮默认显示' : `${pinned ? '从常用移除' : '固定到常用'}：${spec.name}`;
        const pin = this.iconButton(row, 'star', label, 'ziminos-quick-pin');
        pin.setAttribute('aria-pressed', String(pinned));
        pin.disabled = noteButton || this.preferences.saving;
        pin.addEventListener('click', () => {
            const current = this.ctx.settings.quickActionCommands;
            void this.preferences.replace(pinned ? current.filter(id => id !== spec.id) : [...current, spec.id]);
        });
    }

    private iconButton(parent: HTMLElement, icon: string, label: string, cls: string): HTMLButtonElement {
        const button = parent.createEl('button', {
            cls, attr: { type: 'button', title: label, 'aria-label': label },
        });
        setIcon(button, icon);
        button.disabled = this.preferences.saving;
        return button;
    }
}
