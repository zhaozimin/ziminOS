/**
 * [INPUT]: 依赖 obsidian 的 Notice/TFile/normalizePath 与 TAbstractFile 类型；
 *          依赖 core/commands 的 PROJECT_COMMANDS、core/folders 的 normalizeFolderPath、
 *          core/frontmatter 的 hasValue 与三个 YAML 判定/重排函数、
 *          core/modals 的 TextInputModal、core/time 的 nowStampAndUid、core/types 的 ZiminosContext，
 *          依赖同目录 moc 的 resolveMocPath
 * [OUTPUT]: 对外提供 initCard（把一篇笔记登记为卡片）、registerCardInitCommand（init-card 命令）、
 *           registerCardAutoInit（新建空笔记时的自动登记）
 * [POS]: projects 模块的卡片登记器，自 initialize-card-note.js 移植。
 *        它是「一张卡片归属于谁」这条规则在全仓库的唯一实现：归属不靠人工维护清单，
 *        而由文件所处的目录层级反推出所属 MOC，再写成 up 双链，所以 MOC 的反链视图天然完整。
 *        写盘只走 processFrontMatter 做字段合并，绝不整篇重写，用户正文与插件不认识的字段永远不丢；
 *        与 updatedMaintainer 的分工是：这里负责卡片的「出生登记」，那里负责其后的「修改留痕」
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Notice, TFile, normalizePath } from 'obsidian';
import type { App, TAbstractFile } from 'obsidian';
import { PROJECT_COMMANDS } from '../../core/commands';
import { normalizeFolderPath } from '../../core/folders';
import {
    hasValue,
    isCardInitialized,
    isMocFrontmatter,
    reorderFrontmatter,
} from '../../core/frontmatter';
import type { CardValues, Frontmatter } from '../../core/frontmatter';
import { TextInputModal } from '../../core/modals';
import { nowStampAndUid } from '../../core/time';
import { resolveMocPath } from './moc';
import { DEFAULT_SETTINGS } from '../../core/types';
import type { ZiminosContext, ZiminosSettings } from '../../core/types';

// ============================================================
// 类型
// ============================================================

/** 卡片可能归属的两类根目录 */
type CardRootKind = 'project' | 'area';

/** 一个被纳入卡片登记范围的根目录 */
interface CardRoot {
    readonly kind: CardRootKind;
    readonly path: string;
}

/** 由文件路径反推出来的归属信息 */
interface CardContext {
    /** 归属根目录的类别 */
    readonly kind: CardRootKind;
    /** 直属的项目名或领域名，即根目录下的第一层文件夹名 */
    readonly containerName: string;
    /** 该项目/领域的 MOC 路径，新老两种命名都可能 */
    readonly mocPath: string;
    /** 写入 up 字段的双链文本，显示名取项目名而非全路径 */
    readonly upLink: string;
}

/** initCard 的行为开关 */
interface InitCardOptions {
    /**
     * 是否允许弹窗向用户索要 description。
     * 命令与自动登记都为 true——「概述只在首次询问」是原脚本的核心体验，
     * 一旦跳过，卡片会被判定为已初始化，此后再也不会追问，导航视图里的概述列将永久为空。
     * 留下 false 是给未来批量/静默场景用的：那种场景下阻塞在弹窗上是错的。
     */
    readonly interactive: boolean;
}

// ============================================================
// 路径归属推断
// ============================================================

/**
 * 由设置构造待扫描的根目录清单。设置项是自由文本，先各自规范化并回落到默认目录，
 * 再用 Map 去重——避免用户把项目与领域设置成同一路径后同一文件被处理两次；
 * 键冲突时后写入的领域覆盖项目，与原脚本一致。
 */
