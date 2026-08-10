/*
本文件由 esbuild 自 src/ 目录打包生成，请勿直接编辑。
需要修改行为请改 src/ 下的 TypeScript 源码，然后运行 npm run build。
*/

"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ZiminosPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian10 = require("obsidian");

// src/core/constants.ts
var FOLDERS = {
  inbox: "00-inbox",
  projects: "01-projects",
  areas: "02-areas",
  resources: "03-resources",
  archives: "04-archives",
  system: "90-system",
  template: "90-system/Template"
};
var INIT_FOLDERS = [
  FOLDERS.inbox,
  FOLDERS.projects,
  FOLDERS.areas,
  FOLDERS.resources,
  FOLDERS.archives,
  FOLDERS.system,
  FOLDERS.template
];
var NAV_FILE = `${FOLDERS.system}/\u5BFC\u822A.md`;
var TEMPLATE_FILES = {
  moc: `${FOLDERS.template}/MOC \u6A21\u677F.md`,
  card: `${FOLDERS.template}/\u5361\u7247\u7B14\u8BB0\u6A21\u677F.md`
};
var CARD_FIELDS = [
  "aliases",
  "description",
  "created",
  "updated",
  "tags",
  "UID",
  "rating",
  "author",
  "source",
  "up"
];
var DEFAULT_DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
var UID_FORMAT = "YYYYMMDDHHmmssSSS";
var SELF_WRITE_WINDOW_MS = 3e3;
var TRANSITIONS = {
  done: {
    label: "\u5B8C\u6210",
    source: "active",
    target: "archive",
    status: "done",
    allowedStatuses: ["active"]
  },
  dropped: {
    label: "\u653E\u5F03",
    source: "active",
    target: "archive",
    status: "dropped",
    allowedStatuses: ["active"]
  },
  paused: {
    label: "\u6682\u505C",
    source: "active",
    target: "archive",
    status: "paused",
    allowedStatuses: ["active"]
  },
  active: {
    label: "\u91CD\u65B0\u5F00\u59CB",
    source: "archive",
    target: "active",
    status: "active",
    allowedStatuses: ["done", "dropped", "paused"]
  }
};
var STATUS_LABELS = {
  active: "\u8FDB\u884C\u4E2D",
  paused: "\u5DF2\u6682\u505C",
  done: "\u5DF2\u5B8C\u6210",
  dropped: "\u5DF2\u653E\u5F03"
};

// src/core/guard.ts
var SelfWriteGuard = class {
  constructor() {
    /** 路径 → 插件最近一次写入该路径的时间戳（毫秒） */
    this.marks = /* @__PURE__ */ new Map();
  }
  /** 插件写入任一文件之前调用，声明「接下来这个路径的变化是我干的」 */
  mark(path) {
    this.marks.set(path, Date.now());
  }
  /**
   * 判断某路径是否仍处于自写窗口内。
   * 遍历时顺手清掉所有过期登记：读多写少的场景下，这比另起定时器清理更简单，
   * 也符合「无定时器、无后台轮询」的红线。
   */
  isRecent(path, windowMs = SELF_WRITE_WINDOW_MS) {
    const now = Date.now();
    let recent = false;
    for (const [markedPath, markedAt] of this.marks) {
      if (now - markedAt > windowMs) {
        this.marks.delete(markedPath);
        continue;
      }
      if (markedPath === path) recent = true;
    }
    return recent;
  }
};

// src/core/types.ts
var DEFAULT_SETTINGS = {
  autoCardInit: true,
  autoUpdated: true,
  projectFolder: FOLDERS.projects,
  areaFolder: FOLDERS.areas,
  archiveFolder: FOLDERS.archives,
  dateTimeFormat: DEFAULT_DATETIME_FORMAT,
  initializedAt: ""
};

// src/modules/projects/cardInit.ts
var import_obsidian4 = require("obsidian");

// src/core/folders.ts
var import_obsidian = require("obsidian");
async function ensureFolderPath(app, folderPath) {
  const normalizedFolderPath = (0, import_obsidian.normalizePath)(folderPath);
  const pathParts = normalizedFolderPath.split("/").filter(Boolean);
  let currentPath = "";
  for (const pathPart of pathParts) {
    currentPath = currentPath ? `${currentPath}/${pathPart}` : pathPart;
    const existingEntry = app.vault.getAbstractFileByPath(currentPath);
    if (!existingEntry) {
      await app.vault.createFolder(currentPath);
      continue;
    }
    if (!(existingEntry instanceof import_obsidian.TFolder)) {
      throw new Error(`\u65E0\u6CD5\u521B\u5EFA\u6587\u4EF6\u5939\uFF0C\u56E0\u4E3A\u540C\u4E00\u8DEF\u5F84\u4E0B\u5DF2\u7ECF\u5B58\u5728\u6587\u4EF6\uFF1A${currentPath}`);
    }
  }
}
function normalizeFolderPath(value, fallback) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const path = (candidate || fallback).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return (0, import_obsidian.normalizePath)(path);
}

// src/core/frontmatter.ts
function hasValue(value) {
  if (value === null || value === void 0) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
function asFrontmatter(frontmatter) {
  if (!frontmatter || typeof frontmatter !== "object") return null;
  return frontmatter;
}
function isCardInitialized(frontmatter) {
  const fm = asFrontmatter(frontmatter);
  if (!fm) return false;
  const hasEveryField = CARD_FIELDS.every(
    (key) => Object.prototype.hasOwnProperty.call(fm, key)
  );
  return hasEveryField && hasValue(fm.created) && hasValue(fm.UID) && hasValue(fm.up);
}
function isMocFrontmatter(frontmatter) {
  const fm = asFrontmatter(frontmatter);
  if (!fm) return false;
  return hasValue(fm.type);
}
function reorderFrontmatter(frontmatter, cardValues) {
  const knownFields = CARD_FIELDS;
  const extraEntries = Object.entries(frontmatter).filter(
    ([key]) => !knownFields.includes(key)
  );
  for (const key of Object.keys(frontmatter)) {
    delete frontmatter[key];
  }
  for (const key of CARD_FIELDS) {
    frontmatter[key] = cardValues[key];
  }
  for (const [key, value] of extraEntries) {
    frontmatter[key] = value;
  }
}

// src/core/modals.ts
var import_obsidian2 = require("obsidian");
var TextInputModal = class extends import_obsidian2.Modal {
  constructor(app, options) {
    super(app);
    /** Promise 的 resolve 句柄；结算后置空，避免重复结算与引用滞留 */
    this.resolver = null;
    /** 是否已经结算过。关闭动作与提交动作都会走到结算，用它保证只生效一次 */
    this.settled = false;
    this.options = options;
  }
  /** 打开弹窗并等待用户作答：有输入返回文本，取消返回 null */
  openAndGetValue() {
    return new Promise((resolve) => {
      this.resolver = resolve;
      this.open();
    });
  }
  onOpen() {
    var _a, _b;
    this.titleEl.setText(this.options.title);
    this.contentEl.empty();
    const inputEl = this.contentEl.createEl("input", {
      type: "text",
      value: (_a = this.options.initial) != null ? _a : "",
      placeholder: (_b = this.options.placeholder) != null ? _b : ""
    });
    inputEl.style.width = "100%";
    inputEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.isComposing) return;
      event.preventDefault();
      this.submit(inputEl.value);
    });
    const buttonBar = this.contentEl.createDiv();
    buttonBar.style.display = "flex";
    buttonBar.style.justifyContent = "flex-end";
    buttonBar.style.gap = "8px";
    buttonBar.style.marginTop = "16px";
    new import_obsidian2.ButtonComponent(buttonBar).setButtonText("\u53D6\u6D88").onClick(() => this.close());
    new import_obsidian2.ButtonComponent(buttonBar).setButtonText("\u786E\u8BA4").setCta().onClick(() => this.submit(inputEl.value));
    inputEl.focus();
    inputEl.select();
  }
  onClose() {
    this.settle(null);
    this.contentEl.empty();
  }
  /** 提交输入并关闭：先结算再关闭，onClose 里的兜底结算自然失效 */
  submit(value) {
    this.settle(value);
    this.close();
  }
  /** 唯一结算点，保证 Promise 只被兑现一次 */
  settle(value) {
    if (this.settled) return;
    this.settled = true;
    const resolve = this.resolver;
    this.resolver = null;
    if (resolve) resolve(value);
  }
};

