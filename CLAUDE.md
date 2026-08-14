# ziminOS - 让零基础学员一键长出能管项目、收灵感、记读书划线、经营人脉、逐级复盘且带完整外观的 Obsidian 个人知识管理系统

TypeScript 7.0 + esbuild 0.28 + Obsidian API 1.13（manifest minAppVersion 1.13.0）+ Dataview 0.5.68 + Minimal 9.0.2 + Style Settings 1.0.9 + Pikaicons（图标，MIT，编译进 main.js）

三条红线贯穿全仓库：人主导（一切写入由用户命令或用户建的文件触发，无定时器、无轮询）、脚本驱动（插件内零 AI 调用，同输入同结果）、只用官方公开 API。

**第二条红线在 v0.13.0 被用户明令放宽：允许联网、允许登录。** 原文是「零网络请求」，代价是学员为了一本书要操作三步——豆瓣插件建档、划线插件导出、再手工把划线复制粘贴进 MOC。用户的判决是：那三步里有两步是机器该干的活儿，把它们留给人不是克制，是失职。放宽只对读书笔记这一个模块生效，且只用于两件事：查书目（豆瓣）与取本人划线（微信读书）。其余模块仍然零网络；「同输入同结果」在本机来源（苹果图书 SQLite、Kindle 的 My Clippings）上原样成立，网络来源则如实告知失败原因而不是装作没有数据。

第二条红线最硬的一次兑现是读书笔记（v0.12.0）：微信读书、Kindle、苹果图书与豆瓣的同步插件全走各家私有网络接口，因此一个都不集成、一个都不捆绑；ziminOS 只认这三家**官方的纯文本导出**，学员复制、粘贴、确认，插件解析与合并。豆瓣同理——书籍详情留一个「书籍信息」小节当落点，装了豆瓣插件它是加速器，不装就手抄一行，主线不断。

<directory>
docs/ - 设计规格与第三方组件锁定记录；代码、交付物与规格必须同步
fonts/ - 四款阅读字体的锁定资产 (4子目录: 文楷 GB 屏幕版＝默认正文、思源宋体 CN、朱雀仿宋、新晰黑＋)；OFL×3 + IPA×1 许可随行，安装时装进用户级字体目录，笔记库内零字节
skill/ - SKILL.md 桌面智能体交付契约；当前工作区就是用户已命名的笔记库，源码只在外部临时目录施工
vault/ - 笔记库成品模板；同一交付物内独立放置 ziminOS、Dataview、Minimal、Style Settings、默认配色与自有 CSS
vault/.obsidian/plugins/ziminos/ - 插件安装位；manifest.json 是版本号事实源，main.js 是刻意入库的构建产物（二十七个图形与五个品牌 logo 的 SVG 也在里面），styles.css 是二十二个视图的三线表与待办样式、外加外观开关浮层、设置页那八张标签页与作者名片（手工维护，不经 esbuild）
vault/.obsidian/snippets/ - 十二个 CSS 片段，外观包的可拆装部分；十个默认启用，全部由右下角外观开关逐个开关。appearance.json 的 enabledCssSnippets 是它们开着还是关着的唯一事实源
src/ - 插件源码 (2子目录: core 无业务的基础设施、命令注册台与视图引擎、modules 含 setup 开荒、projects 项目领域与容器流程、books 读书笔记与划线导入、inspiration 灵感收集、review 五级复盘、contacts 人脉与客户、appearance 外观开关、format 排版整理、ribbon 左侧边栏命令、about 作者名片)
</directory>

<commands>
二十九条命令，身份（id / 中文名 / 图标 / 分组）全在 src/core/commands.ts，一律经 CommandRegistry 注册——它在交给 Obsidian 的同时留一份花名册，左侧边栏与设置页照着它摆，三处因此不可能对不齐。默认七条摆进左侧边栏（新建项目、记录灵感、今天的日记、写复盘主题、新建人脉、记人情、外观开关），其余二十二条勾一下就上；首次摆出的先后即命令的注册顺序，此后顺序归用户（Obsidian 自带的边栏拖拽）。图标全程只用公开 API（addIcon / addRibbonIcon / Command.icon），不构成第 4 处红线偏离。边栏图标与设置页清单按九个分组着功能色（GROUP_COLORS：垦土棕/工程蓝/朱批红/灯泡黄/沉思紫/玫红/钱绿/调色盘橙/青），颜色即索引，隔着半个屏幕就分得出组。
</commands>

