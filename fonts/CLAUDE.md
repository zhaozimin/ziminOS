# fonts/

> L2 | 父级: ../CLAUDE.md

正文字体包，v0.11.0 起的交付资产。它住在仓库根而不是 `vault/` 里，因为它的终点不是笔记库：安装契约（skill/SKILL.md）把这里的字体装进**用户级字体目录**（macOS `~/Library/Fonts`、Windows `%LOCALAPPDATA%\Microsoft\Windows\Fonts` + HKCU 注册表、Linux `~/.local/share/fonts`），笔记库里一个字节都不留。正文换字体走的是 Obsidian 官方正门——`appearance.json` 的 `textFontFamily`（即「设置 → 外观 → 正文字体」），第一款装了就用、没装自动顺延，因此插件零代码参与、无 CSS 片段、不新增红线偏离；用户想换想撤，都在 Obsidian 自己的设置里。

与 Dataview 同一套供应链纪律：官方发布资产原样入库、不修改不子集化不转格式，`.gitattributes` 锁字节，SHA-256 与升级边界备案在 `docs/第三方组件.md`，每族一份 SOURCE.md 记上游与锁定版本。四族共约 65MB，是全仓库最重的目录——这是「只交付仓库已锁定的资产、安装时不临时下载」这条红线的直接代价，谁想给克隆减重，先想清楚要不要放弃那条红线。

## 成员清单

lxgw-wenkai-gb-screen/: 霞鹜文楷 GB 屏幕阅读版 v1.522（OFL 1.1），家族名 `LXGW WenKai GB Screen`。开荒默认正文——楷体、大陆规范字形、官方针对屏幕加粗；TTF + OFL.txt + SOURCE.md。
source-han-serif-cn/: 思源宋体 CN 2.003R（OFL 1.1），家族名 `Source Han Serif CN`。工业级长文衬线、实测零缺字，唯一带真 Bold 的一族，Regular/Bold 双 OTF + LICENSE.txt + SOURCE.md。
zhuque-fangsong/: 朱雀仿宋 v0.212（OFL 1.1），家族名 `Zhuque Fangsong (technical preview)`。民国铅字风味选项；预览版身份与 GB2312 边界备案在其 SOURCE.md，TTF + LICENSE.txt + SOURCE.md。
lxgw-neo-xihei-plus/: 霞鹜新晰黑＋ v1.304（IPA 1.0），家族名 `LXGW Neo XiHei Plus`。轻量简中黑体；IPA 要求许可副本随行，故英日原文与中文译文两份 LICENSE 都在，TTF + LICENSE.md + LICENSE_CHS.md + SOURCE.md。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
