/**
 * [INPUT]: 无。本文件不 import 任何模块，是 core 层依赖图的最底层叶子
 * [OUTPUT]: 对外提供 PARA 目录常量 FOLDERS/INIT_FOLDERS、笔记路径常量 NAV_FILE/TEMPLATE_FILES、
 *           卡片字段序 CARD_FIELDS 与其字段类型 CardField、时间格式 DEFAULT_DATETIME_FORMAT/UID_FORMAT、
 *           自写抑制窗口 SELF_WRITE_WINDOW_MS，以及项目生命周期状态机 TRANSITIONS/STATUS_LABELS
 *           及其类型 ProjectStatus/TransitionAction/FolderRole/ProjectTransition
 * [POS]: 全仓库唯一的常量源。规格要求「禁魔法字符串」，任何目录名、字段名、状态名、时间格式
 *        都必须从这里取而不得就地硬编码；因为它零依赖，所有模块都可单向依赖它而不产生环
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================
// PARA 目录骨架
// ============================================================

/** 笔记库的六个根文件夹与模板目录，值是相对于库根的路径 */
export const FOLDERS = {
    inbox: '00-inbox',
    projects: '01-projects',
    areas: '02-areas',
    resources: '03-resources',
    archives: '04-archives',
    system: '90-system',
    template: '90-system/Template',
} as const;

/** 开荒时按序创建的目录：先六个根目录，再模板子目录（父目录先于子目录） */
export const INIT_FOLDERS: readonly string[] = [
    FOLDERS.inbox,
    FOLDERS.projects,
    FOLDERS.areas,
    FOLDERS.resources,
    FOLDERS.archives,
    FOLDERS.system,
    FOLDERS.template,
];

// ============================================================
// 系统笔记路径
// ============================================================

/** 导航笔记：库的总入口，开荒时生成 */
export const NAV_FILE = `${FOLDERS.system}/导航.md`;

/** 供「模板」核心插件手动插入的两份模板文件 */
export const TEMPLATE_FILES = {
    moc: `${FOLDERS.template}/MOC 模板.md`,
    card: `${FOLDERS.template}/卡片笔记模板.md`,
} as const;

// ============================================================
// 卡片 YAML 字段
// ============================================================

/**
 * 卡片笔记的十个标准字段，数组顺序即 YAML 中的呈现顺序。
 * 重排 frontmatter 与生成卡片模板都以此为准，两处共用同一份定义。
 */
export const CARD_FIELDS = [
    'aliases',
    'description',
    'created',
    'updated',
    'tags',
    'UID',
    'rating',
    'author',
    'source',
    'up',
] as const;

/** 卡片标准字段名的联合类型，由 CARD_FIELDS 推导，增删字段无需同步维护类型 */
export type CardField = (typeof CARD_FIELDS)[number];

// ============================================================
// 时间格式
// ============================================================

/** created / updated 字段的默认时间格式（moment 语法） */
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** UID 字段的 17 位本地时间格式（moment 语法） */
export const UID_FORMAT = 'YYYYMMDDHHmmssSSS';

// ============================================================
// 自写抑制
// ============================================================

/**
 * 自写抑制窗口（毫秒）。插件写盘后的这段时间内，
 * 由该次写入引发的 vault 事件视为插件自己造成，不再触发自动化，避免自激循环。
 */
export const SELF_WRITE_WINDOW_MS = 3000;

// ============================================================
// 项目生命周期状态机（自 move-project.js 移植）
// ============================================================

/** 项目 MOC 的 status 四态 */
export type ProjectStatus = 'active' | 'paused' | 'done' | 'dropped';

/** 四条流转命令对应的动作名 */
export type TransitionAction = 'done' | 'dropped' | 'paused' | 'active';

/** 目录角色：项目目录（进行中）或归档目录 */
export type FolderRole = 'active' | 'archive';

/** 一次状态流转的完整描述：从哪个目录搬到哪个目录、写入什么状态、允许从哪些状态出发 */
export interface ProjectTransition {
    /** 中文动作名，用于确认框与 Notice 文案 */
    readonly label: string;
    /** 源目录角色 */
    readonly source: FolderRole;
    /** 目标目录角色 */
    readonly target: FolderRole;
    /** 流转后写入 MOC 的 status */
    readonly status: ProjectStatus;
    /** 允许执行本次流转的当前状态；用 string[] 是为了直接与 YAML 里的任意文本比较 */
    readonly allowedStatuses: readonly string[];
}

/**
 * 四条流转规则。done/dropped/paused 都是「项目目录 → 归档目录」，
 * 只有 active 是反向的「归档目录 → 项目目录」，因此重新开始只允许从三个终态出发。
 */
export const TRANSITIONS: Readonly<Record<TransitionAction, ProjectTransition>> = {
    done: {
        label: '完成',
        source: 'active',
        target: 'archive',
        status: 'done',
        allowedStatuses: ['active'],
    },
    dropped: {
        label: '放弃',
        source: 'active',
        target: 'archive',
        status: 'dropped',
        allowedStatuses: ['active'],
    },
    paused: {
        label: '暂停',
        source: 'active',
        target: 'archive',
        status: 'paused',
        allowedStatuses: ['active'],
    },
    active: {
        label: '重新开始',
        source: 'archive',
        target: 'active',
        status: 'active',
        allowedStatuses: ['done', 'dropped', 'paused'],
    },
};

/**
 * 状态的中文显示名。索引签名用 string 而非 ProjectStatus，
 * 因为查询来源是用户 YAML 里的任意文本，未知状态需要能安全地兜底。
 */
export const STATUS_LABELS: Readonly<Record<string, string>> = {
    active: '进行中',
    paused: '已暂停',
    done: '已完成',
    dropped: '已放弃',
};
