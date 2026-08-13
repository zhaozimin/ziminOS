/**
 * [INPUT]: 依赖 obsidian 的 PluginSettingTab 基类、Setting 构建器与 setIcon；依赖 ./core/constants 的
 *          灵感默认值/插入位置、./core/types 的 ZiminosContext/DEFAULT_SETTINGS
 * [OUTPUT]: 对外提供 ZiminosSettingTab 与它的注入契约 SettingActions，由 main.ts 在装配末尾挂载
 * [POS]: 插件唯一的图形界面，也是「人主导」这条红线的具象化——开荒只在用户按下按钮时发生，
 *        两个自动行为、以及状态栏那个常驻按钮，随时都可以关掉。
 *        它只读写 ctx.settings 并调 ctx.saveSettings，
 *        不持有任何自己的状态：面板每次 display 都从设置对象重新渲染，因此外部改动天然可见。
 *        七个分区的排列顺序即学员的使用顺序：先开荒，再决定自动化与灵感落点，
 *        然后是外观与左侧边栏这两件「屏幕上摆什么」，其次才是项目目录与时间格式，
 *        最后是模块清单——它如实展示插件内的业务模块与外观包，同时为后续模块预留可见挂载位。
 *        侧边栏那一区不认识任何一条具体命令：清单现读 ctx.commands 的花名册，
 *        因此加一条命令、改一个图标，这个文件一个字都不用改。
 *        开荒动作与两处显隐同步都由 main 注入而非自己 import：
 *        设置页因此既不认识参与开荒的模块名单，也不认识状态栏按钮与边栏图标的实现
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { PluginSettingTab, Setting, setIcon } from 'obsidian';
import { INSPIRATION_DEFAULTS, INSPIRATION_INSERT_POSITIONS } from './core/constants';
import type { InspirationInsertPosition } from './core/constants';
import { DEFAULT_SETTINGS } from './core/types';
import type { ZiminosContext } from './core/types';

// ============================================================
// 界面文案（全中文，集中在此，避免同一句话散落在多处）
// ============================================================

const TEXTS = {
    initHeading: '开荒',
    initName: '初始化笔记库',
    initButton: '初始化',
    initPending: '尚未初始化。点右边的按钮，为这个库铺好七个文件夹、模板与导航，并长出人脉与复盘两套系统。',
    initReadyPrefix: '已就绪 ✓ 首次开荒于 ',
    initReadySuffix: '。再点一次只补齐缺失的文件，不会覆盖你写过的任何笔记。',

    autoHeading: '自动化',
    autoCardName: '新建笔记自动登记为卡片',
    autoCardDesc: '在项目或领域目录里新建空笔记时，自动补齐标准字段，并链回它所属的 MOC。关掉后可用命令「初始化当前卡片」手动登记。',
    autoUpdatedName: '自动维护 updated 时间',
    autoUpdatedDesc: '改完带 YAML 的笔记、停手两秒后，自动记下这次修改时间。没有 YAML 的笔记一个字都不动。',

    inspirationHeading: '灵感收集',
    inspirationFolderName: '文件夹',
    inspirationFolderDesc: '灵感笔记放在哪个文件夹。相对于笔记库根目录。',
    inspirationFileName: '笔记名称',
    inspirationFileDesc: '灵感写入哪一篇笔记；没写 .md 时会自动补齐。',
    inspirationTargetHeading: '定位标题',
    inspirationTargetDesc: '选择标题插入时，用它定位具体区域。可写“灵感集”或完整 Markdown 标题。',
    inspirationPositionName: '插入位置',
    inspirationPositionDesc: '决定新灵感写在标题区或整篇正文的头尾。置顶会自动避开 YAML、页面标题和 Dataview 筛选区。',
    inspirationFormatName: '单条格式',
    inspirationFormatDesc: '必须保留 {{content}}；还可使用 {{date}}、{{time}}、{{datetime}}。',

    ribbonHeading: '左侧边栏',
    ribbonIntro:
        '勾上的命令会变成最左边那一列图标，点一下就执行，不用再打开命令面板。' +
        '图标是 Pikaicons，跟着主题的颜色与描边粗细走。' +
        '取消勾选后，它在「设置 → 外观 → 功能区」和手机端的边栏菜单里要重启 Obsidian 才消失；' +
        '反过来，你在那两处藏掉的图标，这里勾上也不会出现——那是 Obsidian 自己的开关，得回那儿打开。',
    ribbonCountPrefix: '已摆出 ',
    ribbonCountSeparator: ' / ',
    ribbonCountSuffix: ' 条',

    appearanceHeading: '外观',
    appearanceSwitchName: '状态栏外观开关',
    appearanceSwitchDesc: '在右下角状态栏放一个 🎨 按钮，点开就能逐个开关 CSS 片段，不必再进设置翻外观页。关掉只是收起按钮，命令面板里的「打开外观开关」照常可用。',

    advancedHeading: '高级设置（一般不用改）',

    modulesHeading: '系统模块',
} as const;

// ============================================================
// 高级区：四个文本框的声明式描述
// ============================================================

/** 走开关控件的设置项，全部是布尔字段 */
type BooleanSettingKey = 'autoCardInit' | 'autoUpdated' | 'showAppearanceSwitch';

