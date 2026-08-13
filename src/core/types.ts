/**
 * [INPUT]: 依赖 obsidian 的 App/Plugin 类型，依赖 ./constants 的 PARA、时间与灵感收集默认值，
 *          依赖 ./commands 的 DEFAULT_RIBBON_COMMANDS 与 CommandRegistry 类型，
 *          依赖 ./guard 的 SelfWriteGuard 类型
 * [OUTPUT]: 对外提供 ZiminosSettings 设置契约、DEFAULT_SETTINGS 默认值、ZiminosContext 运行时上下文，
 *           以及开荒贡献契约 VaultSeed/VaultSeedNote
 * [POS]: core 的契约层，定义插件与各功能模块之间唯一的传参形态。
 *        功能模块一律只接收 ZiminosContext，不直接持有 Plugin 实例细节，也不各自读写设置文件——
 *        这样 main.ts 是唯一装配点，模块之间彼此不可见，可以并行开发、独立替换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { App, Plugin } from 'obsidian';
import { DEFAULT_RIBBON_COMMANDS } from './commands';
import type { CommandRegistry } from './commands';
import {
    CLIENT_FOLDER,
    CONTACT_FOLDER,
    DEFAULT_DATETIME_FORMAT,
    FOLDERS,
    INSPIRATION_DEFAULTS,
} from './constants';
import type { InspirationInsertPosition } from './constants';
import type { SelfWriteGuard } from './guard';

/** 插件设置，持久化在 vault/.obsidian/plugins/ziminos/data.json */
export interface ZiminosSettings {
    /** 在项目/领域目录内新建空 md 时，是否自动登记为卡片 */
    autoCardInit: boolean;
    /** 用户改动带 YAML 的笔记时，是否自动维护 updated 字段 */
    autoUpdated: boolean;
    /** 进行中的项目所在根目录 */
    projectFolder: string;
    /** 领域根目录 */
    areaFolder: string;
    /** 暂停、完成、放弃的项目所在归档根目录 */
    archiveFolder: string;
    /** created / updated 字段的时间格式（moment 语法） */
    dateTimeFormat: string;
    /** 灵感笔记所在目录，相对于笔记库根目录 */
    inspirationFolder: string;
    /** 灵感笔记文件名；运行时会自动补齐 .md */
    inspirationFileName: string;
    /** 标题插入模式定位的 Markdown 标题 */
    inspirationHeading: string;
    /** 新灵感在目标标题区或整篇正文中的插入位置 */
    inspirationInsertPosition: InspirationInsertPosition;
    /** 单条灵感模板，支持 content/date/time/datetime 四个占位符 */
    inspirationFormat: string;
    /** 复盘时间轴根目录；五个子目录由它派生，学员改一处即可整体搬家 */
    diaryFolder: string;
    /** 人脉档案根目录 */
    contactFolder: string;
    /** 客户档案根目录 */
    clientFolder: string;
    /** 客户来源渠道候选，逗号分隔。走选择而非手打，否则「B站/b站/哔哩哔哩」会把渠道统计打散 */
    clientSources: string;
    /** 产品候选，逗号分隔。产品名是学员自己的，必须可配，但仍要枚举化 */
    clientProducts: string;
    /**
     * 是否在右下角状态栏摆出外观开关。
     *
     * 插件往用户屏幕上常驻一个图标，就必须给出撤走它的办法——这是「人主导」的最小兑现。
     * 关掉只是收起按钮，命令面板里的「打开外观开关」照常可用。
     */
    showAppearanceSwitch: boolean;
    /**
     * 摆进左侧边栏的命令 id 清单，顺序不由它决定——边栏顺序永远是命令的注册顺序。
     *
     * 类型是 readonly：DEFAULT_SETTINGS 与设置对象在「用户没调过」时共享同一个数组引用，
     * 若允许原地 push/splice，用户第一次勾选就会把默认值本身改掉，
     * 此后连「恢复默认」都恢复不回来。声明成只读，改动就只能是造一个新数组，
     * 这条约束由编译器执行，不靠人记得。
     */
    ribbonCommands: readonly string[];
    /** 首次开荒完成的时间戳；空字符串表示尚未初始化，是「首次」与「补齐」的唯一判据 */
    initializedAt: string;
}

