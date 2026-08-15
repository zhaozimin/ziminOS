/**
 * [INPUT]: 依赖 ./core/commands 的 COMMAND_ICONS（标签页图标与左侧边栏同源）
 * [OUTPUT]: 对外提供设置页的三张数据表——TABS（七张标签页的身份）、TEXTS（全部界面文案）、
 *           TEXT_FIELDS 与 BOOK_TAG_PREFIX_FIELD（文本框），
 *           连同它们的类型 TabId/SettingsTab/BooleanSettingKey/TextSettingKey/TextField/TextFieldSpec
 * [POS]: 设置页的**数据模型**，回答「这一页有什么」；隔壁 settings.ts 回答「它怎么画出来」。
 *        两者分家不是为了凑行数，是因为它们的变更理由不同：
 *        加一个设置项、改一句文案、调一次字段顺序，动的都是这里的表，与渲染无关；
 *        改滚动行为、改标签栏样式、改折叠区画法，动的都是那边的类，与有哪些设置无关。
 *        本文件零渲染代码、零 obsidian 依赖（图标名只是字符串），
 *        因此「这个库到底有哪些设置」这个问题，读一个文件就能答完
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { COMMAND_ICONS } from './core/commands';

// ============================================================
// 七张标签页：一页一个系统模块
// ============================================================

/**
 * 页标识。取值一律与 modules/ 下的目录同名——同名不是巧合而是纪律：
 * 设置页的分页若与代码的模块边界对不上，学员问「客户的设置在哪」时，
 * 答案就会取决于当初谁把它排在了哪一段。
 *
 * 三个模块刻意没有自己的页，判据是同一条——**一个控件撑一整页是把分页做成摆设**：
 * appearance 只有一个开关、about 只有一张名片（v0.9.2 拍板），
 * 而它们本就天然属于「开荒」（外观是开荒交付物的一部分，名片是这套交付物的落款）；
 * books 的设置（标签前缀、标签条数、微信读书的连接）住在「项目」页里，
 * 理由不是它小，是**一本书就是一个项目**——书落在项目目录、走项目的四态流转归档，
 * 给它单开一页等于在界面上否认代码里那条已经成立的事实。
 *
 * clients 也不再单列（v0.14.0）。它曾经单列，理由与 COMMAND_GROUPS 里单列成组的
 * 是同一条：客户与人脉在业务上是两个物种。那条理由对**命令**仍然成立——
 * 建一个人脉和建一个客户是两件事，分组色也不同；但对**设置**不成立：
 * 两页加起来只有四个字段，其中两个还是同一种东西（人脉目录 / 客户目录）。
 * 分页的意义是「一页看完就不必再往下翻」，而不是「每个物种都得有张页」；
 * 一张只有一个目录框的页，翻到它的人只会以为自己漏了什么。
 * 页内仍按「人脉」「客户」切成两段——分的是段落，不是页。
 */
export type TabId =
    | 'setup'
    | 'projects'
    | 'inspiration'
    | 'review'
    | 'contacts'
    | 'format'
    | 'ribbon';

