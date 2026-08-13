/**
 * [INPUT]: 依赖 obsidian 的 MarkdownView/Notice/normalizePath 与 App/TFile 类型，
 *          依赖 core/constants 的 FIELDS/FOLDERS/NOTE_TYPES、core/folders 的
 *          ensureFolderPath/normalizeFolderPath、core/modals 的 TextInputModal/ChoiceModal、
 *          core/time 的 nowStampAndUid、core/types 的 ZiminosContext/ZiminosSettings，
 *          依赖同目录 moc 的 mocBasenameOf/mocPathOf 与 templates 的 mocContent/mocFrontmatter
 * [OUTPUT]: 对外提供 ContainerKind 契约、PROJECT_KIND/AREA_KIND 两份规格、
 *           CreateContainerPreset 预设契约、PersonPicker 选人能力契约、createContainer
 * [POS]: 「一个文件夹 + 一篇 MOC」这件事的唯一实现，项目与领域共用它。
 *        两者的差别只有三处，全部收在 ContainerKind 那张表里：落在哪个根目录、
 *        写什么 type、问不问归属。除此之外它们连一个字的提示文案都不该分叉——
 *        分叉的代价不是重复代码，是「新建领域」某天悄悄少了一道防覆盖校验。
 *        名称合法性、防覆盖、光标落点这些规矩因此只在此处定义一次。
 *        项目那条路的文案与流程仍逐段对照 create-project-moc.js：label 取「项目」时，
 *        它吐出的每一句话与 V2 逐字相同
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { MarkdownView, Notice, normalizePath } from 'obsidian';
import type { TFile } from 'obsidian';
import { FIELDS, FOLDERS, NOTE_TYPES } from '../../core/constants';
import { ensureFolderPath, normalizeFolderPath } from '../../core/folders';
import { ChoiceModal, TextInputModal } from '../../core/modals';
import { nowStampAndUid } from '../../core/time';
import type { ZiminosContext, ZiminosSettings } from '../../core/types';
import { mocBasenameOf, mocPathOf } from './moc';
import { mocContent, mocFrontmatter } from './templates';
import type { ProjectRelation } from './templates';

/**
 * 「从库里选一个人」这项能力，由 main 在装配时注入。
 * 建项目要问「这是谁委托的」，而候选人住在人脉模块——本文件因此不 import 那个模块，
 * 只声明这个洞。第二个参数决定库里一个人都没有时要不要吭声：
 * 客户委托必须有人，缺人要说清楚；自己独做本来就可以没有同行者，那时不该被打扰。
 */
export type PersonPicker = (title: string, quietWhenEmpty: boolean) => Promise<TFile | null>;

/**
 * 项目归属的两个选项。
 *
 * 这一问是整条流程里信息量最大的一步，所以选项文案直接把后果写出来。
 * client 是商业契约标记：写下它等于把那个人注册成客户，三张客户表全靠它过滤。
 * 「周六和张三去旅游」这类私人项目必须走 with，否则朋友会被无声注册成客户、
 * 项目会挂进「我还欠谁的交付」，结案后还会污染案例库的选题统计。
 */
const OWNERSHIP = [
    { field: null, label: '自己的项目（不写 client，不进客户统计）', ask: '和谁一起做？（自己独做就按 Esc 跳过）' },
    { field: FIELDS.client, label: '客户委托的（写 client，我欠他一个交付）', ask: '这是谁委托的？' },
] as const;

// ============================================================
// 项目与领域的全部差别
// ============================================================

/**
 * 一类容器的规格。
 *
 * 这张表存在的意义是把「项目和领域到底差在哪」摆成三行可读的事实，
 * 而不是散在流程里的三处 if。将来若再来第三类容器（比如「书籍」），
 * 它是这张表多一条，而不是这条流程多一个分支。
 */