function resolveRoots(settings: ZiminosSettings): CardRoot[] {
    const projectFolder = normalizeFolderPath(
        settings.projectFolder,
        DEFAULT_SETTINGS.projectFolder,
    );
    const areaFolder = normalizeFolderPath(settings.areaFolder, DEFAULT_SETTINGS.areaFolder);

    return Array.from(
        new Map<string, CardRoot>([
            [projectFolder, { kind: 'project', path: projectFolder }],
            [areaFolder, { kind: 'area', path: areaFolder }],
        ]).values(),
    );
}

/**
 * 根据当前文件路径识别它属于哪个项目或领域，并计算对应 MOC 链接。
 * 约定：根目录/容器名/MOC-容器名.md 是 MOC，其余 Markdown 文件是卡片；
 * V3 之前建的容器里那篇 MOC 与文件夹同名，读取侧一并认（见 ./moc）。
 * 返回 null 表示「这篇笔记不归任何 MOC 管」，调用方据此放行不做任何写入。
 */
function getCardContext(
    app: App,
    filePath: string,
    roots: readonly CardRoot[],
): CardContext | null {
    const normalizedFilePath = normalizePath(filePath);

    for (const root of roots) {
        const prefix = `${root.path}/`;

        if (!normalizedFilePath.startsWith(prefix)) continue;

        const relativePath = normalizedFilePath.slice(prefix.length);
        const pathParts = relativePath.split('/').filter(Boolean);

        // 文件必须位于某个具体项目或领域文件夹内。
        if (pathParts.length < 2) return null;

        const containerName = pathParts[0];
        // 认名走 resolveMocPath 而不是就地拼：V3 起新建的 MOC 叫 MOC-文件夹名，
        // 而 V3 之前建的项目仍与文件夹同名，两种都得认得出来，否则老库里的卡片
        // 会挂到一篇不存在的 MOC 上——那条 up 双链是死的，而死链不报错
        const mocPath = resolveMocPath(app, `${root.path}/${containerName}`, containerName);

        // MOC 自身不套用卡片字段。
        if (normalizedFilePath === mocPath) return null;

        return {
            kind: root.kind,
            containerName,
            mocPath,
            upLink: `[[${mocPath.slice(0, -3)}|${containerName}]]`,
        };
    }

    return null;
}

// ============================================================
// 卡片登记主流程
// ============================================================

/**
 * 把一篇笔记登记为卡片：补齐十个标准字段、写入所属 MOC 的 up 双链、按固定顺序重排 YAML。
 * 全程幂等——已完整的卡片与 MOC 本体都会在两道校验中被挡下，不产生任何写盘。
 */
