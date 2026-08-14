/**
 * [INPUT]: 依赖 obsidian 的 Plugin 基类；依赖 core 的 SelfWriteGuard、CommandRegistry、
 *          INIT_VAULT_COMMAND、normalizeRibbonCommands、DEFAULT_SETTINGS、
 *          ZiminosSettings/ZiminosContext/VaultSeed 契约、PERIODS 与 registerViewCodeBlock；
 *          依赖 modules/setup 的 initializeVault/applySeed，以及项目管理、读书笔记、灵感收集、
 *          复盘、人脉与客户六个模块各自的 seed、register 函数与视图数组，
 *          其中读书笔记那三条命令还要 modules/projects/createContainer 的 createContainer/BOOK_KIND
 *          来填「建一个书籍容器」那个洞；
 *          再加 modules/format 的 registerFormatter、modules/appearance 的 registerAppearanceSwitch、
 *          modules/ribbon 的 registerRibbon 与 modules/about 的 aboutViews/renderAboutPanel
 * [OUTPUT]: 默认导出 ZiminosPlugin，即 Obsidian 加载 main.js 时实例化的插件入口类
 * [POS]: 插件唯一入口与唯一装配点。它只做四件事：把磁盘上的设置读成一个对象、
 *        把它连同 app/plugin/guard 装配成 ZiminosContext、把上下文分发给各模块去自行注册、
 *        再把彼此需要但不该互相认识的能力接上线。
 *        最后这件事是 V2 新增的，也是本文件最有分量的部分：
 *        记人情要往当天日记里写一行，客户模块要按需长出自己的产物，
 *        建一本书要走项目模块那套「文件夹 + MOC」的流程，
 *        设置页要能让状态栏那个按钮与左侧边栏那列图标按新设置重新显隐——
 *        它们分别需要复盘模块、开荒模块、项目模块、外观模块与 ribbon 模块的能力。
 *        它们都不 import 对方，而是各自声明一个函数类型的洞，由这里填上。
 *        于是依赖图仍是一棵树：main 认识所有模块，模块之间彼此不认识，
 *        加一个模块只是在这里多几行，删一个模块只需删掉那几行。
 *        这里还多了一条纪律：命令一律经 ctx.commands 注册，且左侧边栏必须最后装配——
 *        它是照着花名册摆图标的，摆的时候花名册必须已经收齐
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Plugin } from 'obsidian';
import { registerViewCodeBlock } from './core/codeblock';
import { CommandRegistry, INIT_VAULT_COMMAND, normalizeRibbonCommands } from './core/commands';
import { normalizeFormatRules } from './core/markdownStyle';
import { PERIODS } from './core/constants';
import { SelfWriteGuard } from './core/guard';
import { DEFAULT_SETTINGS } from './core/types';
import type { VaultSeed, ZiminosContext, ZiminosSettings } from './core/types';
import { aboutViews, renderAboutPanel } from './modules/about/view';
import { registerAppearanceSwitch } from './modules/appearance/statusBar';
import { registerCreateBookCommand } from './modules/books/createBook';
import { registerExcerptCardCommand } from './modules/books/extractCard';
import { registerImportHighlightsCommand } from './modules/books/importHighlights';
import { registerFormatter } from './modules/format/formatter';
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
import { registerCreateAreaCommand } from './modules/projects/createArea';
import { BOOK_KIND, createContainer } from './modules/projects/createContainer';
import { registerCreateProjectCommand } from './modules/projects/createProject';
import { projectsSeed } from './modules/projects/seed';
import { registerTransitionCommands } from './modules/projects/transitions';
import { registerUpdatedMaintainer } from './modules/projects/updatedMaintainer';
import { openPeriodNote, registerPeriodicCommands } from './modules/review/periodic';
import { reviewProjectViews } from './modules/review/projectViews';
import { reviewSeed } from './modules/review/seed';
import { registerThemeCommand } from './modules/review/theme';
import { reviewThemeViews } from './modules/review/views';
import { registerRibbon } from './modules/ribbon/dock';
import { applySeed, initializeVault } from './modules/setup/init';
import { ZiminosSettingTab } from './settings';

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
            // 注册台同样全库唯一：它手里那份花名册就是左侧边栏与设置页看到的命令清单
            commands: new CommandRegistry(this),
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

        // 开荒内部已把全部异常转成中文 Notice，此处无需等待也无需接住
        ctx.commands.register(INIT_VAULT_COMMAND, () => {
            void initializeVault(ctx, collectSeeds());
        });

        // ============================================================
        // 各模块注册自己的命令与自动行为
        // ============================================================

        // 建项目要问「这是谁委托的」，候选人住在人脉模块——用同一套注入把两者接上
        registerCreateProjectCommand(ctx, (title) => pickPerson(ctx, title));
        registerCreateAreaCommand(ctx);
        registerCardInitCommand(ctx);
        registerCardAutoInit(ctx);
        registerTransitionCommands(ctx);
        registerUpdatedMaintainer(ctx);

        // 一本书就是一个项目：建书要的「一个文件夹 + 一篇 MOC」正是 createContainer 那套流程，
        // 而 books 模块不认识 projects——它只声明了一个「建一个书籍容器」的洞，由这里填上。
        // BOOK_KIND 那张表说清了书与项目的全部差别，因此这里递的是规格，不是又一条流程
        registerCreateBookCommand(ctx, (preset) => createContainer(ctx, BOOK_KIND, preset));
        registerImportHighlightsCommand(ctx);
        registerExcerptCardCommand(ctx);

        registerInspirationCaptureCommand(ctx);

        registerPeriodicCommands(ctx);
        registerThemeCommand(ctx);

        registerCreateContactCommand(ctx);
        // 记人情要往当天日记里写一行。它不认识复盘模块，只声明了一个「拿到今天的日记」的洞，
        // 由这里用复盘模块的能力填上；reveal 关掉，顺手记一笔不该顶掉学员正在读的笔记
        registerRecordFavorCommand(ctx, () => openPeriodNote(ctx, PERIODS.daily, { reveal: false }));
        // 客户模块要按需长出自己的产物，同理只声明了一个「落一份开荒贡献」的洞
        registerClientCommands(ctx, (seed) => applySeed(ctx, seed));

        // 排版整理横跨全库、不属于任何一套笔记，它注册的是一条命令与一个编辑监听，一篇笔记都不生产。
        // 位置排在这里而不是更早：注册顺序就是左侧边栏的分组顺序，它该落在客户与外观之间，
        // 与设置页那九张标签的先后对齐——两处只要有一处自作主张，学员就会觉得是两套东西
        registerFormatter(ctx);

        // 外观开关在状态栏常驻一个按钮，而设置页只会改设置对象、没法让已经画出来的按钮消失，
        // 因此它交回一个「按当前设置重新决定显隐」的函数，由下面转交给设置页
        const syncAppearanceSwitch = registerAppearanceSwitch(ctx);

        // ============================================================
        // 左侧边栏：必须在全部命令注册完之后，它摆的就是上面那些命令
        // ============================================================

        // 与外观开关同理：设置页改完勾选，得有人去推那列已经画出来的图标一把
        const syncRibbon = registerRibbon(ctx);

        // ============================================================
        // 视图引擎：一个代码块语言，二十二个视图；加视图不必改这里之外的任何装配代码
        // ============================================================

        registerViewCodeBlock(ctx, [
            ...reviewThemeViews,
            ...reviewProjectViews,
            ...personViews,
            ...circleViews,
            // 客户视图始终注册：视图是只读的，注册它零成本，
            // 而用开关控制注册会让「块能不能渲染」变成需要重启才生效的事
            ...clientViews,
            // 作者名片：开荒写进导航页尾的那个块由它渲染
            ...aboutViews,
        ]);

        // ============================================================
        // 挂载设置页：它是「人主导」这条红线的操作面，放在最后保证挂载时上下文已完备
        // ============================================================

        this.addSettingTab(
            new ZiminosSettingTab(ctx, {
                initialize: () => initializeVault(ctx, collectSeeds()),
                syncAppearanceSwitch,
                syncRibbon,
                // 设置页的「关于作者」区与导航页尾的视图块画同一张名片，实现只有 about 一份
                renderAbout: renderAboutPanel,
            }),
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
        // 唯一需要额外收敛的字段。浅合并对坏值毫无抵抗力，而它是全部设置里唯一一个
        // 「值坏了会让设置页画到一半炸掉」的——理由与做法见 normalizeRibbonCommands
        this.settings.ribbonCommands = normalizeRibbonCommands(this.settings.ribbonCommands);
        // 同因同治：formatRules 也被 .includes 直接使用，坏值会让整趟排版在第一条规则上炸掉
        this.settings.formatRules = normalizeFormatRules(this.settings.formatRules);
    }
}
