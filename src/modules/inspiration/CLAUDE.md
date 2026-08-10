# src/modules/inspiration/

> L2 | 父级: ../../CLAUDE.md

灵感收集模块把课程里的 QuickAdd User Script 收进 ziminOS 自身：用户仍通过命令显式触发，成品库不安装 QuickAdd；Dataview 作为独立锁定组件消费模块生成的 DQL 查询。模块只写用户在设置页指定的一篇 Markdown，路径、定位与格式全部运行时读取，不另存配置。

## 成员清单

capture.ts: 唯一副作用编排器。注册 capture-inspiration 命令，用 core/modals 收集一行输入，经设置解析出安全目标路径；目标不存在则逐级建目录并播种带 Dataview 查询的笔记，存在则用 Vault.process 原子更新。所有写入先经全局 SelfWriteGuard 标记，错误只转成中文 Notice。
templates.ts: 纯文本引擎。负责压缩用户输入、规范化 Markdown 标题与格式模板、替换 content/date/time/datetime 白名单变量、按自定义目标路径生成 Dataview 未完成任务查询，并用任务继承的 file.mtime 在分组标题显示真实最后更新时间，不为灵感集强制注入 YAML；同时承担标题头尾/正文头尾四种插入算法。新笔记固定“首行标题 + 第二行 Dataview”，v0.3.0 旧布局在下次显式收集时只对与已知系统查询字节完全相等的页眉换位，并升级 mtime 分组；正文顶部会越过完整 YAML、系统标题与 Dataview 页眉，缺标题或围栏未闭合时拒绝返回新文本。

## 依赖方向

`main.ts → capture.ts → templates.ts + core/*`。templates 不认识 Obsidian 与磁盘，capture 不认识项目管理模块；两个业务模块只在 main 装配点相遇。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
