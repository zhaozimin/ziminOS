/**
 * [INPUT]: 依赖 obsidian 的 Notice/ToggleComponent/setIcon/setTooltip；
 *          依赖 core/constants 的 APPEARANCE_COMMAND、core/types 的 ZiminosContext；
 *          依赖 ./snippets 的 readSnippets/setSnippetEnabled/SnippetState
 * [OUTPUT]: 对外提供 registerAppearanceSwitch，返回一个「按设置重新决定按钮显隐」的同步函数
 * [POS]: 外观模块的呈现层：右下角状态栏的那个按钮，以及它弹出的片段清单面板。
 *        它不认识 Obsidian 的 CSS 子系统，只认识 snippets.ts 给出的那四个字段，
 *        因此内部实现怎么变都碰不到这个文件。
 *        面板刻意不是 Menu：MySnippets 正是把开关塞进 Menu 的内部 DOM 才在新版里散架的——
 *        Menu 的结构属于 Obsidian，往里塞控件等于把自己焊死在别人的实现细节上。
 *        这里改成一个自己的浮层：只用 createDiv 与公开的 ToggleComponent，
 *        位置按状态栏按钮的实际位置算出来，没有任何写死的像素偏移。
 *        每次打开都现读一次磁盘，因此用户在「设置 → 外观」里的改动、
 *        或者往目录里新丢的 .css，下一次打开就都在
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Notice, ToggleComponent, setIcon, setTooltip } from 'obsidian';
import { APPEARANCE_COMMAND } from '../../core/constants';
import type { ZiminosContext } from '../../core/types';
import { readSnippets, setSnippetEnabled } from './snippets';
import type { SnippetState } from './snippets';

// ============================================================
// 界面文案
// ============================================================

const TEXTS = {
    tooltip: '外观开关：开关 CSS 片段',
    /** setIcon 认不出图标名时的替身。MySnippets 就是因为图标名随 Obsidian 换图标库失效而「看不见」 */
    iconFallback: '🎨',
    iconName: 'palette',

    title: '外观开关',
    countSuffix: ' 个片段',

    empty: '片段目录里还没有 CSS 文件。把 .css 文件放进 .obsidian/snippets/，再点一次这个按钮。',
    pendingReload: '已记下这次改动，重新载入 Obsidian 后生效。',
    failedReadPrefix: '读不到片段目录：',
    failedPrefix: '写入失败：',
} as const;

// ============================================================
// 装配
// ============================================================

/**
 * 装配外观开关。
 *
 * 返回值是给设置页用的：设置页只改 ctx.settings 并落盘，它无法让一个已经画在屏幕上的
 * 状态栏按钮自己消失，所以这里交出一个同步函数由 main 转交过去——
 * 与「记人情要日记」「客户要开荒」用的是同一套填洞手法，依赖图仍是一棵树。
 */
export function registerAppearanceSwitch(ctx: ZiminosContext): () => void {
    const swi = new AppearanceSwitch(ctx);

    return () => swi.syncVisibility();
}

// ============================================================
// 状态栏按钮与浮层
// ============================================================

class AppearanceSwitch {
    private readonly ctx: ZiminosContext;

    private readonly statusEl: HTMLElement;

    /** 浮层只在打开期间存在；null 即「当前没开」，不留隐藏的空壳 */
    private panelEl: HTMLElement | null = null;

    /** 关闭浮层用的解绑动作。开一次装一次、关一次拆干净，不给插件生命周期留监听残渣 */
    private readonly detachers: (() => void)[] = [];

    constructor(ctx: ZiminosContext) {
        this.ctx = ctx;
        this.statusEl = ctx.plugin.addStatusBarItem();

        this.statusEl.addClass('ziminos-appearance-switch');
        this.statusEl.addClass('mod-clickable');
        setTooltip(this.statusEl, TEXTS.tooltip, { placement: 'top' });
        this.paintIcon();
        this.syncVisibility();

        this.statusEl.addEventListener('click', () => this.toggle());

        // 按钮可以被用户收起来，命令是到达这个面板的另一条永远存在的路
        ctx.plugin.addCommand({
            id: APPEARANCE_COMMAND.id,
            name: APPEARANCE_COMMAND.name,
            callback: () => this.toggle(),
        });

        // 插件卸载时浮层挂在 body 上，不会随状态栏一起被回收，必须自己收走
        ctx.plugin.register(() => this.close());
    }

    /** 按设置决定按钮显隐。关掉只是收起按钮，命令与浮层照常可用 */
    syncVisibility(): void {
        this.statusEl.toggle(this.ctx.settings.showAppearanceSwitch);
    }

    /**
     * 画图标。
     * 图标名属于 Obsidian 的图标库，换库就会失效——那正是 MySnippets 在新版里
     * 只剩一个看不见的按钮的原因。这里画完检查一眼有没有真的画出 svg，没有就退回一个字符。
     */
    private paintIcon(): void {
        setIcon(this.statusEl, TEXTS.iconName);

        if (!this.statusEl.querySelector('svg')) this.statusEl.setText(TEXTS.iconFallback);
    }

    // ============================================================
    // 开合
    // ============================================================

    private toggle(): void {
        if (this.panelEl) this.close();
        else void this.open();
    }