/** 可由高级区文本框直接编辑的设置项，全部是字符串字段 */
type TextSettingKey =
    | 'projectFolder'
    | 'areaFolder'
    | 'archiveFolder'
    | 'diaryFolder'
    | 'contactFolder'
    | 'clientFolder'
    | 'clientSources'
    | 'clientProducts'
    | 'dateTimeFormat';

/** 一个文本框的全部信息。用数据描述而非四段雷同代码，增删字段只改这张表 */
interface TextFieldSpec {
    readonly key: TextSettingKey;
    readonly name: string;
    /** 说明的前半句；后半句由默认值自动补出，保证提示与 DEFAULT_SETTINGS 永不失同步 */
    readonly hint: string;
}

const ADVANCED_FIELDS: readonly TextFieldSpec[] = [
    { key: 'projectFolder', name: '项目目录', hint: '正在推进的项目放在这里。' },
    { key: 'areaFolder', name: '领域目录', hint: '长期关注、没有终点的领域放在这里。' },
    { key: 'archiveFolder', name: '归档目录', hint: '完成、暂停、放弃的项目会搬到这里；人脉档案搬进来即退出全部名录。' },
    { key: 'diaryFolder', name: '复盘目录', hint: '日/周/月/季/年五级复盘的时间轴根目录，五个子目录由它派生。' },
    { key: 'contactFolder', name: '人脉目录', hint: '人物档案平铺存放在这里；视图靠 type 认人，挪走也不影响。' },
    { key: 'clientFolder', name: '客户目录', hint: '付费用户档案放在这里，运行「初始化客户模块」后才会用到。' },
    { key: 'clientSources', name: '客户渠道', hint: '「新建客户」的渠道候选，用逗号分隔。走选择而非手打，统计才不会被同义写法打散。' },
    { key: 'clientProducts', name: '产品清单', hint: '「增加付费」的产品候选，用逗号分隔。' },
    { key: 'dateTimeFormat', name: '时间格式', hint: 'created 与 updated 字段的写法，moment 语法。' },
];

// ============================================================
// 系统模块清单
// ============================================================

/** 模块清单的一行。running 决定它是运行中的能力还是占位的预告 */
interface ModuleEntry {
    readonly name: string;
    readonly status: string;
    readonly running: boolean;
}

/**
 * 静态模块清单。项目管理与灵感写入由插件运行，查询视图和外观由 vault 中锁定的第三方组件
 * 与自有 CSS 协同提供；清单只展示交付状态，不在 ziminOS 内重新实现第三方能力。
 */
