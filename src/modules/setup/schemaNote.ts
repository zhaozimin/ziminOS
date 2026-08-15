/**
 * [INPUT]: 依赖 core/constants 的 FIELDS/NOTE_TYPES/CONTACT_TIERS/CONTACT_DIRECTIONS
 * [OUTPUT]: 对外提供 schemaNoteContent（属性类型示例笔记的正文），纯函数无副作用
 * [POS]: 属性注册表的人类可读面。真正决定属性面板显示什么控件的是随库交付的
 *        `.obsidian/types.json`——Obsidian 读它，不读任何笔记；本文件生成的是给人看的那一份。
 *        两者必须同时改：改了类型却没改这里，学员照着示例填出来的值就与控件对不上。
 *        示例笔记刻意住在 90-system 且 type 取一个不在封闭枚举内的值——
 *        任何一个视图都靠 type 认身份，若这里写 type: person，
 *        这篇示例自己就会变成人脉名录里的一个人、投喂名单上的一张嘴。
 *        每一类型给一个真实可抄的样例，是因为「空字段」在属性面板里一律显示成文本：
 *        学员看到的第一眼决定他会不会以为系统坏了
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import {
    CONTACT_DIRECTIONS,
    CONTACT_TIERS,
    FIELDS,
    NOTE_TYPES,
} from '../../core/constants';

/** 示例笔记自报的身份。刻意不在 NOTE_TYPES 里，好让全部视图都认不出它 */
const SAMPLE_TYPE = '示例';

/**
 * 属性类型示例笔记的正文。
 *
 * frontmatter 里每个属性都带一个格式正确的样例值——它既是给 Obsidian 看的类型证据，
 * 也是给学员看的填写范本；正文按类型分五块，每块讲清「什么样的信息归这一类」。
 */
