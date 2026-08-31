# ziminOS - 让零基础学员一键长出能管项目、收灵感、记读书划线、看中国日历、经营人脉、逐级复盘且带完整外观的 Obsidian 个人知识管理系统

TypeScript 7.0 + esbuild 0.28 + Obsidian API 1.13（manifest minAppVersion 1.13.0）+ lunar-typescript 1.8.6 + Dataview 0.5.68 + Minimal 9.0.2 + Style Settings 1.0.9 + Pikaicons（图标，MIT，编译进 main.js）

三条红线贯穿全仓库：人主导（一切写入由用户命令或用户建的文件触发，无定时器、无轮询）、脚本驱动（插件内零 AI 调用，同输入同结果）、只用官方公开 API。

**第二条红线在 v0.13.0 被用户明令放宽：允许联网、允许登录。** 原文是「零网络请求」，代价是学员为了一本书要操作三步——豆瓣插件建档、划线插件导出、再手工把划线复制粘贴进 MOC。用户的判决是：那三步里有两步是机器该干的活儿，把它们留给人不是克制，是失职。放宽最初只对读书笔记生效，用于查书目（豆瓣）与取本人划线（微信读书）；v0.15.0 同样按「机器查得到的就不该问人」将它放宽到中国日历，仅用于在视图打开或切年时核验国务院节假日与调休数据。日历不设定时器、不轮询，24 小时内复用本地缓存，联网失败时继续用上一份可验证数据。其余模块仍然零网络；「同输入同结果」在本机来源（苹果图书 SQLite、Kindle 的 My Clippings）上原样成立，网络来源则有明确降级语义。v0.14.0 沿同一条判据将书的 UID 收口为 ISBN，标签收口为豆瓣分类（`#书籍/{分类}`）。

读书笔记经历过一次有意保留的路线修正：v0.12.0 只认三家官方纯文本导出，以复制、粘贴、确认守住当时的零网络红线；v0.13.0 经用户明确授权后把它降为兜底，主路改成豆瓣自动查书目、本机读取 Apple Books 与 Kindle、扫码连接微信读书。两版并存不是两套系统：自动取数失手时，粘贴导入仍复用同一个解析与合并内核，最终都只增不删地写进书的 MOC。

<directory>
docs/ - 设计规格与第三方组件锁定记录；代码、交付物与规格必须同步
fonts/ - 四款阅读字体的锁定资产 (4子目录: 文楷 GB 屏幕版＝默认正文、思源宋体 CN、朱雀仿宋、新晰黑＋)；OFL×3 + IPA×1 许可随行，安装时装进用户级字体目录，笔记库内零字节
skill/ - SKILL.md 桌面智能体交付契约；当前工作区就是用户已命名的笔记库，源码只在外部临时目录施工
vault/ - 笔记库成品模板；同一交付物内独立放置 ziminOS、Dataview、Minimal、Style Settings、默认配色与自有 CSS
vault/.obsidian/plugins/ziminos/ - 插件安装位；manifest.json 是由构建链从 package.json 版本自动同步的发布镜像，main.js 是刻意入库的构建产物（三十枚命令图标、一枚设置页边栏图标与五个品牌 logo 的 SVG 也在里面），styles.css 服务二十二个笔记内视图、中国日历 ItemView、外观开关浮层、七张设置页与作者名片（手工维护，不经 esbuild）
vault/.obsidian/snippets/ - 十二个 CSS 片段，外观包的可拆装部分；十个默认启用，全部由右下角外观开关逐个开关。appearance.json 的 enabledCssSnippets 是它们开着还是关着的唯一事实源
src/ - 插件源码 (2子目录: core 无业务的基础设施、命令注册台与视图引擎、modules 含 setup 开荒、projects 项目领域与容器流程、books 读书笔记与划线导入、inspiration 灵感收集、calendar 中国日历与节假日缓存、review 五级复盘、contacts 人脉与客户、appearance 外观开关、format 排版整理、ribbon 左侧边栏命令、about 作者名片)
tests/ - 审计与回归入口；直接编译 src 事实源，覆盖数据合并、划线身份、日期、换行符、ISBN、设置验形、外观拒写、数据库选择、项目回滚、版本同构与移动端 Node 边界
</directory>

<commands>
三十条命令，身份（id / 中文名 / 图标 / 分组）全在 src/core/commands.ts，一律经 CommandRegistry 注册——它在交给 Obsidian 的同时留一份花名册，左侧边栏与设置页照着它摆，三处因此不可能对不齐。默认七条摆进左侧边栏（新建项目、记录灵感、今天的日记、写复盘主题、新建人脉、记人情、外观开关），其余二十三条勾一下就上；新增的「打开中国日历」默认不占用边栏命令坞，日历 ItemView 会自动出现在右侧边栏。「今天的日记」在日记缺主题时顺手补问、已有主题时只打开，「写复盘主题」则是日/周/月/季/年五级的明确修改入口，两条命令语义不重复。首次摆出的先后即命令的注册顺序，此后顺序归用户（Obsidian 自带的边栏拖拽）。图标全程只用公开 API（addIcon / addRibbonIcon / Command.icon）。边栏图标与设置页清单按九个分组着功能色（GROUP_COLORS：垦土棕/工程蓝/朱批红/灯泡黄/沉思紫/玫红/钱绿/调色盘橙/青），颜色即索引，隔着半个屏幕就分得出组。
</commands>

