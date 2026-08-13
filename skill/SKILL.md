---
name: ziminos-vault-setup
description: 在用户已经创建并命名一个文件夹、再用桌面 Agent 打开该文件夹后，根据 ziminOS GitHub 仓库把当前工作区原地搭建或升级为 Obsidian 个人知识管理笔记库。用户发送仓库地址并说「按照这个仓库搭建我的个人知识管理系统」「搭建/开荒 Obsidian 笔记库」「安装/更新 ziminOS」时使用；不询问名称或安装路径，不创建子级笔记库，不把源码仓库克隆到当前工作区。
---

# ziminOS 当前工作区安装

把 Agent 当前打开的工作区视为最终 Obsidian 笔记库。用户已经在打开工作区之前完成了文件夹创建与命名，不要再替他创建另一层目录。

## 成功模型

安装前：

```text
文件夹 A/    ← 用户已创建、已命名、桌面 Agent 正在这里工作
```

全新安装后、尚未在 Obsidian 内初始化时：

```text
文件夹 A/    ← 仍是同一个目录
├── .obsidian/
└── README.md
```

用户随后直接用 Obsidian 打开文件夹 A。不得生成 `文件夹 A/另一个名称/`，也不得让用户打开源码仓库里的 `vault/`。

## 一、锁定当前工作区

把当前工作目录的真实绝对路径记为唯一目标：

```bash
vault_root="$(pwd -P)"
```

不要询问系统名称或安装位置。当前目录的文件夹名就是用户已经确定的系统名称；不要重命名它，也不要在里面新建笔记库子目录。

执行只读安全检查：

1. 若当前目录是 `/`、用户主目录、“文档/Documents”根目录、桌面根目录或其他宽泛目录，停止并让用户重新用 Agent 打开专门创建的文件夹 A。
2. 若当前目录含 `src/`、`vault/`、`skill/` 和 `package.json` 等 ziminOS 源码仓库特征，说明 Agent 打开错了目录，停止；不要把源码仓库改造成笔记库。
3. 若当前目录不存在 `.obsidian/plugins/ziminos/`，则除系统自动生成的 `.DS_Store` 外必须为空；非空就停止，不覆盖任何文件。
4. 若当前目录已经存在 `.obsidian/plugins/ziminos/`，进入升级模式。

## 二、在工作区外取得施工源

若用户只给出 GitHub 地址，把仓库浅克隆到系统临时目录。临时目录必须位于当前工作区之外：

```bash
install_staging_dir="$(mktemp -d /tmp/ziminos-install.XXXXXX)"
git clone --depth 1 "https://github.com/zhaozimin/ziminOS.git" "$install_staging_dir/repo"
```

把 `$install_staging_dir/repo` 记为施工源。禁止在 `$vault_root` 内执行 `git clone`，禁止把仓库根目录复制进 `$vault_root`。

确认下面的系统交付文件都存在：

```text
施工源/vault/.obsidian/plugins/ziminos/manifest.json
施工源/vault/.obsidian/plugins/ziminos/main.js
施工源/vault/.obsidian/plugins/dataview/manifest.json
施工源/vault/.obsidian/plugins/dataview/main.js
施工源/vault/.obsidian/plugins/dataview/styles.css
施工源/vault/.obsidian/plugins/dataview/LICENSE.txt
施工源/vault/.obsidian/plugins/dataview/SOURCE.md
施工源/vault/.obsidian/plugins/obsidian-style-settings/manifest.json
施工源/vault/.obsidian/plugins/obsidian-style-settings/main.js
施工源/vault/.obsidian/plugins/obsidian-style-settings/styles.css
施工源/vault/.obsidian/plugins/obsidian-style-settings/data.json
施工源/vault/.obsidian/plugins/obsidian-style-settings/LICENSE.md
施工源/vault/.obsidian/plugins/obsidian-style-settings/SOURCE.md
施工源/vault/.obsidian/themes/Minimal/manifest.json
施工源/vault/.obsidian/themes/Minimal/theme.css
施工源/vault/.obsidian/themes/Minimal/LICENSE
施工源/vault/.obsidian/snippets/ziminos-quote-semantic-colors.css
施工源/vault/.obsidian/types.json
```

任一缺失就停止并说明仓库不完整。ziminOS、Dataview、Minimal 与 Style Settings 的运行产物已全部在 `vault/` 中；不要运行 `npm install` / `npm run build`，不要安装 Node.js，也不要去 Obsidian 商店或网络另行下载主题/插件。禁止额外安装 QuickAdd、Linter 等非系统组件。

