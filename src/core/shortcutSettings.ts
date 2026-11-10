/**
 * [INPUT]: 依赖 commands 的命令身份，不依赖业务模块。
 * [OUTPUT]: 提供快捷操作默认清单、当前笔记清单与按钮名称验形。
 * [POS]: 全局设置与右侧快捷操作共用的配置边界。
 *        清单只存命令 id，自定义名称只改变右侧显示。
 *        原命令身份、图标与回调仍归命令台。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import {
    BOOK_COMMANDS, CONTACT_COMMANDS, COPY_PATH_COMMAND, EXPORT_COMMAND,
    FORMAT_COMMAND, INSPIRATION_COMMAND, PERIOD_COMMANDS, PLANNER_COMMANDS,
    PROJECT_COMMANDS, THEME_COMMAND,
} from './commands';

export const DEFAULT_QUICK_ACTION_COMMANDS: readonly string[] = [
    INSPIRATION_COMMAND.id,
    PERIOD_COMMANDS.daily.id,
    PROJECT_COMMANDS.create.id,
    PLANNER_COMMANDS.open.id,
    BOOK_COMMANDS.read.id,
    CONTACT_COMMANDS.create.id,
    CONTACT_COMMANDS.favor.id,
    THEME_COMMAND.id,
];

export const NOTE_QUICK_ACTION_COMMANDS: readonly string[] = [
    FORMAT_COMMAND.id,
    EXPORT_COMMAND.id,
    COPY_PATH_COMMAND.id,
    PROJECT_COMMANDS.card.id,
];

/** 空数组表示用户主动清空；未知 id 留待运行时命令台过滤。 */
export function normalizeQuickActionCommands(input: unknown): readonly string[] {
    if (!Array.isArray(input)) return DEFAULT_QUICK_ACTION_COMMANDS;

    return [...new Set(input.filter((id): id is string =>
        typeof id === 'string' && id.trim().length > 0,
    ))];
}

/** 只接收非空文本；名称是纯文本，不解释 HTML 或 Markdown。 */
export function normalizeQuickActionLabels(input: unknown): Readonly<Record<string, string>> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return {};

    return Object.fromEntries(Object.entries(input).flatMap(([id, label]) =>
        id.trim() && typeof label === 'string' && label.trim() ? [[id, label.trim()]] : [],
    ));
}