// src/core/time.ts
var import_obsidian3 = require("obsidian");
var momentFactory = import_obsidian3.moment;
function normalizeDateTimeFormat(value) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return candidate || DEFAULT_DATETIME_FORMAT;
}
function nowStamp(format) {
  return momentFactory().format(normalizeDateTimeFormat(format));
}
function nowStampAndUid(format) {
  const now = momentFactory();
  return {
    stamp: now.format(normalizeDateTimeFormat(format)),
    uid: now.format(UID_FORMAT)
  };
}

// src/modules/projects/cardInit.ts
function resolveRoots(settings) {
  const projectFolder = normalizeFolderPath(
    settings.projectFolder,
    DEFAULT_SETTINGS.projectFolder
  );
  const areaFolder = normalizeFolderPath(settings.areaFolder, DEFAULT_SETTINGS.areaFolder);
  return Array.from(
    (/* @__PURE__ */ new Map([
      [projectFolder, { kind: "project", path: projectFolder }],
      [areaFolder, { kind: "area", path: areaFolder }]
    ])).values()
  );
}
function getCardContext(filePath, roots) {
  const normalizedFilePath = (0, import_obsidian4.normalizePath)(filePath);
  for (const root of roots) {
    const prefix = `${root.path}/`;
    if (!normalizedFilePath.startsWith(prefix)) continue;
    const relativePath = normalizedFilePath.slice(prefix.length);
    const pathParts = relativePath.split("/").filter(Boolean);
    if (pathParts.length < 2) return null;
    const containerName = pathParts[0];
    const mocPath = (0, import_obsidian4.normalizePath)(`${root.path}/${containerName}/${containerName}.md`);
    if (normalizedFilePath === mocPath) return null;
    return {
      kind: root.kind,
      containerName,
      mocPath,
      upLink: `[[${mocPath.slice(0, -3)}|${containerName}]]`
    };
  }
  return null;
}
async function initCard(ctx, file, opts) {
  var _a;
  const { app, settings, guard } = ctx;
  try {
    if (file.extension !== "md") return;
    const context = getCardContext(file.path, resolveRoots(settings));
    if (!context) return;
    const cachedFrontmatter = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
    if (isMocFrontmatter(cachedFrontmatter) || isCardInitialized(cachedFrontmatter)) {
      return;
    }
    let descriptionInput = null;
    if (opts.interactive && !hasValue(cachedFrontmatter == null ? void 0 : cachedFrontmatter.description)) {
      descriptionInput = await new TextInputModal(app, {
        title: "\u8BF7\u8F93\u5165\u8FD9\u7BC7\u5361\u7247\u7B14\u8BB0\u7684\u5185\u5BB9\u6982\u8FF0"
      }).openAndGetValue();
      if (descriptionInput === null) return;
    }
    const promptedDescription = descriptionInput === null ? null : descriptionInput.trim();
    guard.mark(file.path);
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
      if (isMocFrontmatter(frontmatter) || isCardInitialized(frontmatter)) {
        return;
      }
      const hasOwn = (key) => Object.prototype.hasOwnProperty.call(frontmatter, key);
      const { stamp: createdTime, uid } = nowStampAndUid(settings.dateTimeFormat);
      const cardValues = {
        aliases: hasOwn("aliases") ? frontmatter.aliases : null,
        description: hasValue(frontmatter.description) ? frontmatter.description : hasValue(promptedDescription) ? promptedDescription : null,
        created: hasValue(frontmatter.created) ? frontmatter.created : createdTime,
        // updated 完全交给 updatedMaintainer；此处只保留其当前值或建立空字段。
        updated: hasOwn("updated") ? frontmatter.updated : null,
        tags: hasOwn("tags") ? frontmatter.tags : null,
        UID: hasValue(frontmatter.UID) ? frontmatter.UID : uid,
        rating: hasOwn("rating") ? frontmatter.rating : null,
        author: hasOwn("author") ? frontmatter.author : null,
        source: hasOwn("source") ? frontmatter.source : null,
        up: hasValue(frontmatter.up) ? frontmatter.up : context.upLink
      };
      reorderFrontmatter(frontmatter, cardValues);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian4.Notice(`\u5361\u7247\u7B14\u8BB0\u521D\u59CB\u5316\u5931\u8D25\uFF1A${message}`);
    throw error;
  }
}
function registerCardInitCommand(ctx) {
  ctx.plugin.addCommand({
    id: "init-card",
    name: "\u521D\u59CB\u5316\u5F53\u524D\u5361\u7247",
    callback: () => {
      const activeFile = ctx.app.workspace.getActiveFile();
      if (!activeFile) return;
      void initCard(ctx, activeFile, { interactive: true }).catch(() => {
      });
    }
  });
}
function registerCardAutoInit(ctx) {
  ctx.app.workspace.onLayoutReady(() => {
    ctx.plugin.registerEvent(
      ctx.app.vault.on("create", (file) => {
        if (!ctx.settings.autoCardInit) return;
        if (!(file instanceof import_obsidian4.TFile) || file.extension !== "md") return;
        if (ctx.guard.isRecent(file.path)) return;
        if (!getCardContext(file.path, resolveRoots(ctx.settings))) return;
        if (file.stat.size !== 0) return;
        void initCard(ctx, file, { interactive: true }).catch(() => {
        });
      })
    );
  });
}