<settings>
设置页按系统模块切成七张标签页（开荒 / 项目 / 灵感 / 复盘 / 人脉 / 排版 / 边栏），页标识与 modules/ 下的目录同名，一页只回答一个系统的配置问题；目录名等设置也各自归还给它服务的那个模块，而不再堆在页尾一个统称「高级」的折叠区里——每页自己有一个，永远在页尾。三个模块没有自己的页，判据是同一条「一个控件撑一整页是把分页做成摆设」：外观开关与作者名片住「开荒」页（v0.9.2 拍板，开关排在初始化之后——外观包是开荒交付物的一部分；名片是页尾落款、排在高级折叠之后，画的与 README 顶部是同一张）；读书笔记的三项（标签前缀、标签条数、微信读书的连接）住「项目」页，理由不是它少，是**一本书就是一个项目**——书落在项目目录、走项目的四态流转归档，给它单开一页等于在界面上否认代码里那条已经成立的事实。客户也不再单列（v0.14.0 并进「人脉」页）：它单列的旧理由（客户与人脉是两个物种）对命令仍成立、对设置不成立——两页加起来只有四个字段，其中两个还是同一种东西；分页的意义是「一页看完就不必再往下翻」，而不是「每个物种都得有张页」，页内切段不切页。七张页的身份（短名 / 图标 / 模块全名 / 交付状态）收在 src/settingsModel.ts 的 TABS 一张表里，标签栏与每页页头都从它出；图标取自 COMMAND_ICONS，与左侧边栏、命令面板同一套 Pikaicons 笔画图形（v0.9.1 起弃 emoji），标签栏是「整行底线 + 当前页填充胶囊」的样式，标签自然宽度左对齐、一行排下不换行；模块清单不再单列一份，标签栏本身就是那份清单。加一页 = TABS 加一行 + panels 表加一个渲染函数，后者的 Record<TabId, …> 会在漏写时报编译错。
</settings>

