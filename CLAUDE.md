# ziminOS - 让零基础学员一键长出能管项目、收灵感且带完整外观的 Obsidian 个人知识管理系统

TypeScript 7.0 + esbuild 0.28 + Obsidian API 1.13（manifest minAppVersion 1.13.0）+ Dataview 0.5.68 + Minimal 9.0.2 + Style Settings 1.0.9

三条不可违背的红线贯穿全仓库：人主导（一切写入由用户命令或用户建的文件触发，无定时器、无轮询）、脚本驱动（插件内零 AI 调用、零网络请求，同输入同结果）、只用官方公开 API。

<directory>
docs/ - 设计规格与第三方组件锁定记录；代码、交付物与规格必须同步
skill/ - SKILL.md 桌面智能体交付契约；当前工作区就是用户已命名的笔记库，源码只在外部临时目录施工
vault/ - 笔记库成品模板；同一交付物内独立放置 ziminOS、Dataview、Minimal、Style Settings、默认配色与自有 CSS
vault/.obsidian/plugins/ziminos/ - 插件安装位；manifest.json 是版本号事实源，main.js 是刻意入库的构建产物
src/ - 插件源码 (2子目录: core 无业务的基础设施、modules 含 projects 项目管理与 inspiration 灵感收集)
</directory>

<config>
AGENTS.md - 智能体任务路由；安装请求强制进入 skill/SKILL.md，开发请求进入项目规格
package.json - 依赖与两条脚本：dev 常驻 watch，build 先 tsc 严格检查再 esbuild 打包
tsconfig.json - 严格模式 + noEmit；类型检查与代码产出彻底分工，产出只由 esbuild 负责
esbuild.config.mjs - 唯一构建出口；产物直接写入 vault 插件目录，构建即就位，无需任何同步脚本
.gitignore - 只忽略 node_modules 与 .DS_Store；main.js 不忽略，学员克隆即可用
.gitattributes - 锁定 Dataview、Minimal、Style Settings 发布资产的原始字节，防止 Git 换行/格式化破坏 SHA-256
docs/第三方组件.md - Dataview / Minimal / Style Settings 的版本、上游、校验和升级边界
</config>

<delivery>
用户先创建并命名文件夹 A，再用桌面 Agent 打开 A；此时 A 同时是 Agent 工作区与最终 Obsidian 笔记库。安装时不再询问名称或路径，不创建子目录，不在 A 内克隆源码；GitHub 仓库只能进入 A 外部的系统临时目录，最终把 vault/ 的内部内容直接铺到 A 根。全新安装交付锁定的 Dataview 与外观包；升级只更新受管运行文件、合并必要开关，绝不覆盖用户配色与其他插件配置。禁止让用户打开仓库或仓库内的 vault/，禁止安装 Node/npm 依赖，交付后必须清理临时源码。
</delivery>

<deviations>
两处与规格书的被迫偏离，在此备案，不是疏漏：
1. tsconfig 的 moduleResolution 取 bundler 而非规格书 §2 写的 node —— 实际装到的 TypeScript 7.0.2 已移除 node10 解析模式（TS5108），规格的 node 与规格的「依赖用最新稳定版」自相冲突；bundler 是 esbuild 打包场景下的等价现代取值，其余编译选项全按规格保留。
2. src/core/time.ts 存在全仓库唯一一处类型断言 —— obsidian 把 moment 作为命名空间导出，其类型不携带调用签名，断言只还原类型不改变运行时行为。
</deviations>
