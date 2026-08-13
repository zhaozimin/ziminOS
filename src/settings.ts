/**
 * [INPUT]: 依赖 obsidian 的 PluginSettingTab 基类、Setting 构建器与 setIcon；依赖 ./core/constants 的
 *          灵感默认值/插入位置、./core/types 的 ZiminosContext/DEFAULT_SETTINGS
 * [OUTPUT]: 对外提供 ZiminosSettingTab 与它的注入契约 SettingActions，由 main.ts 在装配末尾挂载
 * [POS]: 插件唯一的图形界面，也是「人主导」这条红线的具象化——开荒只在用户按下按钮时发生，
 *        两个自动行为、以及状态栏那个常驻按钮，随时都可以关掉。
 *        它只读写 ctx.settings 并调 ctx.saveSettings，不持有任何领域状态：
 *        每次 display 都从设置对象重新渲染，因此外部改动天然可见。
 *        V3 起页面按系统模块切成十张标签页，切法不是新发明的分类，就是 modules/ 下的目录本身——
 *        一页只回答一个系统的配置问题，目录名也各自归还给它服务的那个模块，
 *        于是「一页看完就不必再往下翻」，而不是二十来个设置项排成一条长路。
 *        末页「关于」是唯一没有设置项的一页，它照样按同名纪律来自 modules/about：
 *        名片与首页导航尾部画的是同一张，实现只有一份。
 *        侧边栏那一页不认识任何一条具体命令：清单现读 ctx.commands 的花名册，
 *        因此加一条命令、改一个图标，这个文件一个字都不用改。
 *        开荒动作、两处显隐同步与作者名片都由 main 注入而非自己 import：
 *        设置页因此既不认识参与开荒的模块名单，也不认识状态栏按钮、边栏图标与名片的实现
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { PluginSettingTab, Setting, setIcon } from 'obsidian';
import { COMMAND_ICONS } from './core/commands';
import { INSPIRATION_DEFAULTS, INSPIRATION_INSERT_POSITIONS } from './core/constants';
import type { InspirationInsertPosition } from './core/constants';
import { FORMAT_RULES } from './core/markdownStyle';
import { DEFAULT_SETTINGS } from './core/types';
import type { ZiminosContext } from './core/types';

// ============================================================
// 十张标签页：一页一个系统模块
// ============================================================

/**
 * 页标识。取值一律与 modules/ 下的目录同名（clients 例外，它是 contacts 模块里 client.ts 那一支，
 * 单列成页的理由与 COMMAND_GROUPS 里单列成组的理由是同一条：客户与人脉在业务上本就是两个物种）。
 * 同名不是巧合而是纪律——设置页的分页若与代码的模块边界对不上，
 * 学员问「客户的设置在哪」时，答案就会取决于当初谁把它排在了哪一段。
 */
type TabId =
    | 'setup'
    | 'projects'
    | 'inspiration'
    | 'review'
    | 'contacts'
    | 'clients'
    | 'format'
    | 'appearance'
    | 'ribbon'
    | 'about';

/** 一张标签页的全部身份：标签栏上的那枚按钮，与它翻开之后的那句页头 */
interface SettingsTab {
    readonly id: TabId;
    /** 标签上的短名。十张一律两个字——长短不齐的标签会让人以为它们不是一类东西 */
    readonly label: string;
    /**
     * 这个模块的视觉身份，取自 COMMAND_ICONS——与左侧边栏、命令面板同一套笔画图形。
     * 标签与页头共用同一枚，用户因此知道自己翻开的正是刚点的那张。
     * 曾经是 emoji：十枚彩色符号排成一行，与这套系统其余图标全不同源，像贴纸不像界面。
     */
    readonly icon: string;
    /** 页头上的全名，带版本号 */
    readonly module: string;
    /** 交付状态，即页头那句「这一页管的是什么、跑没跑起来」 */
    readonly status: string;
}