<views>
V2 起的二十二个笔记内视图由插件自渲染：笔记里只留一行 ```ziminos 代码块 + 视图名，逻辑住在 main.js、样式住在 styles.css。v0.15.0 另增一个不写入笔记的中国日历 ItemView：默认打开在右侧边栏，年/季/月各有独立前后箭头，「今」无论从何处出发都回归当日月视图，点日期/周数/月/季度/年分别打开或创建日/周/月/季/年记录，农历、节气与传统节日本地计算，法定休息/调休上班数据按视图事件自动校验并缓存，没有定时器与轮询。第二十二个笔记内视图是「关于作者」（v0.9.0）：作者入口、品牌图形与头像编译进 main.js，名片只在 README 与设置页开荒页尾出现。笔记内视图检索一律排除 90-system 功能目录；表格是三线表，双链可点，任务复选框能写回源文件。库内零 JS 笔记，DataviewJS 保持关闭。Dataview 仍随库交付，只负责灵感集那条 TASK 查询。
</views>

<config>
AGENTS.md - 智能体任务路由；安装请求强制进入 skill/SKILL.md，开发请求进入项目规格
README.md - Gitee 公开首页与安装入口；「一分钟安装」以单个可复制 `text` 代码块把桌面智能体导向默认分支的 skill/SKILL.md，不在首页复制第二份安装逻辑
package.json - 插件版本唯一事实源、依赖与四条脚本：dev 常驻 watch，test 跑审计回归，build 先 tsc 严格检查再 esbuild 打包，check 串行构建与测试
tsconfig.json - 严格模式 + noEmit；类型检查与代码产出彻底分工，产出只由 esbuild 负责
esbuild.config.mjs - 唯一构建出口；打包前把 package.json 版本同步到 manifest.json，产物直接写入 vault 插件目录
.gitignore - 忽略 node_modules、.DS_Store 与仓库根部历史发布压缩包；main.js 与 vault 交付资产不忽略，学员浅克隆即可用
.gitattributes - 锁定 Dataview、Minimal、Style Settings 与 fonts/ 字体发布资产的原始字节，防止 Git 换行/格式化破坏 SHA-256
docs/第三方组件.md - lunar-typescript / holiday-cn / Dataview / Minimal / Style Settings / Pikaicons / Simple Icons / 四款正文字体的版本、上游、许可与升级边界
docs/设计规格书-V2.md - v0.4.0 起的唯一设计事实源；§26 记录 v0.15.0 中国日历，§27 记录 2026-08-18 至 v0.16.0 的三轮代码审计与源码统一，§28 锁定 Gitee 公开部署源与一键安装验收；与 V1 规格并存，交集处以它为准
docs/插件代码审计修复报告-2026-08-18.html - 对外交付的单文件审计报告；源码与设计规格仍是事实源
</config>

<delivery>
用户先创建并命名文件夹 A，再用桌面 Agent 打开 A；Gitee README 顶部那段「一分钟安装」是对人的入口，默认分支的 skill/SKILL.md 是 Agent 的唯一施工契约。此时 A 同时是 Agent 工作区与最终 Obsidian 笔记库。安装时不再询问名称或路径，不创建子目录，不在 A 内克隆源码；Gitee 官方仓库只能进入 A 外部的系统临时目录，最终把 vault/ 的内部内容直接铺到 A 根。全新安装交付锁定的 Dataview、外观包（含十二个 CSS 片段与它们的默认启用清单）与 fonts/ 的四款字体——字体装进用户级字体目录（免管理员，不碰系统级），appearance.json 的 textFontFamily 预设文楷 GB 屏幕版，正文换字走 Obsidian 官方设置正门、插件零参与；升级只更新受管运行文件、合并必要开关，绝不覆盖用户配色、用户自己放进 snippets/ 的片段、其他插件配置、用户自选的正文字体与用户字体目录里已存在的同名文件。禁止让用户打开仓库或仓库内的 vault/，禁止安装 Node/npm 依赖，交付后必须清理临时源码。
</delivery>

<deviations>
六处偏离，在此备案，不是疏漏：
1. tsconfig 的 moduleResolution 取 bundler 而非规格书 §2 写的 node —— 实际装到的 TypeScript 7.0.2 已移除 node10 解析模式（TS5108），规格的 node 与规格的「依赖用最新稳定版」自相冲突；bundler 是 esbuild 打包场景下的等价现代取值，其余编译选项全按规格保留。
2. src/core/time.ts 存在全仓库唯一一处类型断言 —— obsidian 把 moment 作为命名空间导出，其类型不携带调用签名，断言只还原类型不改变运行时行为。
4. 读书笔记模块联网 —— 见开头那段：用户明令放宽第二条红线。落地上只有两个出口：`modules/books/douban.ts`（豆瓣搜索页与详情页，走 Obsidian **公开** API requestUrl）与 `modules/books/sourceWeread.ts`（微信读书：书架走 Cookie 的 /api/user/notebook，划线与想法走取数网关 i.weread.qq.com/api/agent/gateway，令牌在 /api/skills/apikeyGet 用登录态换，全部经 requestUrl）。两处都不碰账号密码；豆瓣不需要登录，微读的登录态由用户扫码后从会话里取。删掉 modules/books 即让零网络重新成立。
5. src/modules/books/sourceWeread.ts 运行时 `require('@electron/remote')` 取 BrowserWindow —— 「只用官方公开 API」这条红线的第二处缺口，为的是让微信读书的登录是**扫码**而不是让学员去开发者工具里手抄一长串 Cookie。它按与第 3 条同样的三条纪律收窄：只有开登录窗口这一步借用（取数全走公开的 requestUrl）、探不到就整条命令降级为不可用而绝不抛异常、声明与调用同处一个文件。另注：那段登录轮询有明确起止与用户在场，与「无后台轮询」说的不是一回事。
6. src/modules/calendar/holidays.ts 联网——日历只在视图打开或用户切年时，经 Obsidian 公开 `requestUrl` 按顺序访问 holiday-cn 的 jsDelivr / Fastly / GitHub Raw 镜像，校验年份、日期、重复与国务院公告链接后才写入 `holiday-cache.json`。这是 v0.15.0 用户明令要求「调休无感更新」的第三个网络出口；无定时器、无轮询、无凭据，失败时保留最后一份好数据，删掉 modules/calendar 即让本出口消失。
3. src/modules/appearance/snippets.ts 借了一次 Obsidian 非公开 API，是「只用官方公开 API」这条红线唯一的缺口 —— 「让某个 CSS 片段此刻生效或失效」在 obsidian.d.ts（1.13.1，8482 行）里没有入口，全文既搜不到 customCss 也搜不到 snippet；能做到的只有 app.customCss.setCssEnabledStatus。不碰它，开关就退化成「改配置文件 + 请重启」，也就不再是开关。缺口按三条纪律收窄：其一，只有「让改动生效」这一步借用，片段清单与启用状态全部走公开的 vault.configDir + DataAdapter，因此开关显示的永远是磁盘上的事实；其二，用模块增强声明成可选成员并在运行时二次验形，TypeScript 强制判空，探不到就降级为改 appearance.json 并提示重载，功能退化但绝不抛异常；其三，声明与调用同处一个文件，不散进 .d.ts，删掉 modules/appearance 即可让红线重新完整。
</deviations>
