/**
 * [INPUT]: 依赖 obsidian 的 PluginSettingTab 基类与 Setting 构建器；依赖 ./core/types 的
 *          ZiminosContext/ZiminosSettings/DEFAULT_SETTINGS；依赖 ./modules/projects/init 的 initializeVault
 * [OUTPUT]: 对外提供 ZiminosSettingTab，由 main.ts 在装配末尾挂载
 * [POS]: 插件唯一的图形界面，也是「人主导」这条红线的具象化——开荒只在用户按下按钮时发生，
 *        两个自动行为的开关随时可以关掉。它只读写 ctx.settings 并调 ctx.saveSettings，
 *        不持有任何自己的状态：面板每次 display 都从设置对象重新渲染，因此外部改动天然可见。
 *        四个分区的排列顺序即学员的使用顺序：先开荒，再决定自动化，其次才是目录与时间格式，
 *        最后是模块清单——它如实展示插件内的项目管理与由 vault 交付的外观包，
 *        同时为后续模块预留可见挂载位
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { PluginSettingTab, Setting } from 'obsidian';
import { DEFAULT_SETTINGS } from './core/types';
import type { ZiminosContext } from './core/types';
import { initializeVault } from './modules/projects/init';

// ============================================================
// 界面文案（全中文，集中在此，避免同一句话散落在多处）
// ============================================================

const TEXTS = {
    initHeading: '开荒',
    initName: '初始化笔记库',
    initButton: '初始化',
    initPending: '尚未初始化。点右边的按钮，为这个库铺好 PARA 六个文件夹、两份模板和一页导航。',
    initReadyPrefix: '已就绪 ✓ 首次开荒于 ',
    initReadySuffix: '。再点一次只补齐缺失的文件，不会覆盖你写过的任何笔记。',

    autoHeading: '自动化',
    autoCardName: '新建笔记自动登记为卡片',
    autoCardDesc: '在项目或领域目录里新建空笔记时，自动补齐标准字段，并链回它所属的 MOC。关掉后可用命令「初始化当前卡片」手动登记。',
    autoUpdatedName: '自动维护 updated 时间',
    autoUpdatedDesc: '改完带 YAML 的笔记、停手两秒后，自动记下这次修改时间。没有 YAML 的笔记一个字都不动。',

    advancedHeading: '高级设置（一般不用改）',

    modulesHeading: '系统模块',
} as const;

// ============================================================
// 高级区：四个文本框的声明式描述
// ============================================================

/** 可由高级区文本框直接编辑的设置项，全部是字符串字段 */
type TextSettingKey = 'projectFolder' | 'areaFolder' | 'archiveFolder' | 'dateTimeFormat';

/** 一个文本框的全部信息。用数据描述而非四段雷同代码，增删字段只改这张表 */
interface TextFieldSpec {
    readonly key: TextSettingKey;
    readonly name: string;
    /** 说明的前半句；后半句由默认值自动补出，保证提示与 DEFAULT_SETTINGS 永不失同步 */
    readonly hint: string;
}

const ADVANCED_FIELDS: readonly TextFieldSpec[] = [
    { key: 'projectFolder', name: '项目目录', hint: '正在推进的项目放在这里。' },
    { key: 'areaFolder', name: '领域目录', hint: '长期关注、没有终点的领域放在这里。' },
    { key: 'archiveFolder', name: '归档目录', hint: '完成、暂停、放弃的项目会搬到这里。' },
    { key: 'dateTimeFormat', name: '时间格式', hint: 'created 与 updated 字段的写法，moment 语法。' },
];

// ============================================================
// 系统模块清单
// ============================================================

/** 模块清单的一行。running 决定它是运行中的能力还是占位的预告 */
interface ModuleEntry {
    readonly name: string;
    readonly status: string;
    readonly running: boolean;
}

/**
 * 静态模块清单。项目管理由插件运行，外观包由 vault 中锁定的主题、
 * 辅助插件与自有 CSS 协同提供；清单只展示交付状态，不在 ziminOS 内重新实现第三方能力。
 */
const SYSTEM_MODULES: readonly ModuleEntry[] = [
    { name: '📦 项目管理 v1', status: '运行中', running: true },
    { name: '👥 人脉管理', status: '敬请期待', running: false },
    { name: '📔 日记复盘', status: '敬请期待', running: false },
    { name: '🎨 外观包 v1', status: 'Minimal + Style Settings 已就绪', running: true },
];

// ============================================================
// 设置页
// ============================================================

/**
 * ziminOS 设置页。
 * 构造参数只收 ZiminosContext 一个：app 与 plugin 都能从中取出，
 * 设置页因此与 main.ts 共用同一个设置对象与同一个落盘通道，不存在第二份真相。
 */
export class ZiminosSettingTab extends PluginSettingTab {
    private readonly ctx: ZiminosContext;

