/**
 * [INPUT]: 依赖 ../../core/constants 的 CARD_FIELDS（卡片十字段的权威顺序）与
 *          ABOUT_VIEW/VIEW_BLOCK_LANG（导航页尾的「关于作者」视图块照它们拼写）。
 *          MOC 的文件名由调用方经 ./moc 算好递进来，本文件不认识命名约定
 * [OUTPUT]: 对外提供 MocContentOptions 类型与七个纯生成函数：mocFrontmatter、mocBaseBlock、mocContent、
 *           cardTemplateFile、mocTemplateFile、navContent、firstProjectDescription
 * [POS]: projects 模块的文本工厂，是「笔记长成什么样」的唯一出处。
 *        全部函数无副作用、只吐字符串，既不碰 App 也不碰文件系统——因此建项目与开荒共用同一套骨架，
 *        库里所有 MOC 的 YAML 与 base 视图才可能长期同构；日后改版式只需动这一个文件。
 *        MOC 的 frontmatter 与 base 块自 create-project-moc.js 逐字移植，仅把项目名与路径参数化，
 *        任何"顺手优化"都会让存量笔记与新笔记分叉，禁止
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { ABOUT_VIEW, CARD_FIELDS, VIEW_BLOCK_LANG } from '../../core/constants';

// ============================================================
// 模板骨架的字段与视图定义
// ============================================================

/**
 * MOC 模板文件的八个字段。
 * 与卡片十字段不同，MOC 用 type/status 描述自己的身份与生命周期，没有 rating/author/source/up，
 * 因此不复用 CARD_FIELDS；此处是「手动插入的空模板」专用，与运行时生成的 mocFrontmatter 各司其职。
 */
const MOC_FIELDS: readonly string[] = [
    'aliases',
    'description',
    'created',
    'updated',
    'tags',
    'UID',
    'type',
    'status',
];

/** 导航页开头的一行说明。面向零基础学员，不出现术语 */
const NAV_INTRO = '这里是你的家。下面四张表会自动列出库里所有项目、领域和书籍，新建之后自动出现，不用手动维护。';

/**
 * 导航页的四个表格视图：显示名 + 筛选表达式。
 * 只用等值判断（== 加字面量），不用未经验证的函数式筛选——导航页是学员每天打开的第一个页面，
 * 语法一旦被 Bases 拒绝整页都会空白，稳比巧重要。
 */
const NAV_VIEWS: readonly { readonly name: string; readonly filter: string }[] = [
    { name: '正在进行中', filter: 'status == "active"' },
    { name: '项目', filter: 'type == "project"' },
    { name: '领域', filter: 'type == "area"' },
    { name: '书籍', filter: 'type == "book"' },
];

// ============================================================
// MOC 正文生成（自 create-project-moc.js 逐字移植）
// ============================================================

/** 一篇 MOC 的 YAML 全部可变量。用具名对象传递以杜绝顺序错位 */
export interface MocFrontmatterOptions {
    /** 概述，写入 description */
    readonly description: string;
    /** 创建时间戳，格式由调用方按设置决定 */
    readonly created: string;
    /** 14 位本地时间 UID，数字类型，落盘不带引号 */
    readonly uid: number;
    /** 身份：NOTE_TYPES.project 或 NOTE_TYPES.area。它决定导航页把这篇笔记摆进哪张表 */
    readonly type: string;
    /**
     * 生命周期状态。项目写 active，领域**不写**——
     * 领域是没有终点的长期关注，给它一个「进行中」等于承诺它某天会结束，
     * 而导航页那张「正在进行中」正是按 status 筛的，写了它就会混进去。
     */
    readonly status?: string;
    /** 与某个人的关系；自己独做的项目不带这一项，空键是登记表不是索引 */
    readonly relation?: ProjectRelation;
}

/** MOC 正文的全部可变量：YAML 那一份，加上 base 视图要用的两个名字 */
export interface MocContentOptions extends MocFrontmatterOptions {
    /**
     * MOC 自己的文件名（不含扩展名），由调用方经 ./moc 的 mocBasenameOf 算好递进来。
     * base 视图的 `up == link(…)` 用的是它——卡片的 up 指向这篇笔记，不是文件夹。
     */
    readonly mocBasename: string;
    /** 项目或领域的文件夹路径，base 视图据此收集同目录文件 */
    readonly projectFolderPath: string;
}

/**
 * 项目与人的关联：写哪个键、指向谁。
 *
 * 两个键分家的理由不是分类癖：client 是商业契约标记，写下它等于把那个人注册成客户，
 * 客户名录直接用它反推身份。所以「周六和张三去旅游」这类私人项目必须走 with，
 * 否则朋友会被无声注册成客户、项目会挂进「我还欠谁的交付」、结案后污染案例库的选题统计。
 */
export interface ProjectRelation {
    /** FIELDS.client 或 FIELDS.with */
    readonly field: string;
    /** 目标笔记名，落盘写成整值 wikilink */
    readonly target: string;
}

/**
 * 把文本转换为 YAML 兼容的双引号字符串。
 * 自脚本一 toYamlString 原样移植：借 JSON.stringify 完成转义，中文与冒号都能安全落盘。
 */
function toYamlString(value: string): string {
    return JSON.stringify(String(value));
}