/** 一张标签页的全部身份：标签栏上的那枚按钮，与它翻开之后的那句页头 */
export interface SettingsTab {
    readonly id: TabId;
    /** 标签上的短名。七张一律两个字——长短不齐的标签会让人以为它们不是一类东西 */
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
 * 七张页，顺序即学员的使用顺序，也正好是 main.ts 的装配顺序与命令的注册顺序：
 * 先开荒，再是每天在用的三套（项目、灵感、复盘），然后是关系与生意（人脉与客户合成一页），
 * 最后两张管的不是笔记而是屏幕上的呈现（排版、边栏）。
 *
 * 外观开关与作者名片住在「开荒」页里而不各占一页：一个控件撑一整页是把分页做成摆设，
 * 且它们本就是开荒交付物的一部分与落款（见 TabId 的注释）。
 *
 * 这张表同时喂两处：标签栏上那枚两个字的按钮，与每页页头那句「这一页是谁、跑没跑起来」。
 * 一处事实两处呈现，因此不存在「标签上写着排版、页头却是另一句」这种事。
 *
 * 曾经还有第三处——开荒页上一份逐行列出全部模块的清单。它被摘掉了，
 * 理由是标签栏本身就是那份清单：七张页一直摆在屏幕最上方，点一下即到，
 * 再在首页把同样七行重列一遍，是把「索引」误当成了「介绍」。
 * status 那句话没有跟着一起消失，它搬进了各页页头——在那儿它回答的是「我现在在哪、这页管什么」，
 * 而不是「这套系统都有些什么」。
 */
export const TABS: readonly SettingsTab[] = [
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
        status: '运行中 · 建项目、卡片登记、四态流转；读书笔记也住在这里（一本书就是一个项目）',
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
        module: '人脉与客户 v1',
        status:
            '运行中 · 新建人脉、记人情，档案与 MOC 共八个视图；' +
            '客户按需启用，运行「初始化客户模块」后长出 MOC 与另外八个视图',
    },
    {
        id: 'format',
        label: '排版',
        icon: COMMAND_ICONS.format,
        module: '排版 v1',
        status: '运行中 · 九条标准 Markdown 写法，改完走开就替你整理',
    },
    {
        id: 'ribbon',
        label: '边栏',
        icon: COMMAND_ICONS.dock,
        module: '左侧边栏 v1',
        status: '运行中 · 二十九条命令配 Pikaicons 图标，默认摆出七条',
    },
];

// ============================================================
// 界面文案（全中文，集中在此，避免同一句话散落在多处）
// ============================================================

