# src/core/

> L2 | 父级: ../CLAUDE.md

基础设施层。判断一个文件该不该住在这里只有一条标准：它是否谈论「项目」「卡片」「归档」这类业务概念——谈了就属于 modules，不谈才留在 core。因此 core 可以被任意数量的未来插件模块（人脉管理、日记复盘）复用而不必改动一行；外观包属于 vault 交付物，不依赖插件 core。

## 成员清单

constants.ts: 全仓库唯一常量源，零 import，是依赖图最底层的叶子。PARA 目录骨架、系统笔记路径、卡片十字段序、时间格式、自写窗口、项目生命周期状态机 TRANSITIONS 都在此。规格禁魔法字符串，任何目录名字段名状态名都必须从这里取。
types.ts: 契约层。ZiminosSettings 定义可持久化的七项设置与 DEFAULT_SETTINGS，ZiminosContext 定义模块获取能力的唯一形态。它是模块与装配点之间的接缝，改这里等于改所有模块的调用约定。
time.ts: 时间口径统一处，也是 dateTimeFormat 的守门人。原始三份脚本存在手写 padStart 与 moment 两套实现，此处收敛为 moment 一种（输出字符串完全一致，属消重非行为改变）。设置页刻意不校验，空值回落因此收在本文件内部而不外露：调用方递原始设置值进来即可，没有哪个读取点能绕过或忘记它——否则空串会让 moment 改用 ISO 默认格式，同一个库里分叉出两种时间写法。nowStampAndUid 承载原脚本「一个时刻派生 created 与 UID」的原子性，凡要同时写这两个字段的地方一律走它，分两次取时间会在跨秒边界上让同一张卡片的两个时间身份差一秒。全仓库禁止就地 new Date 拼时间，否则 dateTimeFormat 设置将形同虚设。
folders.ts: 目录保障。ensureFolderPath 逐级创建并在同名文件挡路时抛出明确错误；normalizeFolderPath 把用户在设置页敲进去的自由文本收敛成可用路径，空值回落默认——校验集中在读取侧，是设置页敢于不做校验的前提。
frontmatter.ts: YAML 字段判定与重排。hasValue / isCardInitialized / reorderFrontmatter 决定「一篇笔记算不算已登记的卡片」；isMocFrontmatter 是规格授权的一处刻意偏离，把 MOC 判据从 type ∈ {project, area} 放宽为 type 有值，否则 type: book 的 MOC 会被误当卡片改写。
modals.ts: 唯一人机问答通道，取代原脚本对 QuickAdd inputPrompt 的依赖。把弹窗生命周期翻译成 Promise：有输入返回文本，取消返回 null，调用方因此能用一条 if 中止流程。
guard.ts: 自激循环断路器。插件的自动化监听 vault 事件，而插件自己的写盘同样触发这些事件——所有写路径动手前 mark，所有监听动手前问 isRecent，两端配合把「机器的动作」与「人的动作」区分开。isRecent 遍历时顺手清过期项，不另起定时器，守住「无后台轮询」红线。

## 内部依赖

constants 零依赖；其余六个文件只允许依赖 constants 与 obsidian，彼此之间除 types 引用 guard 的类型外不产生横向依赖，故 core 内部无环。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