/**
 * 十张页，顺序即学员的使用顺序，也正好是 main.ts 的装配顺序与命令的注册顺序：
 * 先开荒，再是每天在用的三套（项目、灵感、复盘），然后是关系与生意（人脉、客户），
 * 接着两张管的都不是笔记而是屏幕（外观、边栏），最后一张谁也不管——那是作者本人。
 *
 * 末页「关于」是唯一没有设置项的一页。它仍然守同名纪律（modules/about），
 * 也仍然守页头那句承诺；只是它回答的不是「这个系统怎么配」，而是「这套东西是谁做的」。
 * 排在最末不是把它当边角料：那是十页里唯一一页，学员看完可以合上设置去找作者。
 *
 * 这张表同时喂两处：标签栏上那枚两个字的按钮，与每页页头那句「这一页是谁、跑没跑起来」。
 * 一处事实两处呈现，因此不存在「标签上写着外观、页头却是另一句」这种事。
 *
 * 曾经还有第三处——开荒页上一份逐行列出全部模块的清单。它被摘掉了，
 * 理由是标签栏本身就是那份清单：十张页一直摆在屏幕最上方，点一下即到，
 * 再在首页把同样十行重列一遍，是把「索引」误当成了「介绍」。
 * status 那句话没有跟着一起消失，它搬进了各页页头——在那儿它回答的是「我现在在哪、这页管什么」，
 * 而不是「这套系统都有些什么」。
 */
const TABS: readonly SettingsTab[] = [
    {
        id: 'setup',
        label: '开荒',
        icon: COMMAND_ICONS.vault,
        module: '开荒 v1',
        status: '运行中 · 七个文件夹、模板与导航，再点一次只补齐缺失',
    },
    {
        id: 'projects',
        label: '项目',
        icon: COMMAND_ICONS.project,
        module: '项目管理 v1',
        status: '运行中 · 建项目、卡片登记、四态流转',
    },
    {
        id: 'inspiration',
        label: '灵感',
        icon: COMMAND_ICONS.inspiration,
        module: '灵感收集 v1',
        status: '运行中 · Dataview 未完成任务视图已就绪',
    },
    {
        id: 'review',
        label: '复盘',
        icon: COMMAND_ICONS.daily,
        module: '复盘 v1',
        status: '运行中 · 五级周期笔记、主题链与项目数据共五个视图',
    },
    {
        id: 'contacts',
        label: '人脉',
        icon: COMMAND_ICONS.contact,
        module: '人脉管理 v1',
        status: '运行中 · 新建人脉、记人情，档案与 MOC 共八个视图',
    },
    {
        id: 'clients',
        label: '客户',
        icon: COMMAND_ICONS.clients,
        module: '客户与付费 v1',
        status: '按需启用 · 命令面板运行「初始化客户模块」，长出 MOC 与八个视图',
    },
    {
        id: 'format',
        label: '排版',
        icon: COMMAND_ICONS.format,
        module: '排版 v1',
        status: '运行中 · 九条标准 Markdown 写法，改完走开就替你整理',
    },
    {
        id: 'appearance',
        label: '外观',
        icon: COMMAND_ICONS.appearance,
        module: '外观包 v2',
        status: '运行中 · Minimal + Style Settings + 十二个 CSS 片段，右下角一键开关',
    },
    {
        id: 'ribbon',
        label: '边栏',
        icon: COMMAND_ICONS.dock,
        module: '左侧边栏 v1',
        status: '运行中 · 二十三条命令配 Pikaicons 图标，默认摆出七条',
    },
    {
        id: 'about',
        label: '关于',
        icon: COMMAND_ICONS.theme,
        module: '关于作者 v1',
        status: '官网、教程与四个自媒体入口，随插件走——首页导航底部是同一张名片',
    },
];

// ============================================================
// 界面文案（全中文，集中在此，避免同一句话散落在多处）
// ============================================================