export interface ContainerKind {
    /** 中文名，出现在每一句提示里 */
    readonly label: string;
    /** 写进 frontmatter 的 type，导航页据此把它摆进哪张表 */
    readonly type: string;
    /**
     * 写进 frontmatter 的 status；留空表示这类容器没有生命周期。
     * 领域正是如此：它没有终点，给它一个「进行中」等于承诺它某天会结束，
     * 而导航页那张「正在进行中」恰恰按 status 筛。
     */
    readonly status?: string;
    /** 取哪个设置项当根目录 */
    readonly folderKey: 'projectFolder' | 'areaFolder';
    /** 该设置项为空或写错时回落到哪个默认目录 */
    readonly folderFallback: string;
    /**
     * 要不要问「这是谁的」。
     *
     * 只有项目要问，因为只有项目可能是替别人做的、可能欠着一笔交付。
     * 领域是你对自己某一部分人生的长期关注——健康、手艺、人脉——
     * 它天然只属于你自己，问一句「这是谁委托的」是在问一个不成立的问题。
     */
    readonly asksOwnership: boolean;
}

export const PROJECT_KIND: ContainerKind = {
    label: '项目',
    type: NOTE_TYPES.project,
    status: 'active',
    folderKey: 'projectFolder',
    folderFallback: FOLDERS.projects,
    asksOwnership: true,
};

export const AREA_KIND: ContainerKind = {
    label: '领域',
    type: NOTE_TYPES.area,
    folderKey: 'areaFolder',
    folderFallback: FOLDERS.areas,
    asksOwnership: false,
};

/**
 * 免问答建容器的预设值。
 * 开荒流程已经从用户那里问到了名字，不该让人再答一遍，于是把答案直接递进来跳过两次弹窗；
 * 但预设值同样要过下面的名称校验——它源自用户输入，并不比手打的更可信。
 */
export interface CreateContainerPreset {
    /** 名称，同时是文件夹名与 MOC 文件名的后半截 */
    name: string;
    /** 概述，写入 MOC 的 description 字段 */
    description: string;
}

/**
 * 新建一个项目或领域：建文件夹、写 MOC、打开并把光标停在正文起点。
 * 返回新建的 MOC 文件；用户取消、名称非法、同名 MOC 已存在或过程出错时返回 null。
 * 任何一步失败都不留半成品之外的痕迹，也绝不覆盖已有文件。
 */
