/**
 * [INPUT]: 依赖 ./constants 的 VIEW_BLOCK_LANG
 * [OUTPUT]: 对外提供 insertIntoSection（把一行插进指定标题的小节内）
 * [POS]: core 的 Markdown 文本操作层，纯函数，不碰磁盘也不认识业务。
 *        它服务于同一类动作：命令要往一篇既有笔记的某个小节里追加一行记录
 *        （记人情写进日记、增加付费写进客户档案、记收款写进项目 MOC）。
 *        三个落点的规则完全一样，所以规则只该存在一份。
 *        三条行为都是为了「插进去的那一行看起来像是人自己写的」：
 *        插在视图代码块之前（数据在上、汇总在下，符合阅读顺序）、
 *        用掉模板留下的空占位行、找不到小节时宁可追加到文末也绝不拒绝写入——
 *        学员改过标题不该导致他的记录丢失
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { VIEW_BLOCK_LANG } from './constants';

/** 视图代码块的起始围栏 */
const VIEW_FENCE = '```' + VIEW_BLOCK_LANG;

/** 任意层级的 Markdown 标题，用来界定小节的终点 */
const ANY_HEADING = /^#{1,6}\s/;

/** 模板在小节里留下的空列表占位行 */
const PLACEHOLDER = '-';

/**
 * 把一行插进指定标题的小节里。
 *
 * 找不到该标题就追加到文件末尾：位置不理想好过拒绝写入。
 * 小节内若有视图代码块，新行插在它前面——那个块是对这些行的汇总，
 * 汇总排在原始数据后面才读得顺。
 */
export function insertIntoSection(content: string, heading: string, line: string): string {
    const lines = content.split('\n');
    const headingIndex = lines.findIndex((text) => text.trim() === heading);

    if (headingIndex < 0) return `${content.replace(/\s*$/, '')}\n\n${heading}\n\n${line}\n`;

    let sectionEnd = lines.length;

    for (let cursor = headingIndex + 1; cursor < lines.length; cursor += 1) {
        if (ANY_HEADING.test(lines[cursor])) {
            sectionEnd = cursor;
            break;
        }
    }

    let insertAt = sectionEnd;

    // 小节里有视图块就插在它之前，让原始记录留在汇总表上方
    for (let cursor = headingIndex + 1; cursor < sectionEnd; cursor += 1) {
        // 先剥缩进再比前缀；不用 trimStart 是因为目标是 ES2018，那个方法要 ES2019 才有
        if (lines[cursor].replace(/^\s+/, '').indexOf(VIEW_FENCE) === 0) {
            insertAt = cursor;
            break;
        }
    }

    while (insertAt > headingIndex + 1 && lines[insertAt - 1].trim() === '') insertAt -= 1;

    // 模板留的那行空占位直接用掉，免得记录下面永远挂着一根孤零零的横杠
    if (insertAt > headingIndex + 1 && lines[insertAt - 1].trim() === PLACEHOLDER) {
        lines[insertAt - 1] = line;

        return lines.join('\n');
    }

    lines.splice(insertAt, 0, line);

    return lines.join('\n');
}