export async function initCard(
    ctx: ZiminosContext,
    file: TFile,
    opts: InitCardOptions,
): Promise<void> {
    const { app, settings, guard } = ctx;

    try {
        // 只处理 Markdown 文件。
        if (file.extension !== 'md') return;

        const context = getCardContext(app, file.path, resolveRoots(settings));

        // 根目录外的笔记、直接位于根目录的笔记以及 MOC 本身均不处理。
        if (!context) return;

        const cachedFrontmatter = app.metadataCache.getFileCache(file)?.frontmatter;

        // 快速路径：完整卡片不重复写盘，MOC 也不进入修改流程。
        if (isMocFrontmatter(cachedFrontmatter) || isCardInitialized(cachedFrontmatter)) {
            return;
        }

        // null 表示「本次没有问过用户」，与「问了但用户交了空串」是两回事。
        let descriptionInput: string | null = null;

        // 只在首次初始化且 description 为空时询问，不在后续保存时重复弹窗。
        if (opts.interactive && !hasValue(cachedFrontmatter?.description)) {
            descriptionInput = await new TextInputModal(app, {
                title: '请输入这篇卡片笔记的内容概述',
            }).openAndGetValue();

            // 用户关闭输入框时不继续初始化，下次运行时仍可重新填写。
            if (descriptionInput === null) return;
        }

        const promptedDescription =
            descriptionInput === null ? null : descriptionInput.trim();

        guard.mark(file.path);

        await app.fileManager.processFrontMatter(file, (frontmatter: Frontmatter) => {
            // 再次在最新 YAML 上校验，避免缓存延迟造成误判。
            if (isMocFrontmatter(frontmatter) || isCardInitialized(frontmatter)) {
                return;
            }

            const hasOwn = (key: string): boolean =>
                Object.prototype.hasOwnProperty.call(frontmatter, key);

            // 与原脚本一致：一个时刻派生两个字段，绝不各取一次时间；
            // 时间格式的空值回落由 core/time 内部负责，此处传原始设置值即可
            const { stamp: createdTime, uid } = nowStampAndUid(settings.dateTimeFormat);

            const cardValues: CardValues = {
                aliases: hasOwn('aliases') ? frontmatter.aliases : null,
                description: hasValue(frontmatter.description)
                    ? frontmatter.description
                    : hasValue(promptedDescription)
                      ? promptedDescription
                      : null,
                created: hasValue(frontmatter.created) ? frontmatter.created : createdTime,
                // updated 完全交给 updatedMaintainer；此处只保留其当前值或建立空字段。
                updated: hasOwn('updated') ? frontmatter.updated : null,
                tags: hasOwn('tags') ? frontmatter.tags : null,
                UID: hasValue(frontmatter.UID) ? frontmatter.UID : uid,
                rating: hasOwn('rating') ? frontmatter.rating : null,
                author: hasOwn('author') ? frontmatter.author : null,
                source: hasOwn('source') ? frontmatter.source : null,
                // up 是列表类型（一张卡片可以同时属于多个 MOC），首次登记也写成单元素列表
                up: hasValue(frontmatter.up) ? frontmatter.up : [context.upLink],
            };

            reorderFrontmatter(frontmatter, cardValues);
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        new Notice(`卡片笔记初始化失败：${message}`);

        // 与原脚本一致继续上抛：Notice 只负责告知用户，调用方仍有权知道这次登记没成。
        throw error;
    }
}

// ============================================================
// 注册：命令与自动登记
// ============================================================

/** 注册手动登记命令，供用户对当前打开的笔记随时补登记 */
export function registerCardInitCommand(ctx: ZiminosContext): void {
    ctx.commands.register(PROJECT_COMMANDS.card, () => {
        const activeFile = ctx.app.workspace.getActiveFile();

        if (!activeFile) return;

        void initCard(ctx, activeFile, { interactive: true }).catch(() => {
            // 失败详情已由 initCard 以 Notice 呈现，此处只吞掉 rejection
        });
    });
}

/**
 * 注册新建笔记时的自动登记。
 * 监听放在 onLayoutReady 内是官方推荐写法：库启动期会为每个既有文件补发 create 事件，
 * 在此之前注册会把整库笔记误当成新建。
 */
export function registerCardAutoInit(ctx: ZiminosContext): void {
    ctx.app.workspace.onLayoutReady(() => {
        ctx.plugin.registerEvent(
            ctx.app.vault.on('create', (file: TAbstractFile): void => {
                // 1. 用户在设置里关掉了自动登记
                if (!ctx.settings.autoCardInit) return;

                // 2. 只认 Markdown 文件，附件与文件夹一律放过
                if (!(file instanceof TFile) || file.extension !== 'md') return;

                // 3. 插件自己刚建的文件（如新项目 MOC）不触发，避免自激
                if (ctx.guard.isRecent(file.path)) return;

                // 4. 必须落在项目/领域目录的管辖范围内（MOC 本体在此天然被排除）
                if (!getCardContext(ctx.app, file.path, resolveRoots(ctx.settings))) return;

                // 5. 必须是空文件：同步工具带着内容落盘的文件不是「新建」，绝不改写用户既有笔记
                if (file.stat.size !== 0) return;

                void initCard(ctx, file, { interactive: true }).catch(() => {
                    // 失败详情已由 initCard 以 Notice 呈现，此处只吞掉 rejection
                });
            }),
        );
    });
}