export async function createContainer(
    ctx: ZiminosContext,
    kind: ContainerKind,
    preset?: CreateContainerPreset,
    pickPerson?: PersonPicker,
): Promise<TFile | null> {
    const { app } = ctx;

    try {
        // ============================================================
        // 1. 读取设置中的基础目录
        // ============================================================

        const settings: ZiminosSettings = ctx.settings;
        const baseFolder = normalizeFolderPath(settings[kind.folderKey], kind.folderFallback);

        // ============================================================
        // 2. 获取名称
        // ============================================================

        const nameInput = preset
            ? preset.name
            : await new TextInputModal(app, {
                  title: `请输入新建${kind.label}的名称`,
              }).openAndGetValue();

        if (nameInput === null || !nameInput.trim()) {
            new Notice(`未输入${kind.label}名称，操作已取消。`);
            return null;
        }

        const containerName = nameInput.trim();

        // 防止名称意外生成嵌套目录
        if (/[\\/]/.test(containerName)) {
            new Notice(`${kind.label}名称不能包含斜杠或反斜杠。`);
            return null;
        }

        // ============================================================
        // 3. 归属与关联的人：领域不问，开荒的首个项目走预设也不问
        // ============================================================

        let relation: ProjectRelation | undefined;

        if (kind.asksOwnership && !preset) {
            const ownership = await new ChoiceModal(app, {
                title: `这个${kind.label}是谁的？`,
                items: OWNERSHIP,
                labelOf: (item) => item.label,
            }).openAndGetChoice();

            if (!ownership) {
                new Notice(`未选择${kind.label}归属，操作已取消。`);
                return null;
            }

            if (pickPerson) {
                const isCommission = ownership.field !== null;
                const person = await pickPerson(ownership.ask, !isCommission);

                // 客户委托却没选到人，就不该建这个项目：一笔没有债主的交付债务毫无意义，
                // 而且此刻还没动土，中止不留半成品
                if (isCommission && !person) {
                    new Notice('未选择客户，操作已取消。');
                    return null;
                }

                if (person) {
                    relation = {
                        field: ownership.field ?? FIELDS.with,
                        target: person.basename,
                    };
                }
            }
        }

        // ============================================================
        // 4. 获取概述
        // ============================================================

        // 概述允许为空，因此只判断「是否取消」，不判断「是否填了字」
        const descriptionInput = preset
            ? preset.description
            : await new TextInputModal(app, {
                  title: `请输入${kind.label}概述`,
              }).openAndGetValue();

        if (descriptionInput === null) {
            new Notice(`已取消输入${kind.label}概述，操作已取消。`);
            return null;
        }

        const description = descriptionInput.trim();

        // ============================================================
        // 5. 生成文件夹与 MOC 笔记路径
        // ============================================================

        const containerFolderPath = normalizePath(`${baseFolder}/${containerName}`);
        const mocBasename = mocBasenameOf(containerName);
        const mocFilePath = mocPathOf(containerFolderPath, containerName);

        // ============================================================
        // 6. 逐级创建缺失的基础目录
        // ============================================================

        await ensureFolderPath(app, baseFolder);

        // ============================================================
        // 7. 创建容器文件夹
        // ============================================================

        await ensureFolderPath(app, containerFolderPath);

        // ============================================================
        // 8. 防止覆盖已经存在的 MOC
        // ============================================================

        const existingMocFile = app.vault.getAbstractFileByPath(mocFilePath);

        if (existingMocFile) {
            new Notice(`${kind.label} MOC 笔记已经存在，未执行覆盖：${mocFilePath}`);
            return null;
        }

        // ============================================================
        // 9. 生成 YAML 与 Base 内容
        // ============================================================

        // created 与 UID 必须出自同一时刻，否则跨秒时同一篇 MOC 的两个时间身份会差一秒；
        // 时间格式的空值回落由 core/time 内部负责，此处传原始设置值即可
        const { stamp: created, uid } = nowStampAndUid(settings.dateTimeFormat);

        const identity = {
            description,
            created,
            uid,
            type: kind.type,
            status: kind.status,
            relation,
        };

        const mocMarkdown = mocContent({
            ...identity,
            mocBasename,
            projectFolderPath: containerFolderPath,
        });

        // 光标落点只取决于 YAML 有多少行，故单独取一份 frontmatter 量行数；
        // 它是纯函数，与 mocMarkdown 内那一份逐字相同，正文的拼装规则仍只由 templates 一处定义
        const frontmatter = mocFrontmatter(identity);

        // ============================================================
        // 10. 创建、打开 MOC 并定位光标
        // ============================================================

        // 本次写入由插件发起，先登记再落盘，自动化监听据此放行
        ctx.guard.mark(mocFilePath);

        const mocFile = await app.vault.create(mocFilePath, mocMarkdown);

        const leaf = app.workspace.getLeaf(false);

        await leaf.openFile(mocFile, {
            active: true,
            state: {
                mode: 'source',
            },
        });

        if (leaf.view instanceof MarkdownView) {
            const editor = leaf.view.editor;

            // 三个空行中的第二行：紧接 YAML 之后留一行呼吸，人一落笔就在正文里
            const secondBlankLine = frontmatter.split('\n').length + 1;

            const cursorPosition = {
                line: secondBlankLine,
                ch: 0,
            };

            editor.setCursor(cursorPosition);
            editor.focus();

            if (typeof editor.scrollIntoView === 'function') {
                editor.scrollIntoView(
                    {
                        from: cursorPosition,
                        to: cursorPosition,
                    },
                    true,
                );
            }
        }

        new Notice(`${kind.label}已创建：${containerName}`);

        return mocFile;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        new Notice(`创建${kind.label}失败：${message}`);

        return null;
    }
}
