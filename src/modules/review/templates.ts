/**
 * [INPUT]: 依赖 core/constants 的 PERIODS/FIELDS/NOTE_TYPES/VIEW_BLOCK_LANG 与 PeriodDefinition/PeriodKey，
 *          依赖 core/time 的 nowStampAndUid 与 periodNeighbours
 * [OUTPUT]: 对外提供 periodNoteContent（生成某一级复盘笔记的完整正文）与 viewBlock（生成视图代码块）
 * [POS]: 复盘模块唯一生成文本的地方，纯函数无副作用。五级模板逐字承接课程里已实跑验证的
 *        Templater 版本，只做两处刻意删改：其一，天气块整体删除——它要 fetch 三个外部接口，
 *        而「插件内零网络请求」是红线，location/weather/temperature 三个字段一并移除不留空键；
 *        其二，theme 建笔记时留空。theme 是对一天的结论，早上答不出来，
 *        且实测强制弹自由文本会得到 34/34 篇「123123」类垃圾——垃圾能通过一切非空校验并
 *        作为事实进入汇总表，比空值有害得多。改由「写复盘主题」命令在傍晚回填
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { DIARY_LOG_HEADING, FIELDS, PERIODS, VIEW_BLOCK_LANG } from '../../core/constants';
import type { PeriodDefinition, PeriodKey } from '../../core/constants';
import { nowStampAndUid, periodNeighbours, periodStartOf } from '../../core/time';

/** 代码块围栏。写在单引号里，免得与 TypeScript 模板字符串的反引号打架 */
const FENCE = '```';

/**
 * 生成一个视图代码块。
 * 模板与文档里的每一处代码块都从这里出，学员笔记里的写法因此永远与引擎认的写法一致。
 */
export function viewBlock(name: string, params?: Readonly<Record<string, string>>): string {
    const lines = [name];

    for (const [key, value] of Object.entries(params ?? {})) {
        lines.push(`${key}: ${value}`);
    }

    return `${FENCE}${VIEW_BLOCK_LANG}\n${lines.join('\n')}\n${FENCE}`;
}

/**
 * 生成某一级复盘笔记的完整正文。
 *
 * 标题即文件名，导航行由标题推算——因此一篇笔记只要名字对，它在时间轴上的位置就是对的，
 * 不需要任何额外字段来记住「我是哪一周」。
 */
export function periodNoteContent(
    period: PeriodDefinition,
    title: string,
    dateTimeFormat: string,
): string {
    const { stamp, uid } = nowStampAndUid(dateTimeFormat);
    const parent = period.parent ? PERIODS[period.parent] : null;
    const neighbours = periodNeighbours(period, title, parent);

    const frontmatter = [
        '---',
        `${FIELDS.created}: ${stamp}`,
        `${FIELDS.updated}:`,
        `${FIELDS.uid}: "${uid}"`,
        `${FIELDS.type}: ${period.type}`,
        // 日记刻意没有 period_start：文件名就是日期，多一个字段等于给同一件事两个事实源
        ...(period.key === 'daily'
            ? []
            : [`${FIELDS.periodStart}: ${periodStartOf(period, title) ?? ''}`]),
        `${FIELDS.theme}:`,
        '---',
    ].join('\n');

    const navigation = neighbours
        ? `<< [[${neighbours.prev}]] | [[${neighbours.next}]] >>${
              neighbours.parent ? `　↑ [[${neighbours.parent}|${period.parentAlias}]]` : ''
          }`
        : '';

    return [frontmatter, '', `# ${title}`, '', navigation, '', bodyOf(period.key), ''].join('\n');
}

// ============================================================
// 各级正文
// ============================================================

/**
 * 五级正文。
 *
 * 左边一句话是人写的，右边全部自动，两者并排才构成一次复盘——
 * 所以每一级都是「手写小节 + 自动视图」的交替，而不是一堆表格。
 * 手写小节里的提问用 %% 注释包住：它在阅读模式下不显示，不占版面，
 * 但学员一进编辑模式就看得见，等于把复盘方法论贴在了工位上。
 */
function bodyOf(key: PeriodKey): string {
    if (key === 'daily') {
        return [
            DIARY_LOG_HEADING,
            '',
            '%% 一行一件事，写过程。结论写进 frontmatter 的 theme——傍晚用命令「写复盘主题」回填。',
            '周复盘只看 theme，这里是给你自己回想用的。',
            '提到人就挂双链，三种写法自动分流到他的档案：',
            '　事件：和 [[张三]] 谈定一起投一家网咖',
            '　待办：- [ ] 出网咖投资方案给 [[张三]]',
            '　人情：- [[张三]]｜去｜送了半斤生普｜两清 %%',
            '',
            '- ',
            '',
            '## 今日产出（自动）',
            '',
            viewBlock('今日产出'),
        ].join('\n');
    }

    if (key === 'weekly') {
        return [
            '## 本周复盘',
            '',
            '%% 对着下面两张自动表回答，一问一段：',
            '1. 七天的主题连起来，我这周真正在推进的是什么？和 frontmatter 里写的 theme 一致吗？',
            '2. 哪一天偏离了主线？为什么？',
            '3. 下周只改一件事，改什么？ %%',
            '',
            '## 本周每日主题（自动）',
            '',
            viewBlock('主题链', { 范围: '周' }),
            '',
            '## 本周项目动态（自动）',
            '',
            viewBlock('项目动态', { 范围: '周' }),
        ].join('\n');
    }

    if (key === 'monthly') {
        return [
            '## 本月复盘',
            '',
            '%% 月度看结果，不看过程：',
            '1. 几条周主题连起来，这个月真正完成的是什么？和 theme 一致吗？',
            '2. 完成的项目里，哪一个最值得复盘？为什么是它？',
            '3. 下月唯一优先级是什么？为它砍掉什么？ %%',
            '',
            '## 本月完成的项目（自动）',
            '',
            viewBlock('完成的项目', { 范围: '月' }),
            '',
            '## 本月每周主题（自动）',
            '',
            viewBlock('主题链', { 范围: '月' }),
        ].join('\n');
    }

    if (key === 'quarterly') {
        return [
            '## 季度复盘',
            '',
            '%% 季度看系统，不看事件：',
            '1. 三个月的主题连起来，主线是在推进还是在漂移？',
            '2. 完成的项目里，有多少是季初就打算做的？偏离说明了什么？',
            '3. 下季度的战略取舍：做什么、坚决不做什么？ %%',
            '',
            '## 本季每月主题（自动）',
            '',
            viewBlock('主题链', { 范围: '季' }),
            '',
            '## 本季完成的项目（自动）',
            '',
            viewBlock('完成的项目', { 范围: '季' }),
        ].join('\n');
    }

    return [
        '## 年度复盘',
        '',
        '%% 一年只回答四个问题：',
        '1. 十二个月的主题连起来，今年的主线是什么？和年初写下的一致吗？',
        '2. 三大得——哪三件事最值得？共同成因是什么？',
        '3. 三大失——哪三件事最亏？教训各一句。',
        '4. 明年主题定什么？它要求我成为什么样的人？ %%',
        '',
        '## 年度项目全景（自动）',
        '',
        viewBlock('年度全景'),
        '',
        '## 十二个月的主题（自动）',
        '',
        viewBlock('主题链', { 范围: '年' }),
    ].join('\n');
}