const SYSTEM_MODULES: readonly ModuleEntry[] = [
    { name: '📦 项目管理 v1', status: '运行中 · 建项目、卡片登记、四态流转', running: true },
    { name: '💡 灵感收集 v1', status: '运行中 · Dataview 未完成任务视图已就绪', running: true },
    { name: '👥 人脉管理 v1', status: '运行中 · 新建人脉、记人情，档案与 MOC 共八个视图', running: true },
    { name: '📔 复盘 v1', status: '运行中 · 五级周期笔记、主题链与项目数据共五个视图', running: true },
    {
        name: '💰 客户与付费 v1',
        status: '按需启用 · 命令面板运行「初始化客户模块」，长出 MOC 与八个视图',
        running: true,
    },
    {
        name: '🎨 外观包 v2',
        status: '运行中 · Minimal + Style Settings + 十二个 CSS 片段，右下角一键开关',
        running: true,
    },
    {
        name: '🧭 左侧边栏 v1',
        status: '运行中 · 二十一条命令配 Pikaicons 图标，默认摆出七条',
        running: true,
    },
];

// ============================================================
// 注入契约
// ============================================================

/**
 * 设置页干不了、必须由 main 递进来的三件事。
 *
 * 用一个对象而不是三个位置参数：后两个函数的类型都是 `() => void`，
 * 摆成位置参数的话调换顺序照样能通过编译，出的错却是「改了外观开关，边栏跟着动」——
 * 这种错没有任何编译期信号，只能靠人肉眼盯着两行长长的实参对齐。
 */
export interface SettingActions {
    /** 执行一次开荒。名单住在装配点，设置页因此不认识参与开荒的模块 */
    readonly initialize: () => Promise<void>;
    /** 让状态栏那个按钮按当前设置重新决定显隐 */
    readonly syncAppearanceSwitch: () => void;
    /** 让左侧边栏那列图标按当前设置重新决定各自显隐 */
    readonly syncRibbon: () => void;
}

// ============================================================
// 设置页
// ============================================================

/**
 * ziminOS 设置页。
 * 构造参数只收 ZiminosContext 一个：app 与 plugin 都能从中取出，
 * 设置页因此与 main.ts 共用同一个设置对象与同一个落盘通道，不存在第二份真相。
 */
export class ZiminosSettingTab extends PluginSettingTab {
    private readonly ctx: ZiminosContext;

    /**
     * 三件由 main 注入的事。
     * 设置页只会改设置对象并落盘，它既不知道有哪些模块要参与开荒，
     * 也无从让屏幕上已经画好的按钮与图标自己变——谁画的谁负责收，
     * 这里只负责在改完之后叫一声。
     */
    private readonly actions: SettingActions;

    /**
     * 「已摆出 N / 21 条」那行字。
     *
     * 这是全页唯一一处持有 DOM 引用的地方，理由很具体：勾选要即时更新这个数，
     * 而重建整页会把滚动条弹回顶部——二十一行排下来，用户勾第十八行时页面一跳，
     * 他就得重新找回刚才那一行。持有的是一个渲染出来的节点，不是第二份状态：
     * 数字仍然现算自设置对象，每次 display 也会把它换成新节点。
     */
    private ribbonCountEl: HTMLElement | null = null;

    constructor(ctx: ZiminosContext, actions: SettingActions) {
        super(ctx.app, ctx.plugin);

        this.ctx = ctx;
        this.actions = actions;
    }