// src/modules/projects/createProject.ts
var import_obsidian5 = require("obsidian");

// src/modules/projects/templates.ts
var MOC_FIELDS = [
  "aliases",
  "description",
  "created",
  "updated",
  "tags",
  "UID",
  "type",
  "status"
];
var NAV_INTRO = "\u8FD9\u91CC\u662F\u4F60\u7684\u5BB6\u3002\u4E0B\u9762\u56DB\u5F20\u8868\u4F1A\u81EA\u52A8\u5217\u51FA\u5E93\u91CC\u6240\u6709\u9879\u76EE\u3001\u9886\u57DF\u548C\u4E66\u7C4D\uFF0C\u65B0\u5EFA\u4E4B\u540E\u81EA\u52A8\u51FA\u73B0\uFF0C\u4E0D\u7528\u624B\u52A8\u7EF4\u62A4\u3002";
var NAV_VIEWS = [
  { name: "\u6B63\u5728\u8FDB\u884C\u4E2D", filter: 'status == "active"' },
  { name: "\u9879\u76EE", filter: 'type == "project"' },
  { name: "\u9886\u57DF", filter: 'type == "area"' },
  { name: "\u4E66\u7C4D", filter: 'type == "book"' }
];
function toYamlString(value) {
  return JSON.stringify(String(value));
}
function mocFrontmatter(description, created, uid) {
  return [
    "---",
    "aliases:",
    `description: ${toYamlString(description)}`,
    `created: ${created}`,
    "updated:",
    "tags:",
    `UID: ${toYamlString(uid)}`,
    "type: project",
    "status: active",
    "---"
  ].join("\n");
}
function mocBaseBlock(projectName, projectFolderPath) {
  return [
    "```base",
    "filters:",
    "  and:",
    "    - file.path != this.file.path",
    "properties:",
    "  note.description:",
    "    displayName: \u6982\u8FF0",
    "  note.rating:",
    "    displayName: \u8BC4\u5206",
    "views:",
    "  - type: table",
    "    name: \u9879\u76EE\u6587\u4EF6",
    "    filters:",
    "      or:",
    `        - up == link(${JSON.stringify(projectName)})`,
    `        - file.folder == ${JSON.stringify(projectFolderPath)}`,
    "    order:",
    "      - file.name",
    "      - description",
    "      - rating",
    "    sort:",
    "      - property: rating",
    "        direction: DESC",
    "    columnSize:",
    "      file.name: 170",
    "      note.description: 421",
    "",
    "```"
  ].join("\n");
}
function mocContent(options) {
  const frontmatter = mocFrontmatter(options.description, options.created, options.uid);
  const baseBlock = mocBaseBlock(options.projectName, options.projectFolderPath);
  return `${frontmatter}



${baseBlock}
`;
}
function emptyFrontmatter(fields) {
  return ["---", ...fields.map((field) => `${field}:`), "---", ""].join("\n");
}
function cardTemplateFile() {
  return emptyFrontmatter(CARD_FIELDS);
}
function mocTemplateFile() {
  return emptyFrontmatter(MOC_FIELDS);
}
function navContent() {
  const lines = [
    NAV_INTRO,
    "",
    "```base",
    "properties:",
    "  note.description:",
    "    displayName: \u6982\u8FF0",
    "  note.status:",
    "    displayName: \u72B6\u6001",
    "views:"
  ];
  for (const view of NAV_VIEWS) {
    lines.push(
      "  - type: table",
      `    name: ${view.name}`,
      "    filters:",
      "      and:",
      `        - ${view.filter}`,
      "    order:",
      "      - file.name",
      "      - description",
      "      - status"
    );
  }
  lines.push("", "```", "");
  return lines.join("\n");
}
function firstProjectDescription() {
  return "\u642D\u5EFA\u5C5E\u4E8E\u6211\u7684\u4E2A\u4EBA\u77E5\u8BC6\u7BA1\u7406\u7CFB\u7EDF";
}

// src/modules/projects/createProject.ts
async function createProject(ctx, preset) {
  const { app } = ctx;
  try {
    const baseFolder = normalizeFolderPath(ctx.settings.projectFolder, FOLDERS.projects);
    const projectNameInput = preset ? preset.name : await new TextInputModal(app, {
      title: "\u8BF7\u8F93\u5165\u65B0\u5EFA\u9879\u76EE\u7684\u540D\u79F0"
    }).openAndGetValue();
    if (projectNameInput === null || !projectNameInput.trim()) {
      new import_obsidian5.Notice("\u672A\u8F93\u5165\u9879\u76EE\u540D\u79F0\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002");
      return null;
    }
    const projectName = projectNameInput.trim();
    if (/[\\/]/.test(projectName)) {
      new import_obsidian5.Notice("\u9879\u76EE\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u659C\u6760\u6216\u53CD\u659C\u6760\u3002");
      return null;
    }
    const descriptionInput = preset ? preset.description : await new TextInputModal(app, {
      title: "\u8BF7\u8F93\u5165\u9879\u76EE\u6982\u8FF0"
    }).openAndGetValue();
    if (descriptionInput === null) {
      new import_obsidian5.Notice("\u5DF2\u53D6\u6D88\u8F93\u5165\u9879\u76EE\u6982\u8FF0\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002");
      return null;
    }
    const description = descriptionInput.trim();
    const projectFolderPath = (0, import_obsidian5.normalizePath)(`${baseFolder}/${projectName}`);
    const mocFilePath = (0, import_obsidian5.normalizePath)(`${projectFolderPath}/${projectName}.md`);
    await ensureFolderPath(app, baseFolder);
    await ensureFolderPath(app, projectFolderPath);
    const existingMocFile = app.vault.getAbstractFileByPath(mocFilePath);
    if (existingMocFile) {
      new import_obsidian5.Notice(`\u9879\u76EE MOC \u7B14\u8BB0\u5DF2\u7ECF\u5B58\u5728\uFF0C\u672A\u6267\u884C\u8986\u76D6\uFF1A${mocFilePath}`);
      return null;
    }
    const { stamp: created, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);
    const mocMarkdown = mocContent({
      projectName,
      projectFolderPath,
      description,
      created,
      uid
    });
    const frontmatter = mocFrontmatter(description, created, uid);
    ctx.guard.mark(mocFilePath);
    const mocFile = await app.vault.create(mocFilePath, mocMarkdown);
    const leaf = app.workspace.getLeaf(false);
    await leaf.openFile(mocFile, {
      active: true,
      state: {
        mode: "source"
      }
    });
    if (leaf.view instanceof import_obsidian5.MarkdownView) {
      const editor = leaf.view.editor;
      const secondBlankLine = frontmatter.split("\n").length + 1;
      const cursorPosition = {
        line: secondBlankLine,
        ch: 0
      };
      editor.setCursor(cursorPosition);
      editor.focus();
      if (typeof editor.scrollIntoView === "function") {
        editor.scrollIntoView(
          {
            from: cursorPosition,
            to: cursorPosition
          },
          true
        );
      }
    }
    new import_obsidian5.Notice(`\u9879\u76EE\u5DF2\u521B\u5EFA\uFF1A${projectName}`);
    return mocFile;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian5.Notice(`\u521B\u5EFA\u9879\u76EE\u5931\u8D25\uFF1A${message}`);
    return null;
  }
}
function registerCreateProjectCommand(ctx) {
  ctx.plugin.addCommand({
    id: "create-project",
    name: "\u65B0\u5EFA\u9879\u76EE",
    callback: () => {
      void createProject(ctx);
    }
  });
}

