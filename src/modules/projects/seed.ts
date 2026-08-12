/**
 * [INPUT]: 依赖 core/constants 的 NAV_FILE/TEMPLATE_FILES、core/modals 的 TextInputModal、
 *          core/types 的 ZiminosContext 与 VaultSeed；依赖 ./templates 的四个生成器、
 *          依赖 ./createProject 的 createProject
 * [OUTPUT]: 对外提供 projectsSeed（本模块对开荒的全部诉求）
 * [POS]: 项目管理模块面向开荒的唯一窗口。开荒模块不认识「项目」这个概念，
 *        它只认 VaultSeed 契约；本文件把「两份手动插入用的模板 + 导航页 + 第一个项目」
 *        翻译成那份契约。分出这个薄文件的理由是依赖方向：
 *        开荒一旦反过来 import 本模块，「模块之间彼此不认识」就破了，
 *        而那条不变式正是「加一个模块只需在 main 多一行」的前提
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { NAV_FILE, TEMPLATE_FILES } from '../../core/constants';
import { TextInputModal } from '../../core/modals';
import type { VaultSeed, ZiminosContext } from '../../core/types';
import { createProject } from './createProject';
import {
    cardTemplateFile,
    firstProjectDescription,
    mocTemplateFile,
    navContent,
} from './templates';

/** 首个项目的命名后缀：名字 + OS_v1，例如「小明OS_v1」 */
const FIRST_PROJECT_SUFFIX = 'OS_v1';

const MESSAGES = {
    namePrompt: '你的名字（用于创建第一个项目，Esc 跳过）',
    namePlaceholder: '例如：小明',
} as const;

/**
 * 项目管理模块的开荒贡献。
 * 不申报任何目录：01-projects 与 90-system/Template 是 PARA 骨架的一部分，
 * 由笔记库本身保证存在，不因某个模块存在而存在。
 */
export function projectsSeed(ctx: ZiminosContext): VaultSeed {
    return {
        folders: [],
        notes: [
            { path: TEMPLATE_FILES.card, content: cardTemplateFile() },
            { path: TEMPLATE_FILES.moc, content: mocTemplateFile() },
            { path: NAV_FILE, content: navContent() },
        ],
        finish: () => createFirstProject(ctx),
    };
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