const TEXTS = {
    initName: '初始化笔记库',
    initButton: '初始化',
    initPending: '尚未初始化。点右边的按钮，为这个库铺好七个文件夹、模板与导航，并长出人脉与复盘两套系统。',
    initReadyPrefix: '已就绪 ✓ 首次开荒于 ',
    initReadySuffix: '。再点一次只补齐缺失的文件，不会覆盖你写过的任何笔记。',

    autoCardName: '新建笔记自动登记为卡片',
    autoCardDesc: '在项目或领域目录里新建空笔记时，自动补齐标准字段，并链回它所属的 MOC。关掉后可用命令「初始化当前卡片」手动登记。',
    autoUpdatedName: '自动维护 updated 时间',
    autoUpdatedDesc: '改完带 YAML 的笔记、停手两秒后，自动记下这次修改时间。没有 YAML 的笔记一个字都不动。',

    inspirationPositionName: '插入位置',
    inspirationPositionDesc: '决定新灵感写在标题区或整篇正文的头尾。置顶会自动避开 YAML、页面标题和 Dataview 筛选区。',
    inspirationFormatName: '单条格式',
    inspirationFormatDesc: '必须保留 {{content}}；还可使用 {{date}}、{{time}}、{{datetime}}。',

    ribbonIntro:
        '勾上的命令会变成最左边那一列图标，点一下就执行，不用再打开命令面板。' +
        '图标是 Pikaicons，跟着主题的颜色与描边粗细走。' +
        '取消勾选后，它在「设置 → 外观 → 功能区」和手机端的边栏菜单里要重启 Obsidian 才消失；' +
        '反过来，你在那两处藏掉的图标，这里勾上也不会出现——那是 Obsidian 自己的开关，得回那儿打开。',
    ribbonCountPrefix: '已摆出 ',
    ribbonCountSeparator: ' / ',
    ribbonCountSuffix: ' 条',

    autoFormatName: '改完走开自动整理',
    autoFormatDesc: '离开一篇刚改过的笔记时，按下面勾选的规则整理它一次；插件自己往笔记里写过东西之后同样会整理。它刻意不动你正开着的那一篇——中文输入法在合成中途被外部改写会吞字，而两秒的停顿在斟酌一句话时太常见。想当场整理，用命令「整理当前笔记格式」。',

    formatRulesHeading: '九条规则',
    formatRulesIntro: '关掉哪一条，整理时就不再执行它。命令与自动整理走的是同一份勾选。',

    appearanceSwitchName: '状态栏外观开关',
    appearanceSwitchDesc: '在右下角状态栏放一个 🎨 按钮，点开就能逐个开关 CSS 片段，不必再进设置翻外观页。关掉只是收起按钮，命令面板里的「打开外观开关」照常可用。',

    advancedHeading: '高级设置（一般不用改）',
    advancedSuffixPrefix: '课程默认值 ',
    advancedSuffixTail: '，改前三思。',
} as const;

// ============================================================
// 文本字段：谁住在哪一页，谁该被收进折叠区
// ============================================================

/** 走开关控件的设置项，全部是布尔字段 */
type BooleanSettingKey = 'autoCardInit' | 'autoUpdated' | 'autoFormat' | 'showAppearanceSwitch';

/** 可由文本框直接编辑的设置项，全部是字符串字段 */
type TextSettingKey =
    | 'projectFolder'
    | 'areaFolder'
    | 'archiveFolder'
    | 'inspirationFolder'
    | 'inspirationFileName'
    | 'inspirationHeading'
    | 'diaryFolder'
    | 'contactFolder'
    | 'clientSources'
    | 'clientProducts'
    | 'clientFolder'
    | 'dateTimeFormat';

/** 一个文本框的全部信息。用数据描述而非十二段雷同代码，增删字段只改这张表 */
interface TextFieldSpec {
    readonly key: TextSettingKey;
    /**
     * 它住在哪一页。这个字段回答的其实是「这是谁的设置」——
     * 目录名归属它服务的那个模块，而不是笼统地归属「高级」。
     */
    readonly tab: TabId;
    readonly name: string;
    /** 说明的前半句；高级字段的后半句由默认值自动补出，保证提示与 DEFAULT_SETTINGS 永不失同步 */
    readonly hint: string;
    /**
     * 是否收进本页末尾那个「高级设置（一般不用改）」折叠区。
     *
     * 判据不是「难不难懂」，是「改了会不会让学员的库与课程讲义对不上」：
     * 目录名与时间格式是课程内容的一部分，所以既要留出口，又不能摆在明面上诱导人去动它；
     * 而客户渠道与产品清单本来就是学员自己的业务数据——产品名只能由他自己写，
     * 把它锁进「一般不用改」里才是真的误导。
     */
    readonly advanced: boolean;
}

