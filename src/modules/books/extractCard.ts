/**
 * [INPUT]: 依赖 obsidian 的 MarkdownView/Notice/normalizePath；依赖 core/commands 的 BOOK_COMMANDS、
 *          core/modals 的 TextInputModal、core/time 的 nowStampAndUid、core/types 的 ZiminosContext；
 *          依赖同目录 identity 的 isBookMoc/bookNameOf 与 templates 的 excerptCardContent
 * [OUTPUT]: 对外提供 registerExcerptCardCommand（命令 excerpt-book-card）
 * [POS]: books 模块的炼卡命令，读书笔记从素材走向知识的那一步。
 *        它只在书的 MOC 上可用——划线住在那里，选中一段、起个名字，
 *        书的文件夹里就长出一张十字段卡片，划线原文以引用块打底，光标停在正文起点。
 *        up 双链按 cardInit 的同一公式拼（全路径 + 书名作显示名），
 *        因此 MOC 底部的「读书卡片」base 表、反链视图对它零改动全认；
 *        文件带着完整 YAML 出生且写盘前已登记自写，自动登记不会再碰它。
 *        名称防覆盖与「为什么不行」的中文 Notice 一应俱全，与建容器同一姿态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { MarkdownView, Notice, normalizePath } from 'obsidian';
import { BOOK_COMMANDS } from '../../core/commands';
import { TextInputModal } from '../../core/modals';
import { nowStampAndUid } from '../../core/time';
import type { ZiminosContext } from '../../core/types';
import { bookNameOf, isBookMoc } from './identity';
import { excerptCardContent } from './templates';

/**
 * 全部提示文案。用词跟着 README 走：那里通篇叫「总览页」，这里就不能改口叫 MOC——
 * 学员刚学会的词是总览页，一句「请打开 MOC-《书名》」他不知道说的是同一篇。
 */
const MESSAGES = {
    notBookMoc: '「摘成卡片」只能在一本书的总览页上用。先打开那本书文件夹里 MOC- 开头的那一篇。',
    readingMode: '现在是阅读模式，选中的字插件读不到。按 Cmd/Ctrl + E 切回编辑模式，重新选中再试。',
    noSelection: '先选中一段划线，再运行「摘成卡片」。',
    namePrompt: '这张卡片叫什么名字？',
    nameMissing: '未输入卡片名称，操作已取消。',
    nameIllegal: '卡片名称不能包含斜杠或反斜杠。',
    /**
     * 概述这一问的标题必须写明「选填，Esc 跳过」。
     *
     * 建书那三问里 Esc 就是跳过，两条流程隔着几十秒、同属读书模块；
     * 这里若让 Esc 变成「整张卡片作废」，学员会照着刚学会的手势把自己的卡片按没——
     * 而他还得回去重新选中那段划线、重新起名。名称那一问才是取消点，这一问不是。
     */
    descriptionPrompt: '这张卡片讲什么？（选填，Esc 跳过）',
    existsPrefix: '同名卡片已经存在，未执行覆盖：',
    createdPrefix: '卡片已创建：',
    failedPrefix: '摘成卡片失败：',
} as const;

/** 注册「摘成卡片」命令 */
export function registerExcerptCardCommand(ctx: ZiminosContext): void {
    ctx.commands.register(BOOK_COMMANDS.excerpt, () => {
        void excerptCard(ctx);
    });
}

/**
 * 把选中的划线炼成一张卡片：选中 → 卡名 → 概述 → 建卡并打开。
 * 任何一步取消或失败都以中文 Notice 呈现，不留半成品。
 */
async function excerptCard(ctx: ZiminosContext): Promise<void> {
    const { app } = ctx;

    try {
        // ============================================================
        // 1. 守卫：必须站在书的 MOC 上，且选中了文字
        // ============================================================

        const view = app.workspace.getActiveViewOfType(MarkdownView);
        const mocFile = view?.file ?? null;

        if (!view || !mocFile || !isBookMoc(ctx, mocFile)) {
            new Notice(MESSAGES.notBookMoc);

            return;
        }

        const selection = view.editor.getSelection().trim();

        if (!selection) {
            // 阅读模式下鼠标刷中的字不在 editor 里，getSelection 恒为空。
            // 只说「先选中一段划线」等于告诉一个刚刚选过的人他没选——他会反复重选，
            // 而屏幕上没有任何线索指向真正的原因
            new Notice(view.getMode() === 'preview' ? MESSAGES.readingMode : MESSAGES.noSelection);

            return;
        }

        // ============================================================
        // 2. 问卡名与概述：先短问后长答，中途取消损失最小
        // ============================================================

        const nameInput = await new TextInputModal(app, {
            title: MESSAGES.namePrompt,
        }).openAndGetValue();

        if (nameInput === null || !nameInput.trim()) {
            new Notice(MESSAGES.nameMissing);

            return;
        }

        const cardName = nameInput.trim();

        if (/[\\/]/.test(cardName)) {
            new Notice(MESSAGES.nameIllegal);

            return;
        }

        // 概述是选填项，Esc 与留空同义——取消点是上面那一问，不是这一问（理由见文案表）
        const descriptionInput = await new TextInputModal(app, {
            title: MESSAGES.descriptionPrompt,
        }).openAndGetValue();

        // ============================================================
        // 3. 防覆盖并落盘：卡片就住在书的文件夹里
        // ============================================================

        const folderPath = mocFile.parent?.path ?? '';
        const cardPath = normalizePath(
            folderPath ? `${folderPath}/${cardName}.md` : `${cardName}.md`,
        );

        if (app.vault.getAbstractFileByPath(cardPath)) {
            new Notice(MESSAGES.existsPrefix + cardPath);

            return;
        }

        // created 与 UID 必须出自同一时刻；up 按 cardInit 的同一公式拼全路径双链
        const { stamp: created, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);
        const content = excerptCardContent({
            description: (descriptionInput ?? '').trim(),
            created,
            uid,
            upLink: `[[${mocFile.path.slice(0, -3)}|${bookNameOf(mocFile)}]]`,
            quote: selection,
        });

        // 文件带着完整 YAML 出生，写盘前登记自写：自动登记与 updated 维护都不再碰它
        ctx.guard.mark(cardPath);

        const card = await app.vault.create(cardPath, content);

        // ============================================================
        // 4. 打开卡片，光标停在引用块之后的写字位
        // ============================================================

        const leaf = app.workspace.getLeaf(false);

        await leaf.openFile(card, { active: true, state: { mode: 'source' } });

        if (leaf.view instanceof MarkdownView) {
            const editor = leaf.view.editor;
            const lastLine = editor.lineCount() - 1;

            editor.setCursor({ line: lastLine, ch: 0 });
            editor.focus();
        }

        new Notice(MESSAGES.createdPrefix + cardName);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        new Notice(MESSAGES.failedPrefix + message);
    }
}
