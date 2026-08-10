# ziminOS

> 一句话：一个能自己开荒的 Obsidian 笔记库——把 PARA 骨架、项目 MOC、卡片登记、归档流转全部交给脚本，人只负责想事情。

---

## 三个角色

ziminOS 不是一个插件，是三样东西咬合在一起。

```
   你  ──说一句话──▶  桌面智能体  ──读──▶  skill/SKILL.md
                          │                （施工手册：怎么装、装到哪、什么时候必须停手）
                          │
                          │ 照着装
                          ▼
                      vault/  笔记库模板
                      （学员拿到手的「家」：PARA 六件套 + 一份新手导游）
                          │
                          │ 家里住着
                          ▼
                      ziminos 插件
                      （管家：开荒 · 建项目 · 登记卡片 · 归档流转）
                       源码在 src/，产物在 vault/.obsidian/plugins/ziminos/main.js
```

**手册**负责把家搭起来，**家**负责收纳，**管家**负责干重复的活。三者各司其职，谁也不越界。

---

## 管家会干什么

七条命令，按 `Cmd + P` 调用：

| 命令 | 干什么 |
| --- | --- |
| 初始化笔记库 | 建 PARA 六个文件夹、两份模板、一张导航页，顺手建好第一个项目 |
| 新建项目 | 建项目文件夹 + 项目 MOC（自带 Base 视图，卡片自动汇总） |
| 初始化当前卡片 | 给当前笔记补齐十字段 YAML，含 17 位 UID 与所属项目链接 |
| 完成项目 / 暂停项目 / 放弃项目 | 改状态，整个项目目录搬进归档 |
| 重新开始项目 | 从归档原样搬回，状态改回进行中 |

两个自动行为（可在设置里关）：

- **新卡片自动登记**——在项目/领域目录里点出一张空白笔记，它自己把字段补齐。
- **updated 自动维护**——已有 YAML 的笔记改动后，更新时间自己刷新。

---

## 设计红线

这三条是产品的地基，不是可选项：

1. **人主导**——插件的一切写入都由用户的命令或用户创建的文件触发。没有定时器，没有后台轮询。
2. **脚本驱动**——同样的输入必然得到同样的结果。插件内**零 AI 调用、零网络请求**。
3. **只用官方 API**——只碰 `obsidian` 包公开导出的东西，不碰任何未公开的内部属性。

AI 参与的地方只有一处：装库那一次，桌面智能体照着 `skill/SKILL.md` 干活。装完它就退场了。

---

## 给学员：怎么装

你不需要懂命令行。把下面这句话，发给你的桌面智能体（Claude Code、Claude 桌面版，或任何能读文件、能操作你电脑的 AI）：

> 按 https://github.com/zhaozimin/ziminOS 里的 `skill/SKILL.md` 帮我搭建 ziminOS 笔记库。

它会问你两件事：库放在哪、叫什么名字。答完就装好了。

装好之后，用 Obsidian 打开那个文件夹，跟着库里的 `README.md` 走三步，一分钟开荒完成。

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
├── docs/
│   └── 设计规格书.md          V1 实施的唯一事实源，实现与它冲突以它为准
├── skill/
│   └── SKILL.md              施工手册，给桌面智能体读
├── vault/                    笔记库模板，学员拿到手的「家」
│   ├── README.md             库内新手导游
│   └── .obsidian/            库配置 + 插件产物（manifest.json / main.js）
├── src/
│   ├── main.ts               插件入口与唯一装配点
│   ├── settings.ts           设置页
│   ├── core/                 底座：常量、类型、时间、目录、frontmatter、弹窗、自写抑制
│   └── modules/projects/     项目管理模块：模板、开荒、建项目、卡片登记、状态流转
└── package.json / tsconfig.json / esbuild.config.mjs
```

`docs/设计规格书.md` 是这个项目的宪法。改代码之前先读它。

---

## License

MIT · Copyright (c) 2026 zhaozimin
