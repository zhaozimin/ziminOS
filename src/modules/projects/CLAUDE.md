# src/modules/projects/

> L2 | 父级: ../../CLAUDE.md

项目管理模块是 ziminOS 的第一块业务能力，也是后续模块的架构样板。V2 把开荒编排搬去了 modules/setup——它横跨全库骨架并要收齐三个模块的诉求，住在这里是让物理位置对读者说谎；本模块只留下自己那份 seed。三个移植文件（createProject / cardInit / transitions）逐段对应课程原有的三份 QuickAdd 脚本，移植只允许三类替换：inputPrompt → core/modals，QuickAdd 注入的 settings → ZiminosSettings，QuickAdd.obsidian 解构 → 直接 import；其余逻辑连同守卫与错误文案原样保留。

## 成员清单

templates.ts: 纯函数集合，无副作用，全部返回 string。MOC 的 frontmatter 与 base 代码块逐字复刻自原脚本，仅项目名与路径参数化；另供两份手动插入用的模板文件与导航页正文。它是本模块唯一生成文本的地方，其他文件一律不拼字符串。
seed.ts: 本模块面向开荒的窗口，把「两份手动插入用的模板 + 导航页 + 第一个项目」翻译成 VaultSeed 契约。它不申报任何目录：01-projects 与 90-system/Template 属于 PARA 骨架，由笔记库本身保证存在，不因某个模块存在而存在。分出这个薄文件的理由是依赖方向——开荒一旦反过来 import 本模块，「模块之间彼此不认识」就破了，而那条不变式正是「加一个模块只需在 main 多几行」的前提。
createProject.ts: 新建项目命令 create-project，四步——名称 → 归属 → 关联的人 → 概述。这个顺序是设计过的：概述放最后，前面全是点选，中途取消不至于让人白写一段话；归属必须在动土之前问完，客户委托却没选到人时中止，不留半个空文件夹。归属这一问是整条流程里信息量最大的一步，所以选项文案直接把后果写出来——写下 client 等于把那个人注册成客户，三张客户表全靠它过滤，「周六和张三去旅游」这类私人项目必须走 with。候选人住在人脉模块，本文件不 import 它，只声明一个 PersonPicker 的洞由 main 填上。接受可选 preset 让开荒跳过全部问答——但 preset 同样要过名称校验，它源自用户输入，并不比手打的更可信。
cardInit.ts: 卡片登记，命令 init-card 与新建笔记时的自动登记。由路径反推笔记归属哪个 MOC，补齐十个标准字段并写入 up 双链。写盘只走 processFrontMatter 做字段合并，绝不整篇重写；缓存层与 processFrontMatter 回调内各判一次是否已登记，防的是缓存延迟造成的重复写入。
transitions.ts: 四条状态流转命令 project-done/paused/dropped/active。它在同一次写入里落 status 与 **archived**——后者是 V2 补上的缺口，也是复盘「本月完成了哪些项目」唯一可信的时间事实：文件系统时间会被同步、rsync 与批量脚本改写，frontmatter 的 updated 又恰恰被自写抑制挡在门外（归档是插件的动作而非人的编辑），归档时刻若不在这里落笔就再也无处可查，而它的缺失不报错，只是让完成日悄悄落到学员最后一次手打那篇笔记的月份。回滚记原值而非一律删除：重新开始一个已归档项目时若中途失败却把归档日抹了，那篇项目会变成一个没有完成时间的完成项目。TRANSITIONS 状态机把「搬到哪、写什么状态、允许从哪些状态出发」固化成数据，流程本身只剩校验 → 确认 → 搬移改状态 → 重开 → 汇报。校验与写入彻底分家：所有拒绝都发生在动土之前，走到写入即意味着条件已全部成立；写入中途失败则尽力回滚，回滚自身绝不再抛，以免掩盖原始失败原因。它是全模块唯一按子树登记自写的地方：renameFile 搬走一整棵树，Obsidian 随即逐个改写卡片里指向 MOC 的全路径双链，只登记文件夹会让这些改写被 updatedMaintainer 记成用户编辑，一条归档命令污染整个项目的修改历史——抑制范围必须与写入的真实影响面对齐，正反两次搬移都如此。
updatedMaintainer.ts: 全插件唯一常驻的编辑监听，替代原方案里由 Linter 承担的 updated 维护。它与 cardInit 共守同一张卡片——那边写出生字段，这边只碰 updated 一个字段。它最容易失控：写盘本身会再次触发 modify，故必须靠 SelfWriteGuard 断开自激回路，并用 per-file 防抖把连续击键收敛成一次写盘。「只给已有 YAML 的笔记记账、绝不主动注入 YAML」是它对用户的底线承诺；防抖把判定与落盘隔开两秒，因此守卫两头都站：事件到达时判一次决定排不排计划，落盘前再判一次决定这计划还算不算数，而「这篇笔记现在不该记账」还会反过来撤销已排下的旧计划——否则用户刚删掉的 YAML 会在两秒后自己长回来。

## 模块契约

对外只暴露 projectsSeed 与五个 register 函数，由 main.ts 调用；模块内文件之间的调用不外泄。

命令回调一律用 callback 而非 checkCallback：命令在任何笔记上都可见可点，不会凭空消失。至于点下去之后说不说话，两类命令刻意不同——create-project 与四条 transitions 的每一次拒绝都配一句中文 Notice 讲明为什么不行；init-card 则沿用 initialize-card-note.js 的静默放行，不在管辖目录、已登记、是 MOC 本体、无活动文件都直接返回不作声。后者不是疏漏而是移植纪律：原脚本的守卫与文案一字不改，要给它补提示得先在规格里授权。

设置里的目录与时间格式是自由文本，可能被清空或写错，校验责任在读取侧而不在设置页。两者各有唯一守门人：目录经 core/folders 的 normalizeFolderPath，时间格式的空值回落收在 core/time 内部——模块把 settings.dateTimeFormat 原值递进去即可，没有哪个读取点需要、也没机会自己抄一遍兜底。

凡同时写 created 与 UID 的地方一律走 core/time 的 nowStampAndUid：原脚本先取一个 now 再派生两个字段，各取一次会在跨秒边界上让同一篇笔记的两个时间身份差一秒。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
