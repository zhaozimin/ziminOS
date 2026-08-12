/**
 * [INPUT]: 依赖 obsidian 的 App 与 TFile 类型；只用 createEl/createDiv 等原生 DOM 辅助与
 *          workspace.openLinkText，不依赖任何渲染插件
 * [OUTPUT]: 对外提供单元格类型 Cell/NoteLink 与 noteLink 构造器，以及五个渲染原语
 *           renderTable / renderEmpty / renderNote / renderHeading / renderRichText
 * [POS]: 视图引擎的呈现层，二十个视图的唯一出口。它不认识任何业务概念，只认识
 *        「表头 + 行 + 单元格」。收在一处的理由有二：
 *        其一，两次建表会生成两个各自算列宽的 <table>，同一逻辑表的列必然错位——
 *        原始脚本为此在注释里留过教训，这里用「一张表 + 首列标记」的写法从结构上杜绝；
 *        其二，空态必须显式。缺记录是常态，把空结果兜底成 0 等于把「本月没记录」
 *        伪装成「本月跑了 0 公里」，因此空态有专门的原语，且强制要求一句下一步指引
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { TFile } from 'obsidian';
import type { App } from 'obsidian';

/** 指向库内某篇笔记的链接单元格 */
export interface NoteLink {
    readonly path: string;
    /** 显示文本，默认取文件名 */
    readonly display: string;
}

/** 表格单元格可以是文本、数字、笔记链接，或调用方自己搭好的元素 */
export type Cell = string | number | NoteLink | HTMLElement | null | undefined;

/** 由文件构造链接单元格；display 缺省即文件名 */
export function noteLink(file: TFile, display?: string): NoteLink {
    return { path: file.path, display: display ?? file.basename };
}

/** 判定一个单元格是不是笔记链接。用结构判定而非 instanceof，NoteLink 是纯数据 */
function isNoteLink(cell: Cell): cell is NoteLink {
    return typeof cell === 'object' && cell !== null && !(cell instanceof HTMLElement) && 'path' in cell;
}

/**
 * 渲染一张表。
 *
 * 逻辑上属于同一张表的内容必须一次画完：分两次调用会得到两个 <table>，
 * 浏览器对它们各自算列宽，视觉上就是两段对不齐的表。需要区分两类行时，
 * 加一列标记（🆕 / ✏️）而不是加一张表。
 */
export function renderTable(
    app: App,
    el: HTMLElement,
    sourcePath: string,
    headers: readonly string[],
    rows: readonly (readonly Cell[])[],
): void {
    const table = el.createEl('table', { cls: 'ziminos-view-table' });
    const headRow = table.createEl('thead').createEl('tr');

    for (const header of headers) {
        headRow.createEl('th', { text: header });
    }

    const body = table.createEl('tbody');

    for (const row of rows) {
        const tr = body.createEl('tr');

        for (const cell of row) {
            renderCell(app, tr.createEl('td'), sourcePath, cell);
        }
    }
}

/** 把一个单元格画进 td */
function renderCell(app: App, td: HTMLElement, sourcePath: string, cell: Cell): void {
    if (cell === null || cell === undefined) {
        td.setText('—');

        return;
    }

    if (cell instanceof HTMLElement) {
        td.appendChild(cell);

        return;
    }

    if (isNoteLink(cell)) {
        renderNoteLink(app, td, sourcePath, cell);

        return;
    }

    renderRichText(td, String(cell));
}

/**
 * 画一条库内链接。
 *
 * 类名与 data-href 让 Obsidian 认出它并接管悬停预览与样式；
 * 点击则由我们自己转交给 workspace.openLinkText，因此即使将来那套约定变了，
 * 链接依然点得开——样式可以退化，功能不能。
 */
function renderNoteLink(app: App, parent: HTMLElement, sourcePath: string, link: NoteLink): void {
    const anchor = parent.createEl('a', {
        cls: 'internal-link',
        text: link.display,
        href: link.path,
    });

    anchor.setAttribute('data-href', link.path);

    anchor.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        void app.workspace.openLinkText(link.path, sourcePath, event.ctrlKey || event.metaKey);
    });
}

/**
 * 空态：一句话说清楚「现在什么都没有」以及「下一步该做什么」。
 *
 * 强制带指引，是因为学员第一次打开 MOC 时全部视图都是空的——
 * 一片空白会让他以为系统坏了，一句「命令面板运行『新建人脉』建第一个」则是入口。
 */
export function renderEmpty(el: HTMLElement, message: string): void {
    const paragraph = el.createEl('p', { cls: 'ziminos-view-empty' });

    paragraph.style.color = 'var(--text-muted)';
    renderRichText(paragraph, `📭 ${message}`);
}

/** 视图的说明或统计行，弱化显示 */
export function renderNote(el: HTMLElement, message: string): void {
    const paragraph = el.createEl('p');

    paragraph.style.color = 'var(--text-muted)';
    paragraph.style.fontSize = '0.9em';
    renderRichText(paragraph, message);
}

/** 视图内的分组小标题 */
export function renderHeading(el: HTMLElement, level: 3 | 4, text: string): void {
    el.createEl(level === 3 ? 'h3' : 'h4', { text });
}

/** 视图顶部的一句话总结，允许 **加粗** */
export function renderSummary(el: HTMLElement, text: string): void {
    renderRichText(el.createEl('p'), text);
}

/**
 * 只认识 `**加粗**` 的极小文本渲染。
 *
 * 刻意不接 Markdown 渲染器：视图里的文案全是我们自己写的，需要的强调只有加粗一种；
 * 引入完整渲染意味着把用户数据当 Markdown 执行，一个人名里带 `[[` 就会渲染出意外的链接。
 */
export function renderRichText(parent: HTMLElement, text: string): void {
    const segments = text.split('**');

    segments.forEach((segment, position) => {
        if (!segment) return;

        // 奇数段落在两个 ** 之间，即加粗内容
        if (position % 2 === 1) parent.createEl('strong', { text: segment });
        else parent.appendText(segment);
    });
}
