/**
 * [INPUT]: 依赖 obsidian 的 Notice；依赖 ../../core 的 constants（FOLDERS/INIT_FOLDERS/NAV_FILE/TEMPLATE_FILES）、
 *          folders 的 ensureFolderPath、modals 的 TextInputModal、time 的 nowStamp、types 的 ZiminosContext；
 *          依赖 ./templates 的 cardTemplateFile/mocTemplateFile/navContent/firstProjectDescription；
 *          依赖 ./createProject 的 createProject
 * [OUTPUT]: 对外提供 initializeVault（开荒笔记库）
 * [POS]: projects 模块的开荒入口，由设置页「初始化」按钮与 init-vault 命令唯一触发（人主导，无定时器）。
 *        它是学员与 ziminOS 的第一次接触，因此两条原则压倒一切：
 *        其一，绝不覆盖——所有写入都先查存在性，已有文件一律放过，故可反复执行；
 *        其二，绝不半途报错吓人——首个项目跳过、弹窗取消都不算失败，只有真异常才提示。
 *        本文件只做编排：目录交给 core/folders，正文交给 ./templates，建项目复用 ./createProject，
 *        自己不生成任何文本，也不重复实现建项目逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Notice } from 'obsidian';
import { FOLDERS, INIT_FOLDERS, NAV_FILE, TEMPLATE_FILES } from '../../core/constants';
import { ensureFolderPath } from '../../core/folders';
import { TextInputModal } from '../../core/modals';
import { nowStamp } from '../../core/time';
import type { ZiminosContext } from '../../core/types';
import { createProject } from './createProject';
import {
    cardTemplateFile,
    firstProjectDescription,
    mocTemplateFile,
    navContent,
} from './templates';

// ============================================================
// 开荒常量
// ============================================================

/** 库内导游文件。它随 vault 模板一起分发，空库检查必须放行，否则模板库自己就过不了关 */
const VAULT_README_PATH = 'README.md';

/** 首个项目的命名后缀：名字 + OS_v1，例如「小明OS_v1」 */
const FIRST_PROJECT_SUFFIX = 'OS_v1';

/** 全部用户可见文案集中在此，避免同一句话在多处各写一遍 */
const MESSAGES = {
    notEmpty: '检测到已有笔记，ziminOS 只在空库开荒。请新建一个空库再试。',
    namePrompt: '你的名字（用于创建第一个项目，Esc 跳过）',
    namePlaceholder: '例如：小明',
    done: '开荒完成 ✅',
    failedPrefix: '初始化失败：',
} as const;

// ============================================================
// 开荒主流程
// ============================================================

/**
 * 开荒笔记库：建骨架目录、写模板与导航、开出第一个项目。
 *
 * 首次开荒与后续补齐走同一条流程，差别只有两处：空库检查与首个项目仅首次执行。
 * 这样「初始化」按钮永远可点——学员误删了模板或导航，再点一次就补回来，
 * 而已有笔记一个字都不会动。
 */
export async function initializeVault(ctx: ZiminosContext): Promise<void> {
    try {
        // 是否首次开荒的唯一判据，必须在第 6 步写入时间戳之前取出
        const isFirstRun = ctx.settings.initializedAt === '';

        // ============================================================
        // 1. 空库检查：只在首次开荒时把关
        // ============================================================

        if (isFirstRun && hasUserNotes(ctx)) {
            new Notice(MESSAGES.notEmpty);
            return;
        }

        // ============================================================
        // 2. 建 PARA 骨架目录（ensureFolderPath 天然幂等）
        // ============================================================

        for (const folder of INIT_FOLDERS) {
            await ensureFolderPath(ctx.app, folder);
        }

        // ============================================================
        // 3. 写两份手动插入用的模板
        // ============================================================

        await createFileIfMissing(ctx, TEMPLATE_FILES.card, cardTemplateFile());
        await createFileIfMissing(ctx, TEMPLATE_FILES.moc, mocTemplateFile());

        // ============================================================
        // 4. 写导航页
        // ============================================================

        await createFileIfMissing(ctx, NAV_FILE, navContent());

        // ============================================================
        // 5. 开出第一个项目：仅首次开荒
        // ============================================================

        if (isFirstRun) {
            await createFirstProject(ctx);
        }

        // ============================================================
        // 6. 收尾：记录开荒时间、落盘设置、把学员送到导航页
        // ============================================================

        // 只在首次落笔。字段名与设置页文案都说的是「首次开荒于」，
        // 每次补齐都重写会让面板把补齐当天说成开荒当天，且首次时刻从此无处可寻；
        // 「最近一次补齐」若真有人要，那是另一个字段的事，不能让一个字段说两句话
        if (isFirstRun) {
            ctx.settings.initializedAt = nowStamp(ctx.settings.dateTimeFormat);
        }

        await ctx.saveSettings();

        new Notice(MESSAGES.done);

        await ctx.app.workspace.openLinkText(NAV_FILE, '', false);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        new Notice(MESSAGES.failedPrefix + message);
    }
}

// ============================================================
// 内部步骤
// ============================================================

/**
 * 判断库里是否已经存在用户自己的笔记。
 * 随模板分发的库内导游与 90-system/ 下的系统笔记都不算数——
 * 前者是学员拿到库时就在的，后者是插件自己写的，把它们计入会让开荒第一步就被自己挡住。
 */
function hasUserNotes(ctx: ZiminosContext): boolean {
    const systemPrefix = `${FOLDERS.system}/`;

    return ctx.app.vault
        .getMarkdownFiles()
        .some((file) => file.path !== VAULT_README_PATH && !file.path.startsWith(systemPrefix));
}

/**
 * 只在文件缺失时创建，是开荒可以反复执行的关键：已存在的文件一律不读不改不覆盖。
 * 写盘前先 mark，让卡片自动登记与 updated 维护把这次变化认作插件自己所为，不再回头处理。
 */
async function createFileIfMissing(
    ctx: ZiminosContext,
    path: string,
    content: string,
): Promise<void> {
    if (ctx.app.vault.getAbstractFileByPath(path)) return;

    ctx.guard.mark(path);
    await ctx.app.vault.create(path, content);
}

/**
 * 问一次名字，用它开出第一个项目。
 * 这是学员看见的第一件成品，所以宁可跳过也不打断：Esc 取消或留空都直接放行，
 * 不报错、不阻塞收尾——骨架已经就位，第一个项目随时可以自己建。
 */
async function createFirstProject(ctx: ZiminosContext): Promise<void> {
    const answer = await new TextInputModal(ctx.app, {
        title: MESSAGES.namePrompt,
        placeholder: MESSAGES.namePlaceholder,
    }).openAndGetValue();

    const ownerName = (answer ?? '').trim();

    if (!ownerName) return;

    await createProject(ctx, {
        name: `${ownerName}${FIRST_PROJECT_SUFFIX}`,
        description: firstProjectDescription(),
    });
}