/**
 * 生成 MOC 的 YAML frontmatter（固定十行）。
 * aliases/updated/tags 刻意留空：前者由用户自取，updated 交给自动维护，tags 属于个人分类习惯。
 */
export function mocFrontmatter(options: MocFrontmatterOptions): string {
    const { description, created, uid, type, status, relation } = options;

    return [
        '---',
        'aliases:',
        `description: ${toYamlString(description)}`,
        `created: ${created}`,
        'updated:',
        'tags:',
        `UID: ${uid}`,
        `type: ${type}`,
        // 领域没有状态，那一行整行不写；空的 status 键会让它出现在「正在进行中」那张表里
        ...(status ? [`status: ${status}`] : []),
        // 只在有值时才写这一行：空的 client 键会让这个项目被当成一笔没有客户的委托
        ...(relation ? [`${relation.field}: "[[${relation.target}]]"`] : []),
        '---',
    ].join('\n');
}

/**
 * 生成 MOC 正文的 base 代码块——项目的文件清单视图。
 * 两条 or 筛选是这个设计的核心：既收 up 指向本 MOC 的卡片（可以散落库内任何角落），
 * 也收项目文件夹里的所有文件（附件、草稿、来不及登记的笔记），
 * 因此"整理"这件事对学员是可选的，而不是前提。
 */
export function mocBaseBlock(mocBasename: string, projectFolderPath: string): string {
    return [
        '```base',
        'filters:',
        '  and:',
        '    - file.path != this.file.path',
        'properties:',
        '  note.description:',
        '    displayName: 概述',
        '  note.rating:',
        '    displayName: 评分',
        'views:',
        '  - type: table',
        '    name: 项目文件',
        '    filters:',
        '      or:',
        // 这一行必须是 MOC 自己的文件名，不是文件夹名：卡片的 up 指向的是这篇笔记。
        // 两者一旦分叉，这张表会静默少收一半文件——它不报错，只是变短
        `        - up == link(${JSON.stringify(mocBasename)})`,
        `        - file.folder == ${JSON.stringify(projectFolderPath)}`,
        '    order:',
        '      - file.name',
        '      - description',
        '      - rating',
        '    sort:',
        '      - property: rating',
        '        direction: DESC',
        '    columnSize:',
        '      file.name: 170',
        '      note.description: 421',
        '',
        '```',
    ].join('\n');
}

/**
 * 拼出一篇完整 MOC 的正文。
 * 四个换行符使 YAML 与正文之间保留三个完整空行——这三行是留给用户写字的地方，
 * 建项目后光标正落在其中，脚本一的这条约定被完整保留。
 */
export function mocContent(options: MocContentOptions): string {
    const frontmatter = mocFrontmatter(options);
    const baseBlock = mocBaseBlock(options.mocBasename, options.projectFolderPath);

    return `${frontmatter}\n\n\n\n${baseBlock}\n`;
}

// ============================================================
// 供「模板」核心插件手动插入的空模板
// ============================================================

/**
 * 按给定字段序生成全空值的 YAML 骨架。
 * 空模板的意义是"字段齐、值空"：用户手动插入后照着填，插件后续再补齐也不会打乱顺序。
 */
function emptyFrontmatter(fields: readonly string[]): string {
    return ['---', ...fields.map((field) => `${field}:`), '---', ''].join('\n');
}

/** 卡片笔记模板：十字段严格按 CARD_FIELDS 序，与自动登记后的排列完全一致 */
export function cardTemplateFile(): string {
    return emptyFrontmatter(CARD_FIELDS);
}

/** MOC 模板：八字段，供手动新建书籍等非项目非领域型 MOC 使用（项目与领域各有命令） */
export function mocTemplateFile(): string {
    return emptyFrontmatter(MOC_FIELDS);
}

// ============================================================
// 导航页
// ============================================================

/**
 * 生成 90-system/导航.md 的全文：一行说明 + 一个 base 块 + 页尾的「关于作者」视图块。
 * 导航页自身不写 frontmatter，因此不会被任何一个视图筛中，也不会被 updated 维护碰到——
 * 它是库的地图，不是库的一份笔记。
 * 页尾那个块只有一行视图名，画什么由 main.js 里的 about 模块决定：
 * 名片内容随插件升级而更新，不随这篇建库时写下的笔记冻结。
 */
export function navContent(): string {
    const lines: string[] = [
        NAV_INTRO,
        '',
        '```base',
        'properties:',
        '  note.description:',
        '    displayName: 概述',
        '  note.status:',
        '    displayName: 状态',
        'views:',
    ];

    for (const view of NAV_VIEWS) {
        lines.push(
            '  - type: table',
            `    name: ${view.name}`,
            '    filters:',
            '      and:',
            `        - ${view.filter}`,
            '    order:',
            '      - file.name',
            '      - description',
            '      - status',
        );
    }

    lines.push('', '```', '', '---', '', '```' + VIEW_BLOCK_LANG, ABOUT_VIEW, '```', '');

    return lines.join('\n');
}

// ============================================================
// 首个项目
// ============================================================

/**
 * 开荒时自动创建的第一个项目的概述。
 * 学员的第一个项目就是"搭建这套系统"本身——用产品讲清产品，比任何说明书都直接。
 */
export function firstProjectDescription(): string {
    return '搭建属于我的个人知识管理系统';
}
