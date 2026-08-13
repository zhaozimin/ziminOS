/**
 * [INPUT]: 依赖 obsidian 的 TFile 类型；依赖 core/commands 的 PROJECT_COMMANDS、
 *          core/types 的 ZiminosContext；依赖同目录 createContainer 的 createContainer/AREA_KIND
 * [OUTPUT]: 对外提供 createArea 与 registerCreateAreaCommand
 * [POS]: 领域这一类容器的入口，与 createProject 并列。两者共用 createContainer 那条流程，
 *        差别只有 AREA_KIND 那三行：落在领域目录、type 写 area、不问归属。
 *        它比 createProject 更薄，薄得理直气壮——领域没有委托人，
 *        因此既不需要选人那个注入洞，也没有开荒预设（首个领域不由开荒生成，
 *        人脉那个领域是 contacts 模块自己的 seed 带来的）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { TFile } from 'obsidian';
import { PROJECT_COMMANDS } from '../../core/commands';
import type { ZiminosContext } from '../../core/types';
import { AREA_KIND, createContainer } from './createContainer';

/**
 * 新建一个领域：建领域文件夹、写 MOC、打开并把光标停在正文起点。
 * 两问即成——名称、概述。返回新建的 MOC 文件；取消或出错时返回 null。
 */
export async function createArea(ctx: ZiminosContext): Promise<TFile | null> {
    return createContainer(ctx, AREA_KIND);
}

/** 注册「新建领域」命令。失败提示由 createContainer 内部统一给出 */
export function registerCreateAreaCommand(ctx: ZiminosContext): void {
    ctx.commands.register(PROJECT_COMMANDS.area, () => {
        void createArea(ctx);
    });
}