// src/modules/projects/init.ts
var import_obsidian6 = require("obsidian");
var VAULT_README_PATH = "README.md";
var FIRST_PROJECT_SUFFIX = "OS_v1";
var MESSAGES = {
  notEmpty: "\u68C0\u6D4B\u5230\u5DF2\u6709\u7B14\u8BB0\uFF0CziminOS \u53EA\u5728\u7A7A\u5E93\u5F00\u8352\u3002\u8BF7\u65B0\u5EFA\u4E00\u4E2A\u7A7A\u5E93\u518D\u8BD5\u3002",
  namePrompt: "\u4F60\u7684\u540D\u5B57\uFF08\u7528\u4E8E\u521B\u5EFA\u7B2C\u4E00\u4E2A\u9879\u76EE\uFF0CEsc \u8DF3\u8FC7\uFF09",
  namePlaceholder: "\u4F8B\u5982\uFF1A\u5C0F\u660E",
  done: "\u5F00\u8352\u5B8C\u6210 \u2705",
  failedPrefix: "\u521D\u59CB\u5316\u5931\u8D25\uFF1A"
};
async function initializeVault(ctx) {
  try {
    const isFirstRun = ctx.settings.initializedAt === "";
    if (isFirstRun && hasUserNotes(ctx)) {
      new import_obsidian6.Notice(MESSAGES.notEmpty);
      return;
    }
    for (const folder of INIT_FOLDERS) {
      await ensureFolderPath(ctx.app, folder);
    }
    await createFileIfMissing(ctx, TEMPLATE_FILES.card, cardTemplateFile());
    await createFileIfMissing(ctx, TEMPLATE_FILES.moc, mocTemplateFile());
    await createFileIfMissing(ctx, NAV_FILE, navContent());
    if (isFirstRun) {
      await createFirstProject(ctx);
    }
    if (isFirstRun) {
      ctx.settings.initializedAt = nowStamp(ctx.settings.dateTimeFormat);
    }
    await ctx.saveSettings();
    new import_obsidian6.Notice(MESSAGES.done);
    await ctx.app.workspace.openLinkText(NAV_FILE, "", false);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian6.Notice(MESSAGES.failedPrefix + message);
  }
}
function hasUserNotes(ctx) {
  const systemPrefix = `${FOLDERS.system}/`;
  return ctx.app.vault.getMarkdownFiles().some((file) => file.path !== VAULT_README_PATH && !file.path.startsWith(systemPrefix));
}
async function createFileIfMissing(ctx, path, content) {
  if (ctx.app.vault.getAbstractFileByPath(path)) return;
  ctx.guard.mark(path);
  await ctx.app.vault.create(path, content);
}
async function createFirstProject(ctx) {
  const answer = await new TextInputModal(ctx.app, {
    title: MESSAGES.namePrompt,
    placeholder: MESSAGES.namePlaceholder
  }).openAndGetValue();
  const ownerName = (answer != null ? answer : "").trim();
  if (!ownerName) return;
  await createProject(ctx, {
    name: `${ownerName}${FIRST_PROJECT_SUFFIX}`,
    description: firstProjectDescription()
  });
}