    constructor(ctx: ZiminosContext) {
        super(ctx.app, ctx.plugin);

        this.ctx = ctx;
    }

    /** 每次打开设置页都整体重建，保证显示的永远是设置对象的当前值 */
    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        this.renderInitSection(containerEl);
        this.renderAutomationSection(containerEl);
        this.renderAdvancedSection(containerEl);
        this.renderModulesSection(containerEl);
    }

    // ============================================================
    // 一、开荒
    // ============================================================

    /**
     * 开荒区：一句状态说明 + 一个按钮。
     * 按钮点下后先禁用再执行，防止连点开出两次流程；完成后重建整个面板，
     * 状态说明随之从「尚未初始化」翻面成「已就绪」。
     */
    private renderInitSection(containerEl: HTMLElement): void {
        new Setting(containerEl).setName(TEXTS.initHeading).setHeading();

        new Setting(containerEl)
            .setName(TEXTS.initName)
            .setDesc(this.describeInitState())
            .addButton((button) => {
                button
                    .setButtonText(TEXTS.initButton)
                    .setCta()
                    .onClick(async () => {
                        button.setDisabled(true);

                        try {
                            // 开荒自己吃掉全部异常并以 Notice 汇报，这里不需要再判断成败
                            await initializeVault(this.ctx);
                        } finally {
                            // 重建面板即刷新状态；旧按钮随 containerEl 一起丢弃，无需解禁
                            this.display();
                        }
                    });
            });
    }

    /** 用 initializedAt 是否为空来决定说什么：这是「首次开荒」与「幂等补齐」的唯一判据 */
    private describeInitState(): string {
        const { initializedAt } = this.ctx.settings;

        if (!initializedAt) return TEXTS.initPending;

        return TEXTS.initReadyPrefix + initializedAt + TEXTS.initReadySuffix;
    }

    // ============================================================
    // 二、自动化
    // ============================================================

    /** 自动化区：两个开关，对应插件仅有的两个常驻监听 */
    private renderAutomationSection(containerEl: HTMLElement): void {
        new Setting(containerEl).setName(TEXTS.autoHeading).setHeading();

        this.renderToggle(containerEl, 'autoCardInit', TEXTS.autoCardName, TEXTS.autoCardDesc);
        this.renderToggle(containerEl, 'autoUpdated', TEXTS.autoUpdatedName, TEXTS.autoUpdatedDesc);
    }

    /** 渲染一个布尔开关。改动立即落盘，监听方每次触发都现读设置，故无需通知任何人 */
    private renderToggle(
        containerEl: HTMLElement,
        key: 'autoCardInit' | 'autoUpdated',
        name: string,
        desc: string,
    ): void {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addToggle((toggle) => {
                toggle.setValue(this.ctx.settings[key]).onChange(async (value) => {
                    this.ctx.settings[key] = value;

                    await this.ctx.saveSettings();
                });
            });
    }

    // ============================================================
    // 三、高级
    // ============================================================

    /**
     * 高级区：默认折叠。
     * 目录名与时间格式是课程内容的一部分，改了会让学员的库与课程讲义对不上，
     * 所以既要留出口，又不能摆在明面上诱导人去动它。
     */
    private renderAdvancedSection(containerEl: HTMLElement): void {
        const details = containerEl.createEl('details');
        const summary = details.createEl('summary', { text: TEXTS.advancedHeading });

        summary.style.cursor = 'pointer';
        summary.style.padding = '12px 0';
        summary.style.fontWeight = '600';

        for (const field of ADVANCED_FIELDS) {
            this.renderTextField(details, field);
        }
    }

    /**
     * 渲染一个文本框。
     * 这里刻意不做清洗与校验：留空或写错的值由各功能模块在使用时回落到默认值，
     * 校验集中在读取侧，设置页只负责如实记录用户敲进去的字。
     */
    private renderTextField(containerEl: HTMLElement, field: TextFieldSpec): void {
        const fallback: string = DEFAULT_SETTINGS[field.key];

        new Setting(containerEl)
            .setName(field.name)
            .setDesc(`${field.hint}课程默认值 ${fallback}，改前三思。`)
            .addText((text) => {
                text.setPlaceholder(fallback)
                    .setValue(this.ctx.settings[field.key])
                    .onChange(async (value) => {
                        this.ctx.settings[field.key] = value;

                        await this.ctx.saveSettings();
                    });
            });
    }

    // ============================================================
    // 四、系统模块
    // ============================================================

    /** 模块区：纯展示，没有任何控件。未上线的模块以禁用态呈现，看得见但点不动 */
    private renderModulesSection(containerEl: HTMLElement): void {
        new Setting(containerEl).setName(TEXTS.modulesHeading).setHeading();

        for (const entry of SYSTEM_MODULES) {
            const item = new Setting(containerEl).setName(entry.name).setDesc(entry.status);

            if (!entry.running) item.setDisabled(true);
        }
    }
}