/** 十二个文本字段。同一页内的先后即它们在页面上的先后 */
const TEXT_FIELDS: readonly TextFieldSpec[] = [
    { key: 'projectFolder', tab: 'projects', name: '项目目录', hint: '正在推进的项目放在这里。', advanced: true },
    { key: 'areaFolder', tab: 'projects', name: '领域目录', hint: '长期关注、没有终点的领域放在这里。', advanced: true },
    { key: 'archiveFolder', tab: 'projects', name: '归档目录', hint: '完成、暂停、放弃的项目会搬到这里；人脉档案搬进来即退出全部名录。', advanced: true },

    { key: 'inspirationFolder', tab: 'inspiration', name: '文件夹', hint: '灵感笔记放在哪个文件夹。相对于笔记库根目录。', advanced: false },
    { key: 'inspirationFileName', tab: 'inspiration', name: '笔记名称', hint: '灵感写入哪一篇笔记；没写 .md 时会自动补齐。', advanced: false },
    { key: 'inspirationHeading', tab: 'inspiration', name: '定位标题', hint: '选择标题插入时，用它定位具体区域。可写“灵感集”或完整 Markdown 标题。', advanced: false },

    { key: 'diaryFolder', tab: 'review', name: '复盘目录', hint: '日/周/月/季/年五级复盘的时间轴根目录，五个子目录由它派生。', advanced: true },

    { key: 'contactFolder', tab: 'contacts', name: '人脉目录', hint: '人物档案平铺存放在这里；视图靠 type 认人，挪走也不影响。', advanced: true },

    { key: 'clientSources', tab: 'clients', name: '客户渠道', hint: '「新建客户」的渠道候选，用逗号分隔。走选择而非手打，统计才不会被同义写法打散。', advanced: false },
    { key: 'clientProducts', tab: 'clients', name: '产品清单', hint: '「增加付费」的产品候选，用逗号分隔。写你自己在卖的东西。', advanced: false },
    { key: 'clientFolder', tab: 'clients', name: '客户目录', hint: '付费用户档案放在这里，运行「初始化客户模块」后才会用到。', advanced: true },

    { key: 'dateTimeFormat', tab: 'setup', name: '时间格式', hint: 'created 与 updated 字段的写法，moment 语法。', advanced: true },
];

// ============================================================
// 注入契约
// ============================================================

/**
 * 设置页干不了、必须由 main 递进来的四件事。
 *
 * 用一个对象而不是四个位置参数：中间两个函数的类型都是 `() => void`，
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
    /** 把作者名片画进「关于」那一页。名片住在 about 模块，设置页因此不认识它 */
    readonly renderAbout: (el: HTMLElement) => void;
}

/** 一页除字段之外的自有控件。三张页确实没有，见 panels 表 */
type PanelRenderer = (containerEl: HTMLElement) => void;

/**
 * 复盘、人脉、客户三页除了目录字段没有别的控件。
 * 写成显式的空实现而不是让它们从 panels 表里缺席，是为了让 Record 的穷尽检查继续成立——
 * 加一张页却忘了写渲染，编译期就过不去，而不是运行时得到一张空白页。
 */