// src/modules/projects/transitions.ts
var import_obsidian7 = require("obsidian");
var PROJECT_TYPE = "project";
var CONFIRM_MODAL_CLASS = "qa-project-transition-confirm";
var TRANSITION_COMMANDS = [
  { id: "project-done", name: "\u5B8C\u6210\u9879\u76EE", action: "done" },
  { id: "project-paused", name: "\u6682\u505C\u9879\u76EE", action: "paused" },
  { id: "project-dropped", name: "\u653E\u5F03\u9879\u76EE", action: "dropped" },
  { id: "project-active", name: "\u91CD\u65B0\u5F00\u59CB\u9879\u76EE", action: "active" }
];
function registerTransitionCommands(ctx) {
  for (const command of TRANSITION_COMMANDS) {
    ctx.plugin.addCommand({
      id: command.id,
      name: command.name,
      // 回调不能是 async：流转内部已吃掉全部异常并转成 Notice，此处无需等待
      callback: () => {
        void runProjectTransition(ctx, command.action);
      }
    });
  }
}
async function runProjectTransition(ctx, action) {
  try {
    const transition = TRANSITIONS[action];
    if (!transition) {
      new import_obsidian7.Notice(`\u672A\u77E5\u7684\u9879\u76EE\u6D41\u8F6C\u52A8\u4F5C\uFF1A${action}`);
      return;
    }
    const plan = resolveTransitionPlan(ctx, transition);
    if (!plan) return;
    const confirmed = await showProjectTransitionConfirm(ctx.app, plan);
    if (!confirmed) return;
    const basePathChanged = await applyTransition(ctx, plan);
    await reopenMovedMoc(ctx, plan.targetMocPath);
    if (!basePathChanged) {
      new import_obsidian7.Notice(
        "\u9879\u76EE\u6D41\u8F6C\u6210\u529F\uFF0C\u4F46 MOC\uFF08\u9879\u76EE\u5BFC\u822A\u7B14\u8BB0\uFF09\u4E2D\u6CA1\u6709\u627E\u5230\u9700\u8981\u66F4\u65B0\u7684 file.folder\uFF08\u6587\u4EF6\u5939\uFF09\u7B5B\u9009\u6761\u4EF6\u3002"
      );
    }
    new import_obsidian7.Notice(
      `\u9879\u76EE\u5DF2${transition.label}\uFF1A${plan.projectName} \u2192 ${formatStatusForDisplay(transition.status)}`
    );
  } catch (error) {
    new import_obsidian7.Notice(`\u9879\u76EE\u72B6\u6001\u6D41\u8F6C\u5931\u8D25\uFF1A${getErrorMessage(error)}`);
  }
}
function resolveTransitionPlan(ctx, transition) {
  var _a;
  const { app, settings } = ctx;
  const activeFolder = normalizeFolderPath(settings.projectFolder, DEFAULT_SETTINGS.projectFolder);
  const archiveFolder = normalizeFolderPath(settings.archiveFolder, DEFAULT_SETTINGS.archiveFolder);
  if (activeFolder === archiveFolder) {
    new import_obsidian7.Notice("\u9879\u76EE\u76EE\u5F55\u548C\u5F52\u6863\u76EE\u5F55\u4E0D\u80FD\u8BBE\u7F6E\u4E3A\u540C\u4E00\u8DEF\u5F84\u3002");
    return null;
  }
  const sourceRoot = transition.source === "active" ? activeFolder : archiveFolder;
  const targetRoot = transition.target === "active" ? activeFolder : archiveFolder;
  const mocFile = app.workspace.getActiveFile();
  if (!(mocFile instanceof import_obsidian7.TFile) || mocFile.extension !== "md") {
    new import_obsidian7.Notice("\u8BF7\u5148\u6253\u5F00\u9700\u8981\u8FDB\u884C\u72B6\u6001\u6D41\u8F6C\u7684\u9879\u76EE MOC\u3002");
    return null;
  }
  const projectFolder = mocFile.parent;
  if (!(projectFolder instanceof import_obsidian7.TFolder)) {
    new import_obsidian7.Notice("\u65E0\u6CD5\u8BC6\u522B\u5F53\u524D\u9879\u76EE\u6587\u4EF6\u5939\u3002");
    return null;
  }
  const projectName = projectFolder.name;
  const sourceProjectPath = (0, import_obsidian7.normalizePath)(`${sourceRoot}/${projectName}`);
  const expectedMocPath = (0, import_obsidian7.normalizePath)(`${sourceProjectPath}/${projectName}.md`);
  if ((0, import_obsidian7.normalizePath)(mocFile.path) !== expectedMocPath) {
    new import_obsidian7.Notice(`\u5F53\u524D\u547D\u4EE4\u53EA\u80FD\u5728\u4EE5\u4E0B\u9879\u76EE MOC \u4E2D\u6267\u884C\uFF1A${expectedMocPath}`);
    return null;
  }
  const frontmatter = (_a = app.metadataCache.getFileCache(mocFile)) == null ? void 0 : _a.frontmatter;
  const type = normalizeText(frontmatter == null ? void 0 : frontmatter.type);
  const currentStatus = normalizeText(frontmatter == null ? void 0 : frontmatter.status);
  if (type !== PROJECT_TYPE) {
    new import_obsidian7.Notice("\u5F53\u524D\u7B14\u8BB0\u4E0D\u662F\u9879\u76EE MOC\uFF1A\u7F3A\u5C11 type: project\uFF08\u9879\u76EE\uFF09\u3002");
    return null;
  }
  if (!transition.allowedStatuses.includes(currentStatus)) {
    new import_obsidian7.Notice(
      `\u9879\u76EE\u5F53\u524D\u72B6\u6001\u4E3A\u201C${formatStatusForDisplay(currentStatus)}\u201D\uFF0C\u4E0D\u80FD\u6267\u884C\u201C${transition.label}\u201D\u64CD\u4F5C\u3002`
    );
    return null;
  }
  const targetProjectPath = (0, import_obsidian7.normalizePath)(`${targetRoot}/${projectName}`);
  const targetMocPath = (0, import_obsidian7.normalizePath)(`${targetProjectPath}/${projectName}.md`);
  const existingTarget = app.vault.getAbstractFileByPath(targetProjectPath);
  if (existingTarget) {
    new import_obsidian7.Notice(`\u76EE\u6807\u4F4D\u7F6E\u5DF2\u7ECF\u5B58\u5728\u540C\u540D\u9879\u76EE\uFF0C\u64CD\u4F5C\u5DF2\u505C\u6B62\uFF1A${targetProjectPath}`);
    return null;
  }
  return {
    transition,
    projectFolder,
    projectName,
    currentStatus,
    sourceProjectPath,
    targetRoot,
    targetProjectPath,
    targetMocPath,
    expectedMocPath
  };
}
async function applyTransition(ctx, plan) {
  const { app, guard } = ctx;
  await ensureFolderPath(app, plan.targetRoot);
  const progress = {
    moved: false,
    statusChanged: false,
    basePathChanged: false
  };
  try {
    markFolderTree(ctx, plan.projectFolder, plan.targetProjectPath);
    await app.fileManager.renameFile(plan.projectFolder, plan.targetProjectPath);
    progress.moved = true;
    const movedMoc = app.vault.getAbstractFileByPath(plan.targetMocPath);
    if (!(movedMoc instanceof import_obsidian7.TFile)) {
      throw new Error(`\u79FB\u52A8\u540E\u6CA1\u6709\u627E\u5230\u9879\u76EE MOC\uFF1A${plan.targetMocPath}`);
    }
    guard.mark(movedMoc.path);
    await app.fileManager.processFrontMatter(movedMoc, (movedFrontmatter) => {
      if (normalizeText(movedFrontmatter.type) !== PROJECT_TYPE) {
        throw new Error("\u79FB\u52A8\u540E\u7684 MOC \u7F3A\u5C11 type: project\uFF08\u9879\u76EE\uFF09\u3002");
      }
      movedFrontmatter.status = plan.transition.status;
    });
    progress.statusChanged = true;
    progress.basePathChanged = await updateMocBaseFolderPath(
      ctx,
      movedMoc,
      plan.sourceProjectPath,
      plan.targetProjectPath
    );
  } catch (operationError) {
    const rollbackError = await rollbackTransition(ctx, plan, progress);
    if (rollbackError) {
      throw new Error(
        `${getErrorMessage(operationError)}\uFF1B\u81EA\u52A8\u56DE\u6EDA\u4E5F\u5931\u8D25\uFF1A${getErrorMessage(rollbackError)}`
      );
    }
    throw operationError;
  }
  return progress.basePathChanged;
}
function markFolderTree(ctx, folder, targetPath) {
  const { guard } = ctx;
  const sourcePath = folder.path;
  guard.mark(sourcePath);
  guard.mark(targetPath);
  import_obsidian7.Vault.recurseChildren(folder, (child) => {
    if (!(child instanceof import_obsidian7.TFile)) return;
    const relativePath = child.path.slice(sourcePath.length + 1);
    guard.mark(child.path);
    guard.mark((0, import_obsidian7.normalizePath)(`${targetPath}/${relativePath}`));
  });
}
async function reopenMovedMoc(ctx, targetMocPath) {
  const movedMoc = ctx.app.vault.getAbstractFileByPath(targetMocPath);
  if (!(movedMoc instanceof import_obsidian7.TFile)) return;
  try {
    await ctx.app.workspace.getLeaf(false).openFile(movedMoc, { active: true });
  } catch (e) {
  }
}
async function updateMocBaseFolderPath(ctx, mocFile, oldProjectPath, newProjectPath) {
  const oldFilter = `file.folder == ${JSON.stringify(oldProjectPath)}`;
  const newFilter = `file.folder == ${JSON.stringify(newProjectPath)}`;
  let changed = false;
  ctx.guard.mark(mocFile.path);
  await ctx.app.vault.process(mocFile, (content) => {
    if (!content.includes(oldFilter)) return content;
    changed = true;
    return content.split(oldFilter).join(newFilter);
  });
  return changed;
}
async function rollbackTransition(ctx, plan, progress) {
  var _a;
  if (!progress.moved) return null;
  const { app, guard } = ctx;
  try {
    const currentFolder = (_a = app.vault.getAbstractFileByPath(plan.targetProjectPath)) != null ? _a : plan.projectFolder;
    if (!(currentFolder instanceof import_obsidian7.TFolder)) {
      throw new Error(`\u56DE\u6EDA\u65F6\u6CA1\u6709\u627E\u5230\u9879\u76EE\u76EE\u5F55\uFF1A${plan.targetProjectPath}`);
    }
    if (app.vault.getAbstractFileByPath(plan.sourceProjectPath)) {
      throw new Error(`\u539F\u4F4D\u7F6E\u5DF2\u7ECF\u88AB\u5360\u7528\uFF1A${plan.sourceProjectPath}`);
    }
    markFolderTree(ctx, currentFolder, plan.sourceProjectPath);
    await app.fileManager.renameFile(currentFolder, plan.sourceProjectPath);
    const restoredMoc = app.vault.getAbstractFileByPath(plan.expectedMocPath);
    if (!(restoredMoc instanceof import_obsidian7.TFile)) {
      throw new Error(`\u56DE\u6EDA\u540E\u6CA1\u6709\u627E\u5230\u9879\u76EE MOC\uFF1A${plan.expectedMocPath}`);
    }
    if (progress.statusChanged) {
      guard.mark(restoredMoc.path);
      await app.fileManager.processFrontMatter(restoredMoc, (frontmatter) => {
        frontmatter.status = plan.currentStatus;
      });
    }
    if (progress.basePathChanged) {
      await updateMocBaseFolderPath(
        ctx,
        restoredMoc,
        plan.targetProjectPath,
        plan.sourceProjectPath
      );
    }
    return null;
  } catch (error) {
    return error;
  }
}
async function showProjectTransitionConfirm(app, plan) {
  return new Promise((resolve) => {
    new ProjectTransitionConfirmModal(app, plan, resolve).open();
  });
}
var ProjectTransitionConfirmModal = class extends import_obsidian7.Modal {
  constructor(app, plan, resolver) {
    super(app);
    /** 按钮结算与关闭结算都会走到 settle，用它保证只生效一次 */
    this.settled = false;
    this.plan = plan;
    this.resolver = resolver;
  }
  onOpen() {
    const { transition } = this.plan;
    this.containerEl.addClass(CONFIRM_MODAL_CLASS);
    this.modalEl.style.width = "520px";
    this.modalEl.style.maxWidth = "calc(100vw - 32px)";
    this.titleEl.setText(`\u786E\u8BA4${transition.label}\u9879\u76EE`);
    this.contentEl.empty();
    const description = this.contentEl.createEl("p", {
      text: "\u9879\u76EE\u6587\u4EF6\u5939\u5C06\u6574\u4F53\u79FB\u52A8\uFF0C\u5E76\u540C\u6B65\u66F4\u65B0 MOC\uFF08\u9879\u76EE\u5BFC\u822A\u7B14\u8BB0\uFF09\u72B6\u6001\u3002"
    });
    description.style.margin = "0 0 14px";
    description.style.color = "var(--text-muted)";
    description.style.lineHeight = "1.6";
    const summary = this.contentEl.createDiv();
    summary.style.padding = "12px 14px";
    summary.style.borderRadius = "10px";
    summary.style.background = "var(--background-secondary)";
    summary.style.border = "1px solid var(--background-modifier-border)";
    createModalInfoRow(summary, "\u9879\u76EE", this.plan.projectName, true);
    createModalInfoRow(
      summary,
      "\u72B6\u6001",
      `${formatStatusForDisplay(this.plan.currentStatus)}  \u2192  ${formatStatusForDisplay(transition.status)}`
    );
    const pathSection = summary.createDiv();
    pathSection.style.marginTop = "8px";
    pathSection.style.paddingTop = "8px";
    pathSection.style.borderTop = "1px solid var(--background-modifier-border)";
    createModalInfoRow(
      pathSection,
      "\u4ECE",
      `${this.plan.sourceProjectPath}\uFF08${getFolderTypeLabel(transition.source)}\uFF09`
    );
    createModalInfoRow(
      pathSection,
      "\u5230",
      `${this.plan.targetProjectPath}\uFF08${getFolderTypeLabel(transition.target)}\uFF09`
    );
    const buttonBar = this.contentEl.createDiv();
    buttonBar.style.display = "flex";
    buttonBar.style.justifyContent = "flex-end";
    buttonBar.style.gap = "8px";
    buttonBar.style.marginTop = "18px";
    new import_obsidian7.ButtonComponent(buttonBar).setButtonText("\u53D6\u6D88").onClick(() => this.settle(false));
    const confirmButton = new import_obsidian7.ButtonComponent(buttonBar).setButtonText(`\u786E\u8BA4${transition.label}`).setCta().onClick(() => this.settle(true));
    confirmButton.buttonEl.focus();
  }
  onClose() {
    this.settle(false);
    this.contentEl.empty();
  }
  /** 唯一结算点，保证 Promise 只被兑现一次 */
  settle(value) {
    if (this.settled) return;
    this.settled = true;
    const resolve = this.resolver;
    this.resolver = null;
    if (resolve) resolve(value);
    this.close();
  }
};
function createModalInfoRow(parent, label, value, emphasize = false) {
  const row = parent.createDiv();
  row.style.display = "grid";
  row.style.gridTemplateColumns = "4em minmax(0, 1fr)";
  row.style.gap = "10px";
  row.style.alignItems = "start";
  row.style.padding = "5px 0";
  const labelElement = row.createDiv({ text: label });
  labelElement.style.color = "var(--text-muted)";
  const valueElement = row.createDiv({ text: value });
  valueElement.style.minWidth = "0";
  valueElement.style.overflowWrap = "anywhere";
  valueElement.style.lineHeight = "1.5";
  if (emphasize) {
    valueElement.style.fontWeight = "600";
    valueElement.style.color = "var(--text-normal)";
  }
}
function formatStatusForDisplay(status) {
  const normalizedStatus = normalizeText(status);
  if (!normalizedStatus) return "\u672A\u8BBE\u7F6E\uFF08\u7A7A\uFF09";
  return `${STATUS_LABELS[normalizedStatus] || "\u672A\u77E5\u72B6\u6001"}\uFF08${normalizedStatus}\uFF09`;
}
function getFolderTypeLabel(folderType) {
  return folderType === "active" ? "\u9879\u76EE\u76EE\u5F55" : "\u5F52\u6863\u76EE\u5F55";
}
function normalizeText(value) {
  return String(value != null ? value : "").trim().toLowerCase();
}
function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

