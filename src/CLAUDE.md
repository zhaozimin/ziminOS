# src/

> L2 | 父级: ../CLAUDE.md

插件源码根。这一层只有三个文件：main.ts 承担两件事——把「Obsidian 交给我们的运行时」翻译成「模块能用的上下文」并分发出去，以及把彼此需要、却不该互相认识的能力接上线；settings.ts 与 settingsModel.ts 是插件唯一的图形界面，一个回答「怎么画」，一个回答「有什么」。

## 成员清单

main.ts: 插件入口与唯一装配点。loadData 的未知 JSON 先经 normalizeSettings 逐字段验形，再装配 ZiminosContext（app / plugin / settings / saveSettings / 全局唯一的 SelfWriteGuard 与 CommandRegistry）→ 注册 init-vault 命令并在点击时收齐各模块的 VaultSeed → 分发十一个模块 → 装配左侧边栏 → 注册二十二个笔记内视图 → 挂载设置页。calendar 自己挂载 ItemView，main 只注入指定周期与锚点日期的打开能力。十个跨模块函数类型洞（主题、日记、客户开荒、书籍容器、微读连接/断开、外观、边栏、作者名片、日历）都在此接线，模块不反向 import。左侧边栏必须排在全部命令注册之后，它照注册台花名册摆图标；全部事件与定时器经 registerEvent / register 托管。
settings.ts: 设置页 ZiminosSettingTab。七张页与 modules/ 边界同名，一页的骨架固定为页头 → 明面字段 → 自有控件 → 高级折叠。页面只改全局设置并即时落盘；执行开荒、连接/断开微信读书、同步状态栏与边栏显隐、渲染作者名片六项能力由 main 以 SettingActions 对象注入，不反向依赖具体模块。
settingsModel.ts: 设置页的**数据模型**——七张标签页的身份 TABS、全部界面文案 TEXTS、文本框表 TEXT_FIELDS 与面板自持的 BOOK_TAG_PREFIX_FIELD，连同它们的类型。它零渲染代码、零 obsidian 依赖（图标名只是字符串），因此「这个库到底有哪些设置」这个问题读一个文件就能答完。v0.14.0 从 settings.ts 分出来，判据是变更理由不同：加一个设置项、改一句文案、调一次字段顺序动的是这里的表，与渲染无关；改滚动行为、改标签栏样式、改折叠区画法动的是那边的类，与有哪些设置无关。分家的触发点是那条 ≤800 行的约束——它先于人察觉到一个文件在同时干两件事。
core/: 无业务语义的基础设施层，被所有功能模块单向依赖，自己不认识任何模块。V2 起它还含视图引擎的事实层与呈现层。
modules/setup/: 开荒模块，只保证 PARA 骨架与「开荒过没有」这个事实，其余产物由各模块自报 VaultSeed。
modules/projects/: 项目管理模块，建项目、卡片登记与状态流转住在这里。它还供着「一个文件夹 + 一篇 MOC」这套容器流程，项目、领域与书籍三类容器共用它。
modules/books/: 读书笔记模块，一条命令从豆瓣查到书目、建出《书名》容器、把微信读书 / Kindle / 苹果图书三处的划线取回来合并进书的 MOC，再让学员把值得拓展的那几条摘成卡片。它是唯一存网络凭据的模块；日历联网但不登录、不存凭据。v0.14.0 沿「机器查得到的就不该问人」将书的 UID 收口为 ISBN，标签收口为豆瓣分类。
modules/inspiration/: 灵感收集模块，把参考 QuickAdd 脚本移植为 ziminOS 自带命令，生成由独立 Dataview 运行的未完成任务视图，并将文本生成与 Obsidian 写入分离。
modules/calendar/: 中国日历模块，以本地农历换算与 ISO 周为事实层，以 holiday-cn 镜像和内置当年快照为法定休息/调休补丁，以 Dust 式年/季/月独立导航的 ItemView 把日/周/月/季/年点击注入复盘模块的周期笔记入口。
modules/review/: 复盘模块，五级周期笔记、主题链与项目数据五视图。
modules/contacts/: 人脉与客户模块，两类档案、六条命令（人脉两条、客户四条）与十六个视图。
modules/format/: 排版模块，一条整理命令与一个编辑监听，替代学员原本要自己装的 Linter。规则本体住在 core/markdownStyle，本模块只回答「什么时候对哪一篇跑它」；它绝不整理用户正开着的那一篇——中文输入法在合成中途被外部改写会吞字。断环靠 formatMarkdown 幂等而非守卫，因此插件自己插进去的那一行（里面有用户现敲的字）照样会被整理。同样不生产笔记。
modules/appearance/: 外观模块，右下角状态栏的 CSS 片段开关。不生产笔记，也是唯一接触 Obsidian 非公开 API 的地方——那一处接触被关在 snippets.ts 里，声明成可选并带公开 API 兜底。
modules/ribbon/: 左侧边栏模块，二十七个 Pikaicons 图形与「哪几条命令摆出来」。同样不生产笔记；与 appearance 不同的是它全程只用公开 API（addIcon / addRibbonIcon / Command.icon）。
modules/about/: 作者名片模块，官网/教程双域名、海外 GitHub 与大陆 Gitee 双开源主页、四个自媒体频道连同 Simple Icons 品牌图形与头像照片编译进 main.js。同一个渲染函数挂两处：「关于作者」视图（v0.10.0 起住在 README，导航是工位不放署名）与设置页开荒页尾的落款。

## 依赖方向

单向且不可逆：`main.ts → modules/* → core/*`。main 认识所有模块，模块之间彼此不认识、也不认识 main——因此加一个模块只是在 main 里多几行，删一个模块只需删掉那几行。

有十处跨模块需求真实存在：日记主题、记人情、客户开荒、书籍容器、微读连接与断开、外观重绘、边栏重绘、作者名片、日历点击打开周期笔记。它们不被写成模块间直接 import，而是各自声明函数类型作为洞，由 main 在唯一装配点接上。依赖图因此仍是一棵树而不是一张网。

两处显隐同步与其余七处形状相同，动机却不同，值得单独记一笔：其余七处是「模块 A 要用模块 B 的能力」，这两处是「已经画在屏幕上的 DOM 不会自己再问一次设置」。

开荒同样走这条路：modules/setup 只认 VaultSeed 契约，各模块自报诉求，main 收齐后递进去。于是新增一个模块不需要修改开荒代码一行（OCP）。

ZiminosContext 是这条依赖链上唯一的传参形态。模块不接收 Plugin 实例细节、不各自读写 data.json、不自行 new Guard、也不直接调 plugin.addCommand；settings、guard 与 commands 都是全局唯一引用，设置页改完开关，正在监听的模块下次触发时立刻看见新值，中间没有任何同步环节。唯一需要同步环节的是已经渲染出来的东西——状态栏那个按钮与边栏那列图标都不会自己再读一次设置，所以它们是 SettingActions 那六个洞里的两处显隐同步。

命令一律经 ctx.commands 注册，这条纪律是 V3 新加的，理由与 FIELDS 收口同源：命令面板、左侧边栏、设置页三处都要拿这条命令的身份，各自 addCommand 的话，图标与名字迟早在三处对不齐，而对不齐既不报错也没人发现。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