export function schemaNoteContent(created: string, uid: number): string {
    const frontmatter = [
        '---',
        `${FIELDS.aliases}:`,
        '  - 属性说明',
        `${FIELDS.description}: 全部笔记属性各出现一次，照着它填就不会错`,
        `${FIELDS.created}: ${created}`,
        `${FIELDS.updated}: ${created}`,
        `${FIELDS.tags}:`,
        '  - 系统',
        `${FIELDS.uid}: ${uid}`,
        `${FIELDS.type}: ${SAMPLE_TYPE}`,
        `${FIELDS.status}: active`,
        `${FIELDS.up}:`,
        '  - "[[导航]]"',
        `${FIELDS.rating}: 5`,
        `${FIELDS.author}:`,
        '  - 赵子民',
        `${FIELDS.source}: https://edu.zhaozimin.com`,
        `${FIELDS.archived}: 2026-12-31`,
        `${FIELDS.client}: "[[某位客户]]"`,
        `${FIELDS.with}: "[[某位同行者]]"`,
        `${FIELDS.theme}: 今天主要做了什么，一句话`,
        `${FIELDS.periodStart}: 2026-01-01`,
        `${FIELDS.tier}: ${CONTACT_TIERS[1]}`,
        `${FIELDS.direction}: ${CONTACT_DIRECTIONS[0]}`,
        `${FIELDS.gift}: true`,
        `${FIELDS.address}: 张三 138-0000-0000 北京市朝阳区示例路 1 号 2 单元 301`,
        `${FIELDS.get}:`,
        '  - 装修',
        '  - 本地人脉',
        `${FIELDS.birthday}: 1985-08-15`,
        `${FIELDS.contact}: 微信 demo_wangwu`,
        `${FIELDS.homepage}: https://example.com`,
        '---',
    ].join('\n');

    return [
        frontmatter,
        '',
        '# 属性类型示例',
        '',
        '> 这篇笔记不是给你写东西用的，是**一张对照表**。',
        '> 上面的属性框里，每一个属性都填了一个格式正确的样例——想知道某个属性该怎么填，回来照抄。',
        '> 类型本身由笔记库自带的配置决定，你不需要手动去改任何一个属性的类型。',
        '',
        '## 📝 文本：一句话、一个词、一个链接',
        '',
        '| 属性 | 装什么 | 样例 |',
        '|---|---|---|',
        `| \`${FIELDS.description}\` | 一句话披露：这篇里有什么 | 装修公司老板，本地资源多 |`,
        `| \`${FIELDS.source}\` | 这东西从哪来 | 网址、书名、认识的场合 |`,
        `| \`${FIELDS.type}\` | 身份登记，封闭取值 | ${Object.values(NOTE_TYPES).join(' / ')} |`,
        `| \`${FIELDS.status}\` | 有终点之物的过程状态 | active / paused / done / dropped |`,
        `| \`${FIELDS.tier}\` | 联系节奏 | ${CONTACT_TIERS.join(' / ')} |`,
        `| \`${FIELDS.direction}\` | 关系位势 | ${CONTACT_DIRECTIONS.join(' / ')} |`,
        `| \`${FIELDS.address}\` | 整串寄件信息，照抄就能填快递单 | 收件人 + 电话 + 地址 |`,
        `| \`${FIELDS.contact}\` | 客户的联系方式 | 微信号 / 手机号 / 平台账号 |`,
        `| \`${FIELDS.homepage}\` | 客户的主页 | 一个网址 |`,
        `| \`${FIELDS.theme}\` | 复盘主题：对一天/一周的**结论** | 今天主要做了什么 |`,
        `| \`${FIELDS.client}\` | 他委托的（我欠一个交付） | \`"[[张三]]"\` |`,
        `| \`${FIELDS.with}\` | 和他一起做的（无交付债务） | \`"[[张三]]"\` |`,
        '',
        `> [!warning] \`${FIELDS.client}\` 与 \`${FIELDS.with}\` 不能互换`,
        `> 写下 \`${FIELDS.client}\` 等于宣告「我欠这个人一个交付」，客户名录直接用它反推身份。`,
        `> 朋友一起做的事必须走 \`${FIELDS.with}\`，否则朋友会被无声注册成客户。`,
        '',
        '## 🕐 日期和时间：机器的记账',
        '',
        '| 属性 | 装什么 | 样例 |',
        '|---|---|---|',
        `| \`${FIELDS.created}\` | 诞生时刻，建笔记时自动填 | 2026-08-12 09:30:00 |`,
        `| \`${FIELDS.updated}\` | 最后一次改动，自动维护 | 2026-08-12 21:15:00 |`,
        '',
        '这两个不用你管：`created` 建笔记时写一次就不再变，`updated` 由插件在你停手两秒后自动记。',
        '',
        '## 📅 日期：只到天，不带时间',
        '',
        '| 属性 | 装什么 | 样例 |',
        '|---|---|---|',
        `| \`${FIELDS.birthday}\` | 生日，本月生日表靠它 | 1985-08-15 |`,
        `| \`${FIELDS.archived}\` | 归档时刻，由「完成项目」命令写 | 2026-12-31 |`,
        `| \`${FIELDS.periodStart}\` | 复盘周期的第一天，建复盘笔记时自动算 | 2026-01-01 |`,
        '',
        '## 🔢 数字：能排序、能求和的量',
        '',
        '| 属性 | 装什么 | 样例 |',
        '|---|---|---|',
        `| \`${FIELDS.uid}\` | 机器主键，14 位时间戳，改名也不变；读书笔记是那本书的 ISBN | ${uid} |`,
        `| \`${FIELDS.rating}\` | 我给它打几分 | 1 到 5 |`,
        '',
        `> [!note] \`${FIELDS.uid}\` 为什么是 14 位而不是 17 位`,
        '> 数字类型有个硬上限：超过 16 位就会被悄悄四舍五入，值变了还不报错。',
        '> 14 位（年月日时分秒）刚好稳稳在安全线内，所以主键取 14 位。',
        '> 读书笔记是唯一的例外：书自带 ISBN 这个全世界通用的号（13 位，同样在安全线内），',
        '> 再发一个只有这个库认得的时间戳，等于给同一本书造两个主键。豆瓣没登记书号时才退回时间戳。',
        '',
        '## 📋 列表：可以有好几个',
        '',
        '| 属性 | 装什么 | 样例 |',
        '|---|---|---|',
        `| \`${FIELDS.aliases}\` | 别的叫法，输入 \`[[\` 时也能搜到 | 昵称、拼音、英文名 |`,
        `| \`${FIELDS.tags}\` | 横切主题词 | 不装类型、不装归属、不装状态 |`,
        `| \`${FIELDS.up}\` | 我属于谁：卡片→项目，人→圈子 | \`[[某个 MOC]]\` |`,
        `| \`${FIELDS.author}\` | 外部内容的原作者 | 可以有好几位 |`,
        `| \`${FIELDS.get}\` | 他能给我什么 | 装修、本地人脉 |`,
        '',
        '## ☑️ 勾选框：是或否',
        '',
        '| 属性 | 装什么 |',
        '|---|---|',
        `| \`${FIELDS.gift}\` | 愿不愿意持续在他身上花钱花心思。勾上即进「投喂名单」 |`,
        '',
        '---',
        '',
        '## 这篇笔记为什么不会污染任何统计',
        '',
        `全部视图都靠 \`${FIELDS.type}\` 认身份。这篇的 \`${FIELDS.type}\` 是 \`${SAMPLE_TYPE}\`，`,
        `不在系统认得的取值里（${Object.values(NOTE_TYPES).join(' / ')}），所以它谁也不像——`,
        '它不会出现在人脉名录、投喂名单、项目看板或任何一张表里。',
        '',
        '你可以放心把它留着当对照表；真不想要了，删掉也不影响任何功能。',
        '',
    ].join('\n');
}
