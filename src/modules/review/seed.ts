/**
 * [INPUT]: 依赖 core/types 的 ZiminosContext 与 VaultSeed；依赖 ./periodic 的 diaryFolders
 * [OUTPUT]: 对外提供 reviewSeed（复盘模块对开荒的全部诉求）
 * [POS]: 复盘模块面向开荒的窗口。它只申报目录、不申报笔记——
 *        五级复盘笔记全部由命令按需生成，开荒时预建一篇空日记只会在时间轴上
 *        留下一个「那天什么都没发生却有记录」的假点。
 *        第七个根文件夹 05-diary 由这里带来，而不是写死在 PARA 骨架里：
 *        它存在的理由是复盘模块存在，这件事必须在代码里也成立
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { VaultSeed, ZiminosContext } from '../../core/types';
import { diaryFolders } from './periodic';

/** 复盘模块的开荒贡献：时间轴的六个目录 */
export function reviewSeed(ctx: ZiminosContext): VaultSeed {
    return {
        folders: diaryFolders(ctx),
        notes: [],
    };
}