export const TEXTS = {
    initName: '初始化笔记库',
    initButton: '初始化',
    initPending: '尚未初始化。点右边的按钮，为这个库铺好七个文件夹、模板与导航，并长出人脉与复盘两套系统。',
    initReadyPrefix: '已就绪 ✓ 首次开荒于 ',
    initReadySuffix: '。再点一次只补齐缺失的文件，不会覆盖你写过的任何笔记。',

    autoCardName: '新建笔记自动登记为卡片',
    autoCardDesc: '在项目或领域目录里新建空笔记时，自动补齐标准字段，并链回它所属的 MOC。关掉后可用命令「初始化当前卡片」手动登记。',
    autoUpdatedName: '自动维护 updated 时间',
    autoUpdatedDesc: '改完带 YAML 的笔记、停手两秒后，自动记下这次修改时间。没有 YAML 的笔记一个字都不动。',

    booksHeading: '读书笔记',
    booksIntro:
        '一本书就是一个项目：它落在项目目录里，读完用「完成项目」归档，所以它的设置也住在这一页。' +
        '书目字段（作者、出版社、ISBN、评分）没有开关——豆瓣怎么写就怎么落，那是事实不是口味。' +
        'UID 直接写这本书的 ISBN；豆瓣没登记书号时才退回时间戳。',
    bookTagCountName: '标签条数',
    bookTagCountDesc:
        '豆瓣的分类按投票数从高到低排，取前几个。往后很快滑向个人化的碎语，所以这个数问的不是「够不够」，是「从哪儿开始变成噪音」。',

    wereadName: '微信读书',
    wereadConnected:
        '已连接。「读一本书」与「同步这本书的划线」会自动把你在微读上的划线与想法取回来。' +
        '断开只清掉本机存的这份登录凭据，不动你在微信读书那边的任何东西。',
    wereadDisconnected:
        '未连接。连上之后，读书命令会多一处划线来源（另两处是本机的苹果图书与 Kindle，不需要连接）。' +
        '连接走扫码，插件全程不碰你的账号和密码。',
    wereadMobile: '扫码登录只在电脑版可用。手机上仍可用「导入读书划线」把划线粘贴进来。',

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
export type BooleanSettingKey = 'autoCardInit' | 'autoUpdated' | 'autoFormat' | 'showAppearanceSwitch';

/** 可由文本框直接编辑的设置项，全部是字符串字段 */
export type TextSettingKey =
    | 'projectFolder'
    | 'areaFolder'
    | 'archiveFolder'
    | 'bookTagPrefix'
    | 'inspirationFolder'
    | 'inspirationFileName'
    | 'inspirationHeading'
    | 'diaryFolder'
    | 'contactFolder'
    | 'clientSources'
    | 'clientProducts'
    | 'clientFolder'
    | 'dateTimeFormat';

/**
 * 画一个文本框需要知道的全部。
 *
 * 它比下面那张表少两个字段，为的是让**面板也能画文本框**：
 * 读书笔记那几项必须与它的下拉框、连接按钮排在一起，而骨架画的字段一律排在面板之前，
 * 交给骨架就会被拆到两段里去。分成两层之后，进表的带去处、面板自持的不带，没有闲置字段。
 */
export interface TextField {
    readonly key: TextSettingKey;
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

/** 一个进了下面那张表的文本框：它还得说清自己住在哪一页、哪一段 */
export interface TextFieldSpec extends TextField {
    /**
     * 它住在哪一页。这个字段回答的其实是「这是谁的设置」——
     * 目录名归属它服务的那个模块，而不是笼统地归属「高级」。
     */
    readonly tab: TabId;
    /**
     * 页内小标题。一页只服务一个系统时不需要它（绝大多数如此）；
     * 人脉页同时装着人脉与客户两套，段名就是那句「以下是谁的设置」。
     * 相邻两行的段名一变就切一道标题——与边栏页按分组切标题是同一套画法，
     * 段的顺序因此不需要另一张表，它已经写在这张表的行序里了。
     */
    readonly section?: string;
}

/** 十一个进表的文本字段。同一页内的先后即它们在页面上的先后 */
export const TEXT_FIELDS: readonly TextFieldSpec[] = [
    { key: 'projectFolder', tab: 'projects', name: '项目目录', hint: '正在推进的项目放在这里；读书笔记也落在这里。', advanced: true },
    { key: 'areaFolder', tab: 'projects', name: '领域目录', hint: '长期关注、没有终点的领域放在这里。', advanced: true },
    { key: 'archiveFolder', tab: 'projects', name: '归档目录', hint: '完成、暂停、放弃的项目会搬到这里；人脉档案搬进来即退出全部名录。', advanced: true },

    { key: 'inspirationFolder', tab: 'inspiration', name: '文件夹', hint: '灵感笔记放在哪个文件夹。相对于笔记库根目录。', advanced: false },
    { key: 'inspirationFileName', tab: 'inspiration', name: '笔记名称', hint: '灵感写入哪一篇笔记；没写 .md 时会自动补齐。', advanced: false },
    { key: 'inspirationHeading', tab: 'inspiration', name: '定位标题', hint: '选择标题插入时，用它定位具体区域。可写“灵感集”或完整 Markdown 标题。', advanced: false },

    { key: 'diaryFolder', tab: 'review', name: '复盘目录', hint: '日/周/月/季/年五级复盘的时间轴根目录，五个子目录由它派生。', advanced: true },

    { key: 'clientSources', tab: 'contacts', section: '客户', name: '客户渠道', hint: '「新建客户」的渠道候选，用逗号分隔。走选择而非手打，统计才不会被同义写法打散。', advanced: false },
    { key: 'clientProducts', tab: 'contacts', section: '客户', name: '产品清单', hint: '「增加付费」的产品候选，用逗号分隔。写你自己在卖的东西。', advanced: false },
    { key: 'contactFolder', tab: 'contacts', section: '人脉', name: '人脉目录', hint: '人物档案平铺存放在这里；视图靠 type 认人，挪走也不影响。', advanced: true },
    { key: 'clientFolder', tab: 'contacts', section: '客户', name: '客户目录', hint: '付费用户档案放在这里，运行「初始化客户模块」后才会用到。', advanced: true },

    { key: 'dateTimeFormat', tab: 'setup', name: '时间格式', hint: 'created 与 updated 字段的写法，moment 语法。', advanced: true },
];

/**
 * 书籍标签的前缀。它不进上面那张表，因为它必须紧挨着「标签条数」那个下拉框——
 * 一个说前缀叫什么、一个说取几条，拆开之后两句话谁也说不完整。
 */
export const BOOK_TAG_PREFIX_FIELD: TextField = {
    key: 'bookTagPrefix',
    name: '标签前缀',
    hint: '豆瓣的「方法论」会写成 #书籍/方法论。前缀让整个书架的分类成片，不与灵感、卡片里的同名标签混在一起。',
    advanced: false,
};
