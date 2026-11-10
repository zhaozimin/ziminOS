/**
 * [INPUT]: 依赖 core/types 的共享设置与落盘能力；依赖命令身份。
 * [OUTPUT]: 提供 QuickActionPreferences，保存按钮清单与自定义名称。
 * [POS]: 右侧按钮配置的唯一写入口。视图与配置弹窗共享保存锁。
 *        保存失败恢复配置快照，显示名不反写原命令。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Notice } from 'obsidian';
import type { CommandSpec } from '../../core/commands';
import type { ZiminosContext } from '../../core/types';

export class QuickActionPreferences {
    private readonly listeners = new Set<() => void>();
    saving = false;

    constructor(private readonly ctx: ZiminosContext) {}

    labelOf(spec: CommandSpec): string {
        return this.ctx.settings.quickActionLabels[spec.id] ?? spec.name;
    }

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    async replace(ids: readonly string[]): Promise<void> {
        await this.save([...ids], this.ctx.settings.quickActionLabels);
    }

    /** 留空或填写原名时删除覆盖值，后续跟随命令原名。 */
    async rename(spec: CommandSpec, label: string): Promise<void> {
        const labels = { ...this.ctx.settings.quickActionLabels };
        const name = label.trim();
        if (name && name !== spec.name) labels[spec.id] = name;
        else delete labels[spec.id];
        await this.save(this.ctx.settings.quickActionCommands, labels);
    }

    private async save(ids: readonly string[], labels: Readonly<Record<string, string>>): Promise<void> {
        if (this.saving) return;
        const beforeIds = this.ctx.settings.quickActionCommands;
        const beforeLabels = this.ctx.settings.quickActionLabels;
        this.saving = true;
        this.ctx.settings.quickActionCommands = ids;
        this.ctx.settings.quickActionLabels = labels;
        this.notify();
        try {
            await this.ctx.saveSettings();
        } catch {
            this.ctx.settings.quickActionCommands = beforeIds;
            this.ctx.settings.quickActionLabels = beforeLabels;
            new Notice('按钮配置未能保存，已恢复原配置。请重试。');
        } finally {
            this.saving = false;
            this.notify();
        }
    }

    private notify(): void {
        for (const listener of this.listeners) listener();
    }
}
