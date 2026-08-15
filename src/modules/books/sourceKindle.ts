/**
 * [INPUT]: 依赖 obsidian 的 Platform；依赖 Node 的 fs/os/path；
 *          依赖同目录 parsers 的 parseHighlightExport（My Clippings 的解析规则只存在一份）
 * [OUTPUT]: 对外提供 kindleClippingsPath（自动找到那个文件）、kindleAvailable、
 *           listKindleBooks、readKindleBookHighlights
 * [POS]: 划线来源之一：Kindle。它与苹果图书同属「本机数据」那一类——
 *        My Clippings.txt 就在插着的设备里，读它不需要网络也不需要 Amazon 登录。
 *        本文件只做一件 parsers 不做的事：**把那个文件找出来**。
 *        学员的认知里没有「My Clippings.txt 在哪」这一条，让他去找等于把一步变成三步；
 *        而它的位置其实是确定的——Kindle 插上电脑就是一个卷宗，
 *        `documents/My Clippings.txt` 是固定路径，扫一遍挂载点即可。
 *        解析仍然交给 parsers：同一份格式规则不该有第二份实现
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Platform } from 'obsidian';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { parseHighlightExport } from './parsers';
import type { ParsedBook, ParsedHighlight } from './parsers';

/** 设备里那个文件的固定相对路径，各代 Kindle 一致 */
const DEVICE_RELATIVE = join('documents', 'My Clippings.txt');

/**
 * 找到 My Clippings.txt。
 *
 * 三处依次找，顺序即「有多大把握是学员这次要的那一份」：
 * 插着的 Kindle（最新、最全）→ 下载目录里的副本（他自己拷出来过）→ 桌面。
 * 找不到返回 null，由调用方讲清「没插设备也没找到副本」，而不是弹一个文件选择框——
 * 选择框正是我们要消灭的那一步。
 */
export function kindleClippingsPath(): string | null {
    if (!Platform.isDesktopApp) return null;

    for (const candidate of candidatePaths()) {
        try {
            if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
        } catch {
            // 卷宗刚被拔掉、或没有读权限：换下一个候选，不打断整条流程
        }
    }

    return null;
}

/** 全部候选路径，按把握从大到小 */
function candidatePaths(): string[] {
    const paths: string[] = [];
    const home = homedir();

    // macOS 把外接设备挂在 /Volumes 下；Linux 常见 /media/<user> 与 /run/media/<user>
    for (const mountRoot of ['/Volumes', `/media/${process.env.USER ?? ''}`, `/run/media/${process.env.USER ?? ''}`]) {
        try {
            if (!existsSync(mountRoot)) continue;

            for (const volume of readdirSync(mountRoot)) {
                paths.push(join(mountRoot, volume, DEVICE_RELATIVE));
            }
        } catch {
            // 挂载点不可读就跳过，这一步是探测不是断言
        }
    }

    // Windows：盘符逐个试，Kindle 通常是可移动卷
    if (process.platform === 'win32') {
        for (const letter of 'DEFGHIJKLMNOPQRSTUVWXYZ') {
            paths.push(`${letter}:\\${DEVICE_RELATIVE}`);
        }
    }

    paths.push(join(home, 'Downloads', 'My Clippings.txt'));
    paths.push(join(home, 'Desktop', 'My Clippings.txt'));

    return paths;
}

/** 这台机器此刻能不能读到 Kindle 划线 */
export function kindleAvailable(): boolean {
    return kindleClippingsPath() !== null;
}

/** 读出整份 My Clippings 并按书分组。文件不在或读不动时返回空清单 */
export function listKindleBooks(): readonly ParsedBook[] {
    const path = kindleClippingsPath();

    if (!path) return [];

    try {
        return parseHighlightExport(readFileSync(path, 'utf8'))?.books ?? [];
    } catch {
        return [];
    }
}

/** 取某一本书的划线；书名逐字对不上时返回空 */
export function readKindleBookHighlights(title: string): readonly ParsedHighlight[] {
    return listKindleBooks().find((book) => book.title === title)?.highlights ?? [];
}
