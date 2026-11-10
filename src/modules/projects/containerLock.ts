/**
 * [INPUT]: 接收宿主容器对象，零依赖。
 * [OUTPUT]: 提供 pendingContainerChanges 互斥集合。
 * [POS]: 改名、类型转换与归档共享对象锁；目录移动后锁仍指向同一容器。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export const pendingContainerChanges = new WeakSet<object>();
