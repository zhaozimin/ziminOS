/**
 * [INPUT]: 依赖 ./constants 的 SELF_WRITE_WINDOW_MS
 * [OUTPUT]: 对外提供 SelfWriteGuard 类（mark 登记自写、isRecent 查询自写）
 * [POS]: core 的自激循环断路器。插件的自动化行为监听 vault 的 create/modify 事件，
 *        而插件自己的写盘同样会触发这些事件——没有它，updated 维护会写盘、写盘再触发维护，
 *        形成无限循环。所有写路径在动手前 mark，所有事件监听在动手前问 isRecent，
 *        两端配合把「机器的动作」与「人的动作」区分开
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { SELF_WRITE_WINDOW_MS } from './constants';

/**
 * 自写抑制器。
 * 只记录「路径 → 最近一次插件自写的时刻」，不持有任何 Obsidian 对象，
 * 因此可以被所有模块共享而不产生依赖纠缠。
 */
export class SelfWriteGuard {
    /** 路径 → 插件最近一次写入该路径的时间戳（毫秒） */
    private readonly marks = new Map<string, number>();

    /** 插件写入任一文件之前调用，声明「接下来这个路径的变化是我干的」 */
    mark(path: string): void {
        this.marks.set(path, Date.now());
    }

    /**
     * 判断某路径是否仍处于自写窗口内。
     * 遍历时顺手清掉所有过期登记：读多写少的场景下，这比另起定时器清理更简单，
     * 也符合「无定时器、无后台轮询」的红线。
     */
    isRecent(path: string, windowMs: number = SELF_WRITE_WINDOW_MS): boolean {
        const now = Date.now();
        let recent = false;

        for (const [markedPath, markedAt] of this.marks) {
            if (now - markedAt > windowMs) {
                this.marks.delete(markedPath);
                continue;
            }

            if (markedPath === path) recent = true;
        }

        return recent;
    }
}
