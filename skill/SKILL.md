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

确认下面两个文件都存在：

```text
施工源/vault/.obsidian/plugins/ziminos/manifest.json
施工源/vault/.obsidian/plugins/ziminos/main.js
```

任一缺失就停止并说明仓库不完整。不要运行 `npm install` 或 `npm run build`，不要安装 Node.js、QuickAdd、Linter、主题或任何额外插件。

## 三、原地搭建当前工作区

### 全新安装

只把施工源中 `vault/` 的内部内容复制到当前工作区根目录，包括隐藏的 `.obsidian`：

```bash
cp -R "$install_staging_dir/repo/vault/." "$vault_root/"
```

这里的 `/.` 不得省略。禁止复制仓库根目录，禁止生成 `$vault_root/vault/`，禁止生成任何以用户系统名称命名的子目录。

### 升级

先读取新旧 `manifest.json` 的版本号，然后只覆盖两个插件文件：

```bash
cp "$install_staging_dir/repo/vault/.obsidian/plugins/ziminos/manifest.json" "$vault_root/.obsidian/plugins/ziminos/manifest.json"
cp "$install_staging_dir/repo/vault/.obsidian/plugins/ziminos/main.js" "$vault_root/.obsidian/plugins/ziminos/main.js"
```

不得改动 Markdown 笔记、`data.json`、Obsidian 配置、主题或其他插件。

## 四、验证当前工作区

全新安装后检查 `$vault_root` 顶层。除安装前已存在的 `.DS_Store` 外，只允许：

```text
.obsidian/
README.md
```

确认：

- `$vault_root/.obsidian/plugins/ziminos/main.js` 存在。
- `$vault_root/.obsidian/plugins/ziminos/manifest.json` 存在。
- `$vault_root/.obsidian/community-plugins.json` 只声明 `ziminos`。
- `$vault_root` 内不存在 `.git/`、`src/`、`docs/`、`skill/`、`vault/`、`node_modules/` 或 `package.json`。

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
> 1. Obsidian 询问信任时，点「信任作者并启用插件」。
> 2. 打开设置，在左边找到 ziminOS，点「初始化」。
> 3. 看到「开荒完成 ✅」后，跟着笔记库里的 README 使用。

不要再给用户一个新的文件夹路径，不要提临时源码位置，不要让他寻找 `vault/` 子目录。

升级完成后输出：

> 当前笔记库里的 ziminOS 已从 v旧版本更新到 v新版本。你的笔记和设置都没有改动，重新加载 Obsidian 插件后即可生效。

## 红线

- 当前工作区就是最终笔记库，不另建目录。
- 不在当前工作区克隆 GitHub 仓库。
- 不让用户打开仓库或仓库内的 `vault/`。
- 不删除或覆盖用户笔记。
- 不安装运行 ziminOS 不需要的软件、插件或主题。
- 判断不了当前目录是否安全时停止，不要猜。