<settings>
设置页按系统模块切成八张标签页（开荒 / 项目 / 灵感 / 复盘 / 人脉 / 客户 / 排版 / 边栏），页标识与 modules/ 下的目录同名，一页只回答一个系统的配置问题；目录名等设置也各自归还给它服务的那个模块，而不再堆在页尾一个统称「高级」的折叠区里——每页自己有一个，永远在页尾。读书笔记模块没有自己的页，因为它一个可配置项都没有（书住项目目录、划线的行形态是约定不是口味），一张永远空着的页比没有这张页更让人怀疑自己漏了什么。外观开关与作者名片刻意不各占一页（v0.9.2 拍板：一个控件撑一整页是把分页做成摆设），都住在「开荒」页里：开关排在初始化之后（外观包是开荒交付物的一部分），名片是页尾落款、排在高级折叠之后，画的与首页导航尾部是同一张。八张页的身份（短名 / 图标 / 模块全名 / 交付状态）收在 src/settings.ts 的 TABS 一张表里，标签栏与每页页头都从它出；图标取自 COMMAND_ICONS，与左侧边栏、命令面板同一套 Pikaicons 笔画图形（v0.9.1 起弃 emoji），标签栏是「整行底线 + 当前页填充胶囊」的样式，标签自然宽度左对齐、一行排下不换行；模块清单不再单列一份，标签栏本身就是那份清单。加一页 = TABS 加一行 + panels 表加一个渲染函数，后者的 Record<TabId, …> 会在漏写时报编译错。
</settings>

