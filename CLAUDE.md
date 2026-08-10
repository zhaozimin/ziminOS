# ziminOS - 让零基础学员一键长出个人知识管理系统的 Obsidian 插件 + 笔记库模板

TypeScript 7.0 + esbuild 0.28 + Obsidian API 1.13（manifest minAppVersion 1.9.0）+ 零运行时依赖

三条不可违背的红线贯穿全仓库：人主导（一切写入由用户命令或用户建的文件触发，无定时器、无轮询）、脚本驱动（插件内零 AI 调用、零网络请求，同输入同结果）、只用官方公开 API。

<directory>
docs/ - 设计规格书.md，V1 实施的唯一事实源；实现与它冲突时以它为准
skill/ - SKILL.md 桌面智能体施工手册；学员把仓库地址交给智能体，由它照着装库
vault/ - 笔记库模板，即学员拿到的「家」(.obsidian 预配置四个 JSON + 库内导游 README.md)
vault/.obsidian/plugins/ziminos/ - 插件安装位；manifest.json 是版本号事实源，main.js 是刻意入库的构建产物
src/ - 插件源码 (2子目录: core 无业务的基础设施、modules/projects 项目管理模块)
</directory>

<config>
package.json - 依赖与两条脚本：dev 常驻 watch，build 先 tsc 严格检查再 esbuild 打包
tsconfig.json - 严格模式 + noEmit；类型检查与代码产出彻底分工，产出只由 esbuild 负责
esbuild.config.mjs - 唯一构建出口；产物直接写入 vault 插件目录，构建即就位，无需任何同步脚本
.gitignore - 只忽略 node_modules 与 .DS_Store；main.js 不忽略，学员克隆即可用
</config>

<deviations>
两处与规格书的被迫偏离，在此备案，不是疏漏：
1. tsconfig 的 moduleResolution 取 bundler 而非规格书 §2 写的 node —— 实际装到的 TypeScript 7.0.2 已移除 node10 解析模式（TS5108），规格的 node 与规格的「依赖用最新稳定版」自相冲突；bundler 是 esbuild 打包场景下的等价现代取值，其余编译选项全按规格保留。
2. src/core/time.ts 存在全仓库唯一一处类型断言 —— obsidian 把 moment 作为命名空间导出，其类型不携带调用签名，断言只还原类型不改变运行时行为。
</deviations>
