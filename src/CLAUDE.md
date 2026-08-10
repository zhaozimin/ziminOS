# src/

> L2 | 父级: ../CLAUDE.md

插件源码根。这一层只有两个文件，因为它只承担一件事：把「Obsidian 交给我们的运行时」翻译成「模块能用的上下文」，然后把上下文分发出去。

## 成员清单

main.ts: 插件入口与唯一装配点。loadData 以默认值打底合并出设置对象 → 装配 ZiminosContext（app / plugin / settings / saveSettings / 全局唯一的 SelfWriteGuard）→ 注册横跨全库的 init-vault 命令 → 装配项目管理与灵感收集注册函数 → 挂载设置页。全部事件与定时器经 registerEvent / register 托管，故 onunload 无需手写清理。
settings.ts: 设置页 ZiminosSettingTab，五区依学员使用顺序排列——开荒按钮、两个自动化开关、灵感文件夹/笔记名/标题/插入位置/格式、details 折叠的项目目录与时间格式、静态模块清单。页面只改全局设置对象并即时落盘，不持有第二份状态。
core/: 无业务语义的基础设施层，被所有功能模块单向依赖，自己不认识任何模块。
modules/projects/: 项目管理模块，开荒、建项目、卡片登记与状态流转住在这里。
modules/inspiration/: 灵感收集模块，把参考 QuickAdd 脚本移植为 ziminOS 自带命令，生成由独立 Dataview 运行的未完成任务视图，并将文本生成与 Obsidian 写入分离。

## 依赖方向

单向且不可逆：`main.ts → modules/* → core/*`，`core` 内部只允许依赖 constants。main 认识所有模块，模块之间彼此不认识、也不认识 main——因此加一个模块只是在 main 里多一行注册调用，删一个模块只需删掉那一行。

ZiminosContext 是这条依赖链上唯一的传参形态。模块不接收 Plugin 实例细节、不各自读写 data.json、不自行 new Guard；settings 与 guard 都是全局唯一引用，设置页改完开关，正在监听的模块下次触发时立刻看见新值，中间没有任何同步环节。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
