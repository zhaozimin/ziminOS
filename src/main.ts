/**
 * [INPUT]: 依赖 obsidian 的 Plugin 基类；依赖 ./core/guard 的 SelfWriteGuard、./core/types 的
 *          DEFAULT_SETTINGS 与 ZiminosSettings/ZiminosContext 契约；依赖 ./settings 的 ZiminosSettingTab；
 *          依赖 ./modules/projects 的 initializeVault 与五个注册函数
 *          （createProject/cardInit×2/transitions/updatedMaintainer）
 * [OUTPUT]: 默认导出 ZiminosPlugin，即 Obsidian 加载 main.js 时实例化的插件入口类
 * [POS]: 插件唯一入口与唯一装配点。它只做三件事：把磁盘上的设置读成一个对象、把这个对象连同
 *        app/plugin/guard 装配成 ZiminosContext、再把上下文分发给各功能模块去自行注册。
 *        依赖方向是单向的——main 认识所有模块，模块之间彼此不认识，也不认识 main；
 *        因此新增一个模块只是在这里多一行注册调用，删一个模块只需删掉一行。
 *        全部事件与定时器都经 registerEvent / register 托管，onunload 无需手写任何清理
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Plugin } from 'obsidian';
import { SelfWriteGuard } from './core/guard';
import { DEFAULT_SETTINGS } from './core/types';
import type { ZiminosContext, ZiminosSettings } from './core/types';
import { registerCardAutoInit, registerCardInitCommand } from './modules/projects/cardInit';
import { registerCreateProjectCommand } from './modules/projects/createProject';
import { initializeVault } from './modules/projects/init';
import { registerTransitionCommands } from './modules/projects/transitions';
import { registerUpdatedMaintainer } from './modules/projects/updatedMaintainer';
import { ZiminosSettingTab } from './settings';

// ============================================================
// 命令
// ============================================================

/**
 * 开荒命令。它是唯一在 main.ts 里直接注册的命令——
 * 因为开荒横跨全库骨架，不专属于任何一个功能模块；其余六条命令都由各自模块自行注册。
 */
const INIT_VAULT_COMMAND = {
    id: 'init-vault',
    name: '初始化笔记库',
} as const;

// ============================================================
// 插件入口
// ============================================================

export default class ZiminosPlugin extends Plugin {
    /**
     * 全局唯一的设置对象。
     * 它会被原样放进 ZiminosContext，各模块与设置页读写的都是这同一份引用——
     * 设置页改完一个开关，正在监听的模块下次触发时立刻看见新值，中间没有任何同步环节。
     */
    settings: ZiminosSettings = { ...DEFAULT_SETTINGS };

    async onload(): Promise<void> {
        await this.loadSettings();

        // ============================================================
        // 装配上下文：模块要用的一切能力都从这里获得，不再各自去摸 app 或磁盘
        // ============================================================

        const ctx: ZiminosContext = {
            app: this.app,
            plugin: this,
            settings: this.settings,
            saveSettings: () => this.saveData(this.settings),
            // 守卫必须全库唯一：写方标记与监听方查询共用同一份记录，自写抑制才成立
            guard: new SelfWriteGuard(),
        };

        // ============================================================
        // 注册命令与自动行为
        // ============================================================

        this.addCommand({
            id: INIT_VAULT_COMMAND.id,
            name: INIT_VAULT_COMMAND.name,
            // 开荒内部已把全部异常转成中文 Notice，此处无需等待也无需接住
            callback: () => {
                void initializeVault(ctx);
            },
        });

        registerCreateProjectCommand(ctx);
        registerCardInitCommand(ctx);
        registerCardAutoInit(ctx);
        registerTransitionCommands(ctx);
        registerUpdatedMaintainer(ctx);

        // ============================================================
        // 挂载设置页：它是「人主导」这条红线的操作面，放在最后保证挂载时上下文已完备
        // ============================================================

        this.addSettingTab(new ZiminosSettingTab(ctx));
    }

    /**
     * 读取持久化设置并补齐缺省值。
     * 用「默认值打底、存档覆盖」的顺序合并：新版本新增的字段对老库自动生效，
     * 老库里已有的选择则一个都不会被冲掉。首次安装时 loadData 返回 null，结果即纯默认值。
     */
    private async loadSettings(): Promise<void> {
        const stored = (await this.loadData()) as Partial<ZiminosSettings> | null;

        this.settings = { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
    }
}