// src/modules/projects/updatedMaintainer.ts
var import_obsidian8 = require("obsidian");
var UPDATED_DEBOUNCE_MS = 2e3;
var SYSTEM_PREFIX = `${FOLDERS.system}/`;
function registerUpdatedMaintainer(ctx) {
  const pendingTimeouts = /* @__PURE__ */ new Map();
  const applyUpdated = async (path) => {
    var _a;
    if (!ctx.settings.autoUpdated) return;
    if (path.startsWith(SYSTEM_PREFIX)) return;
    const file = ctx.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian8.TFile)) return;
    if (!((_a = ctx.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter)) return;
    ctx.guard.mark(path);
    await ctx.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.updated = nowStamp(ctx.settings.dateTimeFormat);
    });
  };
  const scheduleUpdate = (path) => {
    const pending = pendingTimeouts.get(path);
    if (pending !== void 0) window.clearTimeout(pending);
    const timeoutId = window.setTimeout(() => {
      pendingTimeouts.delete(path);
      void applyUpdated(path).catch(() => {
      });
    }, UPDATED_DEBOUNCE_MS);
    pendingTimeouts.set(path, timeoutId);
  };
  const cancelUpdate = (path) => {
    const pending = pendingTimeouts.get(path);
    if (pending === void 0) return;
    window.clearTimeout(pending);
    pendingTimeouts.delete(path);
  };
  ctx.plugin.register(() => {
    for (const timeoutId of pendingTimeouts.values()) {
      window.clearTimeout(timeoutId);
    }
    pendingTimeouts.clear();
  });
  ctx.app.workspace.onLayoutReady(() => {
    ctx.plugin.registerEvent(
      ctx.app.vault.on("modify", (file) => {
        var _a;
        if (!ctx.settings.autoUpdated) {
          cancelUpdate(file.path);
          return;
        }
        if (!(file instanceof import_obsidian8.TFile) || file.extension !== "md") return;
        if (file.path.startsWith(SYSTEM_PREFIX)) {
          cancelUpdate(file.path);
          return;
        }
        if (ctx.guard.isRecent(file.path)) return;
        if (!((_a = ctx.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter)) {
          cancelUpdate(file.path);
          return;
        }
        scheduleUpdate(file.path);
      })
    );
  });
}

