/**
 * [INPUT]: 依赖 Obsidian 的 parseYaml/stringifyYaml 与 lineEndings 的换行识别。
 * [OUTPUT]: 提供 yamlOf 与 patchProperties；undefined 删除指定属性。
 * [POS]: Markdown 属性的增量文本边界。大日历与容器转换共用，保留其他字段、注释与正文。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { parseYaml, stringifyYaml } from 'obsidian';
import { splitTextLines } from './lineEndings';

export function yamlOf(text: string): Record<string, unknown> {
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
    if (!match) return {};
    const value: unknown = parseYaml(match[1]);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('笔记属性不是有效的 YAML 对象。');
    return value as Record<string, unknown>;
}
// 只替换明确拥有的顶层键，保留其他字段、注释和正文原文。
export function patchProperties(text: string, patch: Record<string, unknown>): string {
    const { lineEnding } = splitTextLines(text);
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
    yamlOf(text);
    const lines = match ? match[1].split(/\r?\n/) : [];
    for (const [key, value] of Object.entries(patch)) {
        const indexes = lines.flatMap((line, i) => line.startsWith(`${key}:`) ? [i] : []);
        if (indexes.length > 1) throw new Error(`属性 ${key} 重复，已停止写入。`);
        const encoded = value === undefined ? [] : stringifyYaml({ [key]: value }).trimEnd().split(/\r?\n/);
        if (!indexes.length) { lines.push(...encoded); continue; }
        const start = indexes[0]; let end = start + 1;
        while (end < lines.length && !/^[^\s#][^:]*:/.test(lines[end])) end++;
        // 末尾空行和独立注释属于原文，不随字段替换删除。
        while (end > start + 1 && /^(?:\s*|#.*)$/.test(lines[end - 1])) end--;
        lines.splice(start, end - start, ...encoded);
    }
    const body = match ? text.slice(match[0].length) : text;
    const result = ['---', ...lines, '---', body].join(lineEnding);
    yamlOf(result);
    return result;
}