## 三、原地搭建当前工作区

### 全新安装

只把施工源中 `vault/` 的内部内容复制到当前工作区根目录，包括隐藏的 `.obsidian`：

```bash
cp -R "$install_staging_dir/repo/vault/." "$vault_root/"
```

这里的 `/.` 不得省略。禁止复制仓库根目录，禁止生成 `$vault_root/vault/`，禁止生成任何以用户系统名称命名的子目录。

### 升级

先读取新旧 ziminOS `manifest.json` 的版本号。若目标已有 Dataview 或 Style Settings `data.json`，分别记录 SHA-256；验证阶段必须证明这些用户设置一个字节都未变。

先补齐目录，再只更新明确归 ziminOS 管理的运行文件：

```bash
mkdir -p "$vault_root/.obsidian/plugins/ziminos"
mkdir -p "$vault_root/.obsidian/plugins/dataview"
mkdir -p "$vault_root/.obsidian/plugins/obsidian-style-settings"
mkdir -p "$vault_root/.obsidian/themes/Minimal"
mkdir -p "$vault_root/.obsidian/snippets"

cp "$install_staging_dir/repo/vault/.obsidian/plugins/ziminos/manifest.json" "$vault_root/.obsidian/plugins/ziminos/manifest.json"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/ziminos/main.js" "$vault_root/.obsidian/plugins/ziminos/main.js"

cp "$install_staging_dir/repo/vault/.obsidian/plugins/dataview/manifest.json" "$vault_root/.obsidian/plugins/dataview/manifest.json"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/dataview/main.js" "$vault_root/.obsidian/plugins/dataview/main.js"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/dataview/styles.css" "$vault_root/.obsidian/plugins/dataview/styles.css"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/dataview/LICENSE.txt" "$vault_root/.obsidian/plugins/dataview/LICENSE.txt"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/dataview/SOURCE.md" "$vault_root/.obsidian/plugins/dataview/SOURCE.md"

cp "$install_staging_dir/repo/vault/.obsidian/plugins/obsidian-style-settings/manifest.json" "$vault_root/.obsidian/plugins/obsidian-style-settings/manifest.json"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/obsidian-style-settings/main.js" "$vault_root/.obsidian/plugins/obsidian-style-settings/main.js"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/obsidian-style-settings/styles.css" "$vault_root/.obsidian/plugins/obsidian-style-settings/styles.css"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/obsidian-style-settings/LICENSE.md" "$vault_root/.obsidian/plugins/obsidian-style-settings/LICENSE.md"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/obsidian-style-settings/SOURCE.md" "$vault_root/.obsidian/plugins/obsidian-style-settings/SOURCE.md"

cp "$install_staging_dir/repo/vault/.obsidian/themes/Minimal/manifest.json" "$vault_root/.obsidian/themes/Minimal/manifest.json"
cp "$install_staging_dir/repo/vault/.obsidian/themes/Minimal/theme.css" "$vault_root/.obsidian/themes/Minimal/theme.css"
cp "$install_staging_dir/repo/vault/.obsidian/themes/Minimal/LICENSE" "$vault_root/.obsidian/themes/Minimal/LICENSE"

cp "$install_staging_dir/repo/vault/.obsidian/snippets/ziminos-quote-semantic-colors.css" "$vault_root/.obsidian/snippets/ziminos-quote-semantic-colors.css"
```

然后按下列所有权规则处理四份用户配置：

1. Dataview `data.json`：施工源不提供默认设置文件；目标存在时原样保留，不得创建或覆盖。DataviewJS 因此保持插件上游默认关闭，用户已有选择仍归用户所有。
1b. `types.json`（属性类型登记表）：目标不存在时才从施工源复制；已存在则解析现有 JSON，只补进缺失的属性键，绝不改写用户已经调过的类型。它决定属性面板给每个属性什么控件（文本/日期时间/日期/数字/列表/勾选框），缺了它学员会看到所有属性都是文本，只能一个个手动改。
2. Style Settings `data.json`：目标不存在时才从施工源复制；已存在则一个字节都不得改。
3. `community-plugins.json`：解析现有 JSON 数组，仅追加缺失的 `ziminos`、`dataview` 与 `obsidian-style-settings`；保留原顺序、原插件和用户状态。文件不存在时才复制施工源默认文件。
4. `appearance.json`：解析现有 JSON 对象，把 `ziminos-quote-semantic-colors` 合并进 `enabledCssSnippets`。`cssTheme` 缺失或为空时设为 `Minimal`；若用户已选其他非空主题则保留。文件不存在时才复制施工源默认文件。