const FIELDS_ONLY: PanelRenderer = () => {};

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
     * 当前停在哪一页。
     *
     * 这是页面状态而非领域状态，因此刻意不进 data.json——设置对象里存的都是
     * 「这个库是什么样」，而不是「上次那个人翻到了第几页」。
     * 它随本条插件实例存活，也就是关掉设置弹窗再打开仍停在原页、重启 Obsidian 归位，
     * 与 Obsidian 自己记住你上次停在哪个插件设置页是同一档待遇。
     */
    private activeTab: SettingsTab = TABS[0];

    /**
     * 「已摆出 N / 21 条」那行字。
     *
     * 这是全页唯一一处持有 DOM 引用的地方，理由很具体：勾选要即时更新这个数，
     * 而重建整页会把滚动条弹回顶部——二十三行排下来，用户勾第十八行时页面一跳，
     * 他就得重新找回刚才那一行。持有的是一个渲染出来的节点，不是第二份状态：
     * 数字仍然现算自设置对象，每次 display 也会把它换成新节点。
     */
    private ribbonCountEl: HTMLElement | null = null;

    /**
     * 每页自己的控件。
     *
     * 用 Record<TabId, …> 而不是可选查表：加一张标签页却忘了写它的渲染，
     * 在这里是一个编译错误，而不是一张点进去空空如也的页。
     */
    private readonly panels: Readonly<Record<TabId, PanelRenderer>> = {
        setup: (el) => this.renderInitButton(el),
        projects: (el) => this.renderProjectsPanel(el),
        inspiration: (el) => this.renderInspirationPanel(el),
        review: FIELDS_ONLY,
        contacts: FIELDS_ONLY,
        clients: FIELDS_ONLY,
        format: (el) => this.renderFormatPanel(el),
        appearance: (el) => this.renderAppearancePanel(el),
        ribbon: (el) => this.renderRibbonPanel(el),
        // 名片画什么由 about 模块决定，这里只递一个容器过去；
        // 首页导航尾部那个「关于作者」视图块画的是同一张，两处不可能对不齐
        about: (el) => this.actions.renderAbout(el),
    };

    constructor(ctx: ZiminosContext, actions: SettingActions) {
        super(ctx.app, ctx.plugin);

        this.ctx = ctx;
        this.actions = actions;
    }

    /** 每次打开设置页都整体重建，保证显示的永远是设置对象的当前值 */
    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        containerEl.addClass('ziminos-settings');

        this.renderTabBar(containerEl);
        this.renderPanel(containerEl.createDiv({ cls: 'ziminos-settings-body' }));
    }

    // ============================================================
    // 一、标签栏与分页骨架
    // ============================================================

    /**
     * 标签栏：十枚按钮收进一条分段式控件里，当前页从容器底色上凸起。
     * 分段式而不是十颗散摆的按钮，是因为它们其实只是十个位置——
     * 一条共享的槽把这层语义画了出来，按钮自己反而要卸干净立体外观。
     * 用真的 button 而非 div，键盘与读屏器才认得它。
     */
    private renderTabBar(containerEl: HTMLElement): void {
        const bar = containerEl.createDiv({ cls: 'ziminos-settings-tabs' });
        const rail = bar.createDiv({ cls: 'ziminos-settings-tabrail' });

        for (const tab of TABS) {
            const active = tab.id === this.activeTab.id;
            const button = rail.createEl('button', {
                cls: 'ziminos-settings-tab',
                // aria-pressed 而不是 role=tab：没实现方向键遍历就自称 tablist 是撒谎，
                // 而「一枚按下去的按钮」既属实，读屏器也照样播报得清楚
                attr: { type: 'button', 'aria-pressed': String(active) },
            });

            // 第二个类名走 DOM，不塞进上面那个 cls：一个带空格的类名字符串是被整体赋给
            // className 还是被 classList.add 逐个吞下，取决于 Obsidian 的实现而非它的类型
            if (active) button.addClass('is-active');

            setIcon(button.createSpan({ cls: 'ziminos-settings-tab-icon' }), tab.icon);
            button.createSpan({ text: tab.label });
            button.addEventListener('click', () => this.switchTo(tab));
        }
    }

    /** 换页。同一页再点一次不重建，否则正在编辑的输入框会被换掉 */
    private switchTo(tab: SettingsTab): void {
        if (tab.id === this.activeTab.id) return;

        this.activeTab = tab;
        this.display();
        // 换页等于换一屏内容，滚动条必须归零：从二十一行的边栏页切到只有一个开关的外观页，
        // 不归零的话用户迎面是一片空白，会以为切坏了。containerEl 就是设置弹窗的滚动容器
        this.containerEl.scrollTop = 0;
    }

    /**
     * 一页的固定骨架：页头 → 明面上的文本字段 → 本页自有控件 → 高级折叠区。
     *
     * 四段的先后是一条跨九页的承诺，两头各占一句：页头永远先说清这一页是谁、跑没跑起来；
     * 折叠区永远在最后，于是任何一页往下翻到底，危险的东西都在同一个位置、同一个标题下，
     * 不需要每页重新找一遍。中间两段的顺序是「先说东西放哪儿，再说怎么用它」——
     * 灵感页把落点三问排在插入位置与格式之前，正是这条顺序，不必自己再画一次字段。
     */
    private renderPanel(body: HTMLElement): void {
        const tab = this.activeTab;

        // 页头图标与标签栏同一枚，只是大一号、着强调色——它是整页唯一的一处强调色锚点
        const header = new Setting(body).setDesc(tab.status).setHeading();
        const title = header.nameEl.createSpan({ cls: 'ziminos-settings-page-title' });

        setIcon(title.createSpan({ cls: 'ziminos-settings-page-icon' }), tab.icon);
        title.createSpan({ text: tab.module });

        this.renderTextFields(body, tab.id, false);
        this.panels[tab.id](body);
        this.renderAdvancedFold(body, tab.id);
    }

    // ============================================================
    // 二、通用控件：开关、文本框、折叠区
    // ============================================================

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

    /** 画出本页某一档（明面/高级）的全部文本字段。没有就一个都不画，也不留空标题 */
    private renderTextFields(containerEl: HTMLElement, tab: TabId, advanced: boolean): void {
        const fields = TEXT_FIELDS.filter(
            (field) => field.tab === tab && field.advanced === advanced,
        );

        for (const field of fields) {
            this.renderTextField(containerEl, field);
        }
    }

    /**
     * 本页的高级折叠区。默认折叠，本页没有高级字段就整块不出现——
     * 一个点开来是空的折叠区，比没有这个折叠区更让人怀疑自己漏了什么。
     */
    private renderAdvancedFold(containerEl: HTMLElement, tab: TabId): void {
        const hasAdvanced = TEXT_FIELDS.some((field) => field.tab === tab && field.advanced);

        if (!hasAdvanced) return;

        const details = containerEl.createEl('details', { cls: 'ziminos-advanced' });

        details.createEl('summary', { text: TEXTS.advancedHeading });
        this.renderTextFields(details, tab, true);
    }

    /**
     * 渲染一个文本框。
     * 这里刻意不做清洗与校验：留空或写错的值由各功能模块在使用时回落到默认值，
     * 校验集中在读取侧，设置页只负责如实记录用户敲进去的字。
     */
    private renderTextField(containerEl: HTMLElement, field: TextFieldSpec): void {
        const fallback: string = DEFAULT_SETTINGS[field.key];
        // 明面上的字段只说它是什么；高级字段还要多说一句默认值，那是「改前三思」的依据
        const desc = field.advanced
            ? `${field.hint}${TEXTS.advancedSuffixPrefix}${fallback}${TEXTS.advancedSuffixTail}`
            : field.hint;

        new Setting(containerEl)
            .setName(field.name)
            .setDesc(desc)
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
    // 三、开荒页：一个按钮
    // ============================================================

    /**
     * 开荒按钮：一句状态说明 + 一个按钮。
     * 按钮点下后先禁用再执行，防止连点开出两次流程；完成后重建整个面板，
     * 状态说明随之从「尚未初始化」翻面成「已就绪」——停留的页不变，重建的是内容。
     */
    private renderInitButton(containerEl: HTMLElement): void {
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
    // 四、项目页：两个自动行为
    // ============================================================

    /** 插件仅有的两个常驻监听都住在 modules/projects，所以它们的开关也该在这一页 */
    private renderProjectsPanel(containerEl: HTMLElement): void {
        this.renderToggle(containerEl, 'autoCardInit', TEXTS.autoCardName, TEXTS.autoCardDesc);
        this.renderToggle(containerEl, 'autoUpdated', TEXTS.autoUpdatedName, TEXTS.autoUpdatedDesc);
    }

    // ============================================================
    // 五、灵感页：落点、位置与格式
    // ============================================================

    /**
     * 灵感页上的每一项都是「记录灵感」命令的下一次运行参数。
     * 落点那三个文本框已由骨架照字段表画在上方，这里只补两个非文本控件。
     */
    private renderInspirationPanel(containerEl: HTMLElement): void {
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

    /** 防御手改 data.json 产生的未知枚举值，设置面板与写入模块保持同一回落策略 */
    private normalizeInspirationPosition(value: string): InspirationInsertPosition {
        const candidate = value as InspirationInsertPosition;

        return INSPIRATION_INSERT_POSITIONS.includes(candidate)
            ? candidate
            : INSPIRATION_DEFAULTS.insertPosition;
    }

    // ============================================================
    // 六、排版页：一个自动开关，加九条规则
    // ============================================================

    /**
     * 排版页：先决定「要不要替我按」，再决定「按下去做哪几件事」。
     *
     * 两者刻意不合成一个开关：自动整理关掉之后，命令仍然照这九条勾选执行——
     * 规则回答的是「标准写法是什么」，自动回答的是「谁来按」，把它们绑在一起，
     * 就没法表达「我自己按，但按下去要全套」这个再正常不过的用法。
     */
    private renderFormatPanel(containerEl: HTMLElement): void {
        this.renderToggle(
            containerEl,
            'autoFormat',
            TEXTS.autoFormatName,
            TEXTS.autoFormatDesc,
        );

        new Setting(containerEl)
            .setName(TEXTS.formatRulesHeading)
            .setDesc(TEXTS.formatRulesIntro)
            .setHeading();

        for (const rule of FORMAT_RULES) {
            this.renderRuleRow(containerEl, rule.key, rule.name, rule.desc);
        }
    }

    /**
     * 一条规则一行。
     *
     * 它与边栏那二十三行是同一种控件——勾选决定一个 id 在不在清单里，而不是翻一个布尔字段。
     * 存清单而不是九个布尔字段，是为了让「加一条规则」不必动设置契约：
     * 老库升级时那条新规则不在清单里，于是默认不开，这与「不替用户改他没选过的东西」同源。
     */
    private renderRuleRow(
        containerEl: HTMLElement,
        key: string,
        name: string,
        desc: string,
    ): void {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addToggle((toggle) => {
                toggle.setValue(this.ctx.settings.formatRules.includes(key)).onChange(async (value) => {
                    this.ctx.settings.formatRules = this.nextFormatRules(key, value);

                    await this.ctx.saveSettings();
                });
            });
    }

    /**
     * 算出勾选之后的新清单。
     *
     * 与 nextRibbonCommands 同法同因：照 FORMAT_RULES 重排一遍而不是往旧数组里增删，
     * 于是顺序永远等于规则表的顺序，data.json 里混进的不认识的 id 也在第一次勾选时被扫掉。
     * 返回新数组，绝不原地改——它在用户没调过时与 DEFAULT_SETTINGS 共用引用。
     */
    private nextFormatRules(key: string, enabled: boolean): readonly string[] {
        const chosen = new Set(this.ctx.settings.formatRules);

        if (enabled) chosen.add(key);
        else chosen.delete(key);

        return FORMAT_RULES.map((rule) => rule.key).filter((candidate) => chosen.has(candidate));
    }

    // ============================================================
    // 七、外观页：一个开关
    // ============================================================

    /** 这一页管的是「右下角要不要常驻这个按钮」，不管片段本身开着还是关着 */
    private renderAppearancePanel(containerEl: HTMLElement): void {
        this.renderToggle(
            containerEl,
            'showAppearanceSwitch',
            TEXTS.appearanceSwitchName,
            TEXTS.appearanceSwitchDesc,
            this.actions.syncAppearanceSwitch,
        );
    }

    // ============================================================
    // 八、边栏页：二十三行
    // ============================================================

    /**
     * 边栏页：一句说明 + 按分组排下来的二十三行。
     *
     * 清单现读花名册而不是自己维护一份，因此它与命令面板里能搜到的命令永远是同一批；
     * 分组标题按「相邻两行的 group 不同」切出来，与外观开关面板用的是同一套画法——
     * 分组顺序不需要另一张表，它就是命令的注册顺序。
     */
    private renderRibbonPanel(containerEl: HTMLElement): void {
        const summary = new Setting(containerEl)
            .setName(this.describeRibbonCount())
            .setDesc(TEXTS.ribbonIntro);

        this.ribbonCountEl = summary.nameEl;

        let currentGroup = '';

        for (const command of this.ctx.commands.list()) {
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
     * 「已摆出 7 / 22 条」。给的是一个量级感：勾多了那条边栏会变成谁也不看的图标柱。
     * 总数现算自花名册，不写死——这一页不认识任何一条具体命令，也就不该认识它们有几条。
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
}