// src/settings.ts
var import_obsidian9 = require("obsidian");
var TEXTS = {
  initHeading: "\u5F00\u8352",
  initName: "\u521D\u59CB\u5316\u7B14\u8BB0\u5E93",
  initButton: "\u521D\u59CB\u5316",
  initPending: "\u5C1A\u672A\u521D\u59CB\u5316\u3002\u70B9\u53F3\u8FB9\u7684\u6309\u94AE\uFF0C\u4E3A\u8FD9\u4E2A\u5E93\u94FA\u597D PARA \u516D\u4E2A\u6587\u4EF6\u5939\u3001\u4E24\u4EFD\u6A21\u677F\u548C\u4E00\u9875\u5BFC\u822A\u3002",
  initReadyPrefix: "\u5DF2\u5C31\u7EEA \u2713 \u9996\u6B21\u5F00\u8352\u4E8E ",
  initReadySuffix: "\u3002\u518D\u70B9\u4E00\u6B21\u53EA\u8865\u9F50\u7F3A\u5931\u7684\u6587\u4EF6\uFF0C\u4E0D\u4F1A\u8986\u76D6\u4F60\u5199\u8FC7\u7684\u4EFB\u4F55\u7B14\u8BB0\u3002",
  autoHeading: "\u81EA\u52A8\u5316",
  autoCardName: "\u65B0\u5EFA\u7B14\u8BB0\u81EA\u52A8\u767B\u8BB0\u4E3A\u5361\u7247",
  autoCardDesc: "\u5728\u9879\u76EE\u6216\u9886\u57DF\u76EE\u5F55\u91CC\u65B0\u5EFA\u7A7A\u7B14\u8BB0\u65F6\uFF0C\u81EA\u52A8\u8865\u9F50\u6807\u51C6\u5B57\u6BB5\uFF0C\u5E76\u94FE\u56DE\u5B83\u6240\u5C5E\u7684 MOC\u3002\u5173\u6389\u540E\u53EF\u7528\u547D\u4EE4\u300C\u521D\u59CB\u5316\u5F53\u524D\u5361\u7247\u300D\u624B\u52A8\u767B\u8BB0\u3002",
  autoUpdatedName: "\u81EA\u52A8\u7EF4\u62A4 updated \u65F6\u95F4",
  autoUpdatedDesc: "\u6539\u5B8C\u5E26 YAML \u7684\u7B14\u8BB0\u3001\u505C\u624B\u4E24\u79D2\u540E\uFF0C\u81EA\u52A8\u8BB0\u4E0B\u8FD9\u6B21\u4FEE\u6539\u65F6\u95F4\u3002\u6CA1\u6709 YAML \u7684\u7B14\u8BB0\u4E00\u4E2A\u5B57\u90FD\u4E0D\u52A8\u3002",
  advancedHeading: "\u9AD8\u7EA7\u8BBE\u7F6E\uFF08\u4E00\u822C\u4E0D\u7528\u6539\uFF09",
  modulesHeading: "\u7CFB\u7EDF\u6A21\u5757"
};
var ADVANCED_FIELDS = [
  { key: "projectFolder", name: "\u9879\u76EE\u76EE\u5F55", hint: "\u6B63\u5728\u63A8\u8FDB\u7684\u9879\u76EE\u653E\u5728\u8FD9\u91CC\u3002" },
  { key: "areaFolder", name: "\u9886\u57DF\u76EE\u5F55", hint: "\u957F\u671F\u5173\u6CE8\u3001\u6CA1\u6709\u7EC8\u70B9\u7684\u9886\u57DF\u653E\u5728\u8FD9\u91CC\u3002" },
  { key: "archiveFolder", name: "\u5F52\u6863\u76EE\u5F55", hint: "\u5B8C\u6210\u3001\u6682\u505C\u3001\u653E\u5F03\u7684\u9879\u76EE\u4F1A\u642C\u5230\u8FD9\u91CC\u3002" },
  { key: "dateTimeFormat", name: "\u65F6\u95F4\u683C\u5F0F", hint: "created \u4E0E updated \u5B57\u6BB5\u7684\u5199\u6CD5\uFF0Cmoment \u8BED\u6CD5\u3002" }
];
var SYSTEM_MODULES = [
  { name: "\u{1F4E6} \u9879\u76EE\u7BA1\u7406 v1", status: "\u8FD0\u884C\u4E2D", running: true },
  { name: "\u{1F465} \u4EBA\u8109\u7BA1\u7406", status: "\u656C\u8BF7\u671F\u5F85", running: false },
  { name: "\u{1F4D4} \u65E5\u8BB0\u590D\u76D8", status: "\u656C\u8BF7\u671F\u5F85", running: false },
  { name: "\u{1F3A8} \u5916\u89C2\u5305 v1", status: "Minimal + Style Settings \u5DF2\u5C31\u7EEA", running: true }
];
var ZiminosSettingTab = class extends import_obsidian9.PluginSettingTab {
  constructor(ctx) {
    super(ctx.app, ctx.plugin);
    this.ctx = ctx;
  }
  /** 每次打开设置页都整体重建，保证显示的永远是设置对象的当前值 */
  display() {
    const { containerEl } = this;
    containerEl.empty();
    this.renderInitSection(containerEl);
    this.renderAutomationSection(containerEl);
    this.renderAdvancedSection(containerEl);
    this.renderModulesSection(containerEl);
  }
  // ============================================================
  // 一、开荒
  // ============================================================
  /**
   * 开荒区：一句状态说明 + 一个按钮。
   * 按钮点下后先禁用再执行，防止连点开出两次流程；完成后重建整个面板，
   * 状态说明随之从「尚未初始化」翻面成「已就绪」。
   */
  renderInitSection(containerEl) {
    new import_obsidian9.Setting(containerEl).setName(TEXTS.initHeading).setHeading();
    new import_obsidian9.Setting(containerEl).setName(TEXTS.initName).setDesc(this.describeInitState()).addButton((button) => {
      button.setButtonText(TEXTS.initButton).setCta().onClick(async () => {
        button.setDisabled(true);
        try {
          await initializeVault(this.ctx);
        } finally {
          this.display();
        }
      });
    });
  }
  /** 用 initializedAt 是否为空来决定说什么：这是「首次开荒」与「幂等补齐」的唯一判据 */
  describeInitState() {
    const { initializedAt } = this.ctx.settings;
    if (!initializedAt) return TEXTS.initPending;
    return TEXTS.initReadyPrefix + initializedAt + TEXTS.initReadySuffix;
  }
  // ============================================================
  // 二、自动化
  // ============================================================
  /** 自动化区：两个开关，对应插件仅有的两个常驻监听 */
  renderAutomationSection(containerEl) {
    new import_obsidian9.Setting(containerEl).setName(TEXTS.autoHeading).setHeading();
    this.renderToggle(containerEl, "autoCardInit", TEXTS.autoCardName, TEXTS.autoCardDesc);
    this.renderToggle(containerEl, "autoUpdated", TEXTS.autoUpdatedName, TEXTS.autoUpdatedDesc);
  }
  /** 渲染一个布尔开关。改动立即落盘，监听方每次触发都现读设置，故无需通知任何人 */
  renderToggle(containerEl, key, name, desc) {
    new import_obsidian9.Setting(containerEl).setName(name).setDesc(desc).addToggle((toggle) => {
      toggle.setValue(this.ctx.settings[key]).onChange(async (value) => {
        this.ctx.settings[key] = value;
        await this.ctx.saveSettings();
      });
    });
  }
  // ============================================================
  // 三、高级
  // ============================================================
  /**
   * 高级区：默认折叠。
   * 目录名与时间格式是课程内容的一部分，改了会让学员的库与课程讲义对不上，
   * 所以既要留出口，又不能摆在明面上诱导人去动它。
   */
  renderAdvancedSection(containerEl) {
    const details = containerEl.createEl("details");
    const summary = details.createEl("summary", { text: TEXTS.advancedHeading });
    summary.style.cursor = "pointer";
    summary.style.padding = "12px 0";
    summary.style.fontWeight = "600";
    for (const field of ADVANCED_FIELDS) {
      this.renderTextField(details, field);
    }
  }
  /**
   * 渲染一个文本框。
   * 这里刻意不做清洗与校验：留空或写错的值由各功能模块在使用时回落到默认值，
   * 校验集中在读取侧，设置页只负责如实记录用户敲进去的字。
   */
  renderTextField(containerEl, field) {
    const fallback = DEFAULT_SETTINGS[field.key];
    new import_obsidian9.Setting(containerEl).setName(field.name).setDesc(`${field.hint}\u8BFE\u7A0B\u9ED8\u8BA4\u503C ${fallback}\uFF0C\u6539\u524D\u4E09\u601D\u3002`).addText((text) => {
      text.setPlaceholder(fallback).setValue(this.ctx.settings[field.key]).onChange(async (value) => {
        this.ctx.settings[field.key] = value;
        await this.ctx.saveSettings();
      });
    });
  }
  // ============================================================
  // 四、系统模块
  // ============================================================
  /** 模块区：纯展示，没有任何控件。未上线的模块以禁用态呈现，看得见但点不动 */
  renderModulesSection(containerEl) {
    new import_obsidian9.Setting(containerEl).setName(TEXTS.modulesHeading).setHeading();
    for (const entry of SYSTEM_MODULES) {
      const item = new import_obsidian9.Setting(containerEl).setName(entry.name).setDesc(entry.status);
      if (!entry.running) item.setDisabled(true);
    }
  }
};