/** 默认设置。目录默认值取自 PARA 骨架常量，保证设置页与开荒结果天然一致 */
export const DEFAULT_SETTINGS: ZiminosSettings = {
    autoCardInit: true,
    autoUpdated: true,
    projectFolder: FOLDERS.projects,
    areaFolder: FOLDERS.areas,
    archiveFolder: FOLDERS.archives,
    dateTimeFormat: DEFAULT_DATETIME_FORMAT,
    inspirationFolder: INSPIRATION_DEFAULTS.folder,
    inspirationFileName: INSPIRATION_DEFAULTS.fileName,
    inspirationHeading: INSPIRATION_DEFAULTS.heading,
    inspirationInsertPosition: INSPIRATION_DEFAULTS.insertPosition,
    inspirationFormat: INSPIRATION_DEFAULTS.format,
    diaryFolder: FOLDERS.diary,
    contactFolder: CONTACT_FOLDER,
    clientFolder: CLIENT_FOLDER,
    clientSources: 'B站,抖音,小红书,公众号,朋友介绍,其他',
    clientProducts: '课程,咨询,陪跑',
    showAppearanceSwitch: true,
    ribbonCommands: DEFAULT_RIBBON_COMMANDS,
    initializedAt: '',
};

/**
 * 一份笔记的开荒诉求：路径 + 正文。
 * 正文是已经求值好的字符串而非工厂函数——模板都是纯函数，求值便宜，
 * 多一层惰性只会让「开荒到底会写出什么」这件事需要跑一遍才知道。
 */
export interface VaultSeedNote {
    readonly path: string;
    readonly content: string;
}

/**
 * 一个功能模块对开荒的全部贡献。
 *
 * 它存在的理由是依赖方向：开荒要建人脉 MOC、要建复盘目录，
 * 但开荒模块一旦 import 人脉模块，「模块之间彼此不认识」这条不变式就破了。
 * 改由每个模块自报诉求、main 装配、开荒只认这个契约——
 * 于是新增一个模块只是在 main 里多传一个 seed，开荒代码一行不改（OCP）。
 */
export interface VaultSeed {
    /** 本模块要求存在的目录，父目录必须排在子目录之前 */
    readonly folders: readonly string[];
    /** 本模块要求存在的笔记；已存在的一律不读不改不覆盖 */
    readonly notes: readonly VaultSeedNote[];
    /**
     * 仅首次开荒执行的收尾动作，例如开出第一个项目。
     * 补齐时不执行——补齐是修复骨架，不是重来一次。
     */
    readonly finish?: () => Promise<void>;
}

/**
 * 运行时上下文：功能模块能力的全部来源。
 * settings 是 main.ts 持有的同一个对象引用，模块改字段后调 saveSettings 落盘；
 * guard 也是全局唯一实例，写方与监听方共用同一份自写记录才有意义。
 */
export interface ZiminosContext {
    app: App;
    /**
     * 供模块调用 addRibbonIcon / addStatusBarItem / registerEvent / register，
     * 生命周期由 Obsidian 托管。唯独 addCommand 不在此列——命令一律经下面的 commands 注册台，
     * 否则它只会出现在命令面板里，左侧边栏与设置页都看不见它。
     */
    plugin: Plugin;
    settings: ZiminosSettings;
    saveSettings: () => Promise<void>;
    guard: SelfWriteGuard;
    /**
     * 命令注册台。模块一律经它注册命令而不直接调 plugin.addCommand——
     * 那样命令才会同时出现在命令面板和左侧边栏的可选清单里，两处不会各说各话。
     */
    commands: CommandRegistry;
}
