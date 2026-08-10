# ziminOS

> 一句话：一个能自己开荒、随手收灵感、开箱就好看的 Obsidian 笔记库——把 PARA 骨架、项目 MOC、卡片登记、归档流转与灵感收集交给 ziminOS，未完成任务视图交给 Dataview，外观交给独立的 Minimal 与 Style Settings。

> **给桌面智能体：** 如果用户已经创建并命名一个文件夹、用你打开该文件夹后要求按照本仓库搭建个人知识管理系统，立即读取并严格执行 [`skill/SKILL.md`](skill/SKILL.md)。当前工作区就是最终 Obsidian 笔记库；不要询问名称或路径，不要创建子目录，不要在当前工作区克隆本仓库，只把 `vault/` 的内部内容直接铺到当前工作区根目录。

---

## 三个角色

ziminOS 不是一个插件，是三样东西咬合在一起。

```
   你  ──说一句话──▶  桌面智能体  ──读──▶  skill/SKILL.md
                          │                （施工手册：怎么装、装到哪、什么时候必须停手）
                          │
                          │ 照着装
                          ▼
                      vault/  笔记库成品
                      （学员的「家」：系统配置 + 外观包 + 新手导游）
                          │
                          ├─ ziminos 插件：开荒 · 建项目 · 登记卡片 · 归档流转 · 灵感收集
                          ├─ Dataview：灵感集未完成任务的交互视图
                          └─ 外观包：Minimal · Style Settings · 默认配色 · ziminOS CSS
```

**手册**负责把家搭起来，**家**负责收纳，**ziminOS** 负责系统工作流，**Dataview** 负责查询，**外观包**保持独立运行。它们一起交付，但不把第三方代码揉进 ziminOS。

---

## 管家会干什么

八条命令，按 `Cmd + P` 调用：

| 命令 | 干什么 |
| --- | --- |
| 初始化笔记库 | 建 PARA 六个文件夹、两份模板、一张导航页，顺手建好第一个项目 |
| 新建项目 | 建项目文件夹 + 项目 MOC（自带 Base 视图，卡片自动汇总） |
| 初始化当前卡片 | 给当前笔记补齐十字段 YAML，含 17 位 UID 与所属项目链接 |
| 记录灵感 | 弹出一个输入框，把一句话写入指定笔记；默认置顶进入 `00-inbox/灵感集.md` |
| 完成项目 / 暂停项目 / 放弃项目 | 改状态，整个项目目录搬进归档 |
| 重新开始项目 | 从归档原样搬回，状态改回进行中 |

两个自动行为（可在设置里关）：

- **新卡片自动登记**——在项目/领域目录里点出一张空白笔记，它自己把字段补齐。
- **updated 自动维护**——已有 YAML 的笔记改动后，更新时间自己刷新。

「记录灵感」不需要 QuickAdd。灵感集顶部由 Dataview 自动显示并可直接勾选全部未完成任务，下方保留完整历史。设置 → ziminOS → 灵感收集里，可以改文件夹、笔记名称、定位标题、插入位置和单条格式；格式支持 `{{content}}`、`{{date}}`、`{{time}}`、`{{datetime}}`。若想一键呼出，再到设置 → 快捷键给它绑定自己顺手的按键。

---

## 设计红线

这三条是产品的地基，不是可选项：

1. **人主导**——插件的一切写入都由用户的命令或用户创建的文件触发。没有定时器，没有后台轮询。
2. **脚本驱动**——同样的输入必然得到同样的结果。插件内**零 AI 调用、零网络请求**。
3. **只用官方 API**——只碰 `obsidian` 包公开导出的东西，不碰任何未公开的内部属性。

AI 参与的地方只有一处：装库那一次，桌面智能体照着 `skill/SKILL.md` 干活。装完它就退场了。

---

## 给学员：怎么装

你不需要懂命令行。照着四步做：

1. 先创建一个空文件夹，并给它取好名字。这个名字就是你的个人知识管理系统名称。
2. 用桌面智能体打开这个文件夹，让它在这个文件夹中工作。
3. 把下面这句话发给它：

   > 按 https://github.com/zhaozimin/ziminOS 里的 `skill/SKILL.md`，在当前工作区搭建我的个人知识管理系统。

4. 安装完成后，直接用 Obsidian 打开同一个文件夹。

智能体不会再问名称或安装路径，也不会创建另一层文件夹。它会在工作区外临时读取仓库，只把真正有用的笔记库内容放进当前文件夹；你不会看到 `src`、`docs`、`package.json` 等开发文件，也不需要安装 Node、QuickAdd 或 Linter。Dataview、Minimal、Style Settings、默认配色和 CSS 已经在成品库中。之后跟着笔记库里的 `README.md` 走三步，一分钟开荒完成。

请使用 Obsidian 1.13.0 或更高版本。

想学得更系统：**https://edu.zhaozimin.com**

---

## 给开发者：怎么构建

```bash
npm install
npm run build
```

`npm run build` = `tsc --noEmit`（严格模式类型检查）+ esbuild 打包。产物直接落在 `vault/.obsidian/plugins/ziminos/main.js`——**构建即就位**，没有中间同步脚本，也没有 dist 目录。

开发时用 `npm run dev`，watch 模式 + inline sourcemap，改完文件在 Obsidian 里重载插件即可。

产物**刻意提交入库**（不进 `.gitignore`），这样学员拿到仓库就能直接用，不需要装 Node。

代码规约：TypeScript 严格模式、注释中文、单文件 ≤ 800 行、禁 `console.log`（用户可见反馈一律走 `Notice`）、常量统归 `src/core/constants.ts`。每个业务文件带 GEB L3 头部契约。

---

## 目录导览

```
ziminOS/
├── CLAUDE.md                 GEB L1 项目宪法：全局地图与技术栈
├── README.md                 你正在看的这份
├── LICENSE                   MIT
├── .gitattributes            保护第三方发布资产的原始校验值
├── docs/
│   ├── 设计规格书.md          V1 实施的唯一事实源，实现与它冲突以它为准
│   └── 第三方组件.md          Dataview 与外观包的版本、来源、校验和升级边界
├── skill/
│   └── SKILL.md              施工手册，给桌面智能体读
├── vault/                    笔记库模板，学员拿到手的「家」
│   ├── README.md             库内新手导游
│   └── .obsidian/            库配置 + ziminOS + Dataview + Minimal + Style Settings + CSS
├── src/
│   ├── main.ts               插件入口与唯一装配点
│   ├── settings.ts           设置页
│   ├── core/                 底座：常量、类型、时间、目录、frontmatter、弹窗、自写抑制
│   ├── modules/projects/     项目管理模块：模板、开荒、建项目、卡片登记、状态流转
│   └── modules/inspiration/  灵感收集模块：输入、格式渲染与四种安全插入方式
└── package.json / tsconfig.json / esbuild.config.mjs
```

`docs/设计规格书.md` 是这个项目的宪法。改代码之前先读它。

---

## License

ziminOS：MIT · Copyright (c) 2026 zhaozimin。

随库交付的 Dataview 与 Minimal 为 MIT，Style Settings 为 GPL-3.0；完整来源、版本、校验值与许可证见 [`docs/第三方组件.md`](docs/%E7%AC%AC%E4%B8%89%E6%96%B9%E7%BB%84%E4%BB%B6.md)。
