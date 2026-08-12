# src/

> L2 | 父级: ../CLAUDE.md

插件源码根。这一层只有两个文件，因为它只承担两件事：把「Obsidian 交给我们的运行时」翻译成「模块能用的上下文」并分发出去；以及把彼此需要、却不该互相认识的能力接上线。

## 成员清单

main.ts: 插件入口与唯一装配点。loadData 以默认值打底合并出设置对象 → 装配 ZiminosContext（app / plugin / settings / saveSettings / 全局唯一的 SelfWriteGuard）→ 注册横跨全库的 init-vault 命令并在点击时才收齐各模块的 VaultSeed → 分发五个模块的注册函数 → 注册视图引擎与二十一个视图 → 挂载设置页。它还负责填两个函数类型的洞：记人情需要「拿到今天的日记」，客户模块需要「落一份开荒贡献」，两者都由这里用别的模块的能力接上。全部事件与定时器经 registerEvent / register 托管，故 onunload 无需手写清理。
settings.ts: 设置页 ZiminosSettingTab，五区依学员使用顺序排列——开荒按钮、两个自动化开关、灵感落点、details 折叠的目录与时间格式、静态模块清单。开荒动作由 main 注入而非自己 import，因此加一个参与开荒的模块不会牵动这个文件。页面只改全局设置对象并即时落盘，不持有第二份状态。
core/: 无业务语义的基础设施层，被所有功能模块单向依赖，自己不认识任何模块。V2 起它还含视图引擎的事实层与呈现层。
modules/setup/: 开荒模块，只保证 PARA 骨架与「开荒过没有」这个事实，其余产物由各模块自报 VaultSeed。
modules/projects/: 项目管理模块，建项目、卡片登记与状态流转住在这里。
modules/inspiration/: 灵感收集模块，把参考 QuickAdd 脚本移植为 ziminOS 自带命令，生成由独立 Dataview 运行的未完成任务视图，并将文本生成与 Obsidian 写入分离。
modules/review/: 复盘模块，五级周期笔记、主题链与项目数据五视图。
modules/contacts/: 人脉与客户模块，两类档案、四条命令与十六个视图。

## 依赖方向

单向且不可逆：`main.ts → modules/* → core/*`。main 认识所有模块，模块之间彼此不认识、也不认识 main——因此加一个模块只是在 main 里多几行，删一个模块只需删掉那几行。

V2 有两处跨模块需求真实存在：记人情要往当天日记里写一行，客户模块要按需长出自己的产物。它们没有被写成 import，而是各自声明了一个函数类型（DailyNoteProvider、SeedApplier）作为洞，由 main 用另一个模块的能力填上。依赖图因此仍是一棵树而不是一张网——这是「模块之间彼此不认识」这条不变式在有真实耦合时的兑现方式，不是它的例外。

开荒同样走这条路：modules/setup 只认 VaultSeed 契约，各模块自报诉求，main 收齐后递进去。于是新增一个模块不需要修改开荒代码一行（OCP）。

ZiminosContext 是这条依赖链上唯一的传参形态。模块不接收 Plugin 实例细节、不各自读写 data.json、不自行 new Guard；settings 与 guard 都是全局唯一引用，设置页改完开关，正在监听的模块下次触发时立刻看见新值，中间没有任何同步环节。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
