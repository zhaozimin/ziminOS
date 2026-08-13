/**
 * [INPUT]: 依赖 obsidian 的 Plugin 基类；依赖 core 的 SelfWriteGuard、DEFAULT_SETTINGS、
 *          ZiminosSettings/ZiminosContext/VaultSeed 契约、PERIODS 与 registerViewCodeBlock；
 *          依赖 modules/setup 的 initializeVault/applySeed，以及项目管理、灵感收集、复盘、
 *          人脉与客户五个模块各自的 seed、register 函数与视图数组
 * [OUTPUT]: 默认导出 ZiminosPlugin，即 Obsidian 加载 main.js 时实例化的插件入口类
 * [POS]: 插件唯一入口与唯一装配点。它只做四件事：把磁盘上的设置读成一个对象、
 *        把它连同 app/plugin/guard 装配成 ZiminosContext、把上下文分发给各模块去自行注册、
 *        再把彼此需要但不该互相认识的能力接上线。
 *        最后这件事是 V2 新增的，也是本文件最有分量的部分：
 *        记人情要往当天日记里写一行，客户模块要按需长出自己的产物——
 *        前者需要复盘模块的能力，后者需要开荒模块的能力。
 *        它们都不 import 对方，而是各自声明一个函数类型的洞，由这里填上。
 *        于是依赖图仍是一棵树：main 认识所有模块，模块之间彼此不认识，
 *        加一个模块只是在这里多几行，删一个模块只需删掉那几行
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Plugin } from 'obsidian';
import { registerViewCodeBlock } from './core/codeblock';
import { PERIODS } from './core/constants';
import { SelfWriteGuard } from './core/guard';
import { DEFAULT_SETTINGS } from './core/types';
import type { VaultSeed, ZiminosContext, ZiminosSettings } from './core/types';
import { circleViews } from './modules/contacts/circleViews';
import { clientViews } from './modules/contacts/clientViews';
import { registerClientCommands } from './modules/contacts/client';
import { registerCreateContactCommand } from './modules/contacts/createContact';
import { pickPerson } from './modules/contacts/identity';
import { personViews } from './modules/contacts/personViews';
import { registerRecordFavorCommand } from './modules/contacts/recordFavor';
import { contactsSeed } from './modules/contacts/seed';
import { registerInspirationCaptureCommand } from './modules/inspiration/capture';
import { registerCardAutoInit, registerCardInitCommand } from './modules/projects/cardInit';
import { registerCreateProjectCommand } from './modules/projects/createProject';
import { projectsSeed } from './modules/projects/seed';
import { registerTransitionCommands } from './modules/projects/transitions';
import { registerUpdatedMaintainer } from './modules/projects/updatedMaintainer';
import { openPeriodNote, registerPeriodicCommands } from './modules/review/periodic';
import { reviewProjectViews } from './modules/review/projectViews';
import { reviewSeed } from './modules/review/seed';
import { registerThemeCommand } from './modules/review/theme';
import { reviewThemeViews } from './modules/review/views';
import { applySeed, initializeVault } from './modules/setup/init';
import { ZiminosSettingTab } from './settings';

// ============================================================
// 命令
// ============================================================

/**
 * 开荒命令。它是唯一在 main.ts 里直接注册的命令——
 * 因为开荒横跨全库骨架并要收齐各模块的诉求，不专属于任何一个功能模块；
 * 其余命令都由各自模块自行注册。
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
        // 开荒：各模块自报诉求，开荒模块只认这份契约，不认识任何模块
        // ============================================================

        // 每次点「初始化」都重新求值，而不是在 onload 时算好一份：
        // seed 里带着 created 与 UID，插件早上加载、下午开荒的话，
        // 预先算好的时间戳会把开荒时刻记成加载时刻
        const collectSeeds = (): VaultSeed[] => [
            projectsSeed(ctx),
            reviewSeed(ctx),
            contactsSeed(ctx),
        ];

        this.addCommand({
            id: INIT_VAULT_COMMAND.id,
            name: INIT_VAULT_COMMAND.name,
            // 开荒内部已把全部异常转成中文 Notice，此处无需等待也无需接住
            callback: () => {
                void initializeVault(ctx, collectSeeds());
            },
        });

        // ============================================================
        // 各模块注册自己的命令与自动行为
        // ============================================================

        // 建项目要问「这是谁委托的」，候选人住在人脉模块——用同一套注入把两者接上
        registerCreateProjectCommand(ctx, (title, quiet) => pickPerson(ctx, title, quiet));
        registerCardInitCommand(ctx);
        registerCardAutoInit(ctx);
        registerTransitionCommands(ctx);
        registerUpdatedMaintainer(ctx);
        registerInspirationCaptureCommand(ctx);

        registerPeriodicCommands(ctx);
        registerThemeCommand(ctx);

        registerCreateContactCommand(ctx);
        // 记人情要往当天日记里写一行。它不认识复盘模块，只声明了一个「拿到今天的日记」的洞，
        // 由这里用复盘模块的能力填上；reveal 关掉，顺手记一笔不该顶掉学员正在读的笔记
        registerRecordFavorCommand(ctx, () => openPeriodNote(ctx, PERIODS.daily, { reveal: false }));
        // 客户模块要按需长出自己的产物，同理只声明了一个「落一份开荒贡献」的洞
        registerClientCommands(ctx, (seed) => applySeed(ctx, seed));

        // ============================================================
        // 视图引擎：一个代码块语言，二十一个视图；加视图不必改这里之外的任何装配代码
        // ============================================================

        registerViewCodeBlock(ctx, [
            ...reviewThemeViews,
            ...reviewProjectViews,
            ...personViews,
            ...circleViews,
            // 客户视图始终注册：视图是只读的，注册它零成本，
            // 而用开关控制注册会让「块能不能渲染」变成需要重启才生效的事
            ...clientViews,
        ]);

        // ============================================================
        // 挂载设置页：它是「人主导」这条红线的操作面，放在最后保证挂载时上下文已完备
        // ============================================================

        this.addSettingTab(
            new ZiminosSettingTab(ctx, () => initializeVault(ctx, collectSeeds())),
        );
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