使用 Agent 自身的 JSON 读写能力做结构化合并；禁止用字符串替换破坏 JSON，禁止整份覆盖用户已有配置。不得改动 Markdown 笔记、其他 CSS、其他主题或其他插件。

## 四、验证当前工作区

全新安装后检查 `$vault_root` 顶层。除安装前已存在的 `.DS_Store` 外，只允许：

```text
.obsidian/
README.md
```

确认：

- `$vault_root/.obsidian/plugins/ziminos/main.js` 存在。
- `$vault_root/.obsidian/plugins/ziminos/manifest.json` 存在。
- `$vault_root/.obsidian/plugins/dataview/main.js` 存在，版本为 0.5.68。
- `$vault_root/.obsidian/plugins/obsidian-style-settings/main.js` 存在，`data.json` 是合法 JSON 对象。
- `$vault_root/.obsidian/themes/Minimal/theme.css` 存在，版本为 9.0.2。
- `$vault_root/.obsidian/snippets/ziminos-quote-semantic-colors.css` 存在。
- `$vault_root/.obsidian/types.json` 存在且是合法 JSON，`types` 下至少含 `created: datetime`、`UID: number`、`up: multitext`。
- `$vault_root/.obsidian/community-plugins.json` 包含 `ziminos`、`dataview` 与 `obsidian-style-settings`。
- `$vault_root/.obsidian/appearance.json` 的全新安装默认主题为 `Minimal`，并启用 `ziminos-quote-semantic-colors`。
- `$vault_root` 内不存在 `.git/`、`src/`、`docs/`、`skill/`、`vault/`、`node_modules/` 或 `package.json`。

升级模式还要确认：升级前已存在的 Dataview / Style Settings `data.json` SHA-256 不变；`types.json` 里用户原有的属性类型一个都没被改写；用户原有插件 ID、非空自选主题、其他 CSS 片段与 Markdown 笔记全部仍在。

若发现开发文件，说明安装错误；由 Agent 修正，不让用户判断哪些文件该删。

## 五、清理临时施工源

无论成功或失败，都清理本次创建的临时目录。删除前必须验证它匹配 `/tmp/ziminos-install.*`，只删除这个精确目录：

```bash
case "$install_staging_dir" in
    /tmp/ziminos-install.*) find "$install_staging_dir" -depth -delete ;;
    *) echo "拒绝清理非 ziminOS 临时目录：$install_staging_dir" >&2; exit 1 ;;
esac
```

不得删除 `$vault_root`，不得删除用户提供的任何目录，不在当前工作区旁留下源码仓库、压缩包或安装脚本。

## 六、交付给用户

全新安装完成后输出：

> 已经把当前文件夹搭建成你的个人知识管理系统。
>
> 现在直接用 Obsidian 打开这个文件夹，然后：
> 1. Obsidian 询问信任时，点「信任作者并启用插件」。Dataview、Minimal 主题、Style Settings 和默认配色已就位。
> 2. 打开设置，在左边找到 ziminOS，点「初始化」。「记录灵感」命令及其自定义设置已经就位。
> 3. 看到「开荒完成 ✅」后，跟着笔记库里的 README 使用。

不要再给用户一个新的文件夹路径，不要提临时源码位置，不要让他寻找 `vault/` 子目录。

升级完成后输出：

> 当前笔记库里的 ziminOS 已从 v旧版本更新到 v新版本，Dataview 和外观包也已补齐。你的笔记、自定义配色和其他插件都没有被覆盖，重新加载 Obsidian 后即可生效。

## 红线

- 当前工作区就是最终笔记库，不另建目录。
- 不在当前工作区克隆 GitHub 仓库。
- 不让用户打开仓库或仓库内的 `vault/`。
- 不删除或覆盖用户笔记。
- 只交付仓库已锁定的 ziminOS、Dataview、Minimal、Style Settings 与 ziminOS CSS；不临时下载或安装任何额外软件、插件或主题。
- 全新安装可播种默认配色；升级绝不覆盖用户 Dataview / Style Settings `data.json`、非空自选主题或额外插件。
- 判断不了当前目录是否安全时停止，不要猜。
