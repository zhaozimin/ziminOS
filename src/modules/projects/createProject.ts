/**
 * [INPUT]: 依赖 obsidian 的 MarkdownView/Notice/normalizePath 与 App/TFile 类型，
 *          依赖 core/constants 的 FOLDERS、core/folders 的 ensureFolderPath/normalizeFolderPath、
 *          core/modals 的 TextInputModal、core/time 的 nowStampAndUid、core/types 的 ZiminosContext，
 *          依赖同目录 templates 的 mocContent 与 mocFrontmatter
 * [OUTPUT]: 对外提供 CreateProjectPreset 预设契约、createProject（建目录与 MOC 并落光标）、
 *           registerCreateProjectCommand（注册「新建项目」命令）
 * [POS]: projects 模块的入口动作，把课程约定「一个项目 = 一个文件夹 + 一篇同名 MOC」固化为一次写入。
 *        它是项目唯一的诞生通道：命令面板的新建项目与开荒流程的首个项目都汇到这里，
 *        因此名称合法性、防覆盖、光标落点这些规矩只在此处定义一次；
 *        文案与流程逐段对照 create-project-moc.js，本文件不产生原脚本以外的任何行为
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { MarkdownView, Notice, normalizePath } from 'obsidian';
import type { TFile } from 'obsidian';
import { FOLDERS } from '../../core/constants';
import { ensureFolderPath, normalizeFolderPath } from '../../core/folders';
import { TextInputModal } from '../../core/modals';
import { nowStampAndUid } from '../../core/time';
import type { ZiminosContext } from '../../core/types';
import { mocContent, mocFrontmatter } from './templates';

/**
 * 免问答建项目的预设值。
 * 开荒流程已经从用户那里问到了名字，不该让人再答一遍，于是把答案直接递进来跳过两次弹窗；
 * 但预设值同样要过下面的名称校验——它源自用户输入，并不比手打的更可信。
 */
export interface CreateProjectPreset {
    /** 项目名称，同时是项目文件夹名与 MOC 文件名 */
    name: string;
    /** 项目概述，写入 MOC 的 description 字段 */
    description: string;
}

/**
 * 新建一个项目：建项目文件夹、写同名 MOC、打开并把光标停在正文起点。
 * 返回新建的 MOC 文件；用户取消、名称非法、同名 MOC 已存在或过程出错时返回 null。
 * 任何一步失败都不留半成品之外的痕迹，也绝不覆盖已有文件。
 */
export async function createProject(
    ctx: ZiminosContext,
    preset?: CreateProjectPreset,
): Promise<TFile | null> {
    const { app } = ctx;

    try {
        // ============================================================
        // 1. 读取设置中的项目基础目录
        // ============================================================

        const baseFolder = normalizeFolderPath(ctx.settings.projectFolder, FOLDERS.projects);

        // ============================================================
        // 2. 获取项目名称
        // ============================================================

        const projectNameInput = preset
            ? preset.name
            : await new TextInputModal(app, {
                  title: '请输入新建项目的名称',
              }).openAndGetValue();

        if (projectNameInput === null || !projectNameInput.trim()) {
            new Notice('未输入项目名称，操作已取消。');
            return null;
        }

        const projectName = projectNameInput.trim();

        // 防止项目名称意外生成嵌套目录
        if (/[\\/]/.test(projectName)) {
            new Notice('项目名称不能包含斜杠或反斜杠。');
            return null;
        }

        // ============================================================
        // 3. 获取项目概述
        // ============================================================

        // 概述允许为空，因此只判断「是否取消」，不判断「是否填了字」
        const descriptionInput = preset
            ? preset.description
            : await new TextInputModal(app, {
                  title: '请输入项目概述',
              }).openAndGetValue();

        if (descriptionInput === null) {
            new Notice('已取消输入项目概述，操作已取消。');
            return null;
        }

        const description = descriptionInput.trim();

        // ============================================================
        // 4. 生成项目文件夹与 MOC 笔记路径
        // ============================================================

        const projectFolderPath = normalizePath(`${baseFolder}/${projectName}`);
        const mocFilePath = normalizePath(`${projectFolderPath}/${projectName}.md`);

        // ============================================================
        // 5. 逐级创建缺失的基础目录
        // ============================================================

        await ensureFolderPath(app, baseFolder);

        // ============================================================
        // 6. 创建项目文件夹
        // ============================================================

        await ensureFolderPath(app, projectFolderPath);

        // ============================================================
        // 7. 防止覆盖已经存在的项目 MOC
        // ============================================================

        const existingMocFile = app.vault.getAbstractFileByPath(mocFilePath);

        if (existingMocFile) {
            new Notice(`项目 MOC 笔记已经存在，未执行覆盖：${mocFilePath}`);
            return null;
        }

        // ============================================================
        // 8. 生成 YAML 与 Base 内容
        // ============================================================

        // created 与 UID 必须出自同一时刻，否则跨秒时同一篇 MOC 的两个时间身份会差一秒；
        // 时间格式的空值回落由 core/time 内部负责，此处传原始设置值即可
        const { stamp: created, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);

        const mocMarkdown = mocContent({
            projectName,
            projectFolderPath,
            description,
            created,
            uid,
        });

        // 光标落点只取决于 YAML 有多少行，故单独取一份 frontmatter 量行数；
        // 它是纯函数，与 mocMarkdown 内那一份逐字相同，正文的拼装规则仍只由 templates 一处定义
        const frontmatter = mocFrontmatter(description, created, uid);

        // ============================================================
        // 9. 创建、打开 MOC 并定位光标
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

        new Notice(`项目已创建：${projectName}`);

        return mocFile;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        new Notice(`创建项目失败：${message}`);

        return null;
    }
}

/** 注册「新建项目」命令。命令本身不做错误处理，失败提示由 createProject 内部统一给出 */
export function registerCreateProjectCommand(ctx: ZiminosContext): void {
    ctx.plugin.addCommand({
        id: 'create-project',
        name: '新建项目',
        callback: () => {
            void createProject(ctx);
        },
    });
}