    /** 打开浮层。事实现读，因此「设置 → 外观」里的改动与新丢进目录的文件都会出现在这一次 */
    private async open(): Promise<void> {
        this.close();

        const panel = document.body.createDiv({ cls: 'ziminos-appearance-panel' });

        this.panelEl = panel;
        this.place(panel);
        this.bindDismiss(panel);

        try {
            const snippets = await readSnippets(this.ctx.app);

            // 读盘期间用户可能已经把浮层关了、或者又开了一个新的：
            // 认准自己这一份，否则会往一个已经摘掉的 div 上画画
            if (this.panelEl !== panel) return;

            this.render(panel, snippets);
        } catch (error) {
            if (this.panelEl !== panel) return;

            // 读不到片段目录也要说人话，不能留一个空框让人以为系统坏了
            panel.createDiv({
                cls: 'ziminos-appearance-empty',
                text: TEXTS.failedReadPrefix + describe(error),
            });
        }
    }

    private close(): void {
        for (const detach of this.detachers) detach();

        this.detachers.length = 0;
        this.panelEl?.remove();
        this.panelEl = null;
    }

    /**
     * 把浮层贴到状态栏按钮上方。
     *
     * 位置一律由按钮的实际矩形算出，不写死像素——MySnippets 用的是
     * 「窗口右下角减 15 和 37」，换一套窗口边框就飘出屏幕。
     * 按钮被用户收起来时（此时用命令打开）矩形是全零，退回贴着窗口右下角。
     */
    private place(panel: HTMLElement): void {
        const rect = this.statusEl.getBoundingClientRect();
        const anchored = rect.width > 0;

        panel.style.bottom = `${anchored ? window.innerHeight - rect.top + 6 : 34}px`;
        panel.style.right = `${anchored ? Math.max(8, window.innerWidth - rect.right) : 12}px`;
    }

    /** 点别处、按 Esc、改窗口大小都算「不看了」。三个监听都记进 detachers，关闭时一起拆掉 */
    private bindDismiss(panel: HTMLElement): void {
        const onPointerDown = (event: MouseEvent): void => {
            const target = event.target;

            if (!(target instanceof Node)) return;
            // 点按钮本身不在这里处理：让它落到按钮的 click 上，由 toggle 收起，否则会关了又开
            if (panel.contains(target) || this.statusEl.contains(target)) return;

            this.close();
        };

        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') this.close();
        };

        const onResize = (): void => this.close();

        document.addEventListener('mousedown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('resize', onResize);

        this.detachers.push(
            () => document.removeEventListener('mousedown', onPointerDown, true),
            () => document.removeEventListener('keydown', onKeyDown, true),
            () => window.removeEventListener('resize', onResize),
        );
    }

    // ============================================================
    // 渲染
    // ============================================================

    /** 画标题、分组与每一行。分组名来自用户自己的【】命名习惯，不是我们发明的分类 */
    private render(panel: HTMLElement, snippets: readonly SnippetState[]): void {
        const header = panel.createDiv({ cls: 'ziminos-appearance-header' });

        header.createSpan({ text: TEXTS.title });
        header.createSpan({
            cls: 'ziminos-appearance-count',
            text: `${snippets.length}${TEXTS.countSuffix}`,
        });

        if (snippets.length === 0) {
            panel.createDiv({ cls: 'ziminos-appearance-empty', text: TEXTS.empty });

            return;
        }

        const list = panel.createDiv({ cls: 'ziminos-appearance-list' });
        let currentGroup = '';

        for (const snippet of snippets) {
            if (snippet.group !== currentGroup) {
                currentGroup = snippet.group;
                list.createDiv({ cls: 'ziminos-appearance-group', text: currentGroup });
            }

            this.renderRow(list, snippet);
        }
    }

    /**
     * 一行：名字 + 开关。
     *
     * 失败要把开关拨回去——否则界面说「开着」而磁盘上是关着的，
     * 用户下次打开面板会看到它自己变了回去，那比一开始就报错更让人不信任系统。
     * 回拨用一个重入标志兜住：ToggleComponent.setValue 是否回调 onChange 属于它的实现细节，
     * 不该由我们来赌。
     */
    private renderRow(list: HTMLElement, snippet: SnippetState): void {
        const row = list.createDiv({ cls: 'ziminos-appearance-row' });

        row.createSpan({ cls: 'ziminos-appearance-name', text: snippet.label });

        const toggle = new ToggleComponent(row);
        let rollingBack = false;

        toggle.setValue(snippet.enabled).onChange((value) => {
            if (rollingBack) return;

            void this.applyToggle(snippet, value, () => {
                rollingBack = true;
                toggle.setValue(!value);
                rollingBack = false;
            });
        });
    }

    /** 落一次开关：即刻生效就闭嘴，只落了盘就提醒重载，失败就回拨并说明原因 */
    private async applyToggle(
        snippet: SnippetState,
        value: boolean,
        rollback: () => void,
    ): Promise<void> {
        try {
            const applied = await setSnippetEnabled(this.ctx.app, snippet.name, value);

            // 生效了就什么都不说：开关自己拨过去了，就是最好的反馈
            if (!applied) new Notice(TEXTS.pendingReload);
        } catch (error) {
            rollback();
            new Notice(TEXTS.failedPrefix + describe(error));
        }
    }
}

/** 异常转人话。全模块只此一处，保证提示语气一致 */
function describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