// src/main.ts
var INIT_VAULT_COMMAND = {
  id: "init-vault",
  name: "\u521D\u59CB\u5316\u7B14\u8BB0\u5E93"
};
var ZiminosPlugin = class extends import_obsidian10.Plugin {
  constructor() {
    super(...arguments);
    /**
     * 全局唯一的设置对象。
     * 它会被原样放进 ZiminosContext，各模块与设置页读写的都是这同一份引用——
     * 设置页改完一个开关，正在监听的模块下次触发时立刻看见新值，中间没有任何同步环节。
     */
    this.settings = { ...DEFAULT_SETTINGS };
  }
  async onload() {
    await this.loadSettings();
    const ctx = {
      app: this.app,
      plugin: this,
      settings: this.settings,
      saveSettings: () => this.saveData(this.settings),
      // 守卫必须全库唯一：写方标记与监听方查询共用同一份记录，自写抑制才成立
      guard: new SelfWriteGuard()
    };
    this.addCommand({
      id: INIT_VAULT_COMMAND.id,
      name: INIT_VAULT_COMMAND.name,
      // 开荒内部已把全部异常转成中文 Notice，此处无需等待也无需接住
      callback: () => {
        void initializeVault(ctx);
      }
    });
    registerCreateProjectCommand(ctx);
    registerCardInitCommand(ctx);
    registerCardAutoInit(ctx);
    registerTransitionCommands(ctx);
    registerUpdatedMaintainer(ctx);
    this.addSettingTab(new ZiminosSettingTab(ctx));
  }
  /**
   * 读取持久化设置并补齐缺省值。
   * 用「默认值打底、存档覆盖」的顺序合并：新版本新增的字段对老库自动生效，
   * 老库里已有的选择则一个都不会被冲掉。首次安装时 loadData 返回 null，结果即纯默认值。
   */
  async loadSettings() {
    const stored = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...stored != null ? stored : {} };
  }
};
