/**
 * [INPUT]: 依赖 core/modals 的 ChoiceModal、core/constants 的 FIELDS 与 Obsidian App/TFile/Notice。
 * [OUTPUT]: 提供 PersonPicker 与 requestProjectOwnership，返回归属结果或取消。
 * [POS]: 项目归属问答的唯一入口。新建与类型转换共享三选项、选人及客户必答规则。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Notice } from 'obsidian';
import type { App, TFile } from 'obsidian';
import { FIELDS } from '../../core/constants';
import { ChoiceModal } from '../../core/modals';
import type { ProjectRelation } from './templates';

/**
 * 「从库里选一个人」这项能力，由 main 在装配时注入。
 * 建项目要问「这是谁委托的」，而候选人住在人脉模块——本文件因此不 import 那个模块，只声明这个洞。
 *
 * 它曾经还带一个「库里没人时要不要吭声」的开关，V3 随归属三选项一起拆掉了：
 * 那个开关只为「自己独做但顺口问一句同行者」那条路存在，而现在会走到这里的每一次调用，
 * 都是用户刚刚明确表示要挂一个人——库里一个档案都没有时，那句话必须说。
 */
export type PersonPicker = (title: string) => Promise<TFile | null>;

/** 一个归属选项要挂的人。「自己做」没有这一项——这正是它与另外两项的全部区别 */
interface OwnershipLink {
    /** 写进 frontmatter 的字段：FIELDS.client 或 FIELDS.with */
    readonly field: string;
    /** 选人弹窗的标题 */
    readonly ask: string;
    /** 没选到人时是不是就不该建这个项目 */
    readonly required: boolean;
}

/** 一个归属选项：一句给人看的话，加上「要不要挂人、挂哪个字段」 */
interface OwnershipOption {
    readonly label: string;
    readonly link?: OwnershipLink;
}

/**
 * 项目归属的三个选项。
 *
 * 这一问是整条流程里信息量最大的一步，所以选项文案直接把后果写出来。
 *
 * 三个而不是两个，是 V3 修掉的一处自相矛盾：此前只有「自己的项目」与「客户委托的」，
 * 而选了「自己的项目」之后仍会弹一次「和谁一起做？（自己独做就按 Esc 跳过）」——
 * 标签刚说完这是自己的项目，下一屏就问你还有谁，用户只能靠按 Esc 来表达「真的只有我」。
 * 一个必须靠取消才能走完的流程，是在拿取消键当确认键使。
 * 拆开之后，「要不要挂人」由用户在同一屏里一次答完：自己做就直接进下一步，
 * 而「和别人一起做」与「客户委托的」才会弹选人。
 *
 * 后两项分家的理由不是分类癖：client 是商业契约标记，写下它等于把那个人注册成客户，
 * 三张客户表全靠它过滤；「周六和张三去旅游」这类私人项目必须走 with，
 * 否则朋友会被无声注册成客户、项目会挂进「我还欠谁的交付」，结案后还会污染案例库的选题统计。
 * 两者的必答性也不同：客户委托却没选到人就不该建这个项目——一笔没有债主的交付债务毫无意义；
 * 而一起做的人没选到，项目照建，只是少挂一条 with，那不影响这个项目成立。
 */
const OWNERSHIP: readonly OwnershipOption[] = [
    { label: '自己做（只有我，不挂任何人）' },
    {
        label: '和别人一起做（写 with，不算客户）',
        link: { field: FIELDS.with, ask: '和谁一起做？', required: false },
    },
    {
        label: '客户委托的（写 client，我欠他一个交付）',
        link: { field: FIELDS.client, ask: '这是谁委托的？', required: true },
    },
];

/** 归属和客户未确认时返回 null；自己做返回空对象。 */
export async function requestProjectOwnership(
    app: App,
    pickPerson?: PersonPicker,
    cancelWithoutPerson = false,
): Promise<{ relation?: ProjectRelation } | null> {
    const ownership = await new ChoiceModal(app, {
        title: '这个项目是谁的？',
        items: OWNERSHIP,
        labelOf: (item) => item.label,
    }).openAndGetChoice();
    if (!ownership) {
        new Notice('未选择项目归属，操作已取消。');
        return null;
    }
    if (!ownership.link) return {};
    if (!pickPerson) {
        new Notice('选人能力尚未就绪，操作已取消。');
        return null;
    }
    const { field, ask, required } = ownership.link;
    const person = await pickPerson(ask);
    if ((required || cancelWithoutPerson) && !person) {
        new Notice(required ? '未选择客户，操作已取消。' : '未选择协作者，操作已取消。');
        return null;
    }
    return person ? { relation: {
        field,
        target: `${person.path.replace(/\.md$/i, '')}|${person.basename}`,
    } } : {};
}
