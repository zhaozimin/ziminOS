/**
 * [INPUT]: 依赖 obsidian 的 TFile 类型；依赖 core/commands 的 PROJECT_COMMANDS、
 *          core/types 的 ZiminosContext；依赖同目录 createContainer 的
 *          createContainer/PROJECT_KIND 与两个契约类型
 * [OUTPUT]: 对外提供 CreateProjectPreset 预设契约、PersonPicker 选人能力契约（转出）、
 *           createProject、registerCreateProjectCommand
 * [POS]: 项目这一类容器的入口，命令 create-project。真正的流程住在 createContainer——项目与领域共用它，
 *        本文件只负责「项目」这一份规格与那条命令。
 *        它保留独立文件而不是并进去，是因为它有两个 createArea 没有的东西：
 *        开荒要用的 preset（首个项目免问答），以及选人能力那个注入洞
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { TFile } from 'obsidian';
import { PROJECT_COMMANDS } from '../../core/commands';
import type { ZiminosContext } from '../../core/types';
import { PROJECT_KIND, createContainer } from './createContainer';
import type { CreateContainerPreset, PersonPicker } from './createContainer';

export type { PersonPicker } from './createContainer';

/** 开荒的首个项目免问答，把答案直接递进来。字段与流程契约同源，故直接复用 */
export type CreateProjectPreset = CreateContainerPreset;

/**
 * 新建一个项目：建项目文件夹、写 MOC、打开并把光标停在正文起点。
 * 返回新建的 MOC 文件；用户取消、名称非法、同名 MOC 已存在或过程出错时返回 null。
 */
export async function createProject(
    ctx: ZiminosContext,
    preset?: CreateProjectPreset,
    pickPerson?: PersonPicker,
): Promise<TFile | null> {
    return createContainer(ctx, PROJECT_KIND, preset, pickPerson);
}

/** 注册「新建项目」命令。命令本身不做错误处理，失败提示由 createContainer 内部统一给出 */
export function registerCreateProjectCommand(ctx: ZiminosContext, pickPerson: PersonPicker): void {
    ctx.commands.register(PROJECT_COMMANDS.create, () => {
        void createProject(ctx, undefined, pickPerson);
    });
}