    /** 每次打开设置页都整体重建，保证显示的永远是设置对象的当前值 */
    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        this.renderInitSection(containerEl);
        this.renderAutomationSection(containerEl);
        this.renderInspirationSection(containerEl);
        this.renderAppearanceSection(containerEl);
        this.renderRibbonSection(containerEl);
        this.renderAdvancedSection(containerEl);
        this.renderModulesSection(containerEl);
    }

    // ============================================================
    // 一、开荒
    // ============================================================

    /**
     * 开荒区：一句状态说明 + 一个按钮。
     * 按钮点下后先禁用再执行，防止连点开出两次流程；完成后重建整个面板，
     * 状态说明随之从「尚未初始化」翻面成「已就绪」。
     */
    private renderInitSection(containerEl: HTMLElement): void {
        new Setting(containerEl).setName(TEXTS.initHeading).setHeading();

        new Setting(containerEl)
            .setName(TEXTS.initName)
            .setDesc(this.describeInitState())
            .addButton((button) => {
                button
                    .setButtonText(TEXTS.initButton)
                    .setCta()
                    .onClick(async () => {
                        button.setDisabled(true);

                        try {
                            // 开荒自己吃掉全部异常并以 Notice 汇报，这里不需要再判断成败
                            await this.actions.initialize();
                        } finally {
                            // 重建面板即刷新状态；旧按钮随 containerEl 一起丢弃，无需解禁
                            this.display();
                        }
                    });
            });
    }

    /** 用 initializedAt 是否为空来决定说什么：这是「首次开荒」与「幂等补齐」的唯一判据 */
    private describeInitState(): string {
        const { initializedAt } = this.ctx.settings;

        if (!initializedAt) return TEXTS.initPending;

        return TEXTS.initReadyPrefix + initializedAt + TEXTS.initReadySuffix;
    }

    // ============================================================
    // 二、自动化
    // ============================================================

    /** 自动化区：两个开关，对应插件仅有的两个常驻监听 */
    private renderAutomationSection(containerEl: HTMLElement): void {
        new Setting(containerEl).setName(TEXTS.autoHeading).setHeading();

        this.renderToggle(containerEl, 'autoCardInit', TEXTS.autoCardName, TEXTS.autoCardDesc);
        this.renderToggle(containerEl, 'autoUpdated', TEXTS.autoUpdatedName, TEXTS.autoUpdatedDesc);
    }

    /**
     * 渲染一个布尔开关。
     *
     * 改动立即落盘。两个自动化开关不需要 onApplied——监听方每次触发都现读设置，
     * 天然看得见新值；只有已经画在屏幕上的东西（状态栏按钮）才需要有人去推它一把。
     */
    private renderToggle(
        containerEl: HTMLElement,
        key: BooleanSettingKey,
        name: string,
        desc: string,
        onApplied?: () => void,
    ): void {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addToggle((toggle) => {
                toggle.setValue(this.ctx.settings[key]).onChange(async (value) => {
                    this.ctx.settings[key] = value;

                    await this.ctx.saveSettings();
                    onApplied?.();
                });
            });
    }

    // ============================================================
    // 三、灵感收集
    // ============================================================

    /** 灵感区直接展示常用自定义项；这些字段就是「记录灵感」命令的下一次运行参数 */
    private renderInspirationSection(containerEl: HTMLElement): void {
        new Setting(containerEl).setName(TEXTS.inspirationHeading).setHeading();

        this.renderInspirationTextField(
            containerEl,
            'inspirationFolder',
            TEXTS.inspirationFolderName,
            TEXTS.inspirationFolderDesc,
            INSPIRATION_DEFAULTS.folder,
        );
        this.renderInspirationTextField(
            containerEl,
            'inspirationFileName',
            TEXTS.inspirationFileName,
            TEXTS.inspirationFileDesc,
            INSPIRATION_DEFAULTS.fileName,
        );
        this.renderInspirationTextField(
            containerEl,
            'inspirationHeading',
            TEXTS.inspirationTargetHeading,
            TEXTS.inspirationTargetDesc,
            INSPIRATION_DEFAULTS.heading,
        );

        new Setting(containerEl)
            .setName(TEXTS.inspirationPositionName)
            .setDesc(TEXTS.inspirationPositionDesc)
            .addDropdown((dropdown) => {
                dropdown
                    .addOption('heading-top', '标题下方（新内容在前）')
                    .addOption('heading-bottom', '标题区末尾（新内容在后）')
                    .addOption('file-top', '正文顶部')
                    .addOption('file-bottom', '正文底部')
                    .setValue(this.normalizeInspirationPosition(this.ctx.settings.inspirationInsertPosition))
                    .onChange(async (value) => {
                        const position = this.normalizeInspirationPosition(value);

                        this.ctx.settings.inspirationInsertPosition = position;
                        await this.ctx.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName(TEXTS.inspirationFormatName)
            .setDesc(TEXTS.inspirationFormatDesc)
            .addTextArea((textArea) => {
                textArea
                    .setPlaceholder(INSPIRATION_DEFAULTS.format)
                    .setValue(this.ctx.settings.inspirationFormat)
                    .onChange(async (value) => {
                        this.ctx.settings.inspirationFormat = value;
                        await this.ctx.saveSettings();
                    });
                textArea.inputEl.rows = 3;
                textArea.inputEl.style.width = '100%';
            });
    }

    /** 灵感目录/文件/标题三个文本设置共用同一条即时落盘路径 */
    private renderInspirationTextField(
        containerEl: HTMLElement,
        key: 'inspirationFolder' | 'inspirationFileName' | 'inspirationHeading',
        name: string,
        desc: string,
        fallback: string,
    ): void {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addText((text) => {
                text.setPlaceholder(fallback)
                    .setValue(this.ctx.settings[key])
                    .onChange(async (value) => {
                        this.ctx.settings[key] = value;
                        await this.ctx.saveSettings();
                    });
            });
    }

    /** 防御手改 data.json 产生的未知枚举值，设置面板与写入模块保持同一回落策略 */
    private normalizeInspirationPosition(value: string): InspirationInsertPosition {
        const candidate = value as InspirationInsertPosition;

        return INSPIRATION_INSERT_POSITIONS.includes(candidate)
            ? candidate
            : INSPIRATION_DEFAULTS.insertPosition;
    }

    // ============================================================
    // 四、外观
    // ============================================================

    /** 外观区：只有一个开关，管的是「右下角要不要常驻这个按钮」，不管片段本身开着还是关着 */
    private renderAppearanceSection(containerEl: HTMLElement): void {
        new Setting(containerEl).setName(TEXTS.appearanceHeading).setHeading();

        this.renderToggle(
            containerEl,
            'showAppearanceSwitch',
            TEXTS.appearanceSwitchName,
            TEXTS.appearanceSwitchDesc,
            this.actions.syncAppearanceSwitch,
        );
    }

    // ============================================================
    // 五、左侧边栏
    // ============================================================

    /**
     * 侧边栏区：一句说明 + 按分组排下来的二十一行。
     *
     * 清单现读花名册而不是自己维护一份，因此它与命令面板里能搜到的命令永远是同一批；
     * 分组标题按「相邻两行的 group 不同」切出来，与外观开关面板用的是同一套画法——
     * 分组顺序不需要另一张表，它就是命令的注册顺序。
     */
    private renderRibbonSection(containerEl: HTMLElement): void {
        const commands = this.ctx.commands.list();

        new Setting(containerEl).setName(TEXTS.ribbonHeading).setHeading();

        const summary = new Setting(containerEl)
            .setName(this.describeRibbonCount())
            .setDesc(TEXTS.ribbonIntro);

        this.ribbonCountEl = summary.nameEl;

        let currentGroup = '';

        for (const command of commands) {
            if (command.spec.group !== currentGroup) {
                currentGroup = command.spec.group;
                containerEl.createDiv({ cls: 'ziminos-ribbon-group', text: currentGroup });
            }

            this.renderRibbonRow(containerEl, command.spec.id, command.spec.icon, command.spec.name);
        }
    }

    /** 只改那一个数字，不重建页面——重建会把滚动条弹回顶部 */
    private refreshRibbonCount(): void {
        if (this.ribbonCountEl) this.ribbonCountEl.setText(this.describeRibbonCount());
    }

    /**
     * 「已摆出 7 / 21 条」。给的是一个量级感：勾多了那条边栏会变成谁也不看的图标柱。
     * 总数现算自花名册，不写死——这一区不认识任何一条具体命令，也就不该认识它们有几条。
     */
    private describeRibbonCount(): string {
        const total = this.ctx.commands.list().length;

        return (
            TEXTS.ribbonCountPrefix +
            this.ctx.settings.ribbonCommands.length +
            TEXTS.ribbonCountSeparator +
            total +
            TEXTS.ribbonCountSuffix
        );
    }

    /** 一行：图标 + 命令名 + 开关。图标就是它在边栏上的样子，勾之前先看见 */
    private renderRibbonRow(
        containerEl: HTMLElement,
        id: string,
        icon: string,
        name: string,
    ): void {
        const label = createFragment((frag) => {
            const iconEl = frag.createSpan({ cls: 'ziminos-ribbon-icon' });

            setIcon(iconEl, icon);
            frag.createSpan({ text: name });
        });

        new Setting(containerEl)
            .setName(label)
            .setClass('ziminos-ribbon-row')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.ctx.settings.ribbonCommands.includes(id))
                    .onChange(async (value) => {
                        this.ctx.settings.ribbonCommands = this.nextRibbonCommands(id, value);

                        await this.ctx.saveSettings();
                        this.actions.syncRibbon();
                        this.refreshRibbonCount();
                    });
            });
    }

    /**
     * 算出勾选之后的新清单。
     *
     * 一律照花名册重排一遍而不是往旧数组里增删：其一，边栏顺序因此永远等于命令的注册顺序，
     * 与用户先勾哪个无关；其二，data.json 里若混进了不认识的 id（换过版本、手改过文件），
     * 第一次勾选就顺手扫掉，不会留一条永远没人认领的记录。
     * 返回的是新数组，绝不原地改——ribbonCommands 在用户没调过时与 DEFAULT_SETTINGS 共用引用。
     */
    private nextRibbonCommands(id: string, enabled: boolean): readonly string[] {
        const chosen = new Set(this.ctx.settings.ribbonCommands);

        if (enabled) chosen.add(id);
        else chosen.delete(id);

        return this.ctx.commands
            .list()
            .map((command) => command.spec.id)
            .filter((candidate) => chosen.has(candidate));
    }

    // ============================================================
    // 六、高级
    // ============================================================

    /**
     * 高级区：默认折叠。
     * 目录名与时间格式是课程内容的一部分，改了会让学员的库与课程讲义对不上，
     * 所以既要留出口，又不能摆在明面上诱导人去动它。
     */
    private renderAdvancedSection(containerEl: HTMLElement): void {
        const details = containerEl.createEl('details');
        const summary = details.createEl('summary', { text: TEXTS.advancedHeading });

        summary.style.cursor = 'pointer';
        summary.style.padding = '12px 0';
        summary.style.fontWeight = '600';

        for (const field of ADVANCED_FIELDS) {
            this.renderTextField(details, field);
        }
    }

    /**
     * 渲染一个文本框。
     * 这里刻意不做清洗与校验：留空或写错的值由各功能模块在使用时回落到默认值，
     * 校验集中在读取侧，设置页只负责如实记录用户敲进去的字。
     */
    private renderTextField(containerEl: HTMLElement, field: TextFieldSpec): void {
        const fallback: string = DEFAULT_SETTINGS[field.key];

        new Setting(containerEl)
            .setName(field.name)
            .setDesc(`${field.hint}课程默认值 ${fallback}，改前三思。`)
            .addText((text) => {
                text.setPlaceholder(fallback)
                    .setValue(this.ctx.settings[field.key])
                    .onChange(async (value) => {
                        this.ctx.settings[field.key] = value;

                        await this.ctx.saveSettings();
                    });
            });
    }

    // ============================================================
    // 七、系统模块
    // ============================================================

    /** 模块区：纯展示，没有任何控件。未上线的模块以禁用态呈现，看得见但点不动 */
    private renderModulesSection(containerEl: HTMLElement): void {
        new Setting(containerEl).setName(TEXTS.modulesHeading).setHeading();

        for (const entry of SYSTEM_MODULES) {
            const item = new Setting(containerEl).setName(entry.name).setDesc(entry.status);

            if (!entry.running) item.setDisabled(true);
        }
    }
}
