/**
 * [INPUT]: 依赖 obsidian 的 Modal 基类、ButtonComponent 与 App 类型
 * [OUTPUT]: 对外提供 TextInputOptions 配置与 TextInputModal 弹窗类（openAndGetValue）
 * [POS]: core 的唯一人机问答通道，取代原脚本对 QuickAdd inputPrompt 的依赖。
 *        它把「弹窗生命周期」翻译成一个 Promise：有输入返回文本，取消返回 null，
 *        调用方因此可以用一条 if 判断中止流程，无需关心 DOM 与事件。
 *        样式只用 Obsidian 原生组件与极少量内联样式，V1 不引入 styles.css
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { ButtonComponent, Modal } from 'obsidian';
import type { App } from 'obsidian';

/** 文本输入弹窗的配置 */
export interface TextInputOptions {
    /** 弹窗标题，同时充当提问语 */
    title: string;
    /** 输入框占位提示 */
    placeholder?: string;
    /** 输入框初始值，打开时自动全选，便于直接覆写 */
    initial?: string;
}

/**
 * 单行文本输入弹窗。
 * 回车或点击「确认」提交输入原文（不做 trim，是否修剪由调用方按各自语义决定）；
 * 点击「取消」、按 Esc、点击遮罩关闭，一律返回 null。
 */
export class TextInputModal extends Modal {
    private readonly options: TextInputOptions;

    /** Promise 的 resolve 句柄；结算后置空，避免重复结算与引用滞留 */
    private resolver: ((value: string | null) => void) | null = null;

    /** 是否已经结算过。关闭动作与提交动作都会走到结算，用它保证只生效一次 */
    private settled = false;

    constructor(app: App, options: TextInputOptions) {
        super(app);
        this.options = options;
    }

    /** 打开弹窗并等待用户作答：有输入返回文本，取消返回 null */
    openAndGetValue(): Promise<string | null> {
        return new Promise<string | null>((resolve) => {
            this.resolver = resolve;
            this.open();
        });
    }

    onOpen(): void {
        this.titleEl.setText(this.options.title);
        this.contentEl.empty();

        const inputEl = this.contentEl.createEl('input', {
            type: 'text',
            value: this.options.initial ?? '',
            placeholder: this.options.placeholder ?? '',
        });
        inputEl.style.width = '100%';

        // 回车即提交；输入法组合期间的回车属于选词，必须放行
        inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key !== 'Enter' || event.isComposing) return;

            event.preventDefault();
            this.submit(inputEl.value);
        });

        const buttonBar = this.contentEl.createDiv();
        buttonBar.style.display = 'flex';
        buttonBar.style.justifyContent = 'flex-end';
        buttonBar.style.gap = '8px';
        buttonBar.style.marginTop = '16px';

        // 取消不需要单独结算：关闭弹窗会走 onClose，在那里统一结算为 null
        new ButtonComponent(buttonBar)
            .setButtonText('取消')
            .onClick(() => this.close());

        new ButtonComponent(buttonBar)
            .setButtonText('确认')
            .setCta()
            .onClick(() => this.submit(inputEl.value));

        inputEl.focus();
        inputEl.select();
    }

    onClose(): void {
        // Esc、遮罩点击、取消按钮最终都汇到这里；已提交过则此次结算无效
        this.settle(null);
        this.contentEl.empty();
    }

    /** 提交输入并关闭：先结算再关闭，onClose 里的兜底结算自然失效 */
    private submit(value: string): void {
        this.settle(value);
        this.close();
    }

    /** 唯一结算点，保证 Promise 只被兑现一次 */
    private settle(value: string | null): void {
        if (this.settled) return;

        this.settled = true;

        const resolve = this.resolver;
        this.resolver = null;

        if (resolve) resolve(value);
    }
}