<views>
V2 起全部视图（现二十二个）由插件自渲染：笔记里只留一行 ```ziminos 代码块 + 视图名，逻辑住在 main.js、样式住在 styles.css。第二十二个是「关于作者」（v0.9.0）：作者的官网/教程双域名、GitHub 与四个自媒体频道连同 Simple Icons 品牌图形与头像照片编译进 main.js，名片只在两处：README 最前（开荒完成后第一个打开的就是它，v0.10.1）与设置页开荒页尾——插件传到哪，名片跟到哪，其余任何界面不加广告。视图检索一律排除 90-system 功能目录（排除收口在 vaultIndex 与 isSystemPath）。表格是三线表，文本里的双链渲染成可点链接，任务行渲染成能勾的复选框并写回源文件。库内零 JS 文件，DataviewJS 保持关闭，升级只换 main.js 即全库生效。重算由 metadataCache 变更事件驱动，无定时器、无轮询。Dataview 仍随库交付，它的活儿只剩灵感集那条 TASK 查询。
</views>

<config>
AGENTS.md - 智能体任务路由；安装请求强制进入 skill/SKILL.md，开发请求进入项目规格
package.json - 依赖与两条脚本：dev 常驻 watch，build 先 tsc 严格检查再 esbuild 打包
tsconfig.json - 严格模式 + noEmit；类型检查与代码产出彻底分工，产出只由 esbuild 负责
esbuild.config.mjs - 唯一构建出口；产物直接写入 vault 插件目录，构建即就位，无需任何同步脚本
.gitignore - 只忽略 node_modules 与 .DS_Store；main.js 不忽略，学员克隆即可用
.gitattributes - 锁定 Dataview、Minimal、Style Settings 与 fonts/ 字体发布资产的原始字节，防止 Git 换行/格式化破坏 SHA-256
docs/第三方组件.md - Dataview / Minimal / Style Settings / Pikaicons / Simple Icons / 四款正文字体的版本、上游、许可与升级边界
docs/设计规格书-V2.md - 人脉与复盘（v0.4.0）、左侧边栏命令（v0.5.0）、设置页分页（v0.6.0）、排版整理（v0.7.0）、新建领域及 MOC 改名（v0.8.0）、作者名片（v0.9.0，§16）、检索排除功能目录与名片进 README（v0.10.0，§17）、正文字体交付（v0.11.0，§18）、读书笔记系统（v0.12.0，§19）的唯一事实源；与 V1 规格并存，交集处以它为准
</config>

<delivery>
用户先创建并命名文件夹 A，再用桌面 Agent 打开 A；此时 A 同时是 Agent 工作区与最终 Obsidian 笔记库。安装时不再询问名称或路径，不创建子目录，不在 A 内克隆源码；GitHub 仓库只能进入 A 外部的系统临时目录，最终把 vault/ 的内部内容直接铺到 A 根。全新安装交付锁定的 Dataview、外观包（含十二个 CSS 片段与它们的默认启用清单）与 fonts/ 的四款字体——字体装进用户级字体目录（免管理员，不碰系统级），appearance.json 的 textFontFamily 预设文楷 GB 屏幕版，正文换字走 Obsidian 官方设置正门、插件零参与；升级只更新受管运行文件、合并必要开关，绝不覆盖用户配色、用户自己放进 snippets/ 的片段、其他插件配置、用户自选的正文字体与用户字体目录里已存在的同名文件。禁止让用户打开仓库或仓库内的 vault/，禁止安装 Node/npm 依赖，交付后必须清理临时源码。
</delivery>

<deviations>
五处偏离，在此备案，不是疏漏：
1. tsconfig 的 moduleResolution 取 bundler 而非规格书 §2 写的 node —— 实际装到的 TypeScript 7.0.2 已移除 node10 解析模式（TS5108），规格的 node 与规格的「依赖用最新稳定版」自相冲突；bundler 是 esbuild 打包场景下的等价现代取值，其余编译选项全按规格保留。
2. src/core/time.ts 存在全仓库唯一一处类型断言 —— obsidian 把 moment 作为命名空间导出，其类型不携带调用签名，断言只还原类型不改变运行时行为。
4. 读书笔记模块联网 —— 见开头那段：用户明令放宽第二条红线。落地上只有两个出口：`modules/books/douban.ts`（豆瓣搜索页与详情页，走 Obsidian **公开** API requestUrl）与 `modules/books/sourceWeread.ts`（微信读书的 /api/user/notebook 与 /web/* 接口，同样走 requestUrl）。两处都不碰账号密码；豆瓣不需要登录，微读的登录态由用户扫码后从会话里取。删掉 modules/books 即让零网络重新成立。
5. src/modules/books/sourceWeread.ts 运行时 `require('@electron/remote')` 取 BrowserWindow —— 「只用官方公开 API」这条红线的第二处缺口，为的是让微信读书的登录是**扫码**而不是让学员去开发者工具里手抄一长串 Cookie。它按与第 3 条同样的三条纪律收窄：只有开登录窗口这一步借用（取数全走公开的 requestUrl）、探不到就整条命令降级为不可用而绝不抛异常、声明与调用同处一个文件。另注：那段登录轮询有明确起止与用户在场，与「无后台轮询」说的不是一回事。
3. src/modules/appearance/snippets.ts 借了一次 Obsidian 非公开 API，是「只用官方公开 API」这条红线唯一的缺口 —— 「让某个 CSS 片段此刻生效或失效」在 obsidian.d.ts（1.13.1，8482 行）里没有入口，全文既搜不到 customCss 也搜不到 snippet；能做到的只有 app.customCss.setCssEnabledStatus。不碰它，开关就退化成「改配置文件 + 请重启」，也就不再是开关。缺口按三条纪律收窄：其一，只有「让改动生效」这一步借用，片段清单与启用状态全部走公开的 vault.configDir + DataAdapter，因此开关显示的永远是磁盘上的事实；其二，用模块增强声明成可选成员并在运行时二次验形，TypeScript 强制判空，探不到就降级为改 appearance.json 并提示重载，功能退化但绝不抛异常；其三，声明与调用同处一个文件，不散进 .d.ts，删掉 modules/appearance 即可让红线重新完整。
</deviations>
