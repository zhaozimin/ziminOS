/**
 * [INPUT]: 依赖 obsidian 的 App/Plugin 类型，依赖 ./constants 的 PARA、时间与灵感收集默认值，
 *          依赖 ./guard 的 SelfWriteGuard 类型
 * [OUTPUT]: 对外提供 ZiminosSettings 设置契约、DEFAULT_SETTINGS 默认值、ZiminosContext 运行时上下文
 * [POS]: core 的契约层，定义插件与各功能模块之间唯一的传参形态。
 *        功能模块一律只接收 ZiminosContext，不直接持有 Plugin 实例细节，也不各自读写设置文件——
 *        这样 main.ts 是唯一装配点，模块之间彼此不可见，可以并行开发、独立替换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { App, Plugin } from 'obsidian';
import { DEFAULT_DATETIME_FORMAT, FOLDERS, INSPIRATION_DEFAULTS } from './constants';
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
    initializedAt: '',
};

/**
 * 运行时上下文：功能模块能力的全部来源。
 * settings 是 main.ts 持有的同一个对象引用，模块改字段后调 saveSettings 落盘；
 * guard 也是全局唯一实例，写方与监听方共用同一份自写记录才有意义。
 */
export interface ZiminosContext {
    app: App;
    /** 供模块调用 addCommand / registerEvent / register，生命周期由 Obsidian 托管 */
    plugin: Plugin;
    settings: ZiminosSettings;
    saveSettings: () => Promise<void>;
    guard: SelfWriteGuard;
}
