/*
本文件由 esbuild 自 src/ 目录打包生成，请勿直接编辑。
需要修改行为请改 src/ 下的 TypeScript 源码，然后运行 npm run build。

图标来自 Pikaicons（https://pikaicons.com），MIT License，Copyright (c) 2022 Mau Joost。
其中若干图形由 ziminOS 照同一套画法补画，同样以 MIT 授权分发。
详见 docs/第三方组件.md。
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
var import_obsidian22 = require("obsidian");

// src/core/codeblock.ts
var import_obsidian2 = require("obsidian");

// src/core/constants.ts
var FOLDERS = {
  inbox: "00-inbox",
  projects: "01-projects",
  areas: "02-areas",
  resources: "03-resources",
  archives: "04-archives",
  diary: "05-diary",
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
var CONTACT_FOLDER = `${FOLDERS.areas}/\u4EBA\u8109`;
var CLIENT_FOLDER = `${FOLDERS.areas}/\u5BA2\u6237`;
var NAV_FILE = `${FOLDERS.system}/\u5BFC\u822A.md`;
var SCHEMA_NOTE = `${FOLDERS.system}/\u5C5E\u6027\u7C7B\u578B\u793A\u4F8B.md`;
var TEMPLATE_FILES = {
  moc: `${FOLDERS.template}/MOC \u6A21\u677F.md`,
  card: `${FOLDERS.template}/\u5361\u7247\u7B14\u8BB0\u6A21\u677F.md`,
  person: `${FOLDERS.template}/\u4EBA\u8109\u6A21\u677F.md`,
  client: `${FOLDERS.template}/\u5BA2\u6237\u6A21\u677F.md`
};
var CONTACT_MOC = `${CONTACT_FOLDER}/\u4EBA\u8109MOC.md`;
var CLIENT_MOC = `${CLIENT_FOLDER}/\u5BA2\u6237MOC.md`;
var INSPIRATION_INSERT_POSITIONS = [
  "heading-top",
  "heading-bottom",
  "file-top",
  "file-bottom"
];
var INSPIRATION_DEFAULTS = {
  folder: FOLDERS.inbox,
  fileName: "\u7075\u611F\u96C6.md",
  heading: "# \u7075\u611F\u96C6",
  insertPosition: "heading-top",
  format: "- [ ]  {{content}} [[{{date}}]] {{time}}"
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
var UID_FORMAT = "YYYYMMDDHHmmss";
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
var FIELDS = {
  aliases: "aliases",
  description: "description",
  created: "created",
  updated: "updated",
  tags: "tags",
  uid: "UID",
  type: "type",
  status: "status",
  up: "up",
  /** 归档时刻。由状态流转命令与 status 同一次写入，是「本月完成了什么」唯一可信的时间事实 */
  archived: "archived",
  /** 项目→人的商业契约标记：写下它等于宣告「我欠这个人一个交付」 */
  client: "client",
  /** 项目→人的同行标记：一起做的，无交付债务 */
  with: "with",
  tier: "tier",
  direction: "direction",
  gift: "gift",
  address: "address",
  get: "get",
  birthday: "birthday",
  source: "source",
  author: "author",
  rating: "rating",
  contact: "contact",
  homepage: "homepage",
  /** 复盘主题：主题链的唯一入口，五级各写一句 */
  theme: "theme",
  /** 复盘周期锚点，YYYY-MM-DD 定宽字符串；日记没有此字段，它的锚点是文件名 */
  periodStart: "period_start"
};
var NOTE_TYPES = {
  project: "project",
  area: "area",
  /** 人脉档案：认识的人，有生日有脾气有人情往来 */
  person: "person",
  /** 付费用户：陌生人买你的东西，你只知道渠道与联系方式，是与 person 并列的独立物种 */
  client: "client",
  diary: "diary",
  weekly: "weekly",
  monthly: "monthly",
  quarterly: "quarterly",
  yearly: "yearly"
};
var DAY_FORMAT = "YYYY-MM-DD";
var PERIODS = {
  daily: {
    key: "daily",
    type: NOTE_TYPES.diary,
    label: "\u65E5\u8BB0",
    folder: `${FOLDERS.diary}/01-daily`,
    titleFormat: DAY_FORMAT,
    startOfUnit: "day",
    stepUnit: "day",
    parent: "weekly",
    parentAlias: "\u672C\u5468"
  },
  weekly: {
    key: "weekly",
    type: NOTE_TYPES.weekly,
    label: "\u5468\u8BB0",
    folder: `${FOLDERS.diary}/02-weekly`,
    // GGGG 是 ISO 周所属年，与 WW 配对才不会在跨年周上错位
    titleFormat: "GGGG-[W]WW",
    startOfUnit: "isoWeek",
    stepUnit: "week",
    parent: "monthly",
    parentAlias: "\u672C\u6708"
  },
  monthly: {
    key: "monthly",
    type: NOTE_TYPES.monthly,
    label: "\u6708\u8BB0",
    folder: `${FOLDERS.diary}/03-monthly`,
    titleFormat: "YYYY-MM",
    startOfUnit: "month",
    stepUnit: "month",
    parent: "quarterly",
    parentAlias: "\u672C\u5B63"
  },
  quarterly: {
    key: "quarterly",
    type: NOTE_TYPES.quarterly,
    label: "\u5B63\u8BB0",
    folder: `${FOLDERS.diary}/04-quarterly`,
    titleFormat: "YYYY-[Q]Q",
    startOfUnit: "quarter",
    stepUnit: "quarter",
    parent: "yearly",
    parentAlias: "\u672C\u5E74"
  },
  yearly: {
    key: "yearly",
    type: NOTE_TYPES.yearly,
    label: "\u5E74\u8BB0",
    folder: `${FOLDERS.diary}/05-yearly`,
    titleFormat: "YYYY",
    startOfUnit: "year",
    stepUnit: "year",
    parent: null,
    parentAlias: ""
  }
};
var DIARY_FOLDERS = [
  FOLDERS.diary,
  PERIODS.daily.folder,
  PERIODS.weekly.folder,
  PERIODS.monthly.folder,
  PERIODS.quarterly.folder,
  PERIODS.yearly.folder
];
var DIARY_LOG_HEADING = "## \u4ECA\u5929\u505A\u4E86\u4EC0\u4E48";
var CONTACT_TIERS = ["\u5BC6", "\u8FD1", "\u719F", "\u8FDC"];
var TIER_LIMITS = {
  \u5BC6: 7,
  \u8FD1: 30,
  \u719F: 90,
  \u8FDC: 365
};
var TIER_FALLBACK_LIMIT = 365;
var CONTACT_DIRECTIONS = ["\u5411\u4E0A", "\u5E73\u884C", "\u5411\u4E0B"];
var LEDGER = {
  separator: "\uFF5C",
  /** 第二段必须是它们之一，否则这行不是账本行 */
  kinds: ["\u53BB", "\u6765"],
  /** 第四段的合法取值；写了别的以 ⚠️ 前缀暴露，不静默吞掉 */
  statuses: ["\u4E24\u6E05", "\u6211\u6B20", "\u4ED6\u6B20"],
  /** 第四段省略即两清——两清是最常见的情形，让最常见的写法最短 */
  defaultStatus: "\u4E24\u6E05"
};
var PAYMENT_FIELDS = {
  product: "\u4EA7\u54C1",
  amount: "\u91D1\u989D",
  date: "\u65E5\u671F"
};
var CLIENT_PAYMENT_HEADING = "## \u4ED8\u8D39\u4E0E\u4EA4\u4ED8";
var PROJECT_PAYMENT_HEADING = "## \u6536\u6B3E";
var SNIPPET_FOLDER_NAME = "snippets";
var SNIPPET_EXTENSION = ".css";
var APPEARANCE_FILE_NAME = "appearance.json";
var ENABLED_SNIPPETS_KEY = "enabledCssSnippets";
var VIEW_BLOCK_LANG = "ziminos";
var VIEW_REFRESH_DEBOUNCE_MS = 200;

// src/core/table.ts
function noteLink(file, display) {
  return { path: file.path, display: display != null ? display : file.basename };
}
function richText(text, fromPath) {
  return { text, from: fromPath };
}
function isObjectCell(cell) {
  return typeof cell === "object" && cell !== null && !(cell instanceof HTMLElement);
}
function isNoteLink(cell) {
  return isObjectCell(cell) && "path" in cell;
}
function renderTable(app, el, sourcePath, headers, rows, grow) {
  const wrapper = el.createDiv({ cls: "ziminos-table-wrap" });
  const table = wrapper.createEl("table", { cls: "ziminos-table" });
  const headRow = table.createEl("thead").createEl("tr");
  const classOf = (index) => grow === void 0 ? void 0 : index === grow ? "ziminos-grow" : "ziminos-tight";
  headers.forEach((header, index) => {
    headRow.createEl("th", {
      cls: classOf(index),
      text: index === 0 && rows.length ? `${header} (${rows.length})` : header
    });
  });
  const body = table.createEl("tbody");
  for (const row of rows) {
    const tr = body.createEl("tr");
    row.forEach((cell, index) => {
      renderCell(app, tr.createEl("td", { cls: classOf(index) }), sourcePath, cell);
    });
  }
}
function renderCell(app, td, sourcePath, cell) {
  if (cell === null || cell === void 0) {
    td.setText("\u2014");
    return;
  }
  if (cell instanceof HTMLElement) {
    td.appendChild(cell);
    return;
  }
  if (isNoteLink(cell)) {
    renderNoteLink(app, td, sourcePath, cell);
    return;
  }
  if (isObjectCell(cell)) {
    renderTextWithLinks(app, td, cell.text, cell.from);
    return;
  }
  renderRichText(td, String(cell));
}
function renderNoteLink(app, parent, sourcePath, link) {
  const anchor = parent.createEl("a", {
    cls: "internal-link",
    text: link.display,
    href: link.path
  });
  anchor.setAttribute("data-href", link.path);
  anchor.addEventListener("click", (event) => {
    event.preventDefault();
    void app.workspace.openLinkText(link.path, sourcePath, event.ctrlKey || event.metaKey);
  });
}
var WIKILINK = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\\?\|([^\]]*))?\]\]/g;
function renderTextWithLinks(app, parent, text, fromPath) {
  var _a;
  WIKILINK.lastIndex = 0;
  let cursor = 0;
  let match = WIKILINK.exec(text);
  while (match) {
    if (match.index > cursor) parent.appendText(text.slice(cursor, match.index));
    const target = match[1].trim();
    const display = ((_a = match[2]) != null ? _a : "").trim() || target;
    renderNoteLink(app, parent, fromPath, { path: target, display });
    cursor = match.index + match[0].length;
    match = WIKILINK.exec(text);
  }
  if (cursor < text.length) parent.appendText(text.slice(cursor));
}
function renderTaskList(app, el, sourcePath, tasks, onToggle) {
  const ordered = [...tasks].sort((left, right) => right.day.localeCompare(left.day));
  renderTable(
    app,
    el,
    sourcePath,
    ["\u5F85\u529E", "\u65E5\u671F"],
    ordered.map((task) => [taskCell(app, task, onToggle), noteLink(task.file, task.day)]),
    0
  );
}
function taskCell(app, task, onToggle) {
  const cell = createSpan({ cls: "ziminos-task" });
  const box = cell.createEl("input", { type: "checkbox", cls: "task-list-item-checkbox" });
  box.checked = task.checked;
  if (task.checked) cell.addClass("is-checked");
  box.addEventListener("click", (event) => {
    event.preventDefault();
    onToggle(task);
  });
  renderTextWithLinks(app, cell.createSpan({ cls: "ziminos-task-text" }), task.text, task.file.path);
  return cell;
}
function renderEmpty(el, message) {
  renderRichText(el.createEl("p", { cls: "ziminos-empty" }), `\u{1F4ED} ${message}`);
}
function renderNote(el, message) {
  renderRichText(el.createEl("p", { cls: "ziminos-note" }), message);
}
function renderHeading(el, level, text) {
  el.createEl(level === 3 ? "h3" : "h4", { cls: "ziminos-heading", text });
}
function renderSummary(el, text) {
  renderRichText(el.createEl("p", { cls: "ziminos-summary" }), text);
}
function renderRichText(parent, text) {
  const segments = text.split("**");
  segments.forEach((segment, position) => {
    if (!segment) return;
    if (position % 2 === 1) parent.createEl("strong", { text: segment });
    else parent.appendText(segment);
  });
}

// src/core/vaultIndex.ts
var import_obsidian = require("obsidian");
var LIST_MARKER = /^\s*(?:[-*+]|\d+[.)])\s+(?:\[(.)\]\s*)?/;
var WIKILINK2 = /\[\[([^\]]+)\]\]/g;
var VaultIndex = class {
  constructor(app) {
    /** 修订号。变更事件只递增它，不做任何重建工作，因此事件回调恒为 O(1) */
    this.revision = 0;
    /** 反向链接索引构建时的修订号，与当前修订号不等即视为过期 */
    this.backlinksRevision = -1;
    this.backlinks = null;
    /** 按 type 分组的笔记，同一次渲染里一张 MOC 要问四五遍，缓存一次省四五遍全库遍历 */
    this.typesRevision = -1;
    this.types = null;
    /**
     * 列表行缓存。它刻意不随修订号整体作废——每条记录自带 mtime，
     * 改一篇日记不该让另外九十七篇重新读盘。
     */
    this.listCache = /* @__PURE__ */ new Map();
    this.app = app;
  }
  /** 宣告索引已过期。只递增计数，重建推迟到下一次查询 */
  invalidate() {
    this.revision += 1;
  }
  /** 全库 Markdown 笔记 */
  allNotes() {
    return this.app.vault.getMarkdownFiles();
  }
  /** 某篇笔记的 frontmatter；没有 YAML 时返回 undefined */
  frontmatterOf(file) {
    var _a;
    return (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
  }
  /**
   * 取 frontmatter 里某个字段的原始值。
   * 视图对字段的一切访问都走这里，好处是「笔记没有 YAML」与「有 YAML 但没这个字段」
   * 在调用侧收敛成同一个 undefined，不必每处各写一次可选链。
   */
  fieldOf(file, field) {
    var _a;
    return (_a = this.frontmatterOf(file)) == null ? void 0 : _a[field];
  }
  /**
   * 全库 type 为指定值的笔记。
   *
   * 身份靠 type 认，不靠文件夹——学员重命名目录、改分层、用英文目录名，视图一个都不用改。
   * type 在 Obsidian 里可能被写成字符串也可能被写成单元素列表，两种都认。
   */
  notesOfType(type) {
    var _a;
    if (!this.types || this.typesRevision !== this.revision) {
      const grouped = /* @__PURE__ */ new Map();
      for (const file of this.allNotes()) {
        for (const value of toStringList(this.fieldOf(file, "type"))) {
          const bucket = grouped.get(value);
          if (bucket) bucket.push(file);
          else grouped.set(value, [file]);
        }
      }
      this.types = grouped;
      this.typesRevision = this.revision;
    }
    return (_a = this.types.get(type)) != null ? _a : [];
  }
  /**
   * 链到指定文件的全部笔记。
   *
   * 用一次全库遍历建反向表而不是逐个正查：一张名录有上百个人，
   * 逐个去 resolvedLinks 里正查是「人数 × 全库」，建一次表是「全库」，
   * 而这张表在同一次渲染里被所有视图共用。
   */
  backlinksOf(file) {
    var _a;
    if (!this.backlinks || this.backlinksRevision !== this.revision) {
      const map = /* @__PURE__ */ new Map();
      const resolved = this.app.metadataCache.resolvedLinks;
      for (const sourcePath of Object.keys(resolved)) {
        const source = this.app.vault.getAbstractFileByPath(sourcePath);
        if (!(source instanceof import_obsidian.TFile)) continue;
        for (const targetPath of Object.keys(resolved[sourcePath])) {
          const bucket = map.get(targetPath);
          if (bucket) bucket.push(source);
          else map.set(targetPath, [source]);
        }
      }
      this.backlinks = map;
      this.backlinksRevision = this.revision;
    }
    return (_a = this.backlinks.get(file.path)) != null ? _a : [];
  }
  /**
   * 把一段 wikilink 原文解析成它真正指向的文件。
   *
   * 这是全库唯一允许的链接比对方式。`[[张三]]`、`[[张三|老张]]`、`[[02-areas/人脉/张三]]`、
   * `[[张三#约定]]` 指向同一篇笔记，任何基于文件名的字符串匹配都会在其中某一种上失手——
   * 而失手的表现是视图静默少一行，不报错、不留痕。
   */
  resolve(linktext, sourcePath) {
    const path = linktext.split("#")[0].replace(/\\$/, "").trim();
    if (!path) return null;
    return this.app.metadataCache.getFirstLinkpathDest(path, sourcePath);
  }
  /**
   * 读出一篇笔记的全部列表行。
   *
   * metadataCache 的 listItems 只给位置与复选框，不给文本，所以必须回磁盘取一次原文。
   * 调用方永远只对「反链指向我的那几篇日记」调它，不扫全库——
   * 一份人情账本要读的通常是几十篇日记，不是几千篇笔记。
   */
  async listLinesOf(file) {
    var _a, _b;
    const cached = this.listCache.get(file.path);
    if (cached && cached.mtime === file.stat.mtime) return cached.lines;
    const items = (_b = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.listItems) != null ? _b : [];
    const lines = items.length ? parseListLines(await this.app.vault.cachedRead(file), items) : [];
    this.listCache.set(file.path, { mtime: file.stat.mtime, lines });
    return lines;
  }
};
function parseListLines(content, items) {
  var _a;
  const parsed = [];
  for (const item of items) {
    const raw = content.slice(item.position.start.offset, item.position.end.offset);
    const marker = LIST_MARKER.exec(raw);
    const text = raw.slice((_a = marker == null ? void 0 : marker[0].length) != null ? _a : 0).replace(/\s*\n\s*/g, " ").trim();
    const box = typeof item.task === "string" ? item.task : marker == null ? void 0 : marker[1];
    parsed.push({
      text,
      isTask: typeof box === "string",
      checked: typeof box === "string" && box.trim().toLowerCase() === "x",
      links: extractLinks(text),
      line: item.position.start.line
    });
  }
  return parsed;
}
function extractLinks(text) {
  const links = [];
  WIKILINK2.lastIndex = 0;
  let match = WIKILINK2.exec(text);
  while (match) {
    const linktext = match[1].split("|")[0].replace(/\\$/, "").trim();
    if (linktext) links.push(linktext);
    match = WIKILINK2.exec(text);
  }
  return links;
}
function toStringList(value) {
  if (value === null || value === void 0) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item != null ? item : "").trim()).filter((item) => item.length > 0);
  }
  const text = String(value).trim();
  return text ? [text] : [];
}
function toText(value) {
  if (value === null || value === void 0) return "";
  return String(value).trim();
}
function toBoolean(value) {
  if (typeof value === "boolean") return value;
  const text = toText(value).toLowerCase();
  return text === "true" || text === "yes" || text === "\u662F";
}

// src/core/codeblock.ts
function registerViewCodeBlock(ctx, views) {
  const host = new ViewHost(ctx, views);
  ctx.plugin.registerEvent(ctx.app.metadataCache.on("changed", () => host.notifyChanged()));
  ctx.plugin.registerEvent(ctx.app.vault.on("delete", () => host.notifyChanged()));
  ctx.plugin.registerEvent(ctx.app.vault.on("rename", () => host.notifyChanged()));
  ctx.plugin.register(() => host.dispose());
  ctx.plugin.registerMarkdownCodeBlockProcessor(
    VIEW_BLOCK_LANG,
    (source, el, blockCtx) => {
      blockCtx.addChild(new ViewBlock(el, host, parseBlock(source), blockCtx.sourcePath));
    }
  );
}
var ViewHost = class {
  constructor(ctx, views) {
    this.blocks = /* @__PURE__ */ new Set();
    this.timer = null;
    this.ctx = ctx;
    this.index = new VaultIndex(ctx.app);
    this.registry = new Map(views.map((view) => [view.name, view]));
    this.names = views.map((view) => view.name);
  }
  contextFor(el, sourcePath, params) {
    const found = this.ctx.app.vault.getAbstractFileByPath(sourcePath);
    return {
      el,
      sourcePath,
      host: found instanceof import_obsidian2.TFile ? found : null,
      params,
      index: this.index,
      ctx: this.ctx
    };
  }
  attach(block) {
    this.blocks.add(block);
  }
  detach(block) {
    this.blocks.delete(block);
  }
  /**
   * 内容变了。
   * 事件回调本身必须是 O(1)——它在每一次击键的落盘上都会被叫到，
   * 因此这里只递增修订号并排一次防抖，真正的重建推迟到有人来问的时候。
   */
  notifyChanged() {
    this.index.invalidate();
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.timer = null;
      for (const block of this.blocks) void block.render();
    }, VIEW_REFRESH_DEBOUNCE_MS);
  }
  dispose() {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    this.blocks.clear();
  }
};
var ViewBlock = class extends import_obsidian2.MarkdownRenderChild {
  constructor(el, host, request, sourcePath) {
    super(el);
    this.host = host;
    this.request = request;
    this.sourcePath = sourcePath;
  }
  onload() {
    this.host.attach(this);
    void this.render();
  }
  onunload() {
    this.host.detach(this);
  }
  /**
   * 重画一次。
   * 三条兜底缺一不可：块里没写名字、名字不认识、视图自己抛错——
   * 任何一种都必须画出一句中文说明，绝不能留一个空白块让学员以为系统坏了。
   */
  async render() {
    this.containerEl.empty();
    if (!this.request.name) {
      renderEmpty(this.containerEl, "\u8FD9\u4E2A ziminos \u4EE3\u7801\u5757\u6CA1\u5199\u89C6\u56FE\u540D\u3002\u7B2C\u4E00\u884C\u5199\u89C6\u56FE\u540D\u5373\u53EF\uFF0C\u4F8B\u5982\u300C\u4EBA\u8109\u540D\u5F55\u300D\u3002");
      return;
    }
    const definition = this.host.registry.get(this.request.name);
    if (!definition) {
      renderEmpty(this.containerEl, `\u6CA1\u6709\u540D\u4E3A\u300C${this.request.name}\u300D\u7684\u89C6\u56FE\u3002`);
      renderNote(this.containerEl, `\u53EF\u7528\u89C6\u56FE\uFF1A${this.host.names.join(" \xB7 ")}`);
      return;
    }
    try {
      await definition.render(
        this.host.contextFor(this.containerEl, this.sourcePath, this.request.params)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.containerEl.empty();
      renderEmpty(this.containerEl, `\u89C6\u56FE\u300C${this.request.name}\u300D\u6E32\u67D3\u5931\u8D25\uFF1A${message}`);
    }
  }
};
function parseBlock(source) {
  var _a;
  const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);
  const params = {};
  for (const line of lines.slice(1)) {
    const separator = line.search(/[:：]/);
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) params[key] = value;
  }
  return { name: (_a = lines[0]) != null ? _a : "", params };
}

// src/core/commands.ts
var COMMAND_GROUPS = {
  setup: "\u5F00\u8352",
  projects: "\u9879\u76EE",
  inspiration: "\u7075\u611F",
  review: "\u590D\u76D8",
  contacts: "\u4EBA\u8109",
  clients: "\u5BA2\u6237",
  appearance: "\u5916\u89C2"
};
var COMMAND_ICONS = {
  vault: "ziminos-vault",
  project: "ziminos-project",
  card: "ziminos-card",
  done: "ziminos-done",
  paused: "ziminos-paused",
  dropped: "ziminos-dropped",
  active: "ziminos-active",
  inspiration: "ziminos-inspiration",
  daily: "ziminos-daily",
  weekly: "ziminos-weekly",
  monthly: "ziminos-monthly",
  quarterly: "ziminos-quarterly",
  yearly: "ziminos-yearly",
  theme: "ziminos-theme",
  contact: "ziminos-contact",
  favor: "ziminos-favor",
  clients: "ziminos-clients",
  client: "ziminos-client",
  payment: "ziminos-payment",
  receipt: "ziminos-receipt",
  appearance: "ziminos-appearance"
};
var INIT_VAULT_COMMAND = {
  id: "init-vault",
  name: "\u521D\u59CB\u5316\u7B14\u8BB0\u5E93",
  icon: COMMAND_ICONS.vault,
  group: COMMAND_GROUPS.setup
};
var PROJECT_COMMANDS = {
  create: {
    id: "create-project",
    name: "\u65B0\u5EFA\u9879\u76EE",
    icon: COMMAND_ICONS.project,
    group: COMMAND_GROUPS.projects
  },
  card: {
    id: "init-card",
    name: "\u521D\u59CB\u5316\u5F53\u524D\u5361\u7247",
    icon: COMMAND_ICONS.card,
    group: COMMAND_GROUPS.projects
  }
};
var TRANSITION_COMMANDS = [
  {
    id: "project-done",
    name: "\u5B8C\u6210\u9879\u76EE",
    icon: COMMAND_ICONS.done,
    group: COMMAND_GROUPS.projects,
    action: "done"
  },
  {
    id: "project-paused",
    name: "\u6682\u505C\u9879\u76EE",
    icon: COMMAND_ICONS.paused,
    group: COMMAND_GROUPS.projects,
    action: "paused"
  },
  {
    id: "project-dropped",
    name: "\u653E\u5F03\u9879\u76EE",
    icon: COMMAND_ICONS.dropped,
    group: COMMAND_GROUPS.projects,
    action: "dropped"
  },
  {
    id: "project-active",
    name: "\u91CD\u65B0\u5F00\u59CB\u9879\u76EE",
    icon: COMMAND_ICONS.active,
    group: COMMAND_GROUPS.projects,
    action: "active"
  }
];
var INSPIRATION_COMMAND = {
  id: "capture-inspiration",
  name: "\u8BB0\u5F55\u7075\u611F",
  icon: COMMAND_ICONS.inspiration,
  group: COMMAND_GROUPS.inspiration
};
var PERIOD_COMMANDS = {
  daily: {
    id: "open-diary",
    name: "\u6253\u5F00\u4ECA\u5929\u7684\u65E5\u8BB0",
    icon: COMMAND_ICONS.daily,
    group: COMMAND_GROUPS.review
  },
  weekly: {
    id: "open-weekly",
    name: "\u6253\u5F00\u672C\u5468\u590D\u76D8",
    icon: COMMAND_ICONS.weekly,
    group: COMMAND_GROUPS.review
  },
  monthly: {
    id: "open-monthly",
    name: "\u6253\u5F00\u672C\u6708\u590D\u76D8",
    icon: COMMAND_ICONS.monthly,
    group: COMMAND_GROUPS.review
  },
  quarterly: {
    id: "open-quarterly",
    name: "\u6253\u5F00\u672C\u5B63\u590D\u76D8",
    icon: COMMAND_ICONS.quarterly,
    group: COMMAND_GROUPS.review
  },
  yearly: {
    id: "open-yearly",
    name: "\u6253\u5F00\u672C\u5E74\u590D\u76D8",
    icon: COMMAND_ICONS.yearly,
    group: COMMAND_GROUPS.review
  }
};
var THEME_COMMAND = {
  id: "write-theme",
  name: "\u5199\u590D\u76D8\u4E3B\u9898",
  icon: COMMAND_ICONS.theme,
  group: COMMAND_GROUPS.review
};
var CONTACT_COMMANDS = {
  create: {
    id: "create-contact",
    name: "\u65B0\u5EFA\u4EBA\u8109",
    icon: COMMAND_ICONS.contact,
    group: COMMAND_GROUPS.contacts
  },
  favor: {
    id: "record-favor",
    name: "\u8BB0\u4EBA\u60C5",
    icon: COMMAND_ICONS.favor,
    group: COMMAND_GROUPS.contacts
  }
};
var CLIENT_COMMANDS = {
  setup: {
    id: "setup-clients",
    name: "\u521D\u59CB\u5316\u5BA2\u6237\u6A21\u5757",
    icon: COMMAND_ICONS.clients,
    group: COMMAND_GROUPS.clients
  },
  create: {
    id: "create-client",
    name: "\u65B0\u5EFA\u5BA2\u6237",
    icon: COMMAND_ICONS.client,
    group: COMMAND_GROUPS.clients
  },
  payment: {
    id: "add-payment",
    name: "\u589E\u52A0\u4ED8\u8D39",
    icon: COMMAND_ICONS.payment,
    group: COMMAND_GROUPS.clients
  },
  receipt: {
    id: "record-receipt",
    name: "\u8BB0\u6536\u6B3E",
    icon: COMMAND_ICONS.receipt,
    group: COMMAND_GROUPS.clients
  }
};
var APPEARANCE_COMMAND = {
  id: "open-appearance-switch",
  name: "\u6253\u5F00\u5916\u89C2\u5F00\u5173",
  icon: COMMAND_ICONS.appearance,
  group: COMMAND_GROUPS.appearance
};
var DEFAULT_RIBBON_COMMANDS = [
  PROJECT_COMMANDS.create.id,
  INSPIRATION_COMMAND.id,
  PERIOD_COMMANDS.daily.id,
  THEME_COMMAND.id,
  CONTACT_COMMANDS.create.id,
  CONTACT_COMMANDS.favor.id,
  APPEARANCE_COMMAND.id
];
function normalizeRibbonCommands(value) {
  if (!Array.isArray(value)) return DEFAULT_RIBBON_COMMANDS;
  return value.filter((item) => typeof item === "string");
}
var CommandRegistry = class {
  constructor(plugin) {
    this.entries = [];
    this.plugin = plugin;
  }
  /**
   * 注册一条命令。
   *
   * 一律用 callback 而非 checkCallback：命令必须在任何情况下都可见可点，
   * 用户在错误的笔记上执行时该得到一句「为什么不行」，而不是眼看着命令凭空消失。
   * 这条纪律同样适用于侧边栏——一个会自己隐身的图标比一句提示更让人困惑。
   */
  register(spec, run) {
    this.plugin.addCommand({
      id: spec.id,
      name: spec.name,
      icon: spec.icon,
      callback: run
    });
    this.entries.push({ spec, run });
  }
  /** 花名册，顺序即注册顺序。交出只读视图，谁都别想往里塞一条没注册过的命令 */
  list() {
    return this.entries;
  }
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
  inspirationFolder: INSPIRATION_DEFAULTS.folder,
  inspirationFileName: INSPIRATION_DEFAULTS.fileName,
  inspirationHeading: INSPIRATION_DEFAULTS.heading,
  inspirationInsertPosition: INSPIRATION_DEFAULTS.insertPosition,
  inspirationFormat: INSPIRATION_DEFAULTS.format,
  diaryFolder: FOLDERS.diary,
  contactFolder: CONTACT_FOLDER,
  clientFolder: CLIENT_FOLDER,
  clientSources: "B\u7AD9,\u6296\u97F3,\u5C0F\u7EA2\u4E66,\u516C\u4F17\u53F7,\u670B\u53CB\u4ECB\u7ECD,\u5176\u4ED6",
  clientProducts: "\u8BFE\u7A0B,\u54A8\u8BE2,\u966A\u8DD1",
  showAppearanceSwitch: true,
  ribbonCommands: DEFAULT_RIBBON_COMMANDS,
  initializedAt: ""
};

// src/modules/appearance/statusBar.ts
var import_obsidian3 = require("obsidian");

// src/modules/appearance/snippets.ts
var GROUP_PATTERN = /^【([^】]+)】\s*/;
var UNGROUPED_LABEL = "\u5176\u4ED6";
async function readSnippets(app) {
  const folder = `${app.vault.configDir}/${SNIPPET_FOLDER_NAME}`;
  if (!await app.vault.adapter.exists(folder)) return [];
  const listed = await app.vault.adapter.list(folder);
  const enabled = await readEnabledNames(app);
  const states = [];
  for (const path of listed.files) {
    if (!path.endsWith(SNIPPET_EXTENSION)) continue;
    const base = path.slice(path.lastIndexOf("/") + 1, -SNIPPET_EXTENSION.length);
    if (!base) continue;
    states.push({ ...splitGroup(base), name: base, enabled: enabled.has(base) });
  }
  return states.sort(compareSnippets);
}
function splitGroup(base) {
  const matched = GROUP_PATTERN.exec(base);
  if (!matched) return { group: UNGROUPED_LABEL, label: base };
  const label = base.slice(matched[0].length);
  return label ? { group: matched[1], label } : { group: UNGROUPED_LABEL, label: base };
}
function compareSnippets(a, b) {
  if (a.group !== b.group) {
    if (a.group === UNGROUPED_LABEL) return 1;
    if (b.group === UNGROUPED_LABEL) return -1;
    return a.group.localeCompare(b.group, "zh");
  }
  return a.label.localeCompare(b.label, "zh");
}
async function setSnippetEnabled(app, name, enabled) {
  const customCss = app.customCss;
  if (typeof (customCss == null ? void 0 : customCss.setCssEnabledStatus) === "function") {
    customCss.setCssEnabledStatus(name, enabled);
    return true;
  }
  await writeEnabledNames(app, name, enabled);
  return false;
}
function appearancePath(app) {
  return `${app.vault.configDir}/${APPEARANCE_FILE_NAME}`;
}
async function readEnabledNames(app) {
  return extractEnabledNames(await readAppearanceConfig(app));
}
function extractEnabledNames(config) {
  const listed = config[ENABLED_SNIPPETS_KEY];
  if (!Array.isArray(listed)) return /* @__PURE__ */ new Set();
  return new Set(listed.filter((item) => typeof item === "string"));
}
async function writeEnabledNames(app, name, enabled) {
  const config = await readAppearanceConfig(app);
  const names = extractEnabledNames(config);
  if (enabled) names.add(name);
  else names.delete(name);
  config[ENABLED_SNIPPETS_KEY] = [...names];
  await app.vault.adapter.write(appearancePath(app), `${JSON.stringify(config, null, 2)}
`);
}
async function readAppearanceConfig(app) {
  const config = {};
  const path = appearancePath(app);
  if (!await app.vault.adapter.exists(path)) return config;
  let parsed;
  try {
    parsed = JSON.parse(await app.vault.adapter.read(path));
  } catch (e) {
    return config;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return config;
  for (const [key, value] of Object.entries(parsed)) config[key] = value;
  return config;
}

// src/modules/appearance/statusBar.ts
var TEXTS = {
  tooltip: "\u5916\u89C2\u5F00\u5173\uFF1A\u5F00\u5173 CSS \u7247\u6BB5",
  /** setIcon 认不出图标名时的替身。MySnippets 就是因为图标名随 Obsidian 换图标库失效而「看不见」 */
  iconFallback: "\u{1F3A8}",
  iconName: "palette",
  title: "\u5916\u89C2\u5F00\u5173",
  countSuffix: " \u4E2A\u7247\u6BB5",
  empty: "\u7247\u6BB5\u76EE\u5F55\u91CC\u8FD8\u6CA1\u6709 CSS \u6587\u4EF6\u3002\u628A .css \u6587\u4EF6\u653E\u8FDB .obsidian/snippets/\uFF0C\u518D\u70B9\u4E00\u6B21\u8FD9\u4E2A\u6309\u94AE\u3002",
  pendingReload: "\u5DF2\u8BB0\u4E0B\u8FD9\u6B21\u6539\u52A8\uFF0C\u91CD\u65B0\u8F7D\u5165 Obsidian \u540E\u751F\u6548\u3002",
  failedReadPrefix: "\u8BFB\u4E0D\u5230\u7247\u6BB5\u76EE\u5F55\uFF1A",
  failedPrefix: "\u5199\u5165\u5931\u8D25\uFF1A"
};
var SAME_GESTURE_MS = 300;
function registerAppearanceSwitch(ctx) {
  const swi = new AppearanceSwitch(ctx);
  return () => swi.syncVisibility();
}
var AppearanceSwitch = class {
  constructor(ctx) {
    /** 浮层只在打开期间存在；null 即「当前没开」，不留隐藏的空壳 */
    this.panelEl = null;
    /** 关闭浮层用的解绑动作。开一次装一次、关一次拆干净，不给插件生命周期留监听残渣 */
    this.detachers = [];
    /**
     * 上一次「点了别处所以关掉」发生在什么时刻（performance.now）。
     *
     * 它解决的是第三个入口带来的一个具体麻烦：左侧边栏那个调色盘按钮不在放行名单里
     * （状态栏按钮是构造时就拿到的引用，边栏按钮由 ribbon 模块发出，本文件够不着），
     * 于是点它一下会被同一次手势处理两遍——mousedown 判定「点了别处」先关，
     * 随后 click 触发命令又开回来，浮层闪一下还在，用户以为按钮坏了。
     * 记一个时刻而不是维护一份放行名单，是因为「谁能打开我」这件事会随入口增加而增长，
     * 名单迟早漏掉一个；而「这次打开是不是刚才那次关闭的同一个手势」是个恒定的问题。
     * 判据与 SelfWriteGuard 同形：都是「这动作是不是我自己刚才引起的」。
     */
    this.dismissedAt = Number.NEGATIVE_INFINITY;
    this.ctx = ctx;
    this.statusEl = ctx.plugin.addStatusBarItem();
    this.statusEl.addClass("ziminos-appearance-switch");
    this.statusEl.addClass("mod-clickable");
    (0, import_obsidian3.setTooltip)(this.statusEl, TEXTS.tooltip, { placement: "top" });
    this.paintIcon();
    this.syncVisibility();
    this.statusEl.addEventListener("click", () => this.toggle());
    ctx.commands.register(APPEARANCE_COMMAND, () => this.toggle());
    ctx.plugin.register(() => this.close());
  }
  /** 按设置决定按钮显隐。关掉只是收起按钮，命令与浮层照常可用 */
  syncVisibility() {
    this.statusEl.toggle(this.ctx.settings.showAppearanceSwitch);
  }
  /**
   * 画图标。
   * 图标名属于 Obsidian 的图标库，换库就会失效——那正是 MySnippets 在新版里
   * 只剩一个看不见的按钮的原因。这里画完检查一眼有没有真的画出 svg，没有就退回一个字符。
   */
  paintIcon() {
    (0, import_obsidian3.setIcon)(this.statusEl, TEXTS.iconName);
    if (!this.statusEl.querySelector("svg")) this.statusEl.setText(TEXTS.iconFallback);
  }
  // ============================================================
  // 开合
  // ============================================================
  toggle() {
    if (this.panelEl) {
      this.close();
      return;
    }
    const sameGesture = performance.now() - this.dismissedAt < SAME_GESTURE_MS;
    this.dismissedAt = Number.NEGATIVE_INFINITY;
    if (sameGesture) return;
    void this.open();
  }
  /** 打开浮层。事实现读，因此「设置 → 外观」里的改动与新丢进目录的文件都会出现在这一次 */
  async open() {
    this.close();
    const panel = document.body.createDiv({ cls: "ziminos-appearance-panel" });
    this.panelEl = panel;
    this.place(panel);
    this.bindDismiss(panel);
    try {
      const snippets = await readSnippets(this.ctx.app);
      if (this.panelEl !== panel) return;
      this.render(panel, snippets);
    } catch (error) {
      if (this.panelEl !== panel) return;
      panel.createDiv({
        cls: "ziminos-appearance-empty",
        text: TEXTS.failedReadPrefix + describe(error)
      });
    }
  }
  close() {
    var _a;
    for (const detach of this.detachers) detach();
    this.detachers.length = 0;
    (_a = this.panelEl) == null ? void 0 : _a.remove();
    this.panelEl = null;
  }
  /**
   * 把浮层贴到状态栏按钮上方。
   *
   * 位置一律由按钮的实际矩形算出，不写死像素——MySnippets 用的是
   * 「窗口右下角减 15 和 37」，换一套窗口边框就飘出屏幕。
   * 按钮被用户收起来时（此时用命令打开）矩形是全零，退回贴着窗口右下角。
   */
  place(panel) {
    const rect = this.statusEl.getBoundingClientRect();
    const anchored = rect.width > 0;
    panel.style.bottom = `${anchored ? window.innerHeight - rect.top + 6 : 34}px`;
    panel.style.right = `${anchored ? Math.max(8, window.innerWidth - rect.right) : 12}px`;
  }
  /** 点别处、按 Esc、改窗口大小都算「不看了」。三个监听都记进 detachers，关闭时一起拆掉 */
  bindDismiss(panel) {
    const onPointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panel.contains(target) || this.statusEl.contains(target)) return;
      this.dismissedAt = performance.now();
      this.close();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") this.close();
    };
    const onResize = () => this.close();
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", onResize);
    this.detachers.push(
      () => document.removeEventListener("mousedown", onPointerDown, true),
      () => document.removeEventListener("keydown", onKeyDown, true),
      () => window.removeEventListener("resize", onResize)
    );
  }
  // ============================================================
  // 渲染
  // ============================================================
  /** 画标题、分组与每一行。分组名来自用户自己的【】命名习惯，不是我们发明的分类 */
  render(panel, snippets) {
    const header = panel.createDiv({ cls: "ziminos-appearance-header" });
    header.createSpan({ text: TEXTS.title });
    header.createSpan({
      cls: "ziminos-appearance-count",
      text: `${snippets.length}${TEXTS.countSuffix}`
    });
    if (snippets.length === 0) {
      panel.createDiv({ cls: "ziminos-appearance-empty", text: TEXTS.empty });
      return;
    }
    const list = panel.createDiv({ cls: "ziminos-appearance-list" });
    let currentGroup = "";
    for (const snippet of snippets) {
      if (snippet.group !== currentGroup) {
        currentGroup = snippet.group;
        list.createDiv({ cls: "ziminos-appearance-group", text: currentGroup });
      }
      this.renderRow(list, snippet);
    }
  }
  /**
   * 一行：名字 + 开关。
   *
   * 失败要把开关拨回去——否则界面说「开着」而磁盘上是关着的，
   * 用户下次打开面板会看到它自己变了回去，那比一开始就报错更让人不信任系统。
   * 回拨用一个重入标志兜住：ToggleComponent.setValue 是否回调 onChange 属于它的实现细节，
   * 不该由我们来赌。
   */
  renderRow(list, snippet) {
    const row = list.createDiv({ cls: "ziminos-appearance-row" });
    row.createSpan({ cls: "ziminos-appearance-name", text: snippet.label });
    const toggle = new import_obsidian3.ToggleComponent(row);
    let rollingBack = false;
    toggle.setValue(snippet.enabled).onChange((value) => {
      if (rollingBack) return;
      void this.applyToggle(snippet, value, () => {
        rollingBack = true;
        toggle.setValue(!value);
        rollingBack = false;
      });
    });
  }
  /** 落一次开关：即刻生效就闭嘴，只落了盘就提醒重载，失败就回拨并说明原因 */
  async applyToggle(snippet, value, rollback) {
    try {
      const applied = await setSnippetEnabled(this.ctx.app, snippet.name, value);
      if (!applied) new import_obsidian3.Notice(TEXTS.pendingReload);
    } catch (error) {
      rollback();
      new import_obsidian3.Notice(TEXTS.failedPrefix + describe(error));
    }
  }
};
function describe(error) {
  return error instanceof Error ? error.message : String(error);
}

// src/core/time.ts
var import_obsidian4 = require("obsidian");
var momentFactory = import_obsidian4.moment;
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
    uid: Number(now.format(UID_FORMAT))
  };
}
function nowLocalDateTimeParts(format) {
  const now = momentFactory();
  return {
    date: now.format(DAY_FORMAT),
    time: now.format("HH:mm"),
    datetime: now.format(normalizeDateTimeFormat(format))
  };
}
function today() {
  return momentFactory().format(DAY_FORMAT);
}
function dayText(value) {
  if (value === null || value === void 0) return null;
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : momentFactory(time).format(DAY_FORMAT);
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? momentFactory(value).format(DAY_FORMAT) : null;
  }
  const text = String(value).trim();
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : null;
}
function dayOfMillis(millis) {
  return momentFactory(millis).format(DAY_FORMAT);
}
function dayOfTitle(title) {
  return momentFactory(title, DAY_FORMAT, true).isValid() ? title : null;
}
function shiftDay(day, amount, unit) {
  const parsed = momentFactory(day, DAY_FORMAT, true);
  if (!parsed.isValid()) return day;
  return parsed.add(amount, unit).format(DAY_FORMAT);
}
function daysBetween(from, to) {
  if (!from || !to) return null;
  const start = momentFactory(from, DAY_FORMAT, true);
  const end = momentFactory(to, DAY_FORMAT, true);
  if (!start.isValid() || !end.isValid()) return null;
  return Math.round(end.diff(start, "days"));
}
function currentPeriodTitle(period) {
  return momentFactory().format(period.titleFormat);
}
function periodStartOf(period, title) {
  const parsed = momentFactory(title, period.titleFormat, true);
  if (!parsed.isValid()) return null;
  return parsed.startOf(period.startOfUnit).format(DAY_FORMAT);
}
function periodNeighbours(period, title, parentPeriod) {
  const parsed = momentFactory(title, period.titleFormat, true);
  if (!parsed.isValid()) return null;
  const prev = parsed.clone().subtract(1, period.stepUnit).format(period.titleFormat);
  const next = parsed.clone().add(1, period.stepUnit).format(period.titleFormat);
  if (!parentPeriod) return { prev, next, parent: null };
  const anchor = parsed.clone().startOf(period.startOfUnit);
  const parent = (period.key === "weekly" ? anchor.add(3, "days") : anchor).format(
    parentPeriod.titleFormat
  );
  return { prev, next, parent };
}
function titleOfDay(day, period) {
  const parsed = momentFactory(day, DAY_FORMAT, true);
  return parsed.isValid() ? parsed.format(period.titleFormat) : null;
}

// src/modules/contacts/identity.ts
var import_obsidian7 = require("obsidian");

// src/core/modals.ts
var import_obsidian5 = require("obsidian");
var TextInputModal = class extends import_obsidian5.Modal {
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
    new import_obsidian5.ButtonComponent(buttonBar).setButtonText("\u53D6\u6D88").onClick(() => this.close());
    new import_obsidian5.ButtonComponent(buttonBar).setButtonText("\u786E\u8BA4").setCta().onClick(() => this.submit(inputEl.value));
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
var ChoiceModal = class extends import_obsidian5.FuzzySuggestModal {
  constructor(app, options) {
    super(app);
    this.resolver = null;
    this.settled = false;
    this.options = options;
    this.setPlaceholder(options.title);
  }
  /** 打开弹窗并等待用户作答：选中返回该项，取消返回 null */
  openAndGetChoice() {
    return new Promise((resolve) => {
      this.resolver = resolve;
      this.open();
    });
  }
  getItems() {
    return [...this.options.items];
  }
  getItemText(item) {
    return this.options.labelOf(item);
  }
  onChooseItem(item) {
    this.settle(item);
  }
  /**
   * 关闭即取消——但不能立刻断定。
   *
   * Obsidian 的 SuggestModal 在用户选中一项时，是**先关闭弹窗、再回调 onChooseItem**。
   * 若在这里同步结算成 null，每一次正常选择都会先被判成取消，随后的 onChooseItem
   * 因为 settle 幂等而失效——表现就是四条走选择的命令永远只说「已取消」。
   * 推迟一拍再结算，选中回调便有机会先落定；真正的取消（Esc / 遮罩）没有后续回调，
   * 一拍之后照样结算成 null。顺序在两种路径下都成立，不依赖基类的实现细节。
   */
  onClose() {
    super.onClose();
    window.setTimeout(() => this.settle(null), 0);
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

// src/core/folders.ts
var import_obsidian6 = require("obsidian");
async function ensureFolderPath(app, folderPath) {
  const normalizedFolderPath = (0, import_obsidian6.normalizePath)(folderPath);
  const pathParts = normalizedFolderPath.split("/").filter(Boolean);
  let currentPath = "";
  for (const pathPart of pathParts) {
    currentPath = currentPath ? `${currentPath}/${pathPart}` : pathPart;
    const existingEntry = app.vault.getAbstractFileByPath(currentPath);
    if (!existingEntry) {
      await app.vault.createFolder(currentPath);
      continue;
    }
    if (!(existingEntry instanceof import_obsidian6.TFolder)) {
      throw new Error(`\u65E0\u6CD5\u521B\u5EFA\u6587\u4EF6\u5939\uFF0C\u56E0\u4E3A\u540C\u4E00\u8DEF\u5F84\u4E0B\u5DF2\u7ECF\u5B58\u5728\u6587\u4EF6\uFF1A${currentPath}`);
    }
  }
}
function normalizeFolderPath(value, fallback) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const path = (candidate || fallback).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return (0, import_obsidian6.normalizePath)(path);
}
function isInFolder(path, folder) {
  const base = folder.replace(/\/+$/, "");
  if (!base) return true;
  return path === base || path.startsWith(`${base}/`);
}

// src/modules/contacts/identity.ts
function archiveFolderOf(ctx) {
  return normalizeFolderPath(ctx.settings.archiveFolder, FOLDERS.archives);
}
function isLivePath(archiveFolder, path) {
  return !isInFolder(path, archiveFolder);
}
function liveNotesOfType(ctx, type) {
  var _a, _b;
  const archive = archiveFolderOf(ctx);
  const matched = [];
  for (const file of ctx.app.vault.getMarkdownFiles()) {
    if (!isLivePath(archive, file.path)) continue;
    const declared = (_b = (_a = ctx.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b[FIELDS.type];
    const values = Array.isArray(declared) ? declared : [declared];
    if (values.some((value) => String(value != null ? value : "").trim() === type)) matched.push(file);
  }
  return matched.sort((left, right) => left.basename.localeCompare(right.basename, "zh"));
}
function descriptionOf(ctx, file) {
  var _a, _b;
  const value = (_b = (_a = ctx.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b[FIELDS.description];
  return String(value != null ? value : "").trim();
}
async function pickPerson(ctx, title, quietWhenEmpty = false) {
  const candidates = [
    ...liveNotesOfType(ctx, NOTE_TYPES.person),
    ...liveNotesOfType(ctx, NOTE_TYPES.client)
  ];
  if (!candidates.length) {
    if (!quietWhenEmpty) {
      new import_obsidian7.Notice("\u8FD8\u6CA1\u6709\u4EFB\u4F55\u4EBA\u8109\u6216\u5BA2\u6237\u6863\u6848\u3002\u5148\u8FD0\u884C\u300C\u65B0\u5EFA\u4EBA\u8109\u300D\u5EFA\u4E00\u4E2A\uFF0C\u518D\u6765\u5173\u8054\u3002");
    }
    return null;
  }
  return new ChoiceModal(ctx.app, {
    title,
    items: candidates,
    labelOf: (file) => {
      const hint = descriptionOf(ctx, file);
      return hint ? `${file.basename}\u3000\u2014\u3000${hint}` : file.basename;
    }
  }).openAndGetChoice();
}
function lastContactDayOf(view, person) {
  let latest = null;
  for (const source of view.index.backlinksOf(person)) {
    const day = dayOfTitle(source.basename);
    if (day && (!latest || day > latest)) latest = day;
  }
  return latest;
}

// src/modules/contacts/ledger.ts
function diaryNotes(view) {
  const found = [];
  for (const file of view.index.allNotes()) {
    const day = dayOfTitle(file.basename);
    if (day) found.push({ file, day });
  }
  return found;
}
function mentions(view, line, diaryPath, target) {
  return line.links.some((link) => {
    var _a;
    return ((_a = view.index.resolve(link, diaryPath)) == null ? void 0 : _a.path) === target.path;
  });
}
function isLedgerLine(line) {
  if (line.isTask) return false;
  const segments = line.text.split(LEDGER.separator);
  return segments.length >= 3 && LEDGER.kinds.includes(segments[1].trim());
}
async function collectLedger(view, resolvePerson) {
  const entries = [];
  for (const { file, day } of diaryNotes(view)) {
    for (const line of await view.index.listLinesOf(file)) {
      if (!isLedgerLine(line)) continue;
      const segments = line.text.split(LEDGER.separator).map((part) => part.trim());
      const owner = firstResolved(view, segments[0], file.path);
      if (!owner || !resolvePerson(owner)) continue;
      const status = segments[3] || LEDGER.defaultStatus;
      entries.push({
        diary: file,
        day,
        person: owner,
        kind: segments[1],
        item: segments[2],
        status,
        legal: LEDGER.statuses.includes(status)
      });
    }
  }
  return entries.sort((left, right) => right.day.localeCompare(left.day));
}
function firstResolved(view, segment, sourcePath) {
  for (const link of extractLinks(segment)) {
    const resolved = view.index.resolve(link, sourcePath);
    if (resolved) return resolved;
  }
  return null;
}

// src/modules/contacts/circleViews.ts
var UNGROUPED = "\u672A\u5F52\u5708";
var roster = {
  name: "\u4EBA\u8109\u540D\u5F55",
  render: async (view) => {
    const people = livePeople(view);
    if (!people.length) {
      renderEmpty(view.el, "\u8FD8\u6CA1\u6709\u6863\u6848\u3002\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u65B0\u5EFA\u4EBA\u8109\u300D\u5EFA\u7B2C\u4E00\u4E2A\u3002");
      return;
    }
    const circles = /* @__PURE__ */ new Map();
    let stale = 0;
    for (const person of people) {
      const row = rosterRowOf(view, person);
      if (row.overdue) stale += 1;
      const circle = circleOf(view, person);
      const bucket = circles.get(circle);
      if (bucket) bucket.push(row);
      else circles.set(circle, [row]);
    }
    renderSummary(
      view.el,
      stale ? `\u5171 ${people.length} \u4EBA\uFF0C\u5176\u4E2D **${stale} \u4EBA**\u5DF2\u8D85\u51FA\u8BE5\u5C42\u7684\u8054\u7CFB\u8282\u594F\u3002` : `\u5171 ${people.length} \u4EBA\uFF0C\u90FD\u5728\u8054\u7CFB\u534A\u5F84\u5185\u3002`
    );
    const ordered = [...circles.entries()].sort((left, right) => {
      if (left[0] === UNGROUPED) return 1;
      if (right[0] === UNGROUPED) return -1;
      return right[1].length - left[1].length;
    });
    for (const [circle, rows] of ordered) {
      renderHeading(view.el, 3, `${circle}\uFF08${rows.length}\uFF09`);
      if (circle === UNGROUPED) {
        renderNote(view.el, `\u8FD9\u4E9B\u6863\u6848\u7684 \`${FIELDS.up}\` \u6CA1\u6307\u5411\u4EFB\u4F55\u5708\u5B50 MOC\uFF0C\u8865\u4E0A\u5C31\u4F1A\u5F52\u5165\u5BF9\u5E94\u7684\u7EC4\u3002`);
      }
      rows.sort((left, right) => left.tierRank - right.tierRank || staleness(right) - staleness(left));
      renderTable(
        view.ctx.app,
        view.el,
        view.sourcePath,
        ["\u8C01", "\u4E00\u53E5\u8BDD", "\u5C42", "\u65B9\u5411", "\u4ED6\u80FD\u7ED9\u6211\u7684", "\u6700\u8FD1\u8054\u7CFB"],
        rows.map((row) => [
          noteLink(row.file),
          toText(view.index.fieldOf(row.file, FIELDS.description)),
          row.tier || "\u2014",
          toText(view.index.fieldOf(row.file, FIELDS.direction)) || "\u2014",
          toStringList(view.index.fieldOf(row.file, FIELDS.get)).join("\u3001") || "\u2014",
          lastContactText(row)
        ]),
        1
      );
    }
  }
};
function rosterRowOf(view, person) {
  var _a;
  const tier = toText(view.index.fieldOf(person, FIELDS.tier));
  const last = lastContactDayOf(view, person);
  const days = last ? daysBetween(last, today()) : null;
  const limit = (_a = TIER_LIMITS[tier]) != null ? _a : TIER_FALLBACK_LIMIT;
  return {
    file: person,
    tier,
    // 层没写或写了未知值的排在所有已知层之后，但不算错——只是还没定节奏
    tierRank: CONTACT_TIERS.indexOf(tier) < 0 ? CONTACT_TIERS.length : CONTACT_TIERS.indexOf(tier),
    days,
    overdue: days === null || days > limit
  };
}
function staleness(row) {
  var _a;
  return (_a = row.days) != null ? _a : Number.MAX_SAFE_INTEGER;
}
function lastContactText(row) {
  if (row.days === null) return "\u26A0\uFE0F \u4ECE\u672A";
  const text = row.days === 0 ? "\u4ECA\u5929" : `${row.days} \u5929\u524D`;
  return row.overdue ? `\u26A0\uFE0F ${text}` : text;
}
function circleOf(view, person) {
  var _a, _b, _c, _d;
  for (const link of extractLinks(String((_a = view.index.fieldOf(person, FIELDS.up)) != null ? _a : ""))) {
    return (_d = (_c = (_b = view.index.resolve(link, person.path)) == null ? void 0 : _b.basename) != null ? _c : link.split("/").pop()) != null ? _d : UNGROUPED;
  }
  return UNGROUPED;
}
var giftList = {
  name: "\u6295\u5582\u540D\u5355",
  render: async (view) => {
    const rows = [];
    for (const person of livePeople(view)) {
      if (!toBoolean(view.index.fieldOf(person, FIELDS.gift))) continue;
      const address = toText(view.index.fieldOf(person, FIELDS.address));
      rows.push([
        noteLink(person),
        toText(view.index.fieldOf(person, FIELDS.description)),
        address || "\u26A0\uFE0F \u8FD8\u6CA1\u586B\u5BC4\u4EF6\u4FE1\u606F"
      ]);
    }
    if (!rows.length) {
      renderEmpty(
        view.el,
        `\u540D\u5355\u662F\u7A7A\u7684\u3002\u6253\u5F00\u67D0\u4EBA\u7684\u6863\u6848\uFF0C\u5C5E\u6027\u91CC\u628A \`${FIELDS.gift}\` \u5199\u6210 true\u3001\`${FIELDS.address}\` \u586B\u4E0A\u6574\u4E32\u5BC4\u4EF6\u4FE1\u606F\uFF0C\u4ED6\u5C31\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002`
      );
      return;
    }
    renderTable(view.ctx.app, view.el, view.sourcePath, ["\u8C01", "\u4E00\u53E5\u8BDD", "\u5BC4\u4EF6\u4FE1\u606F"], rows, 2);
  }
};
var birthdays = {
  name: "\u672C\u6708\u751F\u65E5",
  render: async (view) => {
    const now = today();
    const month = now.slice(5, 7);
    const upcoming = [];
    for (const person of livePeople(view)) {
      const birthday = dayText(view.index.fieldOf(person, FIELDS.birthday));
      if (!birthday || birthday.slice(5, 7) !== month) continue;
      const thisYear = `${now.slice(0, 4)}-${birthday.slice(5)}`;
      upcoming.push({ file: person, date: birthday.slice(5), days: daysBetween(now, thisYear) });
    }
    if (!upcoming.length) {
      renderEmpty(view.el, `\u8FD9\u4E2A\u6708\u6CA1\u6709\u4EBA\u8FC7\u751F\u65E5\u3002\u5728\u6863\u6848\u5C5E\u6027\u91CC\u586B \`${FIELDS.birthday}\`\uFF0C\u5230\u6708\u4EFD\u4E86\u4F1A\u81EA\u52A8\u51FA\u73B0\u3002`);
      return;
    }
    upcoming.sort((left, right) => left.date.localeCompare(right.date));
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u8C01", "\u751F\u65E5", "\u8FD8\u6709\u51E0\u5929"],
      upcoming.map((entry) => [noteLink(entry.file), entry.date, countdownOf(entry.days)])
    );
  }
};
function countdownOf(days) {
  if (days === null) return "\u2014";
  if (days === 0) return "\u{1F382} \u5C31\u662F\u4ECA\u5929";
  return days > 0 ? `\u8FD8\u6709 ${days} \u5929` : `\u5DF2\u8FC7 ${-days} \u5929`;
}
var balance = {
  name: "\u4EBA\u60C5\u4F59\u989D",
  render: async (view) => {
    var _a;
    const archive = archiveFolderOf(view.ctx);
    const entries = await collectLedger(view, (owner) => isLivePath(archive, owner.path));
    const balances = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      if (entry.status === LEDGER.defaultStatus) continue;
      const current = (_a = balances.get(entry.person.path)) != null ? _a : {
        person: entry.person,
        owed: 0,
        owing: 0,
        last: entry.day
      };
      if (entry.status === "\u6211\u6B20") current.owing += 1;
      else if (entry.status === "\u4ED6\u6B20") current.owed += 1;
      if (entry.day > current.last) current.last = entry.day;
      balances.set(entry.person.path, current);
    }
    if (!balances.size) {
      renderEmpty(view.el, "\u6CA1\u6709\u672A\u4E24\u6E05\u7684\u4EBA\u60C5\u3002\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u8BB0\u4EBA\u60C5\u300D\u8BB0\u4E0B\u4E00\u7B14\u3002");
      return;
    }
    const rows = [...balances.values()].sort(
      (left, right) => right.owing + right.owed - (left.owing + left.owed)
    );
    renderSummary(view.el, `**${rows.length}** \u4E2A\u4EBA\u8FD8\u6709\u6CA1\u4E24\u6E05\u7684\u8D26\u3002`);
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u8C01", "\u6211\u6B20\u4ED6", "\u4ED6\u6B20\u6211", "\u6700\u8FD1\u4E00\u7B14"],
      rows.map((row) => [
        noteLink(row.person),
        row.owing || "\u2014",
        row.owed || "\u2014",
        row.last
      ])
    );
  }
};
function livePeople(view) {
  const archive = archiveFolderOf(view.ctx);
  return view.index.notesOfType(NOTE_TYPES.person).filter((file) => isLivePath(archive, file.path));
}
var circleViews = [roster, giftList, birthdays, balance];

// src/modules/contacts/clientViews.ts
var INLINE_FIELD = /\[([^\]:]+)::([^\]]*)\]/g;
var pending = {
  name: "\u5F85\u4EA4\u4ED8",
  render: async (view) => {
    const payments = (await allPayments(view)).filter((payment) => !payment.delivered);
    if (!payments.length) {
      renderEmpty(view.el, "\u6CA1\u6709\u5F85\u4EA4\u4ED8\u7684\u5355\u5B50\u3002\u6536\u4E86\u94B1\u5C31\u7528\u300C\u589E\u52A0\u4ED8\u8D39\u300D\u8BB0\u4E00\u7B14\uFF0C\u4EA4\u4ED8\u5B8C\u70B9\u6389\u90A3\u4E2A\u52FE\u3002");
      return;
    }
    const now = today();
    payments.sort((left, right) => left.date.localeCompare(right.date));
    renderSummary(view.el, `**${payments.length}** \u7B14\u8FD8\u6CA1\u4EA4\u4ED8\uFF0C\u5171 **${sum(payments)}**\u3002`);
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u8C01", "\u4EA7\u54C1", "\u91D1\u989D", "\u4ED8\u6B3E\u65E5", "\u7B49\u4E86"],
      payments.map((payment) => [
        noteLink(payment.note),
        payment.product || "\u2014",
        payment.amount,
        payment.date || "\u2014",
        formatDays(daysBetween(payment.date, now))
      ])
    );
  }
};
var sales = {
  name: "\u9500\u552E\u5206\u6790",
  render: async (view) => {
    var _a, _b;
    const payments = await allPayments(view);
    if (!payments.length) {
      renderEmpty(view.el, "\u8FD8\u6CA1\u6709\u4EFB\u4F55\u6D41\u6C34\u3002\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u589E\u52A0\u4ED8\u8D39\u300D\u8BB0\u7B2C\u4E00\u7B14\u3002");
      return;
    }
    renderSummary(view.el, `\u7D2F\u8BA1 **${payments.length}** \u7B14\uFF0C\u5171 **${sum(payments)}**\u3002`);
    const byChannel = /* @__PURE__ */ new Map();
    for (const payment of payments) {
      const channel = toText(view.index.fieldOf(payment.note, FIELDS.source)) || "\u672A\u6807\u6E20\u9053";
      const bucket = (_a = byChannel.get(channel)) != null ? _a : { people: /* @__PURE__ */ new Set(), count: 0, total: 0 };
      bucket.people.add(payment.note.path);
      bucket.count += 1;
      bucket.total += payment.amount;
      byChannel.set(channel, bucket);
    }
    renderHeading(view.el, 4, "\u6309\u6E20\u9053");
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u6E20\u9053", "\u4EBA\u6570", "\u7B14\u6570", "\u91D1\u989D", "\u5BA2\u5355\u4EF7"],
      [...byChannel.entries()].sort((left, right) => right[1].total - left[1].total).map(([channel, bucket]) => [
        channel,
        bucket.people.size,
        bucket.count,
        bucket.total,
        Math.round(bucket.total / bucket.people.size)
      ])
    );
    const byProduct = /* @__PURE__ */ new Map();
    for (const payment of payments) {
      const product = payment.product || "\u672A\u6807\u4EA7\u54C1";
      const bucket = (_b = byProduct.get(product)) != null ? _b : { count: 0, total: 0 };
      bucket.count += 1;
      bucket.total += payment.amount;
      byProduct.set(product, bucket);
    }
    renderHeading(view.el, 4, "\u6309\u4EA7\u54C1");
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u4EA7\u54C1", "\u7B14\u6570", "\u91D1\u989D"],
      [...byProduct.entries()].sort((left, right) => right[1].total - left[1].total).map(([product, bucket]) => [product, bucket.count, bucket.total])
    );
  }
};
var paidUsers = {
  name: "\u4ED8\u8D39\u7528\u6237",
  render: async (view) => {
    var _a;
    const payments = await allPayments(view);
    if (!payments.length) {
      renderEmpty(view.el, "\u8FD8\u6CA1\u6709\u4ED8\u8D39\u7528\u6237\u3002\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u65B0\u5EFA\u5BA2\u6237\u300D\uFF0C\u518D\u7528\u300C\u589E\u52A0\u4ED8\u8D39\u300D\u8BB0\u4E00\u7B14\u3002");
      return;
    }
    const byClient = /* @__PURE__ */ new Map();
    for (const payment of payments) {
      const bucket = (_a = byClient.get(payment.note.path)) != null ? _a : {
        note: payment.note,
        count: 0,
        total: 0,
        last: ""
      };
      bucket.count += 1;
      bucket.total += payment.amount;
      if (payment.date > bucket.last) bucket.last = payment.date;
      byClient.set(payment.note.path, bucket);
    }
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u8C01", "\u6E20\u9053", "\u7B14\u6570", "\u7D2F\u8BA1", "\u6700\u8FD1\u4E00\u7B14"],
      [...byClient.values()].sort((left, right) => right.total - left.total).map((bucket) => [
        noteLink(bucket.note),
        toText(view.index.fieldOf(bucket.note, FIELDS.source)) || "\u2014",
        // 复购是最值得一眼看见的事实，用 ★ 标出来
        bucket.count > 1 ? `${bucket.count} \u2605` : bucket.count,
        bucket.total,
        bucket.last || "\u2014"
      ])
    );
  }
};
var openCases = {
  name: "\u672A\u7ED3\u6848",
  render: async (view) => {
    var _a;
    const now = today();
    const rows = [];
    for (const { project, client } of clientProjects(view)) {
      if (toText(view.index.fieldOf(project, FIELDS.status)).toLowerCase() !== "active") continue;
      const born = (_a = dayText(view.index.fieldOf(project, FIELDS.created))) != null ? _a : dayOfMillis(project.stat.ctime);
      rows.push([
        noteLink(project),
        client ? noteLink(client) : "\u2014",
        born,
        formatDays(daysBetween(born, now))
      ]);
    }
    if (!rows.length) {
      renderEmpty(view.el, "\u6CA1\u6709\u672A\u7ED3\u7684\u6848\u5B50\u3002\u624B\u4E0A\u7684\u6D3B\u513F\u90FD\u4EA4\u4ED8\u5B8C\u4E86\u3002");
      return;
    }
    renderSummary(view.el, `\u8FD8\u6B20 **${rows.length}** \u4E2A\u4EA4\u4ED8\u3002`);
    renderTable(view.ctx.app, view.el, view.sourcePath, ["\u9879\u76EE", "\u5BA2\u6237", "\u5F00\u59CB", "\u5DF2\u8FDB\u884C"], rows);
  }
};
var caseLibrary = {
  name: "\u6848\u4F8B\u5E93",
  render: async (view) => {
    var _a, _b;
    const rows = [];
    const topics = /* @__PURE__ */ new Map();
    for (const { project, client } of clientProjects(view)) {
      if (toText(view.index.fieldOf(project, FIELDS.status)).toLowerCase() !== "done") continue;
      const born = (_a = dayText(view.index.fieldOf(project, FIELDS.created))) != null ? _a : dayOfMillis(project.stat.ctime);
      const closed = dayText(view.index.fieldOf(project, FIELDS.archived));
      for (const tag of toStringList(view.index.fieldOf(project, FIELDS.tags))) {
        topics.set(tag, ((_b = topics.get(tag)) != null ? _b : 0) + 1);
      }
      rows.push([
        noteLink(project),
        client ? noteLink(client) : "\u2014",
        closed != null ? closed : "\u2014",
        formatDays(daysBetween(born, closed))
      ]);
    }
    if (!rows.length) {
      renderEmpty(view.el, "\u6848\u4F8B\u5E93\u8FD8\u662F\u7A7A\u7684\u3002\u7ED3\u6848\u7684\u5BA2\u6237\u9879\u76EE\u4F1A\u81EA\u52A8\u6536\u8FDB\u6765\u3002");
      return;
    }
    renderTable(view.ctx.app, view.el, view.sourcePath, ["\u9879\u76EE", "\u5BA2\u6237", "\u7ED3\u6848", "\u5386\u65F6"], rows);
    const ranked = [...topics.entries()].sort((left, right) => right[1] - left[1]);
    if (ranked.length) {
      renderNote(
        view.el,
        `\u4E3B\u9898\u5206\u5E03\uFF1A${ranked.map(([tag, count]) => `${tag} ${count}`).join(" \xB7 ")}\u3000\uFF08\u5806\u5230\u4E09\u4E94\u4E2A\u5C31\u8BE5\u505A\u6210\u8BFE\uFF09`
      );
    }
  }
};
var serviceClients = {
  name: "\u670D\u52A1\u5BA2\u6237",
  render: async (view) => {
    var _a;
    const stats = /* @__PURE__ */ new Map();
    for (const { project, client } of clientProjects(view)) {
      if (!client) continue;
      const bucket = (_a = stats.get(client.path)) != null ? _a : { note: client, open: 0, total: 0 };
      bucket.total += 1;
      if (toText(view.index.fieldOf(project, FIELDS.status)).toLowerCase() === "active") {
        bucket.open += 1;
      }
      stats.set(client.path, bucket);
    }
    if (!stats.size) {
      renderEmpty(
        view.el,
        `\u8FD8\u6CA1\u6709\u670D\u52A1\u5BA2\u6237\u3002\u5728\u9879\u76EE MOC \u7684\u5C5E\u6027\u91CC\u5199 \`${FIELDS.client}: "[[\u67D0\u4EBA]]"\`\uFF0C\u4ED6\u5C31\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002`
      );
      return;
    }
    const now = today();
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u8C01", "\u672A\u7ED3\u6848", "\u5408\u4F5C\u8FC7", "\u6700\u8FD1\u8054\u7CFB"],
      [...stats.values()].sort((left, right) => right.open - left.open || right.total - left.total).map((bucket) => {
        const last = lastContactDayOf(view, bucket.note);
        const days = last ? daysBetween(last, now) : null;
        return [
          noteLink(bucket.note),
          bucket.open || "\u2014",
          bucket.total,
          days === null ? "\u26A0\uFE0F \u4ECE\u672A" : days === 0 ? "\u4ECA\u5929" : `${days} \u5929\u524D`
        ];
      })
    );
  }
};
var clientPayments = {
  name: "\u4ED8\u8D39\u4E0E\u4EA4\u4ED8",
  render: async (view) => {
    if (!view.host) {
      renderEmpty(view.el, "\u8FD9\u4E2A\u89C6\u56FE\u8981\u957F\u5728\u5BA2\u6237\u6863\u6848\u4E0A\u624D\u6709\u5185\u5BB9\u3002");
      return;
    }
    const payments = await paymentsOf(view, view.host);
    if (!payments.length) {
      renderEmpty(view.el, "\u8FD8\u6CA1\u6709\u4ED8\u8D39\u8BB0\u5F55\u3002\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u589E\u52A0\u4ED8\u8D39\u300D\u8BB0\u4E00\u7B14\u3002");
      return;
    }
    renderSummary(
      view.el,
      `**${payments.length}** \u7B14\uFF0C\u7D2F\u8BA1 **${sum(payments)}**\uFF1B\u672A\u4EA4\u4ED8 **${payments.filter((payment) => !payment.delivered).length}** \u7B14\u3002`
    );
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u4EA7\u54C1", "\u91D1\u989D", "\u65E5\u671F", "\u4EA4\u4ED8"],
      payments.sort((left, right) => right.date.localeCompare(left.date)).map((payment) => [
        payment.product || "\u2014",
        payment.amount,
        payment.date || "\u2014",
        payment.delivered ? "\u2705 \u5DF2\u4EA4\u4ED8" : "\u23F3 \u5F85\u4EA4\u4ED8"
      ])
    );
  }
};
var projectPayments = {
  name: "\u9879\u76EE\u6536\u6B3E",
  render: async (view) => {
    if (!view.host) {
      renderEmpty(view.el, "\u8FD9\u4E2A\u89C6\u56FE\u8981\u957F\u5728\u9879\u76EE MOC \u4E0A\u624D\u6709\u5185\u5BB9\u3002");
      return;
    }
    const payments = await paymentsOf(view, view.host);
    if (!payments.length) {
      renderEmpty(view.el, "\u8FD9\u4E2A\u9879\u76EE\u8FD8\u6CA1\u6709\u6536\u6B3E\u8BB0\u5F55\u3002\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u8BB0\u6536\u6B3E\u300D\u8BB0\u4E00\u7B14\u3002");
      return;
    }
    const received = payments.filter((payment) => payment.delivered);
    renderSummary(
      view.el,
      `\u5408\u8BA1 **${sum(payments)}**\uFF0C\u5DF2\u5230\u8D26 **${sum(received)}**\uFF0C\u672A\u5230\u8D26 **${sum(payments) - sum(received)}**\u3002`
    );
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u91D1\u989D", "\u65E5\u671F", "\u5230\u8D26"],
      payments.sort((left, right) => right.date.localeCompare(left.date)).map((payment) => [
        payment.amount,
        payment.date || "\u2014",
        payment.delivered ? "\u2705 \u5DF2\u5230\u8D26" : "\u23F3 \u672A\u5230\u8D26"
      ])
    );
  }
};
async function allPayments(view) {
  const archive = archiveFolderOf(view.ctx);
  const collected = [];
  for (const client of view.index.notesOfType(NOTE_TYPES.client)) {
    if (!isLivePath(archive, client.path)) continue;
    collected.push(...await paymentsOf(view, client));
  }
  return collected;
}
async function paymentsOf(view, note) {
  var _a, _b;
  const payments = [];
  for (const line of await view.index.listLinesOf(note)) {
    if (!line.isTask) continue;
    const fields = inlineFieldsOf(line.text);
    const amount = Number(fields[PAYMENT_FIELDS.amount]);
    if (!Number.isFinite(amount)) continue;
    payments.push({
      note,
      product: (_a = fields[PAYMENT_FIELDS.product]) != null ? _a : "",
      amount,
      date: (_b = fields[PAYMENT_FIELDS.date]) != null ? _b : "",
      delivered: line.checked
    });
  }
  return payments;
}
function inlineFieldsOf(text) {
  const fields = {};
  INLINE_FIELD.lastIndex = 0;
  let match = INLINE_FIELD.exec(text);
  while (match) {
    fields[match[1].trim()] = match[2].trim();
    match = INLINE_FIELD.exec(text);
  }
  return fields;
}
function clientProjects(view) {
  var _a;
  const found = [];
  for (const project of view.index.notesOfType(NOTE_TYPES.project)) {
    const links = extractLinks(String((_a = view.index.fieldOf(project, FIELDS.client)) != null ? _a : ""));
    if (!links.length) continue;
    found.push({ project, client: view.index.resolve(links[0], project.path) });
  }
  return found;
}
function sum(payments) {
  return payments.reduce((total, payment) => total + payment.amount, 0);
}
function formatDays(days) {
  return days === null ? "\u2014" : `${days} \u5929`;
}
var clientViews = [
  pending,
  sales,
  paidUsers,
  openCases,
  caseLibrary,
  serviceClients,
  clientPayments,
  projectPayments
];

// src/modules/contacts/client.ts
var import_obsidian8 = require("obsidian");

// src/core/markdown.ts
var VIEW_FENCE = "```" + VIEW_BLOCK_LANG;
var ANY_HEADING = /^#{1,6}\s/;
var PLACEHOLDER = "-";
var TASK_BOX = /^(\s*(?:[-*+]|\d+[.)])\s+\[)([^\]])(\]\s)/;
function toggleTaskLine(content, line, expectedChecked) {
  const lines = content.split("\n");
  const current = lines[line];
  if (typeof current !== "string") return null;
  const match = TASK_BOX.exec(current);
  if (!match) return null;
  const checked = match[2].trim().toLowerCase() === "x";
  if (checked !== expectedChecked) return null;
  lines[line] = current.replace(TASK_BOX, `$1${checked ? " " : "x"}$3`);
  return lines.join("\n");
}
function insertIntoSection(content, heading, line) {
  const lines = content.split("\n");
  const headingIndex = lines.findIndex((text) => text.trim() === heading);
  if (headingIndex < 0) return `${content.replace(/\s*$/, "")}

${heading}

${line}
`;
  let sectionEnd = lines.length;
  for (let cursor = headingIndex + 1; cursor < lines.length; cursor += 1) {
    if (ANY_HEADING.test(lines[cursor])) {
      sectionEnd = cursor;
      break;
    }
  }
  let insertAt = sectionEnd;
  for (let cursor = headingIndex + 1; cursor < sectionEnd; cursor += 1) {
    if (lines[cursor].replace(/^\s+/, "").indexOf(VIEW_FENCE) === 0) {
      insertAt = cursor;
      break;
    }
  }
  while (insertAt > headingIndex + 1 && lines[insertAt - 1].trim() === "") insertAt -= 1;
  if (insertAt > headingIndex + 1 && lines[insertAt - 1].trim() === PLACEHOLDER) {
    lines[insertAt - 1] = line;
    return lines.join("\n");
  }
  lines.splice(insertAt, 0, line);
  return lines.join("\n");
}

// src/modules/review/templates.ts
var FENCE = "```";
function viewBlock(name, params) {
  const lines = [name];
  for (const [key, value] of Object.entries(params != null ? params : {})) {
    lines.push(`${key}: ${value}`);
  }
  return `${FENCE}${VIEW_BLOCK_LANG}
${lines.join("\n")}
${FENCE}`;
}
function periodNoteContent(period, title, dateTimeFormat) {
  var _a;
  const { stamp, uid } = nowStampAndUid(dateTimeFormat);
  const parent = period.parent ? PERIODS[period.parent] : null;
  const neighbours = periodNeighbours(period, title, parent);
  const frontmatter = [
    "---",
    `${FIELDS.created}: ${stamp}`,
    `${FIELDS.updated}:`,
    `${FIELDS.uid}: ${uid}`,
    `${FIELDS.type}: ${period.type}`,
    // 日记刻意没有 period_start：文件名就是日期，多一个字段等于给同一件事两个事实源
    ...period.key === "daily" ? [] : [`${FIELDS.periodStart}: ${(_a = periodStartOf(period, title)) != null ? _a : ""}`],
    `${FIELDS.theme}:`,
    "---"
  ].join("\n");
  const navigation = neighbours ? `<< [[${neighbours.prev}]] | [[${neighbours.next}]] >>${neighbours.parent ? `\u3000\u2191 [[${neighbours.parent}|${period.parentAlias}]]` : ""}` : "";
  return [frontmatter, "", `# ${title}`, "", navigation, "", bodyOf(period.key), ""].join("\n");
}
function bodyOf(key) {
  if (key === "daily") {
    return [
      DIARY_LOG_HEADING,
      "",
      "%% \u4E00\u884C\u4E00\u4EF6\u4E8B\uFF0C\u5199\u8FC7\u7A0B\u3002\u7ED3\u8BBA\u5199\u8FDB frontmatter \u7684 theme\u2014\u2014\u508D\u665A\u7528\u547D\u4EE4\u300C\u5199\u590D\u76D8\u4E3B\u9898\u300D\u56DE\u586B\u3002",
      "\u5468\u590D\u76D8\u53EA\u770B theme\uFF0C\u8FD9\u91CC\u662F\u7ED9\u4F60\u81EA\u5DF1\u56DE\u60F3\u7528\u7684\u3002",
      "\u63D0\u5230\u4EBA\u5C31\u6302\u53CC\u94FE\uFF0C\u4E09\u79CD\u5199\u6CD5\u81EA\u52A8\u5206\u6D41\u5230\u4ED6\u7684\u6863\u6848\uFF1A",
      "\u3000\u4E8B\u4EF6\uFF1A\u548C [[\u5F20\u4E09]] \u8C08\u5B9A\u4E00\u8D77\u6295\u4E00\u5BB6\u7F51\u5496",
      "\u3000\u5F85\u529E\uFF1A- [ ] \u51FA\u7F51\u5496\u6295\u8D44\u65B9\u6848\u7ED9 [[\u5F20\u4E09]]",
      "\u3000\u4EBA\u60C5\uFF1A- [[\u5F20\u4E09]]\uFF5C\u53BB\uFF5C\u9001\u4E86\u534A\u65A4\u751F\u666E\uFF5C\u4E24\u6E05 %%",
      "",
      "- ",
      "",
      "## \u4ECA\u65E5\u4EA7\u51FA\uFF08\u81EA\u52A8\uFF09",
      "",
      viewBlock("\u4ECA\u65E5\u4EA7\u51FA")
    ].join("\n");
  }
  if (key === "weekly") {
    return [
      "## \u672C\u5468\u590D\u76D8",
      "",
      "%% \u5BF9\u7740\u4E0B\u9762\u4E24\u5F20\u81EA\u52A8\u8868\u56DE\u7B54\uFF0C\u4E00\u95EE\u4E00\u6BB5\uFF1A",
      "1. \u4E03\u5929\u7684\u4E3B\u9898\u8FDE\u8D77\u6765\uFF0C\u6211\u8FD9\u5468\u771F\u6B63\u5728\u63A8\u8FDB\u7684\u662F\u4EC0\u4E48\uFF1F\u548C frontmatter \u91CC\u5199\u7684 theme \u4E00\u81F4\u5417\uFF1F",
      "2. \u54EA\u4E00\u5929\u504F\u79BB\u4E86\u4E3B\u7EBF\uFF1F\u4E3A\u4EC0\u4E48\uFF1F",
      "3. \u4E0B\u5468\u53EA\u6539\u4E00\u4EF6\u4E8B\uFF0C\u6539\u4EC0\u4E48\uFF1F %%",
      "",
      "## \u672C\u5468\u6BCF\u65E5\u4E3B\u9898\uFF08\u81EA\u52A8\uFF09",
      "",
      viewBlock("\u4E3B\u9898\u94FE", { \u8303\u56F4: "\u5468" }),
      "",
      "## \u672C\u5468\u9879\u76EE\u52A8\u6001\uFF08\u81EA\u52A8\uFF09",
      "",
      viewBlock("\u9879\u76EE\u52A8\u6001", { \u8303\u56F4: "\u5468" })
    ].join("\n");
  }
  if (key === "monthly") {
    return [
      "## \u672C\u6708\u590D\u76D8",
      "",
      "%% \u6708\u5EA6\u770B\u7ED3\u679C\uFF0C\u4E0D\u770B\u8FC7\u7A0B\uFF1A",
      "1. \u51E0\u6761\u5468\u4E3B\u9898\u8FDE\u8D77\u6765\uFF0C\u8FD9\u4E2A\u6708\u771F\u6B63\u5B8C\u6210\u7684\u662F\u4EC0\u4E48\uFF1F\u548C theme \u4E00\u81F4\u5417\uFF1F",
      "2. \u5B8C\u6210\u7684\u9879\u76EE\u91CC\uFF0C\u54EA\u4E00\u4E2A\u6700\u503C\u5F97\u590D\u76D8\uFF1F\u4E3A\u4EC0\u4E48\u662F\u5B83\uFF1F",
      "3. \u4E0B\u6708\u552F\u4E00\u4F18\u5148\u7EA7\u662F\u4EC0\u4E48\uFF1F\u4E3A\u5B83\u780D\u6389\u4EC0\u4E48\uFF1F %%",
      "",
      "## \u672C\u6708\u5B8C\u6210\u7684\u9879\u76EE\uFF08\u81EA\u52A8\uFF09",
      "",
      viewBlock("\u5B8C\u6210\u7684\u9879\u76EE", { \u8303\u56F4: "\u6708" }),
      "",
      "## \u672C\u6708\u6BCF\u5468\u4E3B\u9898\uFF08\u81EA\u52A8\uFF09",
      "",
      viewBlock("\u4E3B\u9898\u94FE", { \u8303\u56F4: "\u6708" })
    ].join("\n");
  }
  if (key === "quarterly") {
    return [
      "## \u5B63\u5EA6\u590D\u76D8",
      "",
      "%% \u5B63\u5EA6\u770B\u7CFB\u7EDF\uFF0C\u4E0D\u770B\u4E8B\u4EF6\uFF1A",
      "1. \u4E09\u4E2A\u6708\u7684\u4E3B\u9898\u8FDE\u8D77\u6765\uFF0C\u4E3B\u7EBF\u662F\u5728\u63A8\u8FDB\u8FD8\u662F\u5728\u6F02\u79FB\uFF1F",
      "2. \u5B8C\u6210\u7684\u9879\u76EE\u91CC\uFF0C\u6709\u591A\u5C11\u662F\u5B63\u521D\u5C31\u6253\u7B97\u505A\u7684\uFF1F\u504F\u79BB\u8BF4\u660E\u4E86\u4EC0\u4E48\uFF1F",
      "3. \u4E0B\u5B63\u5EA6\u7684\u6218\u7565\u53D6\u820D\uFF1A\u505A\u4EC0\u4E48\u3001\u575A\u51B3\u4E0D\u505A\u4EC0\u4E48\uFF1F %%",
      "",
      "## \u672C\u5B63\u6BCF\u6708\u4E3B\u9898\uFF08\u81EA\u52A8\uFF09",
      "",
      viewBlock("\u4E3B\u9898\u94FE", { \u8303\u56F4: "\u5B63" }),
      "",
      "## \u672C\u5B63\u5B8C\u6210\u7684\u9879\u76EE\uFF08\u81EA\u52A8\uFF09",
      "",
      viewBlock("\u5B8C\u6210\u7684\u9879\u76EE", { \u8303\u56F4: "\u5B63" })
    ].join("\n");
  }
  return [
    "## \u5E74\u5EA6\u590D\u76D8",
    "",
    "%% \u4E00\u5E74\u53EA\u56DE\u7B54\u56DB\u4E2A\u95EE\u9898\uFF1A",
    "1. \u5341\u4E8C\u4E2A\u6708\u7684\u4E3B\u9898\u8FDE\u8D77\u6765\uFF0C\u4ECA\u5E74\u7684\u4E3B\u7EBF\u662F\u4EC0\u4E48\uFF1F\u548C\u5E74\u521D\u5199\u4E0B\u7684\u4E00\u81F4\u5417\uFF1F",
    "2. \u4E09\u5927\u5F97\u2014\u2014\u54EA\u4E09\u4EF6\u4E8B\u6700\u503C\u5F97\uFF1F\u5171\u540C\u6210\u56E0\u662F\u4EC0\u4E48\uFF1F",
    "3. \u4E09\u5927\u5931\u2014\u2014\u54EA\u4E09\u4EF6\u4E8B\u6700\u4E8F\uFF1F\u6559\u8BAD\u5404\u4E00\u53E5\u3002",
    "4. \u660E\u5E74\u4E3B\u9898\u5B9A\u4EC0\u4E48\uFF1F\u5B83\u8981\u6C42\u6211\u6210\u4E3A\u4EC0\u4E48\u6837\u7684\u4EBA\uFF1F %%",
    "",
    "## \u5E74\u5EA6\u9879\u76EE\u5168\u666F\uFF08\u81EA\u52A8\uFF09",
    "",
    viewBlock("\u5E74\u5EA6\u5168\u666F"),
    "",
    "## \u5341\u4E8C\u4E2A\u6708\u7684\u4E3B\u9898\uFF08\u81EA\u52A8\uFF09",
    "",
    viewBlock("\u4E3B\u9898\u94FE", { \u8303\u56F4: "\u5E74" })
  ].join("\n");
}

// src/modules/contacts/templates.ts
var CONTACT_MOC_LINK = `[[${basenameOf(CONTACT_MOC)}]]`;
var CLIENT_MOC_LINK = `[[${basenameOf(CLIENT_MOC)}]]`;
function basenameOf(path) {
  var _a;
  return (_a = path.replace(/\.md$/, "").split("/").pop()) != null ? _a : path;
}
function personNoteContent(values) {
  const frontmatter = [
    "---",
    `${FIELDS.aliases}:`,
    `${FIELDS.description}:`,
    `${FIELDS.created}: ${values.created}`,
    `${FIELDS.updated}:`,
    `${FIELDS.tags}:`,
    // UID 不加引号：属性面板把它登记为数字类型，加引号就变成一个长得像数字的字符串
    `${FIELDS.uid}:${values.uid === null ? "" : ` ${values.uid}`}`,
    `${FIELDS.type}:${values.type ? ` ${values.type}` : ""}`,
    // up 写成 YAML 列表：它在属性面板里是列表类型，一个人可以同时属于多个圈子
    values.up ? `${FIELDS.up}:
  - "${values.up}"` : `${FIELDS.up}:`,
    `${FIELDS.tier}:${values.tier ? ` ${values.tier}` : ""}`,
    `${FIELDS.direction}:${values.direction ? ` ${values.direction}` : ""}`,
    `${FIELDS.gift}:`,
    `${FIELDS.address}:`,
    `${FIELDS.get}:`,
    `${FIELDS.birthday}:`,
    "---"
  ].join("\n");
  return [
    frontmatter,
    "",
    "## \u8054\u7CFB\u65B9\u5F0F",
    "",
    "## \u559C\u597D\u4E0E\u79C1\u4E8B",
    "",
    "## \u76F8\u5173\u9879\u76EE\uFF08\u81EA\u52A8\uFF09",
    "",
    viewBlock("\u76F8\u5173\u9879\u76EE"),
    "",
    "## \u4EBA\u60C5\u8D26\u672C\uFF08\u81EA\u52A8\uFF09",
    "",
    viewBlock("\u4EBA\u60C5\u8D26\u672C"),
    "",
    "## \u5173\u952E\u4E8B\u4EF6\uFF08\u81EA\u52A8\uFF09",
    "",
    viewBlock("\u5173\u952E\u4E8B\u4EF6"),
    "",
    "## \u5F85\u529E\uFF08\u81EA\u52A8\uFF09",
    "",
    viewBlock("\u5F85\u529E"),
    ""
  ].join("\n");
}
function personTemplateFile() {
  return personNoteContent({ created: "", uid: null, type: "", up: "", tier: "", direction: "" });
}
function clientNoteContent(values) {
  const frontmatter = [
    "---",
    `${FIELDS.aliases}:`,
    `${FIELDS.description}:`,
    `${FIELDS.created}: ${values.created}`,
    `${FIELDS.updated}:`,
    `${FIELDS.tags}:`,
    `${FIELDS.uid}:${values.uid === null ? "" : ` ${values.uid}`}`,
    `${FIELDS.type}:${values.type ? ` ${values.type}` : ""}`,
    `${FIELDS.source}:${values.source ? ` ${values.source}` : ""}`,
    `${FIELDS.contact}:${values.contact ? ` ${values.contact}` : ""}`,
    `${FIELDS.homepage}:`,
    "---"
  ].join("\n");
  return [
    frontmatter,
    "",
    "## \u4ED8\u8D39\u4E0E\u4EA4\u4ED8",
    "",
    `%% \u4E00\u7B14\u4E00\u884C\uFF0C\u672A\u52FE\uFF1D\u5F85\u4EA4\u4ED8\uFF0C\u52FE\u4E0A\uFF1D\u5DF2\u4EA4\u4ED8\u3002\u7528\u547D\u4EE4\u300C\u589E\u52A0\u4ED8\u8D39\u300D\u5199\u5165\uFF0C\u4E0D\u5FC5\u624B\u6253\uFF1A`,
    `- [ ] [${PAYMENT_FIELDS.product}::\u8BFE\u7A0B] [${PAYMENT_FIELDS.amount}::365] [${PAYMENT_FIELDS.date}::2026-08-12] %%`,
    "",
    viewBlock("\u4ED8\u8D39\u4E0E\u4EA4\u4ED8"),
    "",
    "## \u5173\u952E\u4E8B\u4EF6\uFF08\u81EA\u52A8\uFF09",
    "",
    viewBlock("\u5173\u952E\u4E8B\u4EF6"),
    "",
    "## \u5F85\u529E\uFF08\u81EA\u52A8\uFF09",
    "",
    viewBlock("\u5F85\u529E"),
    ""
  ].join("\n");
}
function clientTemplateFile() {
  return clientNoteContent({ created: "", uid: null, type: "", source: "", contact: "" });
}
function areaFrontmatter(description, created, uid) {
  return [
    "---",
    `${FIELDS.aliases}:`,
    `${FIELDS.description}: ${description}`,
    `${FIELDS.created}: ${created}`,
    `${FIELDS.updated}:`,
    `${FIELDS.tags}:`,
    `${FIELDS.uid}: ${uid}`,
    `${FIELDS.type}: ${NOTE_TYPES.area}`,
    `${FIELDS.status}:`,
    "---"
  ].join("\n");
}
function contactMocContent(created, uid) {
  return [
    areaFrontmatter("\u4EBA\u8109\u9886\u57DF\u603B\u63A7\u53F0\uFF1A\u6309\u5708\u5B50\u5206\u7EC4\u7684\u540D\u5F55\u3001\u6295\u5582\u540D\u5355\u3001\u672C\u6708\u751F\u65E5\u3001\u4EBA\u60C5\u4F59\u989D", created, uid),
    "",
    `> \u8FD9\u91CC\u662F\u5168\u90E8\u4EBA\u7684\u7ECF\u8425\u89C6\u89D2\u3002\u5BA2\u6237\u89C6\u89D2\u53E6\u89C1 ${CLIENT_MOC_LINK}\uFF08\u8FD8\u6CA1\u6709\u7684\u8BDD\uFF0C\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u521D\u59CB\u5316\u5BA2\u6237\u6A21\u5757\u300D\uFF09\u3002`,
    "> \u4E00\u4E2A\u4EBA\u53EF\u4EE5\u540C\u65F6\u51FA\u73B0\u5728\u4E24\u5F20\u5730\u56FE\u4E0A\uFF1A\u4ED6\u786E\u5B9E\u53EF\u4EE5\u65E2\u662F\u6211\u7684\u5BA2\u6237\uFF0C\u53C8\u662F\u6211\u7684\u670B\u53CB\u3002",
    "",
    "## \u{1F4C7} \u540D\u5F55",
    "",
    viewBlock("\u4EBA\u8109\u540D\u5F55"),
    "",
    "## \u{1F381} \u6295\u5582\u540D\u5355",
    "",
    viewBlock("\u6295\u5582\u540D\u5355"),
    "",
    "## \u{1F382} \u672C\u6708\u751F\u65E5",
    "",
    viewBlock("\u672C\u6708\u751F\u65E5"),
    "",
    "## \u2696\uFE0F \u4EBA\u60C5\u4F59\u989D\uFF08\u672A\u4E24\u6E05\uFF09",
    "",
    viewBlock("\u4EBA\u60C5\u4F59\u989D"),
    "",
    "## \u{1F4D6} \u4F7F\u7528\u8BF4\u660E",
    "",
    "### \u5361\u7247\u4E0A\u6CA1\u6709\u5206\u7C7B\uFF0C\u53EA\u6709\u5F52\u5C5E",
    "",
    "\u4EBA\u7269\u6863\u6848\u662F\u5361\u7247\u7B14\u8BB0\uFF0C**\u5361\u7247\u4E0D\u5E26\u5206\u7C7B**\u3002\u6240\u4EE5\u8FD9\u91CC\u6CA1\u6709\u300C\u5BA2\u6237/\u751F\u6D3B/\u5DE5\u4F5C\u300D\u8FD9\u79CD\u8EAB\u4EFD\u5B57\u6BB5\uFF0C\u53D6\u800C\u4EE3\u4E4B\u7684\u662F\u4E24\u6761\u673A\u5236\uFF1A",
    "",
    "| \u8981\u56DE\u7B54\u7684 | \u9760\u4EC0\u4E48 |",
    "|---|---|",
    `| **\u4ED6\u5C5E\u4E8E\u54EA\u4E2A\u5708\u5B50** | \`${FIELDS.up}\` \u8FD9\u6761**\u5F52\u5C5E\u94FE\u63A5**\u3002\u6307\u5411\u54EA\u4E2A\u5708\u5B50 MOC\uFF0C\u540D\u5F55\u91CC\u5C31\u5F52\u5230\u54EA\u4E00\u7EC4\u3002\u60F3\u65B0\u5206\u4E00\u4E2A\u5708\u5B50\uFF08\u6BD4\u5982\u67D0\u516C\u53F8\u7684\u540C\u4E8B\uFF09\uFF0C\u5EFA\u4E00\u4E2A\u5708\u5B50 MOC\uFF0C\u628A\u90A3\u6279\u4EBA\u7684 \`${FIELDS.up}\` \u6307\u8FC7\u53BB\uFF0C\u540D\u5F55\u81EA\u52A8\u591A\u4E00\u7EC4 |`,
    `| **\u4ED6\u662F\u4E0D\u662F\u5BA2\u6237** | **\u4E0D\u6807\u6CE8\uFF0C\u4ECE\u4E8B\u5B9E\u63A8\u65AD**\uFF1A\u540D\u4E0B\u6709 \`${FIELDS.client}\` \u6307\u5411\u4ED6\u7684\u9879\u76EE\uFF0C\u4ED6\u5C31\u662F\u5BA2\u6237\u3002\u7ED9\u8C01\u5E72\u8FC7\u6D3B\u8C01\u624D\u662F\u5BA2\u6237\uFF0C\u8FD9\u6BD4\u8D34\u6807\u7B7E\u8BDA\u5B9E |`,
    "",
    "\u597D\u5904\u662F\u8EAB\u4EFD\u4E0D\u518D\u4E92\u65A5\uFF1A\u540C\u4E00\u4E2A\u4EBA\u53EF\u4EE5\u65E2\u5728\u540D\u5F55\u91CC\uFF08\u7ECF\u8425\u5173\u7CFB\uFF09\uFF0C\u53C8\u5728\u5BA2\u6237\u540D\u5F55\u91CC\uFF08\u4EA4\u4ED8\u5173\u7CFB\uFF09\uFF0C\u56E0\u4E3A\u4ED6\u672C\u6765\u5C31\u662F\u4E24\u8005\u3002",
    "",
    "### \u6863\u6848\u653E\u54EA\u90FD\u884C",
    "",
    `\u89C6\u56FE**\u9760 \`${FIELDS.type}: ${NOTE_TYPES.person}\` \u8BA4\u4EBA\uFF0C\u4E0D\u9760\u6587\u4EF6\u5939**\u3002\u4F60\u628A\u6863\u6848\u632A\u53BB\u522B\u7684\u76EE\u5F55\u3001\u6539\u6389\u76EE\u5F55\u540D\u3001\u751A\u81F3\u7528\u82F1\u6587\u76EE\u5F55\u540D\uFF0C\u5341\u51E0\u4E2A\u89C6\u56FE\u4E00\u4E2A\u90FD\u4E0D\u7528\u6539\u3002`,
    "",
    "\u552F\u4E00\u8FD8\u8BA4\u4F4D\u7F6E\u7684\u662F**\u5F52\u6863**\uFF1A\u6863\u6848\u79FB\u8FDB\u5F52\u6863\u76EE\u5F55\u5373\u9000\u51FA\u5168\u90E8\u540D\u5F55\uFF08\u8EAB\u4EFD\u6CA1\u53D8\uFF0C\u662F\u4F60\u4E0D\u518D\u7ECF\u8425\u8FD9\u6BB5\u5173\u7CFB\u4E86\uFF09\u3002\u5F52\u6863\u76EE\u5F55\u5728\u300C\u8BBE\u7F6E \u203A ziminOS \u203A \u9AD8\u7EA7\u300D\u91CC\u6539\u4E00\u6B21\uFF0C\u5168\u90E8\u89C6\u56FE\u8DDF\u7740\u8D70\u3002",
    "",
    "### \u53E6\u5916\u4E09\u6761\u8F74",
    "",
    "| \u5C5E\u6027 | \u7BA1\u4EC0\u4E48 | \u53D6\u503C |",
    "|---|---|---|",
    `| \`${FIELDS.tier}\` | **\u8054\u7CFB\u8282\u594F**\uFF1A\u591A\u4E45\u8BE5\u8BF4\u53E5\u8BDD | \u5BC6=\u6BCF\u5468 / \u8FD1=\u6BCF\u6708 / \u719F=\u6BCF\u5B63 / \u8FDC=\u6BCF\u5E74 |`,
    `| \`${FIELDS.direction}\` | **\u4F4D\u52BF**\uFF1A\u8FD9\u6BB5\u5173\u7CFB\u5F80\u54EA\u4E2A\u65B9\u5411\u4F7F\u52B2 | \u5411\u4E0A\uFF08\u8981\u7528\u5FC3\u7EF4\u62A4\uFF09/ \u5E73\u884C / \u5411\u4E0B\uFF08\u7ED9\u673A\u4F1A\uFF0C\u7ED3\u5584\u7F18\uFF09 |`,
    `| \`${FIELDS.gift}\` | **\u4E3B\u52A8\u6295\u8D44**\uFF1A\u613F\u4E0D\u613F\u610F\u6301\u7EED\u5728\u4ED6\u8EAB\u4E0A\u82B1\u94B1\u82B1\u5FC3\u601D | \u52FE\u4E0A\u5373\u8FDB\u300C\u6295\u5582\u540D\u5355\u300D |`,
    "",
    "\u4E09\u8005\u4E92\u4E0D\u8574\u542B\uFF1A\u53D1\u5C0F\u662F\u300C\u5BC6 + \u5E73\u884C\u300D\u5374\u4E0D\u5728\u6295\u5582\u540D\u5355\u4E0A\uFF08\u4ED6\u4F1A\u7B11\u4F60\u89C1\u5916\uFF09\uFF1B\u5927\u5BA2\u6237\u662F\u300C\u719F + \u5411\u4E0A\u300D\u5374\u94C1\u5B9A\u5728\u540D\u5355\u4E0A\u3002\u6240\u4EE5\u662F\u4E09\u4E2A\u5B57\u6BB5\uFF0C\u4E0D\u662F\u4E00\u4E2A\u3002",
    "",
    `\`${FIELDS.address}\` \u5B58\u6574\u4E32\u5BC4\u4EF6\u4FE1\u606F\uFF08\u6536\u4EF6\u4EBA + \u7535\u8BDD + \u5730\u5740\uFF09\uFF0C\u7167\u7740\u590D\u5236\u5C31\u80FD\u586B\u5FEB\u9012\u5355\u3002\u5B83\u4E0D\u53C2\u4E0E\u7B5B\u9009\uFF0C\u8FDB\u5C5E\u6027\u7684\u552F\u4E00\u7406\u7531\u662F\u6295\u5582\u540D\u5355\u8981\u628A\u5B83\u805A\u5408\u6210\u4E00\u5F20\u8868\u3002`,
    "",
    "### \u65E5\u5E38\u4E09\u4E2A\u52A8\u4F5C",
    "",
    "- **\u5EFA\u6863**\uFF1A\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u65B0\u5EFA\u4EBA\u8109\u300D\uFF0C\u4E09\u8FDE\u95EE\uFF08\u59D3\u540D \u2192 \u5206\u5C42 \u2192 \u65B9\u5411\uFF09\uFF0C\u5F52\u5C5E\u81EA\u52A8\u6307\u5411\u672C MOC\u3002\u6863\u6848\u5E73\u94FA\u5B58\u653E\uFF0C\u4E0D\u5EFA\u5B50\u76EE\u5F55\u3002",
    `- **\u8FDB\u6295\u5582\u540D\u5355**\uFF1A\u6253\u5F00\u6863\u6848\uFF0C\u5C5E\u6027\u91CC\u628A \`${FIELDS.gift}\` \u5199\u6210 true\u3001\u586B\u597D \`${FIELDS.address}\`\u3002\u5E26\u7279\u4EA7\u56DE\u6765\u65F6\uFF0C\u540D\u5355\u548C\u5730\u5740\u5DF2\u7ECF\u5C31\u4F4D\u3002`,
    "- **\u8BB0\u4E8B\u8BB0\u8D26**\uFF1A\u5168\u90E8\u5199\u8FDB**\u5F53\u5929\u65E5\u8BB0**\uFF0C\u9760\u4E00\u884C\u7684\u5F62\u6001\u81EA\u52A8\u5206\u6D41\u5230\u4ED6\u7684\u6863\u6848\uFF1A",
    "",
    "| \u4F60\u5199\u7684 | \u843D\u5230\u4ED6\u6863\u6848\u7684 |",
    "|---|---|",
    "| `\u548C [[\u5F20\u4E09]] \u53BB\u4E86\u65B0\u7586\uFF0C\u8C08\u5B9A\u4E00\u8D77\u6295\u4E00\u5BB6\u7F51\u5496` | \u5173\u952E\u4E8B\u4EF6 |",
    "| `- [ ] \u51FA\u7F51\u5496\u6295\u8D44\u65B9\u6848\u7ED9 [[\u5F20\u4E09]]` | \u5F85\u529E |",
    `| \`- [[\u5F20\u4E09]]${LEDGER.separator}\u53BB${LEDGER.separator}\u9001\u4E86\u534A\u65A4\u751F\u666E${LEDGER.separator}\u4E24\u6E05\` | \u4EBA\u60C5\u8D26\u672C |`,
    "",
    `\u8D26\u672C\u884C\u4E5F\u53EF\u4EE5\u7528\u547D\u4EE4\u300C\u8BB0\u4EBA\u60C5\u300D\u56DB\u6B65\u70B9\u9009\u5199\u5165\u3002\u624B\u5199\u65F6\u6CE8\u610F\uFF1A\u4EBA\u540D\u5FC5\u987B\u5E26 \`[[ ]]\`\uFF08\u5B83\u662F\u7D22\u5F15\uFF09\uFF0C\u5206\u9694\u7B26\u7528\u5168\u89D2 \`${LEDGER.separator}\`\uFF0C\u72B6\u6001\u53D6 ${LEDGER.statuses.join(" / ")}\uFF0C${LEDGER.defaultStatus}\u53EF\u6574\u6BB5\u7701\u7565\u3002`,
    "",
    "### \u540D\u5F55\u600E\u4E48\u8BFB",
    "",
    "\u5148\u770B\u5708\u5B50\uFF0C\u518D\u770B\u4EBA\u3002\u6BCF\u7EC4\u4E00\u5F20\u8868\u56DE\u7B54\u56DB\u4EF6\u4E8B\uFF1A\u8BA4\u8BC6\u8C01\u3001\u8C01\u80FD\u7ED9\u6211\u4EC0\u4E48\u3001\u8C01\u5728\u53D8\u51B7\u3001\u8C01\u8981\u91CD\u70B9\u7EF4\u62A4\u3002",
    "",
    "\u300C\u6700\u8FD1\u8054\u7CFB\u300D\u662F\u4ECE\u65E5\u8BB0\u53CD\u94FE**\u7B97\u51FA\u6765\u7684**\uFF0C\u4E0D\u7528\u624B\u586B\u2014\u2014\u4F60\u6BCF\u8BB0\u4E00\u7B14\u4EBA\u60C5\u6216\u5199\u4E00\u53E5\u65E5\u8BB0\uFF0C\u5B83\u81EA\u52A8\u5237\u65B0\u3002\u8D85\u51FA\u8BE5\u5C42\u8282\u594F\u7684\u4F1A\u6807 \u26A0\uFE0F\uFF0C\u90A3\u5C31\u662F\u8BE5\u4E3B\u52A8\u627E\u4ED6\u7684\u4FE1\u53F7\u3002\u5BF9\u5BA2\u6237\u800C\u8A00\u8FD9\u4E2A \u26A0\uFE0F \u6700\u503C\u94B1\uFF1A\u5B83\u662F\u6D41\u5931\u9884\u8B66\u3002",
    "",
    "### \u5E74\u68C0",
    "",
    `\u6BCF\u5E74\u8FC7\u4E00\u904D\u540D\u5F55\uFF1A\`${FIELDS.up}\` \u6362\u5708\uFF08\u540C\u4E8B\u53D8\u8DEF\u4EBA\u5C31\u79FB\u51FA\u90A3\u4E2A\u5708\u5B50\uFF09\u3001\`${FIELDS.tier}\` \u5347\u964D\u7EA7\u3001\`${FIELDS.direction}\` \u4FEE\u8BA2\u3001\`${FIELDS.gift}\` \u8FDB\u51FA\u3001\u4F59\u989D\u6E05\u8D26\u3002`,
    "",
    "\u6362\u5DE5\u4F5C\u65F6\u989D\u5916\u505A\u4E00\u4EF6\u4E8B\uFF1A\u6253\u5F00\u90A3\u4EFD\u5DE5\u4F5C\u7684\u5708\u5B50 MOC\uFF0C\u540D\u5F55\u91CC\u90A3\u4E00\u7EC4\u6574\u7EC4\u8FC7\u4E00\u904D\u2014\u2014\u7559\u4E0B\u7684\u628A\u5F52\u5C5E\u6539\u6307\u4EBA\u8109 MOC\uFF0C\u6563\u4E86\u7684\u79FB\u8FDB\u5F52\u6863\u76EE\u5F55\u3002\u4E0D\u5F52\u6863\u7684\u8BDD\u5B83\u4F1A\u4E00\u76F4\u5360\u7740\u540D\u5F55\u3002",
    ""
  ].join("\n");
}
function clientMocContent(created, uid) {
  return [
    areaFrontmatter(
      "\u5BA2\u6237\u9886\u57DF\u603B\u63A7\u53F0\uFF1A\u4EA7\u54C1\u533A\uFF08\u5F85\u4EA4\u4ED8/\u9500\u552E\u5206\u6790/\u4ED8\u8D39\u7528\u6237\uFF09\uFF0B \u670D\u52A1\u533A\uFF08\u672A\u7ED3\u6848/\u6848\u4F8B\u5E93/\u670D\u52A1\u5BA2\u6237\uFF09",
      created,
      uid
    ),
    "",
    "> \u4F60\u6709\u4E24\u6761\u4EA4\u6613\u7EBF\uFF0C\u5B83\u4EEC\u56DE\u7B54\u7684\u95EE\u9898\u4E0D\u540C\uFF0C\u6240\u4EE5\u5206\u4E24\u533A\u770B\u3002",
    "> **\u4EA7\u54C1**\uFF1A\u964C\u751F\u4EBA\u4E70\u4F60\u7684\u4E1C\u897F\uFF0C\u4F60\u53EA\u77E5\u9053\u6E20\u9053\u548C\u8054\u7CFB\u65B9\u5F0F\u3002\u8981\u770B\u7684\u662F\u94B1\u4ECE\u54EA\u6765\u3001\u8D27\u7ED9\u4E86\u6CA1\u3002",
    "> **\u670D\u52A1**\uFF1A\u8BA4\u8BC6\u7684\u4EBA\u627E\u4F60\u529E\u4E8B\uFF0C\u6709\u9879\u76EE\u6709\u8FC7\u7A0B\u3002\u8981\u770B\u7684\u662F\u6B20\u8C01\u7684\u6D3B\u3001\u54EA\u7C7B\u95EE\u9898\u8BE5\u505A\u6210\u8BFE\u3002",
    "",
    "# \u{1F6D2} \u4EA7\u54C1",
    "",
    "## \u{1F4E6} \u5F85\u4EA4\u4ED8",
    "",
    viewBlock("\u5F85\u4EA4\u4ED8"),
    "",
    "## \u{1F4CA} \u9500\u552E\u5206\u6790",
    "",
    viewBlock("\u9500\u552E\u5206\u6790"),
    "",
    "## \u{1F465} \u4ED8\u8D39\u7528\u6237",
    "",
    viewBlock("\u4ED8\u8D39\u7528\u6237"),
    "",
    "# \u{1F527} \u670D\u52A1",
    "",
    "## \u{1F4CB} \u672A\u7ED3\u6848",
    "",
    viewBlock("\u672A\u7ED3\u6848"),
    "",
    "## \u{1F4DA} \u6848\u4F8B\u5E93",
    "",
    viewBlock("\u6848\u4F8B\u5E93"),
    "",
    "## \u{1F464} \u670D\u52A1\u5BA2\u6237",
    "",
    viewBlock("\u670D\u52A1\u5BA2\u6237"),
    "",
    "# \u{1F4D6} \u4F7F\u7528\u8BF4\u660E",
    "",
    "## \u4E24\u6761\u4EA4\u6613\u7EBF\uFF0C\u4E24\u4E2A\u7269\u79CD",
    "",
    "| | \u4EA7\u54C1\u578B | \u670D\u52A1\u578B |",
    "|---|---|---|",
    "| **\u8C01** | \u5E73\u53F0\u4E0A\u6765\u7684\u964C\u751F\u4EBA | \u4F60\u8BA4\u8BC6\u7684\u4EBA |",
    "| **\u4F60\u77E5\u9053\u4EC0\u4E48** | \u6E20\u9053\u3001\u8054\u7CFB\u65B9\u5F0F\u3001\u5355\u53F7\uFF0C**\u4EC5\u6B64\u800C\u5DF2** | \u5168\u5957\uFF1A\u751F\u65E5\u3001\u4F4F\u5740\u3001\u813E\u6C14\u3001\u4EBA\u60C5\u5F80\u6765 |",
    `| **\u6863\u6848\u5728\u54EA** | \`${FIELDS.type}: ${NOTE_TYPES.client}\` | \`${FIELDS.type}: ${NOTE_TYPES.person}\`\uFF0C\u89C1 ${CONTACT_MOC_LINK} |`,
    `| **\u6D3B\u513F\u5728\u54EA** | \u6CA1\u6709\u9879\u76EE\uFF0C\u5C31\u662F\u4E00\u7B14\u4E70\u5356\uFF0B\u4E00\u6B21\u4EA4\u4ED8 | \u4E00\u4E2A\u9879\u76EE\uFF0C\`${FIELDS.client}\` \u94FE\u63A5\u6302\u5230\u4ED6 |`,
    "",
    "## \u4ED8\u8D39\u600E\u4E48\u8BB0\uFF1A\u4E00\u7B14\u4E00\u6761\u4EFB\u52A1",
    "",
    "**\u4E00\u7B14\u4ED8\u8D39\u7684\u672C\u8D28\uFF0C\u5C31\u662F\u300C\u6211\u6B20\u4ED6\u4E00\u6B21\u4EA4\u4ED8\u300D\uFF0C\u90A3\u672C\u6765\u5C31\u662F\u4E2A\u5F85\u529E\u3002** \u6240\u4EE5\u547D\u4EE4\u5199\u5165\u7684\u662F**\u672A\u52FE\u9009**\u7684\u4EFB\u52A1\u884C\uFF0C\u4EA4\u4ED8\u5B8C\u70B9\u4E00\u4E0B\u52FE\uFF1A",
    "",
    "```markdown",
    `- [x] [${PAYMENT_FIELDS.product}::\u8BFE\u7A0B] [${PAYMENT_FIELDS.amount}::365] [${PAYMENT_FIELDS.date}::2026-08-12]`,
    `- [ ] [${PAYMENT_FIELDS.product}::\u54A8\u8BE2] [${PAYMENT_FIELDS.amount}::199] [${PAYMENT_FIELDS.date}::2026-09-01]`,
    "```",
    "",
    "**\u4E09\u6761\u683C\u5F0F\u7EAA\u5F8B**\uFF0C\u6BCF\u6761\u90FD\u5728\u8EB2\u4E00\u4E2A\u771F\u5751\uFF1A",
    "",
    "| \u7EAA\u5F8B | \u4E3A\u4EC0\u4E48 |",
    "|---|---|",
    `| **\u952E\u540D\u7528\u4E2D\u6587**\uFF08${PAYMENT_FIELDS.amount}\uFF0C\u4E0D\u5199 Amount\uFF09 | \u542B\u5927\u5199\u7684\u952E\u4F1A\u88AB\u989D\u5916\u8865\u4E00\u4EFD\u5C0F\u5199\u89C4\u8303\u540D\uFF0C\u540C\u4E00\u7B14\u94B1\u5728\u904D\u5386\u6C42\u548C\u65F6\u88AB\u7B97\u4E24\u904D |`,
    "| **\u4E00\u7B14\u5199\u4E00\u884C\uFF0C\u4E0D\u8981\u5D4C\u5957** | \u7236\u9879\u548C\u5B50\u9879\u7684\u5B57\u6BB5\u5404\u81EA\u6241\u5E73\u4E0A\u6D6E\uFF0C\u9875\u9762\u7EA7\u770B\u4E0D\u5230\u8C01\u914D\u8C01\uFF0C\u914D\u5BF9\u4E22\u5931 |",
    "| **\u4EA7\u54C1\u540D\u5199\u5728\u503C\u91CC\uFF0C\u4E0D\u5F53\u952E\u540D** | \u5199\u6210 `[\u8BFE\u7A0B::365]` \u7684\u8BDD\uFF0C\u7B97\u603B\u6536\u5165\u5C31\u5F97\u679A\u4E3E\u6240\u6709\u4EA7\u54C1\u540D\uFF0C\u52A0\u4E00\u4E2A\u4EA7\u54C1\u8981\u6539\u6240\u6709\u67E5\u8BE2 |",
    "",
    `\u6E20\u9053\u4E0D\u5199\u8FDB\u6D41\u6C34\u884C\u2014\u2014\u5B83\u5C5E\u4E8E\u8FD9\u4E2A\u4EBA\u4E0D\u5C5E\u4E8E\u6BCF\u4E00\u7B14\uFF0C\u5199\u5728 frontmatter \u7684 \`${FIELDS.source}\` \u91CC\u5C31\u591F\u4E86\u3002\u4E5F**\u4E0D\u8BBE\u300C\u4ED8\u8D39\u6B21\u6570\u300D\u300C\u7D2F\u8BA1\u91D1\u989D\u300D\u5B57\u6BB5**\uFF1A\u6570\u884C\u6570\u5C31\u662F\u6B21\u6570\uFF0C\u6C42\u548C\u5C31\u662F\u7D2F\u8BA1\uFF0C\u624B\u5DE5\u7EF4\u62A4\u7684\u8BA1\u6570\u8FDF\u65E9\u548C\u6D41\u6C34\u5BF9\u4E0D\u4E0A\uFF0C\u800C\u5BF9\u4E0D\u4E0A\u7684\u90A3\u5929\u4F60\u4E0D\u4F1A\u53D1\u73B0\u3002`,
    "",
    "## \u4E00\u6761\u6CD5\uFF0C\u4E24\u7C7B\u6863\u6848\u90FD\u5B88",
    "",
    "**\u65E5\u5E38\u53D1\u751F\u7684\u4E8B\u53EA\u5199\u4E00\u5904\uFF1A\u5F53\u5929\u65E5\u8BB0\uFF0C\u53E5\u5B50\u91CC\u5E26 `[[\u5BA2\u6237\u540D]]`\u3002** \u5BA2\u6237\u6863\u6848\u7684\u300C\u5173\u952E\u4E8B\u4EF6\u300D\u548C\u300C\u5F85\u529E\u300D\u4F1A\u81EA\u5DF1\u628A\u5B83\u4EEC\u68C0\u7D22\u8FC7\u6765\uFF0C\u548C\u4EBA\u8109\u6863\u6848\u5B8C\u5168\u540C\u4E00\u5957\u673A\u5236\u3002\u6240\u4EE5\u5BA2\u6237\u6863\u6848\u91CC\u6CA1\u6709\u624B\u5199\u7684\u300C\u4ED6\u7684\u95EE\u9898\u300D\u300C\u4EA4\u4ED8\u8BB0\u5F55\u300D\u5C0F\u8282\u2014\u2014**\u4F60\u4E0D\u7528\u7EF4\u62A4\u4EFB\u4F55\u4E00\u4EFD\u6863\u6848\u7684\u6B63\u6587**\u3002",
    "",
    `## \`${FIELDS.client}\` \u4E0E \`${FIELDS.with}\` \u4E0D\u80FD\u4E92\u6362`,
    "",
    `\`${FIELDS.client}\` \u662F**\u5546\u4E1A\u5951\u7EA6\u6807\u8BB0**\uFF0C\u5199\u4E0B\u5B83\u7B49\u4E8E\u5BA3\u544A\u300C\u6211\u6B20\u8FD9\u4E2A\u4EBA\u4E00\u4E2A\u4EA4\u4ED8\u300D\u3002\u4E09\u5F20\u670D\u52A1\u533A\u7684\u8868\u5168\u9760\u5B83\u8FC7\u6EE4\uFF0C\u300C\u670D\u52A1\u5BA2\u6237\u300D\u66F4\u662F\u76F4\u63A5\u7528\u5B83\u53CD\u63A8\u8EAB\u4EFD\u2014\u2014**\u7ED9\u8C01\u5E72\u8FC7\u6D3B\u8C01\u5C31\u662F\u5BA2\u6237**\u3002\u6240\u4EE5\u670B\u53CB\u4E00\u8D77\u505A\u7684\u4E8B\u5FC5\u987B\u8D70 \`${FIELDS.with}\`\uFF0C\u5426\u5219\u670B\u53CB\u4F1A\u88AB\u65E0\u58F0\u6CE8\u518C\u6210\u5BA2\u6237\u3001\u9879\u76EE\u4F1A\u6302\u8FDB\u300C\u6211\u8FD8\u6B20\u8C01\u7684\u4EA4\u4ED8\u300D\u3001\u7ED3\u6848\u540E\u8FD8\u4F1A\u6C61\u67D3\u6848\u4F8B\u5E93\u7684\u9009\u9898\u7EDF\u8BA1\u3002`,
    ""
  ].join("\n");
}

// src/modules/contacts/client.ts
var ILLEGAL_NAME = /[\\/:*?"<>|#^[\]]/;
var MESSAGES = {
  setupDone: "\u5BA2\u6237\u6A21\u5757\u5DF2\u5C31\u7EEA \u2705",
  namePrompt: "\u600E\u4E48\u79F0\u547C\u4ED6\uFF1F\uFF08\u6863\u6848\u5C31\u7528\u5B83\u547D\u540D\uFF09",
  namePlaceholder: "\u4F8B\u5982\uFF1A\u738B\u4E94",
  illegalName: '\u79F0\u547C\u91CC\u4E0D\u80FD\u6709 \\ / : * ? " < > | # ^ [ ] \u8FD9\u4E9B\u5B57\u7B26\u3002',
  sourcePrompt: "\u4ED6\u4ECE\u54EA\u4E2A\u6E20\u9053\u6765\uFF1F",
  contactPrompt: "\u8054\u7CFB\u65B9\u5F0F\uFF08\u5FAE\u4FE1\u53F7\u3001\u624B\u673A\u53F7\u3001\u5E73\u53F0\u8D26\u53F7\u90FD\u884C\uFF09",
  productPrompt: "\u4ED6\u4E70\u7684\u662F\u4EC0\u4E48\uFF1F",
  amountPrompt: "\u591A\u5C11\u94B1\uFF1F\uFF08\u53EA\u586B\u6570\u5B57\uFF09",
  amountInvalid: "\u91D1\u989D\u8981\u662F\u4E2A\u6570\u5B57\uFF0C\u8FD9\u7B14\u6CA1\u8BB0\u3002",
  clientPrompt: "\u8FD9\u7B14\u4ED8\u8D39\u662F\u8C01\u7684\uFF1F",
  projectPrompt: "\u8FD9\u7B14\u6536\u6B3E\u7B97\u54EA\u4E2A\u9879\u76EE\u7684\uFF1F",
  noClients: "\u8FD8\u6CA1\u6709\u5BA2\u6237\u6863\u6848\u3002\u5148\u8FD0\u884C\u300C\u65B0\u5EFA\u5BA2\u6237\u300D\u5EFA\u4E00\u4E2A\u3002",
  noProjects: `\u8FD8\u6CA1\u6709\u5BA2\u6237\u9879\u76EE\u3002\u5728\u9879\u76EE MOC \u7684\u5C5E\u6027\u91CC\u5199 \`${FIELDS.client}: "[[\u67D0\u4EBA]]"\` \u5C31\u7B97\u4E00\u4E2A\u3002`,
  cancelled: "\u5DF2\u53D6\u6D88\u3002",
  existsPrefix: "\u5DF2\u7ECF\u6709\u8FD9\u4EFD\u6863\u6848\u4E86\uFF0C\u76F4\u63A5\u6253\u5F00\uFF1A",
  createdPrefix: "\u5BA2\u6237\u6863\u6848\u5DF2\u5EFA\u597D\uFF1A",
  paidPrefix: "\u5DF2\u8BB0\u4E00\u7B14\u4ED8\u8D39\uFF1A",
  receiptPrefix: "\u5DF2\u8BB0\u4E00\u7B14\u6536\u6B3E\uFF1A",
  failedPrefix: "\u64CD\u4F5C\u5931\u8D25\uFF1A"
};
function clientSeed(ctx) {
  const folder = normalizeFolderPath(ctx.settings.clientFolder, CLIENT_FOLDER);
  const { stamp, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);
  return {
    folders: [folder],
    notes: [
      { path: TEMPLATE_FILES.client, content: clientTemplateFile() },
      { path: `${folder}/${basenameOf(CLIENT_MOC)}.md`, content: clientMocContent(stamp, uid) }
    ]
  };
}
function registerClientCommands(ctx, applySeed2) {
  ctx.commands.register(CLIENT_COMMANDS.setup, () => {
    void setupClients(ctx, applySeed2);
  });
  ctx.commands.register(CLIENT_COMMANDS.create, () => {
    void createClient(ctx);
  });
  ctx.commands.register(CLIENT_COMMANDS.payment, () => {
    void addPayment(ctx);
  });
  ctx.commands.register(CLIENT_COMMANDS.receipt, () => {
    void recordReceipt(ctx);
  });
}
async function setupClients(ctx, applySeed2) {
  try {
    const folder = normalizeFolderPath(ctx.settings.clientFolder, CLIENT_FOLDER);
    await applySeed2(clientSeed(ctx));
    new import_obsidian8.Notice(MESSAGES.setupDone);
    await ctx.app.workspace.openLinkText(`${folder}/${basenameOf(CLIENT_MOC)}.md`, "", false);
  } catch (error) {
    notifyFailure(error);
  }
}
async function createClient(ctx) {
  try {
    const answer = await new TextInputModal(ctx.app, {
      title: MESSAGES.namePrompt,
      placeholder: MESSAGES.namePlaceholder
    }).openAndGetValue();
    const name = (answer != null ? answer : "").trim();
    if (!name) {
      new import_obsidian8.Notice(MESSAGES.cancelled);
      return;
    }
    if (ILLEGAL_NAME.test(name)) {
      new import_obsidian8.Notice(MESSAGES.illegalName);
      return;
    }
    const source = await new ChoiceModal(ctx.app, {
      title: MESSAGES.sourcePrompt,
      items: optionsOf(ctx.settings.clientSources),
      labelOf: (item) => item
    }).openAndGetChoice();
    if (!source) {
      new import_obsidian8.Notice(MESSAGES.cancelled);
      return;
    }
    const contact = await new TextInputModal(ctx.app, {
      title: MESSAGES.contactPrompt
    }).openAndGetValue();
    if (contact === null) {
      new import_obsidian8.Notice(MESSAGES.cancelled);
      return;
    }
    const folder = normalizeFolderPath(ctx.settings.clientFolder, CLIENT_FOLDER);
    const path = `${folder}/${name}.md`;
    const existing = ctx.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian8.TFile) {
      new import_obsidian8.Notice(MESSAGES.existsPrefix + name);
      await ctx.app.workspace.getLeaf(false).openFile(existing);
      return;
    }
    const { stamp, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);
    const content = clientNoteContent({
      created: stamp,
      uid,
      type: NOTE_TYPES.client,
      source,
      contact: contact.trim()
    });
    await ensureFolderPath(ctx.app, folder);
    ctx.guard.mark(path);
    const file = await ctx.app.vault.create(path, content);
    new import_obsidian8.Notice(MESSAGES.createdPrefix + name);
    await ctx.app.workspace.getLeaf(false).openFile(file);
  } catch (error) {
    notifyFailure(error);
  }
}
async function addPayment(ctx) {
  try {
    const clients = liveNotesOfType(ctx, NOTE_TYPES.client);
    if (!clients.length) {
      new import_obsidian8.Notice(MESSAGES.noClients);
      return;
    }
    const client = await new ChoiceModal(ctx.app, {
      title: MESSAGES.clientPrompt,
      items: clients,
      labelOf: (file) => {
        const hint = descriptionOf(ctx, file);
        return hint ? `${file.basename}\u3000\u2014\u3000${hint}` : file.basename;
      }
    }).openAndGetChoice();
    if (!client) {
      new import_obsidian8.Notice(MESSAGES.cancelled);
      return;
    }
    const product = await new ChoiceModal(ctx.app, {
      title: MESSAGES.productPrompt,
      items: optionsOf(ctx.settings.clientProducts),
      labelOf: (item) => item
    }).openAndGetChoice();
    if (!product) {
      new import_obsidian8.Notice(MESSAGES.cancelled);
      return;
    }
    const amount = await askAmount(ctx);
    if (amount === null) return;
    const line = `- [ ] [${PAYMENT_FIELDS.product}::${product}] [${PAYMENT_FIELDS.amount}::${amount}] [${PAYMENT_FIELDS.date}::${today()}]`;
    ctx.guard.mark(client.path);
    await ctx.app.vault.process(
      client,
      (content) => insertIntoSection(content, CLIENT_PAYMENT_HEADING, line)
    );
    new import_obsidian8.Notice(`${MESSAGES.paidPrefix}${client.basename} \xB7 ${product} \xB7 ${amount}`);
  } catch (error) {
    notifyFailure(error);
  }
}
async function recordReceipt(ctx) {
  try {
    const projects = clientProjects2(ctx);
    if (!projects.length) {
      new import_obsidian8.Notice(MESSAGES.noProjects);
      return;
    }
    const project = await new ChoiceModal(ctx.app, {
      title: MESSAGES.projectPrompt,
      items: projects,
      labelOf: (file) => file.basename
    }).openAndGetChoice();
    if (!project) {
      new import_obsidian8.Notice(MESSAGES.cancelled);
      return;
    }
    const amount = await askAmount(ctx);
    if (amount === null) return;
    const line = `- [ ] [${PAYMENT_FIELDS.amount}::${amount}] [${PAYMENT_FIELDS.date}::${today()}]`;
    ctx.guard.mark(project.path);
    await ctx.app.vault.process(
      project,
      (content) => insertIntoSection(content, PROJECT_PAYMENT_HEADING, line)
    );
    new import_obsidian8.Notice(`${MESSAGES.receiptPrefix}${project.basename} \xB7 ${amount}`);
  } catch (error) {
    notifyFailure(error);
  }
}
function clientProjects2(ctx) {
  var _a, _b, _c;
  const found = [];
  for (const file of ctx.app.vault.getMarkdownFiles()) {
    const frontmatter = (_a = ctx.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
    if (String((_b = frontmatter == null ? void 0 : frontmatter[FIELDS.type]) != null ? _b : "").trim() !== NOTE_TYPES.project) continue;
    if (!extractLinks(String((_c = frontmatter == null ? void 0 : frontmatter[FIELDS.client]) != null ? _c : "")).length) continue;
    found.push(file);
  }
  return found.sort((left, right) => left.basename.localeCompare(right.basename, "zh"));
}
async function askAmount(ctx) {
  const answer = await new TextInputModal(ctx.app, {
    title: MESSAGES.amountPrompt,
    placeholder: "\u4F8B\u5982\uFF1A365"
  }).openAndGetValue();
  if (answer === null) {
    new import_obsidian8.Notice(MESSAGES.cancelled);
    return null;
  }
  const amount = Number(answer.trim());
  if (!Number.isFinite(amount) || amount <= 0) {
    new import_obsidian8.Notice(MESSAGES.amountInvalid);
    return null;
  }
  return amount;
}
function optionsOf(raw) {
  return raw.split(/[,，]/).map((item) => item.trim()).filter(Boolean);
}
function notifyFailure(error) {
  const message = error instanceof Error ? error.message : String(error);
  new import_obsidian8.Notice(MESSAGES.failedPrefix + message);
}

// src/modules/contacts/createContact.ts
var import_obsidian9 = require("obsidian");
var ILLEGAL_NAME2 = /[\\/:*?"<>|#^[\]]/;
var MESSAGES2 = {
  namePrompt: "\u8FD9\u4E2A\u4EBA\u53EB\u4EC0\u4E48\uFF1F\uFF08\u771F\u540D\uFF0C\u6863\u6848\u5C31\u7528\u5B83\u547D\u540D\uFF09",
  namePlaceholder: "\u4F8B\u5982\uFF1A\u5F20\u4E09",
  cancelled: "\u5DF2\u53D6\u6D88\uFF0C\u6CA1\u6709\u5EFA\u6863\u3002",
  illegalName: '\u59D3\u540D\u91CC\u4E0D\u80FD\u6709 \\ / : * ? " < > | # ^ [ ] \u8FD9\u4E9B\u5B57\u7B26\u3002',
  tierPrompt: "\u591A\u4E45\u8BE5\u8DDF\u4ED6\u8BF4\u53E5\u8BDD\uFF1F",
  directionPrompt: "\u8FD9\u6BB5\u5173\u7CFB\u5F80\u54EA\u4E2A\u65B9\u5411\u4F7F\u52B2\uFF1F",
  existsPrefix: "\u5DF2\u7ECF\u6709\u8FD9\u4EFD\u6863\u6848\u4E86\uFF0C\u76F4\u63A5\u6253\u5F00\uFF1A",
  donePrefix: "\u6863\u6848\u5DF2\u5EFA\u597D\uFF1A",
  failedPrefix: "\u5EFA\u6863\u5931\u8D25\uFF1A"
};
var TIER_HINTS = {
  \u5BC6: "\u6BCF\u5468\u8BF4\u53E5\u8BDD",
  \u8FD1: "\u6BCF\u6708\u8BF4\u53E5\u8BDD",
  \u719F: "\u6BCF\u5B63\u8BF4\u53E5\u8BDD",
  \u8FDC: "\u6BCF\u5E74\u8BF4\u53E5\u8BDD"
};
var DIRECTION_HINTS = {
  \u5411\u4E0A: "\u8981\u7528\u5FC3\u7EF4\u62A4",
  \u5E73\u884C: "\u4E92\u76F8\u642D\u628A\u624B",
  \u5411\u4E0B: "\u7ED9\u673A\u4F1A\uFF0C\u7ED3\u5584\u7F18"
};
function registerCreateContactCommand(ctx) {
  ctx.commands.register(CONTACT_COMMANDS.create, () => {
    void createContact(ctx);
  });
}
async function createContact(ctx) {
  try {
    const answer = await new TextInputModal(ctx.app, {
      title: MESSAGES2.namePrompt,
      placeholder: MESSAGES2.namePlaceholder
    }).openAndGetValue();
    const name = (answer != null ? answer : "").trim();
    if (!name) {
      new import_obsidian9.Notice(MESSAGES2.cancelled);
      return;
    }
    if (ILLEGAL_NAME2.test(name)) {
      new import_obsidian9.Notice(MESSAGES2.illegalName);
      return;
    }
    const tier = await new ChoiceModal(ctx.app, {
      title: MESSAGES2.tierPrompt,
      items: CONTACT_TIERS,
      labelOf: (item) => {
        var _a;
        return `${item}\u3000\u2014\u3000${(_a = TIER_HINTS[item]) != null ? _a : ""}`;
      }
    }).openAndGetChoice();
    if (!tier) {
      new import_obsidian9.Notice(MESSAGES2.cancelled);
      return;
    }
    const direction = await new ChoiceModal(ctx.app, {
      title: MESSAGES2.directionPrompt,
      items: CONTACT_DIRECTIONS,
      labelOf: (item) => {
        var _a;
        return `${item}\u3000\u2014\u3000${(_a = DIRECTION_HINTS[item]) != null ? _a : ""}`;
      }
    }).openAndGetChoice();
    if (!direction) {
      new import_obsidian9.Notice(MESSAGES2.cancelled);
      return;
    }
    const folder = normalizeFolderPath(ctx.settings.contactFolder, CONTACT_FOLDER);
    const path = `${folder}/${name}.md`;
    const existing = ctx.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian9.TFile) {
      new import_obsidian9.Notice(MESSAGES2.existsPrefix + name);
      await ctx.app.workspace.getLeaf(false).openFile(existing);
      return;
    }
    const { stamp, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);
    const content = personNoteContent({
      created: stamp,
      uid,
      type: NOTE_TYPES.person,
      up: `[[${basenameOf(CONTACT_MOC)}]]`,
      tier,
      direction
    });
    await ensureFolderPath(ctx.app, folder);
    ctx.guard.mark(path);
    const file = await ctx.app.vault.create(path, content);
    new import_obsidian9.Notice(MESSAGES2.donePrefix + name);
    await ctx.app.workspace.getLeaf(false).openFile(file);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian9.Notice(MESSAGES2.failedPrefix + message);
  }
}

// src/modules/contacts/personViews.ts
var MAX_ROWS = 20;
var TERMINAL_STATUS = {
  done: "\u5B8C\u6210",
  dropped: "\u653E\u5F03"
};
var relatedProjects = {
  name: "\u76F8\u5173\u9879\u76EE",
  render: async (view) => {
    if (!view.host) {
      renderEmpty(view.el, "\u8FD9\u4E2A\u89C6\u56FE\u8981\u957F\u5728\u4EBA\u7269\u6863\u6848\u4E0A\u624D\u6709\u5185\u5BB9\u3002");
      return;
    }
    const living = relationsOf(view, view.host).filter(
      (item) => !TERMINAL_STATUS[item.status]
    );
    if (!living.length) {
      renderEmpty(
        view.el,
        `\u624B\u4E0A\u6CA1\u6709\u548C\u4ED6\u76F8\u5173\u7684\u9879\u76EE\u3002\u5728\u9879\u76EE MOC \u7684\u5C5E\u6027\u91CC\u5199 \`${FIELDS.client}: "[[${view.host.basename}]]"\`\uFF08\u4ED6\u59D4\u6258\u7684\uFF09\u6216 \`${FIELDS.with}\`\uFF08\u4E00\u8D77\u505A\u7684\uFF09\u3002\u5DF2\u7ECF\u7ED3\u675F\u7684\u9879\u76EE\u4F1A\u51FA\u73B0\u5728\u4E0B\u9762\u7684\u300C\u5173\u952E\u4E8B\u4EF6\u300D\u91CC\u3002`
      );
      return;
    }
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u9879\u76EE", "\u5173\u7CFB", "\u6982\u8FF0"],
      living.map((item) => [
        noteLink(item.project),
        item.relation,
        toText(view.index.fieldOf(item.project, FIELDS.description)) || "\u2014"
      ]),
      2
    );
  }
};
function relationsOf(view, person) {
  const found = [];
  for (const project of view.index.notesOfType(NOTE_TYPES.project)) {
    const relation = fieldPointsTo(view, project, FIELDS.client, person) ? "\u59D4\u6258" : fieldPointsTo(view, project, FIELDS.with, person) ? "\u540C\u884C" : null;
    if (!relation) continue;
    found.push({
      project,
      relation,
      status: toText(view.index.fieldOf(project, FIELDS.status)).toLowerCase()
    });
  }
  return found;
}
function fieldPointsTo(view, note, field, target) {
  var _a;
  const raw = view.index.fieldOf(note, field);
  const values = Array.isArray(raw) ? raw : [raw];
  for (const value of values) {
    for (const link of extractLinks(String(value != null ? value : ""))) {
      if (((_a = view.index.resolve(link, note.path)) == null ? void 0 : _a.path) === target.path) return true;
    }
  }
  return false;
}
var personLedger = {
  name: "\u4EBA\u60C5\u8D26\u672C",
  render: async (view) => {
    const host = view.host;
    if (!host) {
      renderEmpty(view.el, "\u8FD9\u4E2A\u89C6\u56FE\u8981\u957F\u5728\u4EBA\u7269\u6863\u6848\u4E0A\u624D\u6709\u5185\u5BB9\u3002");
      return;
    }
    const entries = await collectLedger(view, (owner) => owner.path === host.path);
    if (!entries.length) {
      renderEmpty(
        view.el,
        `\u8FD8\u6CA1\u6709\u8D26\u3002\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u8BB0\u4EBA\u60C5\u300D\uFF0C\u6216\u5728\u5F53\u5929\u65E5\u8BB0\u91CC\u5199\u4E00\u884C\uFF1A\`- [[${host.basename}]]\uFF5C\u53BB\uFF5C\u4E8B\u9879\uFF5C\u4E24\u6E05\``
      );
      return;
    }
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u65E5\u671F", "\u53BB/\u6765", "\u4E8B\u9879", "\u72B6\u6001"],
      entries.map((entry) => [
        noteLink(entry.diary, entry.day),
        entry.kind,
        richText(entry.item, entry.diary.path),
        entry.legal ? entry.status : `\u26A0\uFE0F ${entry.status}`
      ]),
      2
    );
  }
};
var keyEvents = {
  name: "\u5173\u952E\u4E8B\u4EF6",
  render: async (view) => {
    var _a;
    const host = view.host;
    if (!host) {
      renderEmpty(view.el, "\u8FD9\u4E2A\u89C6\u56FE\u8981\u957F\u5728\u4EBA\u7269\u6863\u6848\u4E0A\u624D\u6709\u5185\u5BB9\u3002");
      return;
    }
    const events = [];
    for (const source of mentionSources(view, host)) {
      for (const line of await view.index.listLinesOf(source.file)) {
        if (line.isTask || isLedgerLine(line)) continue;
        if (!mentions(view, line, source.file.path, host)) continue;
        events.push({ day: source.day, source: source.file, text: line.text, link: null });
      }
    }
    for (const item of relationsOf(view, host)) {
      const label = TERMINAL_STATUS[item.status];
      if (!label) continue;
      const day = (_a = dayText(view.index.fieldOf(item.project, FIELDS.archived))) != null ? _a : dayOfMillis(item.project.stat.mtime);
      events.push({
        day,
        source: item.project,
        text: `${label}\u4E86${item.relation === "\u59D4\u6258" ? "\u4ED6\u59D4\u6258\u7684" : "\u4E00\u8D77\u505A\u7684"}\u9879\u76EE`,
        link: item.project
      });
    }
    if (!events.length) {
      renderEmpty(
        view.el,
        `\u8FD8\u6CA1\u6709\u548C\u4ED6\u6709\u5173\u7684\u4E8B\u3002\u5728\u5F53\u5929\u65E5\u8BB0\u91CC\u5199\u4E00\u884C\u63D0\u5230 \`[[${host.basename}]]\`\uFF0C\u8FD9\u91CC\u5C31\u4F1A\u957F\u51FA\u6765\u3002`
      );
      return;
    }
    events.sort((left, right) => right.day.localeCompare(left.day));
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u65E5\u671F", "\u53D1\u751F\u4E86\u4EC0\u4E48"],
      events.slice(0, MAX_ROWS).map((event) => [
        noteLink(event.source, event.day),
        event.link ? richText(`${event.text}\u300A[[${event.link.basename}]]\u300B`, view.sourcePath) : richText(event.text, event.source.path)
      ]),
      1
    );
    if (events.length > MAX_ROWS) {
      renderNote(view.el, `\u2026\u53E6\u6709 ${events.length - MAX_ROWS} \u6761\u66F4\u65E9\u7684\u8BB0\u5F55`);
    }
  }
};
var openTasks = {
  name: "\u5F85\u529E",
  render: async (view) => {
    const host = view.host;
    if (!host) {
      renderEmpty(view.el, "\u8FD9\u4E2A\u89C6\u56FE\u8981\u957F\u5728\u4EBA\u7269\u6863\u6848\u4E0A\u624D\u6709\u5185\u5BB9\u3002");
      return;
    }
    const open = [];
    let done = 0;
    for (const source of mentionSources(view, host)) {
      for (const line of await view.index.listLinesOf(source.file)) {
        if (!line.isTask) continue;
        if (!mentions(view, line, source.file.path, host)) continue;
        if (line.checked) done += 1;
        else {
          open.push({
            file: source.file,
            day: source.day,
            text: line.text,
            line: line.line,
            checked: false
          });
        }
      }
    }
    if (!open.length) {
      renderEmpty(
        view.el,
        done ? `\u8DDF\u4ED6\u6709\u5173\u7684\u4E8B\u90FD\u529E\u5B8C\u4E86\uFF08\u5DF2\u5B8C\u6210 ${done} \u4EF6\uFF09\u3002` : `\u6CA1\u6709\u5F85\u529E\u3002\u9700\u8981\u8DDF\u8FDB\u7684\u5171\u8BC6\u5199\u6210\u4EFB\u52A1\u884C\uFF1A\`- [ ] \u51FA\u65B9\u6848\u7ED9 [[${host.basename}]]\``
      );
      return;
    }
    renderSummary(view.el, `\u8FD8\u6B20 **${open.length}** \u4EF6\u4E8B${done ? `\uFF08\u5DF2\u5B8C\u6210 ${done} \u4EF6\uFF09` : ""}`);
    renderTaskList(view.ctx.app, view.el, view.sourcePath, open, (task) => {
      void toggleTask(view, task);
    });
  }
};
async function toggleTask(view, task) {
  view.ctx.guard.mark(task.file.path);
  await view.ctx.app.vault.process(
    task.file,
    (content) => {
      var _a;
      return (_a = toggleTaskLine(content, task.line, task.checked)) != null ? _a : content;
    }
  );
}
function mentionSources(view, host) {
  const sources = [];
  for (const file of view.index.backlinksOf(host)) {
    const day = dayOfTitle(file.basename);
    if (!day) continue;
    const type = toText(view.index.fieldOf(file, FIELDS.type));
    if (type === NOTE_TYPES.person || type === NOTE_TYPES.client) continue;
    sources.push({ file, day });
  }
  return sources.sort((left, right) => right.day.localeCompare(left.day));
}
var personViews = [
  relatedProjects,
  personLedger,
  keyEvents,
  openTasks
];

// src/modules/contacts/recordFavor.ts
var import_obsidian10 = require("obsidian");
var MESSAGES3 = {
  noContacts: "\u8FD8\u6CA1\u6709\u4EFB\u4F55\u6863\u6848\u3002\u5148\u8FD0\u884C\u300C\u65B0\u5EFA\u4EBA\u8109\u300D\u5EFA\u4E00\u4E2A\uFF0C\u518D\u6765\u8BB0\u8D26\u3002",
  personPrompt: "\u8FD9\u7B14\u4EBA\u60C5\uFF0C\u662F\u8DDF\u8C01\uFF1F",
  kindPrompt: "\u4EBA\u60C5\u5F80\u54EA\u4E2A\u65B9\u5411\u8D70\uFF1F",
  itemPrompt: "\u4EC0\u4E48\u4E8B\uFF1F\uFF08\u4E00\u53E5\u8BDD\uFF09",
  itemPlaceholder: "\u4F8B\u5982\uFF1A\u9001\u4E86\u534A\u65A4\u751F\u666E",
  statusPrompt: "\u73B0\u5728\u7B97\u6E05\u4E86\u5417\uFF1F",
  cancelled: "\u5DF2\u53D6\u6D88\uFF0C\u6CA1\u6709\u8BB0\u8D26\u3002",
  noDiary: "\u62FF\u4E0D\u5230\u4ECA\u5929\u7684\u65E5\u8BB0\uFF0C\u6CA1\u6709\u8BB0\u8D26\u3002",
  donePrefix: "\u5DF2\u8BB0\u8FDB\u4ECA\u5929\u7684\u65E5\u8BB0\uFF1A",
  failedPrefix: "\u8BB0\u4EBA\u60C5\u5931\u8D25\uFF1A"
};
var KIND_HINTS = {
  \u53BB: "\u6211\u7ED9\u51FA\u53BB\u7684\uFF08\u9001\u793C\u3001\u5E2E\u5FD9\u3001\u8BF7\u5BA2\uFF09",
  \u6765: "\u6211\u6536\u5230\u7684\uFF08\u6536\u793C\u3001\u88AB\u5E2E\u3001\u88AB\u8BF7\uFF09"
};
var STATUS_HINTS = {
  \u4E24\u6E05: "\u8FD9\u7B14\u4E0D\u7528\u8BB0\u6302\u4E86",
  \u6211\u6B20: "\u6211\u8FD8\u6B20\u4ED6\u4E00\u4EFD",
  \u4ED6\u6B20: "\u4ED6\u8FD8\u6B20\u6211\u4E00\u4EFD"
};
function registerRecordFavorCommand(ctx, openDaily) {
  ctx.commands.register(CONTACT_COMMANDS.favor, () => {
    void recordFavor(ctx, openDaily);
  });
}
async function recordFavor(ctx, openDaily) {
  try {
    const candidates = [
      ...liveNotesOfType(ctx, NOTE_TYPES.person),
      ...liveNotesOfType(ctx, NOTE_TYPES.client)
    ];
    if (!candidates.length) {
      new import_obsidian10.Notice(MESSAGES3.noContacts);
      return;
    }
    const person = await new ChoiceModal(ctx.app, {
      title: MESSAGES3.personPrompt,
      items: candidates,
      labelOf: (file) => {
        const hint = descriptionOf(ctx, file);
        return hint ? `${file.basename}\u3000\u2014\u3000${hint}` : file.basename;
      }
    }).openAndGetChoice();
    if (!person) {
      new import_obsidian10.Notice(MESSAGES3.cancelled);
      return;
    }
    const kind = await new ChoiceModal(ctx.app, {
      title: MESSAGES3.kindPrompt,
      items: LEDGER.kinds,
      labelOf: (item2) => {
        var _a;
        return `${item2}\u3000\u2014\u3000${(_a = KIND_HINTS[item2]) != null ? _a : ""}`;
      }
    }).openAndGetChoice();
    if (!kind) {
      new import_obsidian10.Notice(MESSAGES3.cancelled);
      return;
    }
    const answer = await new TextInputModal(ctx.app, {
      title: MESSAGES3.itemPrompt,
      placeholder: MESSAGES3.itemPlaceholder
    }).openAndGetValue();
    const item = cleanItem(answer != null ? answer : "");
    if (!item) {
      new import_obsidian10.Notice(MESSAGES3.cancelled);
      return;
    }
    const status = await new ChoiceModal(ctx.app, {
      title: MESSAGES3.statusPrompt,
      items: LEDGER.statuses,
      labelOf: (value) => {
        var _a;
        return `${value}\u3000\u2014\u3000${(_a = STATUS_HINTS[value]) != null ? _a : ""}`;
      }
    }).openAndGetChoice();
    if (!status) {
      new import_obsidian10.Notice(MESSAGES3.cancelled);
      return;
    }
    const diary = await openDaily();
    if (!diary) {
      new import_obsidian10.Notice(MESSAGES3.noDiary);
      return;
    }
    const line = ledgerLine(person.basename, kind, item, status);
    ctx.guard.mark(diary.path);
    await ctx.app.vault.process(
      diary,
      (content) => insertIntoSection(content, DIARY_LOG_HEADING, line)
    );
    new import_obsidian10.Notice(MESSAGES3.donePrefix + line);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian10.Notice(MESSAGES3.failedPrefix + message);
  }
}
function cleanItem(raw) {
  return raw.replace(/\s+/g, " ").split(LEDGER.separator).join("|").trim();
}
function ledgerLine(name, kind, item, status) {
  const segments = [`[[${name}]]`, kind, item];
  if (status !== LEDGER.defaultStatus) segments.push(status);
  return `- ${segments.join(LEDGER.separator)}`;
}

// src/modules/contacts/seed.ts
function contactsSeed(ctx) {
  const folder = normalizeFolderPath(ctx.settings.contactFolder, CONTACT_FOLDER);
  const { stamp, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);
  return {
    folders: [folder],
    notes: [
      { path: TEMPLATE_FILES.person, content: personTemplateFile() },
      { path: `${folder}/${basenameOf(CONTACT_MOC)}.md`, content: contactMocContent(stamp, uid) }
    ]
  };
}

// src/modules/inspiration/capture.ts
var import_obsidian11 = require("obsidian");

// src/modules/inspiration/templates.ts
var TEMPLATE_TOKENS = {
  content: "{{content}}",
  date: "{{date}}",
  time: "{{time}}",
  datetime: "{{datetime}}"
};
function normalizeInspiration(input) {
  if (input === null) return "";
  return input.replace(/\s+/g, " ").trim();
}
function normalizeInspirationHeading(value) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate) return INSPIRATION_DEFAULTS.heading;
  const headingMatch = candidate.match(/^(#{1,6})\s*(.+)$/);
  if (headingMatch) return `${headingMatch[1]} ${headingMatch[2].trim()}`;
  return `# ${candidate}`;
}
function normalizeInspirationFormat(value) {
  const candidate = typeof value === "string" ? value : "";
  const format = candidate.trim() ? candidate : INSPIRATION_DEFAULTS.format;
  if (!format.includes(TEMPLATE_TOKENS.content)) {
    throw new Error("\u7075\u611F\u683C\u5F0F\u5FC5\u987B\u5305\u542B {{content}}\uFF0C\u5426\u5219\u8F93\u5165\u5185\u5BB9\u65E0\u5904\u5199\u5165\u3002");
  }
  return format;
}
function renderInspirationEntry(format, inspiration, timeParts) {
  const replacements = {
    [TEMPLATE_TOKENS.content]: inspiration,
    [TEMPLATE_TOKENS.date]: timeParts.date,
    [TEMPLATE_TOKENS.time]: timeParts.time,
    [TEMPLATE_TOKENS.datetime]: timeParts.datetime
  };
  return normalizeInspirationFormat(format).replace(
    /\{\{(?:content|date|time|datetime)\}\}/g,
    (token) => {
      var _a;
      return (_a = replacements[token]) != null ? _a : token;
    }
  );
}
function buildInitialInspirationContent(entry, heading, targetPath) {
  const filter = buildDataviewTaskQuery(targetPath);
  return `${heading}
${filter}

${entry}
`;
}
function buildDataviewTaskQuery(targetPath) {
  return buildDataviewTaskQueryVersion(targetPath, true);
}
function buildDataviewTaskQueryVersion(targetPath, includeMtimeGroup) {
  const escapedPath = targetPath.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const lines = [
    "```dataview",
    "task",
    "from",
    `    "${escapedPath}"`,
    "where",
    "    !completed"
  ];
  if (includeMtimeGroup) {
    lines.push(
      "group by",
      '    "\u6700\u540E\u66F4\u65B0 \xB7 " + dateformat(file.mtime, "yyyy-MM-dd HH:mm")'
    );
  }
  lines.push("```");
  return lines.join("\n");
}
function insertInspiration(content, entry, position, heading, targetPath) {
  var _a, _b, _c, _d;
  const lineEnding = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);
  const entryLines = entry.split(/\r?\n/);
  normalizeSystemHeader(lines, heading, targetPath);
  switch (position) {
    case "heading-top": {
      const headingIndex = findHeadingIndex(lines, heading);
      const insertionIndex = findHeadingContentStart(lines, headingIndex);
      lines.splice(insertionIndex, 0, ...entryLines);
      break;
    }
    case "heading-bottom": {
      const headingIndex = findHeadingIndex(lines, heading);
      const headingLevel = (_b = (_a = heading.match(/^#+/)) == null ? void 0 : _a[0].length) != null ? _b : 1;
      let insertionIndex = findHeadingSectionEnd(lines, headingIndex, headingLevel);
      while (insertionIndex > headingIndex + 1 && !((_c = lines[insertionIndex - 1]) == null ? void 0 : _c.trim())) {
        insertionIndex -= 1;
      }
      lines.splice(insertionIndex, 0, ...entryLines);
      break;
    }
    case "file-top": {
      const insertionIndex = findBodyStart(lines);
      lines.splice(insertionIndex, 0, ...entryLines);
      break;
    }
    case "file-bottom": {
      let insertionIndex = lines.length;
      while (insertionIndex > 0 && !((_d = lines[insertionIndex - 1]) == null ? void 0 : _d.trim())) {
        insertionIndex -= 1;
      }
      lines.splice(insertionIndex, 0, ...entryLines);
      break;
    }
  }
  return lines.join(lineEnding);
}
function findHeadingIndex(lines, heading) {
  const index = lines.findIndex((line) => line.trim() === heading);
  if (index === -1) {
    throw new Error(`\u6CA1\u6709\u627E\u5230\u5B9A\u4F4D\u6807\u9898\u201C${heading}\u201D\uFF0C\u672A\u5199\u5165\u4EFB\u4F55\u5185\u5BB9\u3002`);
  }
  return index;
}
function findHeadingSectionEnd(lines, headingIndex, headingLevel) {
  var _a;
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const nextHeading = (_a = lines[index]) == null ? void 0 : _a.match(/^(#{1,6})\s+/);
    if (nextHeading && nextHeading[1].length <= headingLevel) return index;
  }
  return lines.length;
}
function findHeadingContentStart(lines, headingIndex) {
  const queryStart = skipBlankLines(lines, headingIndex + 1);
  if (!isDataviewFence(lines[queryStart])) return headingIndex + 1;
  return skipBlankLines(lines, findDataviewFenceEnd(lines, queryStart) + 1);
}
function normalizeSystemHeader(lines, heading, targetPath) {
  var _a, _b;
  const bodyStart = findMarkdownBodyStart(lines);
  let headingIndex = bodyStart;
  let queryStart = bodyStart;
  if (((_a = lines[bodyStart]) == null ? void 0 : _a.trim()) === heading) {
    queryStart = skipBlankLines(lines, bodyStart + 1);
  } else if (isDataviewFence(lines[bodyStart])) {
    const legacyQueryEnd = findDataviewFenceEnd(lines, bodyStart);
    headingIndex = skipBlankLines(lines, legacyQueryEnd + 1);
  } else {
    return;
  }
  if (((_b = lines[headingIndex]) == null ? void 0 : _b.trim()) !== heading || !isDataviewFence(lines[queryStart])) return;
  const queryEnd = findDataviewFenceEnd(lines, queryStart);
  const actualQuery = lines.slice(queryStart, queryEnd + 1).join("\n");
  const currentQuery = buildDataviewTaskQuery(targetPath);
  const legacyQuery = buildDataviewTaskQueryVersion(targetPath, false);
  if (actualQuery !== currentQuery && actualQuery !== legacyQuery) return;
  const systemEnd = Math.max(headingIndex, queryEnd);
  const contentStart = skipBlankLines(lines, systemEnd + 1);
  lines.splice(
    bodyStart,
    contentStart - bodyStart,
    heading,
    ...currentQuery.split("\n"),
    ""
  );
}
function findBodyStart(lines) {
  var _a, _b;
  const bodyStart = findMarkdownBodyStart(lines);
  let queryStart = bodyStart;
  if (/^#{1,6}\s+/.test((_b = (_a = lines[bodyStart]) == null ? void 0 : _a.trim()) != null ? _b : "")) {
    const candidate = skipBlankLines(lines, bodyStart + 1);
    if (isDataviewFence(lines[candidate])) queryStart = candidate;
  }
  if (!isDataviewFence(lines[queryStart])) return bodyStart;
  return skipBlankLines(lines, findDataviewFenceEnd(lines, queryStart) + 1);
}
function findMarkdownBodyStart(lines) {
  var _a;
  let bodyStart = 0;
  if (((_a = lines[0]) == null ? void 0 : _a.trim()) === "---") {
    const closingIndex = lines.findIndex(
      (line, index) => index > 0 && (line.trim() === "---" || line.trim() === "...")
    );
    if (closingIndex === -1) {
      throw new Error("\u76EE\u6807\u7B14\u8BB0\u7684 YAML \u5934\u90E8\u6CA1\u6709\u95ED\u5408\uFF0C\u672A\u5199\u5165\u4EFB\u4F55\u5185\u5BB9\u3002");
    }
    bodyStart = closingIndex + 1;
  }
  return skipBlankLines(lines, bodyStart);
}
function isDataviewFence(line) {
  return (line == null ? void 0 : line.trim().toLowerCase()) === "```dataview";
}
function findDataviewFenceEnd(lines, start) {
  const closingIndex = lines.findIndex(
    (line, index) => index > start && line.trim() === "```"
  );
  if (closingIndex === -1) {
    throw new Error("\u76EE\u6807\u7B14\u8BB0\u9876\u90E8\u7684 Dataview \u67E5\u8BE2\u6CA1\u6709\u95ED\u5408\uFF0C\u672A\u5199\u5165\u4EFB\u4F55\u5185\u5BB9\u3002");
  }
  return closingIndex;
}
function skipBlankLines(lines, start) {
  var _a;
  let index = start;
  while (index < lines.length && !((_a = lines[index]) == null ? void 0 : _a.trim())) index += 1;
  return index;
}

// src/modules/inspiration/capture.ts
function registerInspirationCaptureCommand(ctx) {
  ctx.commands.register(INSPIRATION_COMMAND, () => {
    void captureInspiration(ctx);
  });
}
async function captureInspiration(ctx) {
  try {
    const input = await new TextInputModal(ctx.app, {
      title: "\u8BF7\u8F93\u5165\u8981\u8BB0\u5F55\u7684\u7075\u611F",
      placeholder: "\u4E00\u53E5\u8BDD\u8BB0\u4E0B\u6765\uFF0C\u7A0D\u540E\u518D\u6574\u7406"
    }).openAndGetValue();
    const inspiration = normalizeInspiration(input);
    if (!inspiration) {
      new import_obsidian11.Notice("\u672A\u8F93\u5165\u5185\u5BB9\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002");
      return;
    }
    const target = resolveInspirationTarget(ctx);
    const timeParts = nowLocalDateTimeParts(ctx.settings.dateTimeFormat);
    const entry = renderInspirationEntry(target.format, inspiration, timeParts);
    let targetEntry = ctx.app.vault.getAbstractFileByPath(target.path);
    if (targetEntry instanceof import_obsidian11.TFolder) {
      throw new Error(`\u76EE\u6807\u8DEF\u5F84\u662F\u6587\u4EF6\u5939\uFF0C\u65E0\u6CD5\u5199\u5165\uFF1A${target.path}`);
    }
    if (!targetEntry) {
      if (target.folder) await ensureFolderPath(ctx.app, target.folder);
      ctx.guard.mark(target.path);
      targetEntry = await ctx.app.vault.create(
        target.path,
        buildInitialInspirationContent(entry, target.heading, target.path)
      );
    } else {
      if (!(targetEntry instanceof import_obsidian11.TFile) || targetEntry.extension.toLowerCase() !== "md") {
        throw new Error(`\u76EE\u6807\u8DEF\u5F84\u4E0D\u662F Markdown \u6587\u4EF6\uFF1A${target.path}`);
      }
      await ctx.app.vault.process(targetEntry, (content) => {
        const updatedContent = insertInspiration(
          content,
          entry,
          target.position,
          target.heading,
          target.path
        );
        ctx.guard.mark(target.path);
        return updatedContent;
      });
    }
    new import_obsidian11.Notice(`\u5DF2\u8BB0\u5F55\u7075\u611F\uFF1A${inspiration}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian11.Notice(`\u8BB0\u5F55\u7075\u611F\u5931\u8D25\uFF1A${message}`);
  }
}
function resolveInspirationTarget(ctx) {
  const folder = normalizeFolderPath(ctx.settings.inspirationFolder, INSPIRATION_DEFAULTS.folder);
  const fileName = normalizeInspirationFileName(ctx.settings.inspirationFileName);
  const path = (0, import_obsidian11.normalizePath)(folder ? `${folder}/${fileName}` : fileName);
  if (folder.split("/").some((part) => part === "." || part === "..")) {
    throw new Error("\u7075\u611F\u6587\u4EF6\u5939\u4E0D\u80FD\u5305\u542B . \u6216 .. \u8DEF\u5F84\u6BB5\u3002");
  }
  return {
    folder,
    path,
    heading: normalizeInspirationHeading(ctx.settings.inspirationHeading),
    position: normalizeInsertPosition(ctx.settings.inspirationInsertPosition),
    format: normalizeInspirationFormat(ctx.settings.inspirationFormat)
  };
}
function normalizeInspirationFileName(value) {
  const candidate = typeof value === "string" ? value.trim() : "";
  const fileName = candidate || INSPIRATION_DEFAULTS.fileName;
  if (fileName === "." || fileName === ".." || /[\\/:*?"<>|]/.test(fileName)) {
    throw new Error("\u7075\u611F\u7B14\u8BB0\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u8DEF\u5F84\u6216\u7CFB\u7EDF\u4FDD\u7559\u5B57\u7B26\u3002");
  }
  return fileName.toLowerCase().endsWith(".md") ? fileName : `${fileName}.md`;
}
function normalizeInsertPosition(value) {
  const candidate = value;
  return INSPIRATION_INSERT_POSITIONS.includes(candidate) ? candidate : INSPIRATION_DEFAULTS.insertPosition;
}

// src/modules/projects/cardInit.ts
var import_obsidian12 = require("obsidian");

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
  const normalizedFilePath = (0, import_obsidian12.normalizePath)(filePath);
  for (const root of roots) {
    const prefix = `${root.path}/`;
    if (!normalizedFilePath.startsWith(prefix)) continue;
    const relativePath = normalizedFilePath.slice(prefix.length);
    const pathParts = relativePath.split("/").filter(Boolean);
    if (pathParts.length < 2) return null;
    const containerName = pathParts[0];
    const mocPath = (0, import_obsidian12.normalizePath)(`${root.path}/${containerName}/${containerName}.md`);
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
        // up 是列表类型（一张卡片可以同时属于多个 MOC），首次登记也写成单元素列表
        up: hasValue(frontmatter.up) ? frontmatter.up : [context.upLink]
      };
      reorderFrontmatter(frontmatter, cardValues);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian12.Notice(`\u5361\u7247\u7B14\u8BB0\u521D\u59CB\u5316\u5931\u8D25\uFF1A${message}`);
    throw error;
  }
}
function registerCardInitCommand(ctx) {
  ctx.commands.register(PROJECT_COMMANDS.card, () => {
    const activeFile = ctx.app.workspace.getActiveFile();
    if (!activeFile) return;
    void initCard(ctx, activeFile, { interactive: true }).catch(() => {
    });
  });
}
function registerCardAutoInit(ctx) {
  ctx.app.workspace.onLayoutReady(() => {
    ctx.plugin.registerEvent(
      ctx.app.vault.on("create", (file) => {
        if (!ctx.settings.autoCardInit) return;
        if (!(file instanceof import_obsidian12.TFile) || file.extension !== "md") return;
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
var import_obsidian13 = require("obsidian");

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
function mocFrontmatter(description, created, uid, relation) {
  return [
    "---",
    "aliases:",
    `description: ${toYamlString(description)}`,
    `created: ${created}`,
    "updated:",
    "tags:",
    `UID: ${uid}`,
    "type: project",
    "status: active",
    // 只在有值时才写这一行：空的 client 键会让这个项目被当成一笔没有客户的委托
    ...relation ? [`${relation.field}: "[[${relation.target}]]"`] : [],
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
  const frontmatter = mocFrontmatter(
    options.description,
    options.created,
    options.uid,
    options.relation
  );
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
var OWNERSHIP = [
  { field: null, label: "\u81EA\u5DF1\u7684\u9879\u76EE\uFF08\u4E0D\u5199 client\uFF0C\u4E0D\u8FDB\u5BA2\u6237\u7EDF\u8BA1\uFF09", ask: "\u548C\u8C01\u4E00\u8D77\u505A\uFF1F\uFF08\u81EA\u5DF1\u72EC\u505A\u5C31\u6309 Esc \u8DF3\u8FC7\uFF09" },
  { field: FIELDS.client, label: "\u5BA2\u6237\u59D4\u6258\u7684\uFF08\u5199 client\uFF0C\u6211\u6B20\u4ED6\u4E00\u4E2A\u4EA4\u4ED8\uFF09", ask: "\u8FD9\u662F\u8C01\u59D4\u6258\u7684\uFF1F" }
];
async function createProject(ctx, preset, pickPerson2) {
  var _a;
  const { app } = ctx;
  try {
    const baseFolder = normalizeFolderPath(ctx.settings.projectFolder, FOLDERS.projects);
    const projectNameInput = preset ? preset.name : await new TextInputModal(app, {
      title: "\u8BF7\u8F93\u5165\u65B0\u5EFA\u9879\u76EE\u7684\u540D\u79F0"
    }).openAndGetValue();
    if (projectNameInput === null || !projectNameInput.trim()) {
      new import_obsidian13.Notice("\u672A\u8F93\u5165\u9879\u76EE\u540D\u79F0\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002");
      return null;
    }
    const projectName = projectNameInput.trim();
    if (/[\\/]/.test(projectName)) {
      new import_obsidian13.Notice("\u9879\u76EE\u540D\u79F0\u4E0D\u80FD\u5305\u542B\u659C\u6760\u6216\u53CD\u659C\u6760\u3002");
      return null;
    }
    let relation;
    if (!preset) {
      const ownership = await new ChoiceModal(app, {
        title: "\u8FD9\u4E2A\u9879\u76EE\u662F\u8C01\u7684\uFF1F",
        items: OWNERSHIP,
        labelOf: (item) => item.label
      }).openAndGetChoice();
      if (!ownership) {
        new import_obsidian13.Notice("\u672A\u9009\u62E9\u9879\u76EE\u5F52\u5C5E\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002");
        return null;
      }
      if (pickPerson2) {
        const isCommission = ownership.field !== null;
        const person = await pickPerson2(ownership.ask, !isCommission);
        if (isCommission && !person) {
          new import_obsidian13.Notice("\u672A\u9009\u62E9\u5BA2\u6237\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002");
          return null;
        }
        if (person) {
          relation = {
            field: (_a = ownership.field) != null ? _a : FIELDS.with,
            target: person.basename
          };
        }
      }
    }
    const descriptionInput = preset ? preset.description : await new TextInputModal(app, {
      title: "\u8BF7\u8F93\u5165\u9879\u76EE\u6982\u8FF0"
    }).openAndGetValue();
    if (descriptionInput === null) {
      new import_obsidian13.Notice("\u5DF2\u53D6\u6D88\u8F93\u5165\u9879\u76EE\u6982\u8FF0\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88\u3002");
      return null;
    }
    const description = descriptionInput.trim();
    const projectFolderPath = (0, import_obsidian13.normalizePath)(`${baseFolder}/${projectName}`);
    const mocFilePath = (0, import_obsidian13.normalizePath)(`${projectFolderPath}/${projectName}.md`);
    await ensureFolderPath(app, baseFolder);
    await ensureFolderPath(app, projectFolderPath);
    const existingMocFile = app.vault.getAbstractFileByPath(mocFilePath);
    if (existingMocFile) {
      new import_obsidian13.Notice(`\u9879\u76EE MOC \u7B14\u8BB0\u5DF2\u7ECF\u5B58\u5728\uFF0C\u672A\u6267\u884C\u8986\u76D6\uFF1A${mocFilePath}`);
      return null;
    }
    const { stamp: created, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);
    const mocMarkdown = mocContent({
      projectName,
      projectFolderPath,
      description,
      created,
      uid,
      relation
    });
    const frontmatter = mocFrontmatter(description, created, uid, relation);
    ctx.guard.mark(mocFilePath);
    const mocFile = await app.vault.create(mocFilePath, mocMarkdown);
    const leaf = app.workspace.getLeaf(false);
    await leaf.openFile(mocFile, {
      active: true,
      state: {
        mode: "source"
      }
    });
    if (leaf.view instanceof import_obsidian13.MarkdownView) {
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
    new import_obsidian13.Notice(`\u9879\u76EE\u5DF2\u521B\u5EFA\uFF1A${projectName}`);
    return mocFile;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian13.Notice(`\u521B\u5EFA\u9879\u76EE\u5931\u8D25\uFF1A${message}`);
    return null;
  }
}
function registerCreateProjectCommand(ctx, pickPerson2) {
  ctx.commands.register(PROJECT_COMMANDS.create, () => {
    void createProject(ctx, void 0, pickPerson2);
  });
}

// src/modules/projects/seed.ts
var FIRST_PROJECT_SUFFIX = "OS_v1";
var MESSAGES4 = {
  namePrompt: "\u4F60\u7684\u540D\u5B57\uFF08\u7528\u4E8E\u521B\u5EFA\u7B2C\u4E00\u4E2A\u9879\u76EE\uFF0CEsc \u8DF3\u8FC7\uFF09",
  namePlaceholder: "\u4F8B\u5982\uFF1A\u5C0F\u660E"
};
function projectsSeed(ctx) {
  return {
    folders: [],
    notes: [
      { path: TEMPLATE_FILES.card, content: cardTemplateFile() },
      { path: TEMPLATE_FILES.moc, content: mocTemplateFile() },
      { path: NAV_FILE, content: navContent() }
    ],
    finish: () => createFirstProject(ctx)
  };
}
async function createFirstProject(ctx) {
  const answer = await new TextInputModal(ctx.app, {
    title: MESSAGES4.namePrompt,
    placeholder: MESSAGES4.namePlaceholder
  }).openAndGetValue();
  const ownerName = (answer != null ? answer : "").trim();
  if (!ownerName) return;
  await createProject(ctx, {
    name: `${ownerName}${FIRST_PROJECT_SUFFIX}`,
    description: firstProjectDescription()
  });
}

// src/modules/projects/transitions.ts
var import_obsidian14 = require("obsidian");
var PROJECT_TYPE = "project";
var CONFIRM_MODAL_CLASS = "qa-project-transition-confirm";
function registerTransitionCommands(ctx) {
  for (const command of TRANSITION_COMMANDS) {
    ctx.commands.register(command, () => {
      void runProjectTransition(ctx, command.action);
    });
  }
}
async function runProjectTransition(ctx, action) {
  try {
    const transition = TRANSITIONS[action];
    if (!transition) {
      new import_obsidian14.Notice(`\u672A\u77E5\u7684\u9879\u76EE\u6D41\u8F6C\u52A8\u4F5C\uFF1A${action}`);
      return;
    }
    const plan = resolveTransitionPlan(ctx, transition);
    if (!plan) return;
    const confirmed = await showProjectTransitionConfirm(ctx.app, plan);
    if (!confirmed) return;
    const basePathChanged = await applyTransition(ctx, plan);
    await reopenMovedMoc(ctx, plan.targetMocPath);
    if (!basePathChanged) {
      new import_obsidian14.Notice(
        "\u9879\u76EE\u6D41\u8F6C\u6210\u529F\uFF0C\u4F46 MOC\uFF08\u9879\u76EE\u5BFC\u822A\u7B14\u8BB0\uFF09\u4E2D\u6CA1\u6709\u627E\u5230\u9700\u8981\u66F4\u65B0\u7684 file.folder\uFF08\u6587\u4EF6\u5939\uFF09\u7B5B\u9009\u6761\u4EF6\u3002"
      );
    }
    new import_obsidian14.Notice(
      `\u9879\u76EE\u5DF2${transition.label}\uFF1A${plan.projectName} \u2192 ${formatStatusForDisplay(transition.status)}`
    );
  } catch (error) {
    new import_obsidian14.Notice(`\u9879\u76EE\u72B6\u6001\u6D41\u8F6C\u5931\u8D25\uFF1A${getErrorMessage(error)}`);
  }
}
function resolveTransitionPlan(ctx, transition) {
  var _a;
  const { app, settings } = ctx;
  const activeFolder = normalizeFolderPath(settings.projectFolder, DEFAULT_SETTINGS.projectFolder);
  const archiveFolder = normalizeFolderPath(settings.archiveFolder, DEFAULT_SETTINGS.archiveFolder);
  if (activeFolder === archiveFolder) {
    new import_obsidian14.Notice("\u9879\u76EE\u76EE\u5F55\u548C\u5F52\u6863\u76EE\u5F55\u4E0D\u80FD\u8BBE\u7F6E\u4E3A\u540C\u4E00\u8DEF\u5F84\u3002");
    return null;
  }
  const sourceRoot = transition.source === "active" ? activeFolder : archiveFolder;
  const targetRoot = transition.target === "active" ? activeFolder : archiveFolder;
  const mocFile = app.workspace.getActiveFile();
  if (!(mocFile instanceof import_obsidian14.TFile) || mocFile.extension !== "md") {
    new import_obsidian14.Notice("\u8BF7\u5148\u6253\u5F00\u9700\u8981\u8FDB\u884C\u72B6\u6001\u6D41\u8F6C\u7684\u9879\u76EE MOC\u3002");
    return null;
  }
  const projectFolder = mocFile.parent;
  if (!(projectFolder instanceof import_obsidian14.TFolder)) {
    new import_obsidian14.Notice("\u65E0\u6CD5\u8BC6\u522B\u5F53\u524D\u9879\u76EE\u6587\u4EF6\u5939\u3002");
    return null;
  }
  const projectName = projectFolder.name;
  const sourceProjectPath = (0, import_obsidian14.normalizePath)(`${sourceRoot}/${projectName}`);
  const expectedMocPath = (0, import_obsidian14.normalizePath)(`${sourceProjectPath}/${projectName}.md`);
  if ((0, import_obsidian14.normalizePath)(mocFile.path) !== expectedMocPath) {
    new import_obsidian14.Notice(`\u5F53\u524D\u547D\u4EE4\u53EA\u80FD\u5728\u4EE5\u4E0B\u9879\u76EE MOC \u4E2D\u6267\u884C\uFF1A${expectedMocPath}`);
    return null;
  }
  const frontmatter = (_a = app.metadataCache.getFileCache(mocFile)) == null ? void 0 : _a.frontmatter;
  const type = normalizeText(frontmatter == null ? void 0 : frontmatter.type);
  const currentStatus = normalizeText(frontmatter == null ? void 0 : frontmatter.status);
  if (type !== PROJECT_TYPE) {
    new import_obsidian14.Notice("\u5F53\u524D\u7B14\u8BB0\u4E0D\u662F\u9879\u76EE MOC\uFF1A\u7F3A\u5C11 type: project\uFF08\u9879\u76EE\uFF09\u3002");
    return null;
  }
  if (!transition.allowedStatuses.includes(currentStatus)) {
    new import_obsidian14.Notice(
      `\u9879\u76EE\u5F53\u524D\u72B6\u6001\u4E3A\u201C${formatStatusForDisplay(currentStatus)}\u201D\uFF0C\u4E0D\u80FD\u6267\u884C\u201C${transition.label}\u201D\u64CD\u4F5C\u3002`
    );
    return null;
  }
  const targetProjectPath = (0, import_obsidian14.normalizePath)(`${targetRoot}/${projectName}`);
  const targetMocPath = (0, import_obsidian14.normalizePath)(`${targetProjectPath}/${projectName}.md`);
  const existingTarget = app.vault.getAbstractFileByPath(targetProjectPath);
  if (existingTarget) {
    new import_obsidian14.Notice(`\u76EE\u6807\u4F4D\u7F6E\u5DF2\u7ECF\u5B58\u5728\u540C\u540D\u9879\u76EE\uFF0C\u64CD\u4F5C\u5DF2\u505C\u6B62\uFF1A${targetProjectPath}`);
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
    basePathChanged: false,
    previousArchived: void 0
  };
  try {
    markFolderTree(ctx, plan.projectFolder, plan.targetProjectPath);
    await app.fileManager.renameFile(plan.projectFolder, plan.targetProjectPath);
    progress.moved = true;
    const movedMoc = app.vault.getAbstractFileByPath(plan.targetMocPath);
    if (!(movedMoc instanceof import_obsidian14.TFile)) {
      throw new Error(`\u79FB\u52A8\u540E\u6CA1\u6709\u627E\u5230\u9879\u76EE MOC\uFF1A${plan.targetMocPath}`);
    }
    guard.mark(movedMoc.path);
    await app.fileManager.processFrontMatter(movedMoc, (movedFrontmatter) => {
      if (normalizeText(movedFrontmatter.type) !== PROJECT_TYPE) {
        throw new Error("\u79FB\u52A8\u540E\u7684 MOC \u7F3A\u5C11 type: project\uFF08\u9879\u76EE\uFF09\u3002");
      }
      movedFrontmatter.status = plan.transition.status;
      progress.previousArchived = movedFrontmatter[FIELDS.archived];
      if (plan.transition.target === "archive") {
        movedFrontmatter[FIELDS.archived] = today();
      } else {
        delete movedFrontmatter[FIELDS.archived];
      }
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
  import_obsidian14.Vault.recurseChildren(folder, (child) => {
    if (!(child instanceof import_obsidian14.TFile)) return;
    const relativePath = child.path.slice(sourcePath.length + 1);
    guard.mark(child.path);
    guard.mark((0, import_obsidian14.normalizePath)(`${targetPath}/${relativePath}`));
  });
}
async function reopenMovedMoc(ctx, targetMocPath) {
  const movedMoc = ctx.app.vault.getAbstractFileByPath(targetMocPath);
  if (!(movedMoc instanceof import_obsidian14.TFile)) return;
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
    if (!(currentFolder instanceof import_obsidian14.TFolder)) {
      throw new Error(`\u56DE\u6EDA\u65F6\u6CA1\u6709\u627E\u5230\u9879\u76EE\u76EE\u5F55\uFF1A${plan.targetProjectPath}`);
    }
    if (app.vault.getAbstractFileByPath(plan.sourceProjectPath)) {
      throw new Error(`\u539F\u4F4D\u7F6E\u5DF2\u7ECF\u88AB\u5360\u7528\uFF1A${plan.sourceProjectPath}`);
    }
    markFolderTree(ctx, currentFolder, plan.sourceProjectPath);
    await app.fileManager.renameFile(currentFolder, plan.sourceProjectPath);
    const restoredMoc = app.vault.getAbstractFileByPath(plan.expectedMocPath);
    if (!(restoredMoc instanceof import_obsidian14.TFile)) {
      throw new Error(`\u56DE\u6EDA\u540E\u6CA1\u6709\u627E\u5230\u9879\u76EE MOC\uFF1A${plan.expectedMocPath}`);
    }
    if (progress.statusChanged) {
      guard.mark(restoredMoc.path);
      await app.fileManager.processFrontMatter(restoredMoc, (frontmatter) => {
        frontmatter.status = plan.currentStatus;
        if (progress.previousArchived === void 0) delete frontmatter[FIELDS.archived];
        else frontmatter[FIELDS.archived] = progress.previousArchived;
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
var ProjectTransitionConfirmModal = class extends import_obsidian14.Modal {
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
    new import_obsidian14.ButtonComponent(buttonBar).setButtonText("\u53D6\u6D88").onClick(() => this.settle(false));
    const confirmButton = new import_obsidian14.ButtonComponent(buttonBar).setButtonText(`\u786E\u8BA4${transition.label}`).setCta().onClick(() => this.settle(true));
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
var import_obsidian15 = require("obsidian");
var UPDATED_DEBOUNCE_MS = 2e3;
var SYSTEM_PREFIX = `${FOLDERS.system}/`;
function registerUpdatedMaintainer(ctx) {
  const pendingTimeouts = /* @__PURE__ */ new Map();
  const applyUpdated = async (path) => {
    var _a;
    if (!ctx.settings.autoUpdated) return;
    if (path.startsWith(SYSTEM_PREFIX)) return;
    const file = ctx.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian15.TFile)) return;
    if (!((_a = ctx.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter)) return;
    ctx.guard.mark(path);
    await ctx.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.updated = nowStamp(ctx.settings.dateTimeFormat);
    });
  };
  const scheduleUpdate = (path) => {
    const pending2 = pendingTimeouts.get(path);
    if (pending2 !== void 0) window.clearTimeout(pending2);
    const timeoutId = window.setTimeout(() => {
      pendingTimeouts.delete(path);
      void applyUpdated(path).catch(() => {
      });
    }, UPDATED_DEBOUNCE_MS);
    pendingTimeouts.set(path, timeoutId);
  };
  const cancelUpdate = (path) => {
    const pending2 = pendingTimeouts.get(path);
    if (pending2 === void 0) return;
    window.clearTimeout(pending2);
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
        if (!(file instanceof import_obsidian15.TFile) || file.extension !== "md") return;
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

// src/modules/review/periodic.ts
var import_obsidian16 = require("obsidian");
function periodFolderOf(ctx, period) {
  const root = normalizeFolderPath(ctx.settings.diaryFolder, FOLDERS.diary);
  const leaf = period.folder.slice(FOLDERS.diary.length + 1);
  return `${root}/${leaf}`;
}
function diaryFolders(ctx) {
  const root = normalizeFolderPath(ctx.settings.diaryFolder, FOLDERS.diary);
  return [root, ...Object.values(PERIODS).map((period) => periodFolderOf(ctx, period))];
}
function periodOfFile(app, file) {
  var _a, _b, _c;
  const declaredType = String(
    (_c = (_b = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b[FIELDS.type]) != null ? _c : ""
  ).trim();
  for (const period of Object.values(PERIODS)) {
    if (period.type === declaredType) return period;
  }
  for (const period of Object.values(PERIODS)) {
    if (periodStartOf(period, file.basename) !== null) return period;
  }
  return null;
}
function periodStartOfNote(app, file, period) {
  var _a, _b;
  const declared = dayText((_b = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b[FIELDS.periodStart]);
  return declared != null ? declared : periodStartOf(period, file.basename);
}
var SCOPE_ALIASES = {
  \u5468: "weekly",
  \u6708: "monthly",
  \u5B63: "quarterly",
  \u5E74: "yearly"
};
function resolveScope(app, host, params) {
  var _a, _b;
  const aliasKey = SCOPE_ALIASES[(_a = params["\u8303\u56F4"]) != null ? _a : ""];
  const period = (_b = host ? periodOfFile(app, host) : null) != null ? _b : aliasKey ? PERIODS[aliasKey] : null;
  if (!period || !host) return null;
  const start = periodStartOfNote(app, host, period);
  if (!start) return null;
  return { period, start, end: shiftDay(start, 1, period.stepUnit) };
}
async function openPeriodNote(ctx, period, options) {
  try {
    const title = currentPeriodTitle(period);
    const folder = periodFolderOf(ctx, period);
    const path = `${folder}/${title}.md`;
    const existing = ctx.app.vault.getAbstractFileByPath(path);
    if (existing && !(existing instanceof import_obsidian16.TFile)) {
      new import_obsidian16.Notice(`\u540C\u540D\u7684\u4E0D\u662F\u7B14\u8BB0\u800C\u662F\u6587\u4EF6\u5939\uFF1A${path}`);
      return null;
    }
    const content = periodNoteContent(period, title, ctx.settings.dateTimeFormat);
    let file = existing;
    if (!file) {
      await ensureFolderPath(ctx.app, folder);
      ctx.guard.mark(path);
      file = await ctx.app.vault.create(path, content);
    } else if (file.stat.size === 0) {
      ctx.guard.mark(path);
      await ctx.app.vault.process(file, () => content);
    }
    if ((options == null ? void 0 : options.reveal) !== false) await ctx.app.workspace.getLeaf(false).openFile(file);
    return file;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian16.Notice(`\u6253\u5F00${period.label}\u5931\u8D25\uFF1A${message}`);
    return null;
  }
}
function registerPeriodicCommands(ctx) {
  for (const period of Object.values(PERIODS)) {
    ctx.commands.register(PERIOD_COMMANDS[period.key], () => {
      void openPeriodNote(ctx, period);
    });
  }
}

// src/modules/review/projectViews.ts
var MAX_ROWS2 = 10;
var PERIOD_NAMES = {
  daily: "\u4ECA\u5929",
  weekly: "\u672C\u5468",
  monthly: "\u672C\u6708",
  quarterly: "\u672C\u5B63",
  yearly: "\u672C\u5E74"
};
var CLOSED_TITLES = [
  { status: "done", title: "\u2705 \u672C\u5E74\u5B8C\u6210" },
  { status: "dropped", title: "\u274C \u672C\u5E74\u653E\u5F03" },
  { status: "paused", title: "\u23F8 \u672C\u5E74\u6682\u505C" }
];
var projectActivity = {
  name: "\u9879\u76EE\u52A8\u6001",
  render: async (view) => {
    var _a, _b, _c, _d, _e, _f;
    const scope = resolveScope(view.ctx.app, view.host, view.params);
    if (!scope) {
      renderEmpty(view.el, "\u8FD9\u7BC7\u7B14\u8BB0\u7B97\u4E0D\u51FA\u5468\u671F\u5750\u6807\u3002\u7528\u300C\u6253\u5F00\u672C\u5468\u590D\u76D8\u300D\u5EFA\u7684\u7B14\u8BB0\uFF0C\u672C\u533A\u5757\u81EA\u52A8\u751F\u6548\u3002");
      return;
    }
    const periodName = (_a = PERIOD_NAMES[scope.period.key]) != null ? _a : "\u672C\u5468\u671F";
    const root = normalizeFolderPath(view.ctx.settings.projectFolder, FOLDERS.projects);
    const entries = /* @__PURE__ */ new Map();
    const within = (day) => !!day && day >= scope.start && day < scope.end;
    for (const file of view.index.allNotes()) {
      const folder = (_c = (_b = file.parent) == null ? void 0 : _b.path) != null ? _c : "";
      if (!isInFolder(folder, root) || folder === root) continue;
      const name = folder.slice(root.length + 1).split("/")[0];
      const entry = (_d = entries.get(name)) != null ? _d : {
        name,
        moc: null,
        status: "",
        born: 0,
        touched: 0,
        last: ""
      };
      if (toText(view.index.fieldOf(file, FIELDS.type)) === NOTE_TYPES.project) {
        entry.moc = file;
        entry.status = toText(view.index.fieldOf(file, FIELDS.status));
      }
      const created = (_e = dayText(view.index.fieldOf(file, FIELDS.created))) != null ? _e : dayOfMillis(file.stat.ctime);
      const updated = (_f = dayText(view.index.fieldOf(file, FIELDS.updated))) != null ? _f : dayOfMillis(file.stat.mtime);
      if (within(created)) {
        entry.born += 1;
        if (created > entry.last) entry.last = created;
      } else if (within(updated)) {
        entry.touched += 1;
        if (updated > entry.last) entry.last = updated;
      }
      entries.set(name, entry);
    }
    const moving = [...entries.values()].filter((entry) => entry.born + entry.touched > 0);
    const orphans = moving.filter((entry) => !entry.moc);
    const counted = moving.filter((entry) => entry.moc).sort((left, right) => right.born + right.touched - (left.born + left.touched));
    if (!counted.length) {
      renderEmpty(view.el, `${periodName}\u6CA1\u6709\u9879\u76EE\u4EA7\u751F\u65B0\u589E\u6216\u6539\u52A8\u3002`);
      warnOrphans(view, orphans);
      return;
    }
    const totalBorn = counted.reduce((sum2, entry) => sum2 + entry.born, 0);
    const totalTouched = counted.reduce((sum2, entry) => sum2 + entry.touched, 0);
    renderSummary(
      view.el,
      `${periodName} **${counted.length}** \u4E2A\u9879\u76EE\u5728\u52A8\uFF0C\u5171\u65B0\u589E **${totalBorn}** \u7BC7\u3001\u6539\u52A8 **${totalTouched}** \u7BC7\u3002`
    );
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u9879\u76EE", "\u72B6\u6001", "\u65B0\u589E", "\u6539\u52A8", "\u6700\u8FD1"],
      counted.slice(0, MAX_ROWS2).map((entry) => [
        entry.moc ? noteLink(entry.moc, entry.name) : entry.name,
        entry.status || "\u2014",
        entry.born,
        entry.touched,
        entry.last || "\u2014"
      ])
    );
    if (counted.length > MAX_ROWS2) {
      renderNote(view.el, `\u2026\u53E6\u6709 ${counted.length - MAX_ROWS2} \u4E2A\u9879\u76EE${periodName}\u4E5F\u6709\u52A8\u9759`);
    }
    warnOrphans(view, orphans);
  }
};
function warnOrphans(view, orphans) {
  if (!orphans.length) return;
  renderNote(
    view.el,
    `\u26A0\uFE0F \u53E6\u6709 ${orphans.length} \u4E2A\u6587\u4EF6\u5939\u6709\u6539\u52A8\u4F46\u7F3A\u5C11\u540C\u540D\u7684 type: project \u7B14\u8BB0\uFF0C\u672A\u8BA1\u5165\uFF1A${orphans.map((entry) => entry.name).join("\u3001")}`
  );
}
var finishedProjects = {
  name: "\u5B8C\u6210\u7684\u9879\u76EE",
  render: async (view) => {
    var _a;
    const scope = resolveScope(view.ctx.app, view.host, view.params);
    if (!scope) {
      renderEmpty(view.el, "\u8FD9\u7BC7\u7B14\u8BB0\u7B97\u4E0D\u51FA\u5468\u671F\u5750\u6807\u3002\u7528\u300C\u6253\u5F00\u672C\u6708\u590D\u76D8\u300D\u5EFA\u7684\u7B14\u8BB0\uFF0C\u672C\u533A\u5757\u81EA\u52A8\u751F\u6548\u3002");
      return;
    }
    const periodName = (_a = PERIOD_NAMES[scope.period.key]) != null ? _a : "\u672C\u5468\u671F";
    const finished = collectProjects(view).filter((project) => project.status === "done").filter((project) => !!project.closed && project.closed >= scope.start && project.closed < scope.end).sort((left, right) => String(left.closed).localeCompare(String(right.closed)));
    if (!finished.length) {
      renderEmpty(
        view.el,
        `${periodName}\u6CA1\u6709\u9879\u76EE\u5B8C\u6210\u5F52\u6863\u3002\uFF08\u53E3\u5F84\uFF1Astatus \u4E3A done\uFF0C\u4E14\u5F52\u6863\u65E5\u843D\u5728${periodName}\uFF09`
      );
      return;
    }
    const spans = finished.map((project) => daysBetween(project.born, project.closed)).filter((days) => days !== null);
    const average = spans.length ? `\uFF0C\u5E73\u5747\u5386\u65F6 **${Math.round(spans.reduce((sum2, days) => sum2 + days, 0) / spans.length)}** \u5929` : "";
    renderSummary(view.el, `${periodName}\u5B8C\u6210 **${finished.length}** \u4E2A\u9879\u76EE${average}\uFF1A`);
    renderTable(
      view.ctx.app,
      view.el,
      view.sourcePath,
      ["\u9879\u76EE", "\u5F00\u59CB", "\u5B8C\u6210", "\u5386\u65F6"],
      finished.map((project) => durationRow(project, project.closed))
    );
  }
};
var yearlyOverview = {
  name: "\u5E74\u5EA6\u5168\u666F",
  render: async (view) => {
    var _a, _b;
    const scope = resolveScope(view.ctx.app, view.host, view.params);
    if (!scope) {
      renderEmpty(view.el, "\u8FD9\u7BC7\u7B14\u8BB0\u7B97\u4E0D\u51FA\u5468\u671F\u5750\u6807\u3002\u7528\u300C\u6253\u5F00\u672C\u5E74\u590D\u76D8\u300D\u5EFA\u7684\u7B14\u8BB0\uFF0C\u672C\u533A\u5757\u81EA\u52A8\u751F\u6548\u3002");
      return;
    }
    const within = (day) => !!day && day >= scope.start && day < scope.end;
    const monthIndex = (day) => Number(day.slice(5, 7)) - 1;
    const year = scope.start.slice(0, 4);
    const born = [];
    const buckets = /* @__PURE__ */ new Map();
    const monthlyBorn = new Array(12).fill(0);
    const monthlyDone = new Array(12).fill(0);
    for (const project of collectProjects(view)) {
      if (within(project.born)) {
        born.push(project);
        monthlyBorn[monthIndex(project.born)] += 1;
      }
      if (project.status !== "active" && within(project.closed)) {
        const bucket = buckets.get(project.status);
        if (bucket) bucket.push(project);
        else buckets.set(project.status, [project]);
        if (project.status === "done") monthlyDone[monthIndex(project.closed)] += 1;
      }
      if (project.status === "active" && (!project.born || project.born < scope.end)) {
        const bucket = buckets.get("active");
        if (bucket) bucket.push(project);
        else buckets.set("active", [project]);
      }
    }
    const countOf = (status) => {
      var _a2, _b2;
      return (_b2 = (_a2 = buckets.get(status)) == null ? void 0 : _a2.length) != null ? _b2 : 0;
    };
    renderSummary(
      view.el,
      `**${year} \u5E74**\uFF1A\u65B0\u5F00 **${born.length}** \u4E2A \xB7 \u5B8C\u6210 **${countOf("done")}** \u4E2A \xB7 \u653E\u5F03 **${countOf("dropped")}** \u4E2A \xB7 \u6682\u505C **${countOf("paused")}** \u4E2A \xB7 \u4ECD\u5728\u8FDB\u884C **${countOf("active")}** \u4E2A`
    );
    renderMonthlyBars(view, monthlyBorn, monthlyDone);
    for (const { status, title } of CLOSED_TITLES) {
      renderClosedGroup(view, title, (_a = buckets.get(status)) != null ? _a : []);
    }
    renderActiveGroup(view, (_b = buckets.get("active")) != null ? _b : [], scope.end, year);
    if (!born.length && !buckets.size) {
      renderEmpty(view.el, "\u672C\u5E74\u6CA1\u6709\u4EFB\u4F55\u9879\u76EE\u8BB0\u5F55\u3002");
    }
  }
};
function renderMonthlyBars(view, monthlyBorn, monthlyDone) {
  const peak = Math.max(...monthlyBorn, ...monthlyDone, 1);
  const chart = view.el.createDiv();
  chart.style.cssText = "display:flex;align-items:flex-end;gap:4px;height:150px;margin:14px 0 6px;padding-bottom:24px;border-bottom:1px solid var(--background-modifier-border)";
  for (let month = 0; month < 12; month += 1) {
    const column = chart.createDiv();
    column.style.cssText = "flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;position:relative";
    const pair = column.createDiv();
    pair.style.cssText = "display:flex;align-items:flex-end;gap:2px;height:100%;width:100%;justify-content:center";
    addBar(pair, monthlyBorn[month], peak, "var(--text-accent)", `${month + 1} \u6708\u65B0\u5F00`);
    addBar(pair, monthlyDone[month], peak, "var(--color-green, #16a34a)", `${month + 1} \u6708\u5B8C\u6210`);
    const label = column.createDiv();
    label.style.cssText = "position:absolute;bottom:-21px;font-size:11px;color:var(--text-muted)";
    label.setText(String(month + 1));
  }
  renderNote(view.el, `\u5DE6\u67F1\uFF1D\u65B0\u5F00\u3000\u53F3\u67F1\uFF1D\u5B8C\u6210\u3000\u7EB5\u8F74\u5CF0\u503C ${peak}\u3000\u6A2A\u8F74\u4E3A\u6708\u4EFD`);
}
function addBar(parent, count, peak, color, label) {
  const bar = parent.createDiv();
  bar.style.cssText = `width:42%;height:${Math.round(count / peak * 100)}%;min-height:${count > 0 ? 3 : 0}px;background:${color};border-radius:2px 2px 0 0`;
  if (count > 0) bar.setAttribute("aria-label", `${label}\uFF1A${count}`);
}
function renderClosedGroup(view, title, list) {
  if (!list.length) return;
  const sorted = [...list].sort(
    (left, right) => String(left.closed).localeCompare(String(right.closed))
  );
  renderHeading(view.el, 4, `${title}\uFF08${list.length}\uFF09`);
  renderTable(
    view.ctx.app,
    view.el,
    view.sourcePath,
    ["\u9879\u76EE", "\u5F00\u59CB", "\u5F52\u6863", "\u5386\u65F6"],
    sorted.map((project) => durationRow(project, project.closed))
  );
}
function renderActiveGroup(view, list, end, year) {
  if (!list.length) return;
  const isPastYear = end <= today();
  const cutoff = isPastYear ? today() : end;
  const sorted = [...list].sort(
    (left, right) => String(left.born).localeCompare(String(right.born))
  );
  renderHeading(view.el, 4, `\u{1F525} ${isPastYear ? "\u622A\u81F3\u4ECA\u65E5" : "\u5E74\u672B"}\u4ECD\u5728\u8FDB\u884C\uFF08${list.length}\uFF09`);
  if (isPastYear) {
    renderNote(
      view.el,
      `\u9879\u76EE\u72B6\u6001\u53EA\u6709\u5F53\u524D\u503C\uFF0C\u65E0\u6CD5\u56DE\u6EAF\u5230 ${year} \u5E74\u672B\uFF0C\u6B64\u5904\u663E\u793A\u7684\u662F\u6B64\u523B\u4ECD\u5728\u8FDB\u884C\u7684\u9879\u76EE\u3002`
    );
  }
  renderTable(
    view.ctx.app,
    view.el,
    view.sourcePath,
    ["\u9879\u76EE", "\u5F00\u59CB", "\u6700\u8FD1\u6539\u52A8", "\u5DF2\u8FDB\u884C"],
    sorted.map((project) => {
      var _a, _b;
      return [
        noteLink(project.file),
        (_a = project.born) != null ? _a : "\u2014",
        (_b = project.closed) != null ? _b : "\u2014",
        formatDays2(daysBetween(project.born, cutoff))
      ];
    })
  );
}
function collectProjects(view) {
  var _a, _b, _c;
  const projectRoot = normalizeFolderPath(view.ctx.settings.projectFolder, FOLDERS.projects);
  const archiveRoot = normalizeFolderPath(view.ctx.settings.archiveFolder, FOLDERS.archives);
  const collected = [];
  for (const file of view.index.notesOfType(NOTE_TYPES.project)) {
    if (!isInFolder(file.path, projectRoot) && !isInFolder(file.path, archiveRoot)) continue;
    collected.push({
      file,
      born: (_a = dayText(view.index.fieldOf(file, FIELDS.created))) != null ? _a : dayOfMillis(file.stat.ctime),
      // 归档日优先取状态流转命令写入的 archived；回落 updated 只为兼容 V2 之前建的项目
      closed: (_c = (_b = dayText(view.index.fieldOf(file, FIELDS.archived))) != null ? _b : dayText(view.index.fieldOf(file, FIELDS.updated))) != null ? _c : dayOfMillis(file.stat.mtime),
      status: toText(view.index.fieldOf(file, FIELDS.status)).toLowerCase()
    });
  }
  return collected;
}
function durationRow(project, endDay) {
  var _a;
  return [
    noteLink(project.file),
    (_a = project.born) != null ? _a : "\u2014",
    endDay != null ? endDay : "\u2014",
    formatDays2(daysBetween(project.born, endDay))
  ];
}
function formatDays2(days) {
  return days === null ? "\u2014" : `${days} \u5929`;
}
var reviewProjectViews = [
  projectActivity,
  finishedProjects,
  yearlyOverview
];

// src/modules/review/seed.ts
function reviewSeed(ctx) {
  return {
    folders: diaryFolders(ctx),
    notes: []
  };
}

// src/modules/review/theme.ts
var import_obsidian17 = require("obsidian");
var MESSAGES5 = {
  unchanged: "\u4E3B\u9898\u6CA1\u6709\u53D8\u5316\uFF08\u7559\u7A7A\u4E0D\u4F1A\u6E05\u6389\u5DF2\u7ECF\u5199\u597D\u7684\u4E3B\u9898\uFF09",
  donePrefix: "\u5DF2\u5199\u5165",
  failedPrefix: "\u5199\u4E3B\u9898\u5931\u8D25\uFF1A"
};
function registerThemeCommand(ctx) {
  ctx.commands.register(THEME_COMMAND, () => {
    void writeTheme(ctx);
  });
}
async function writeTheme(ctx) {
  var _a, _b, _c;
  try {
    const target = await resolveTarget(ctx);
    if (!target) return;
    const { file, period } = target;
    const current = String(
      (_c = (_b = (_a = ctx.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) == null ? void 0 : _b[FIELDS.theme]) != null ? _c : ""
    ).trim();
    const answer = await new TextInputModal(ctx.app, {
      title: promptOf(period),
      placeholder: "\u4E00\u53E5\u8BDD\uFF0C\u5199\u7ED3\u8BBA\u4E0D\u5199\u8FC7\u7A0B",
      initial: current
    }).openAndGetValue();
    if (answer === null) return;
    const theme = answer.trim();
    if (!theme) {
      new import_obsidian17.Notice(MESSAGES5.unchanged);
      return;
    }
    ctx.guard.mark(file.path);
    await ctx.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter[FIELDS.theme] = theme;
    });
    new import_obsidian17.Notice(`${MESSAGES5.donePrefix}${period.label}\u4E3B\u9898\uFF1A${theme}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian17.Notice(MESSAGES5.failedPrefix + message);
  }
}
async function resolveTarget(ctx) {
  const active = ctx.app.workspace.getActiveFile();
  if (active) {
    const period = periodOfFile(ctx.app, active);
    if (period) return { file: active, period };
  }
  const diary = await openPeriodNote(ctx, PERIODS.daily);
  return diary ? { file: diary, period: PERIODS.daily } : null;
}
function promptOf(period) {
  switch (period.key) {
    case "daily":
      return "\u4ECA\u5929\u4E3B\u8981\u505A\u4E86\u4EC0\u4E48\uFF1F\uFF08\u5468\u590D\u76D8\u770B\u7684\u5C31\u662F\u5B83\uFF09";
    case "weekly":
      return "\u672C\u5468\u4E3B\u9898\uFF1A\u8FD9\u5468\u4E3B\u8981\u63A8\u8FDB\u4E86\u54EA\u9879\u4EBA\u751F\u7BA1\u7406\u76EE\u6807\uFF1F";
    case "monthly":
      return "\u672C\u6708\u4E3B\u9898\uFF1A\u8FD9\u4E2A\u6708\u4E3B\u7EBF\u63A8\u8FDB\u5230\u54EA\u4E00\u6B65\u4E86\uFF1F";
    case "quarterly":
      return "\u5B63\u5EA6\u4E3B\u9898\uFF1A\u8FD9\u4E09\u4E2A\u6708\uFF0C\u4E3B\u7EBF\u4EFB\u52A1\u63A8\u8FDB\u4E86\u591A\u5C11\uFF1F";
    default:
      return "\u5E74\u5EA6\u4E3B\u9898\uFF1A\u7528\u4E00\u53E5\u8BDD\u6982\u62EC\u8FD9\u4E00\u5E74\u7684\u4E3B\u7EBF";
  }
}

// src/modules/review/views.ts
var MAX_ROWS3 = 12;
var CHILD_OF = {
  daily: null,
  weekly: "daily",
  monthly: "weekly",
  quarterly: "monthly",
  yearly: "monthly"
};
var MONTH_SPAN = { quarterly: 3, yearly: 12 };
var WEEKDAY_NAMES = ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u65E5"];
var dailyOutput = {
  name: "\u4ECA\u65E5\u4EA7\u51FA",
  render: async (view) => {
    const day = view.host ? dayOfTitle(view.host.basename) : null;
    if (!day) {
      renderEmpty(view.el, "\u8FD9\u7BC7\u7B14\u8BB0\u7684\u6587\u4EF6\u540D\u4E0D\u662F YYYY-MM-DD\uFF0C\u62FF\u4E0D\u5230\u65E5\u671F\u3002\u7528\u300C\u6253\u5F00\u4ECA\u5929\u7684\u65E5\u8BB0\u300D\u5EFA\u7684\u7B14\u8BB0\uFF0C\u672C\u533A\u5757\u81EA\u52A8\u751F\u6548\u3002");
      return;
    }
    const folders = contentFolders(view);
    const created = [];
    const changed = [];
    for (const file of view.index.allNotes()) {
      if (!folders.some((folder) => isInFolder(file.path, folder))) continue;
      if (dayOf(view, file, FIELDS.created, file.stat.ctime) === day) {
        created.push(file);
        continue;
      }
      if (dayOf(view, file, FIELDS.updated, file.stat.mtime) === day) changed.push(file);
    }
    if (!created.length && !changed.length) {
      renderEmpty(view.el, "\u4ECA\u5929\u8FD8\u6CA1\u6709\u7B14\u8BB0\u4EA7\u51FA\u3002\u5728\u9879\u76EE\u76EE\u5F55\u91CC\u5199\u70B9\u4EC0\u4E48\uFF0C\u8FD9\u91CC\u4F1A\u81EA\u52A8\u957F\u51FA\u6765\u3002");
      return;
    }
    renderSummary(view.el, `\u65B0\u5EFA **${created.length}** \u7BC7 \xB7 \u6539\u52A8 **${changed.length}** \u7BC7`);
    const rows = [];
    collectRows(rows, "\u{1F195}", created, view);
    collectRows(rows, "\u270F\uFE0F", changed, view);
    renderTable(view.ctx.app, view.el, view.sourcePath, ["", "\u7B14\u8BB0", "\u6240\u5C5E"], rows, 1);
  }
};
function collectRows(rows, mark, files, view) {
  for (const file of files.slice(0, MAX_ROWS3)) {
    rows.push([mark, noteLink(file), originOf(view, file)]);
  }
  if (files.length > MAX_ROWS3) rows.push([mark, `\u2026\u53E6\u6709 ${files.length - MAX_ROWS3} \u7BC7`, ""]);
}
function originOf(view, file) {
  var _a, _b;
  const projects = normalizeFolderPath(view.ctx.settings.projectFolder, FOLDERS.projects);
  const archives = normalizeFolderPath(view.ctx.settings.archiveFolder, FOLDERS.archives);
  const folder = (_b = (_a = file.parent) == null ? void 0 : _a.path) != null ? _b : "";
  if (isInFolder(folder, projects) && folder !== projects) {
    return folder.slice(projects.length + 1).split("/")[0];
  }
  if (isInFolder(folder, archives) && folder !== archives) {
    return `\u{1F4E6} ${folder.slice(archives.length + 1).split("/")[0]}`;
  }
  return folder.split("/")[0] || "\u6839\u76EE\u5F55";
}
function contentFolders(view) {
  return [
    FOLDERS.inbox,
    normalizeFolderPath(view.ctx.settings.projectFolder, FOLDERS.projects),
    normalizeFolderPath(view.ctx.settings.areaFolder, FOLDERS.areas),
    normalizeFolderPath(view.ctx.settings.archiveFolder, FOLDERS.archives)
  ];
}
function dayOf(view, file, field, fallbackMillis) {
  var _a;
  return (_a = dayText(view.index.fieldOf(file, field))) != null ? _a : dayOfMillis(fallbackMillis);
}
var themeChain = {
  name: "\u4E3B\u9898\u94FE",
  render: async (view) => {
    const scope = resolveScope(view.ctx.app, view.host, view.params);
    if (!scope) {
      renderEmpty(view.el, "\u8FD9\u7BC7\u7B14\u8BB0\u7B97\u4E0D\u51FA\u5468\u671F\u5750\u6807\uFF1A\u5B83\u4E0D\u662F\u590D\u76D8\u7B14\u8BB0\uFF0C\u6587\u4EF6\u540D\u4E5F\u4E0D\u662F\u672C\u7EA7\u683C\u5F0F\u3002\u7528\u300C\u6253\u5F00\u672C\u5468\u590D\u76D8\u300D\u5EFA\u7684\u7B14\u8BB0\uFF0C\u672C\u533A\u5757\u81EA\u52A8\u751F\u6548\u3002");
      return;
    }
    const childKey = CHILD_OF[scope.period.key];
    if (!childKey) {
      renderEmpty(view.el, "\u65E5\u8BB0\u4E0B\u9762\u6CA1\u6709\u66F4\u5C0F\u7684\u5468\u671F\u4E86\uFF0C\u4E3B\u9898\u94FE\u653E\u5728\u5468\u8BB0\u53CA\u4EE5\u4E0A\u624D\u6709\u5185\u5BB9\u3002");
      return;
    }
    const child = PERIODS[childKey];
    if (childKey === "daily") renderDays(view, child, scope.start);
    else if (childKey === "weekly") renderWeeks(view, child, scope);
    else renderMonths(view, child, scope);
  }
};
function renderDays(view, child, start) {
  const byTitle = notesByTitle(view, child);
  const rows = [];
  let filled = 0;
  for (let offset = 0; offset < 7; offset += 1) {
    const day = shiftDay(start, offset, "day");
    const note = byTitle.get(day);
    if (note) filled += 1;
    rows.push([
      note ? noteLink(note) : day.slice(5),
      `\u5468${WEEKDAY_NAMES[offset]}`,
      themeCell(view, note, "\uFF08\u65E0\u65E5\u8BB0\uFF09")
    ]);
  }
  renderTable(view.ctx.app, view.el, view.sourcePath, ["\u65E5\u671F", "\u661F\u671F", "\u5F53\u65E5\u4E3B\u9898"], rows, 2);
  renderNote(view.el, `\u672C\u5468 **${filled}/7** \u5929\u6709\u65E5\u8BB0\u3002`);
}
function renderWeeks(view, child, scope) {
  const weeks = [];
  for (const note of view.index.notesOfType(child.type)) {
    const weekStart = periodStartOfNote(view.ctx.app, note, child);
    if (!weekStart) continue;
    const thursday = shiftDay(weekStart, 3, "day");
    if (thursday < scope.start || thursday >= scope.end) continue;
    weeks.push({ start: weekStart, note });
  }
  if (!weeks.length) {
    renderEmpty(view.el, "\u672C\u6708\u8FD8\u6CA1\u6709\u5468\u8BB0\u3002\u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u6253\u5F00\u672C\u5468\u590D\u76D8\u300D\u5199\u7B2C\u4E00\u7BC7\u3002");
    return;
  }
  weeks.sort((left, right) => left.start.localeCompare(right.start));
  renderTable(
    view.ctx.app,
    view.el,
    view.sourcePath,
    ["\u5468", "\u672C\u5468\u4E3B\u9898"],
    weeks.map((week) => [noteLink(week.note), themeCell(view, week.note, "")]),
    1
  );
}
function renderMonths(view, child, scope) {
  var _a, _b;
  const span = (_a = MONTH_SPAN[scope.period.key]) != null ? _a : 12;
  const byTitle = notesByTitle(view, child);
  const rows = [];
  let filled = 0;
  for (let offset = 0; offset < span; offset += 1) {
    const monthStart = shiftDay(scope.start, offset, "month");
    const title = (_b = titleOfDay(monthStart, child)) != null ? _b : monthStart;
    const note = byTitle.get(title);
    if (note) filled += 1;
    rows.push([note ? noteLink(note) : title, themeCell(view, note, "\uFF08\u65E0\u6708\u8BB0\uFF09")]);
  }
  renderTable(view.ctx.app, view.el, view.sourcePath, ["\u6708\u4EFD", "\u672C\u6708\u4E3B\u9898"], rows, 1);
  renderNote(
    view.el,
    `\u672C${scope.period.key === "quarterly" ? "\u5B63" : "\u5E74"} **${filled}/${span}** \u4E2A\u6708\u6709\u6708\u8BB0\u3002`
  );
}
function notesByTitle(view, period) {
  const map = /* @__PURE__ */ new Map();
  for (const note of view.index.notesOfType(period.type)) {
    map.set(note.basename, note);
  }
  return map;
}
function themeCell(view, note, missing) {
  if (!note) return missing;
  return toText(view.index.fieldOf(note, FIELDS.theme)) || "\uFF08\u672A\u5199\u4E3B\u9898\uFF09";
}
var reviewThemeViews = [dailyOutput, themeChain];

// src/modules/ribbon/dock.ts
var import_obsidian19 = require("obsidian");

// src/modules/ribbon/icons.ts
var import_obsidian18 = require("obsidian");
var GRID = 24;
var BOX = 100;
var STROKE = "var(--icon-stroke, 2)";
var CIRCLE = "M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z";
var CALENDAR = "M8 2V4.12777M8 6V4.12777M16 2V4.12777M16 6V4.12777M20.9597 10C21 10.7878 21 11.7554 21 13C21 15.7956 21 17.1935 20.5433 18.2961C19.9343 19.7663 18.7663 20.9343 17.2961 21.5433C16.1935 22 14.7956 22 12 22C9.20435 22 7.80653 22 6.7039 21.5433C5.23373 20.9343 4.06569 19.7663 3.45672 18.2961C3 17.1935 3 15.7956 3 13C3 11.7554 3 10.7878 3.0403 10M20.9597 10C20.9095 9.01824 20.7967 8.31564 20.5433 7.7039C19.9343 6.23373 18.7663 5.06569 17.2961 4.45672C16.9146 4.29871 16.4978 4.19536 16 4.12777M20.9597 10L3.0403 10M3.0403 10C3.09052 9.01824 3.20333 8.31564 3.45672 7.7039C4.06569 6.23373 5.23373 5.06569 6.7039 4.45672C7.08538 4.29871 7.50219 4.19536 8 4.12777M8 4.12777C8.94106 4 10.1716 4 12 4C13.8284 4 15.0589 4 16 4.12777";
var ARTWORK = {
  // ---------- 开荒 ----------
  /** 初始化笔记库：三层叠起来的骨架。开荒做的就是一次把层次铺好（Pikaicons 原图） */
  [COMMAND_ICONS.vault]: [
    "M21 12C20.8809 12.2538 20.5097 12.4413 19.7673 12.8164L13.4417 16.012C12.9131 16.279 12.6488 16.4125 12.3715 16.4651C12.126 16.5116 11.874 16.5116 11.6285 16.4651C11.3513 16.4125 11.0869 16.279 10.5583 16.012L4.23275 12.8164C3.49033 12.4413 3.11912 12.2538 3 12M21 16.5C20.8809 16.7538 20.5097 16.9413 19.7673 17.3164L13.4417 20.512C12.9131 20.779 12.6488 20.9125 12.3715 20.9651C12.126 21.0116 11.874 21.0116 11.6285 20.9651C11.3512 20.9125 11.0869 20.779 10.5583 20.512L4.23275 17.3164C3.49033 16.9413 3.11912 16.7538 3 16.5M13.4293 11.5471L19.7007 8.58144C20.4368 8.23337 20.8048 8.05933 20.9229 7.82383C21.0257 7.61888 21.0257 7.38112 20.9229 7.17617C20.8048 6.94067 20.4368 6.76663 19.7007 6.41856L13.4293 3.45291C12.9052 3.20508 12.6432 3.08117 12.3683 3.0324C12.1249 2.9892 11.8751 2.9892 11.6317 3.0324C11.3568 3.08117 11.0948 3.20508 10.5707 3.45291L4.29927 6.41856C3.56321 6.76663 3.19518 6.94067 3.07708 7.17617C2.97431 7.38112 2.97431 7.61888 3.07708 7.82383C3.19518 8.05933 3.56321 8.23337 4.29927 8.58144L10.5707 11.5471C11.0948 11.7949 11.3568 11.9188 11.6317 11.9676C11.8751 12.0108 12.1249 12.0108 12.3683 11.9676C12.6432 11.9188 12.9052 11.7949 13.4293 11.5471Z"
  ],
  // ---------- 项目 ----------
  /** 新建项目：插一面旗。项目与领域的区别就是它有终点，而旗子是插在终点上的（Pikaicons 原图） */
  [COMMAND_ICONS.project]: [
    "M5 3L5 21M6.4719 13.5167C8.2565 12.9141 10.2137 13.104 11.8491 14.0385C13.4338 14.9441 15.3231 15.1518 17.0666 14.6121L18.376 14.2068C18.747 14.092 19 13.7488 19 13.3604V4.48517C19 3.59568 17.3336 4.41833 16.9549 4.53557C15.2894 5.05107 13.4824 4.8202 12 3.90255C10.5176 2.98491 8.71058 2.75404 7.04513 3.26954L5.59885 3.71719C5.24278 3.82741 5 4.15669 5 4.52944V13.4561C5 14.2118 6.13797 13.6294 6.4719 13.5167Z"
  ],
  /** 初始化当前卡片：一页笔记。它做的事就是把眼前这一页登记成卡片（Pikaicons 原图） */
  [COMMAND_ICONS.card]: [
    "M14 2.05752V3.2C14 4.88016 14 5.72024 14.327 6.36197C14.6146 6.92646 15.0735 7.3854 15.638 7.67302C16.2798 8 17.1198 8 18.8 8L19.9425 8M14 2.05752C13.6065 2 13.136 2 12.349 2H10.4C8.15979 2 7.03968 2 6.18404 2.43597C5.43139 2.81947 4.81947 3.43139 4.43597 4.18404C4 5.03969 4 6.15979 4 8.4V15.6C4 17.8402 4 18.9603 4.43597 19.816C4.81947 20.5686 5.43139 21.1805 6.18404 21.564C7.03968 22 8.15979 22 10.4 22H13.6C15.8402 22 16.9603 22 17.816 21.564C18.5686 21.1805 19.1805 20.5686 19.564 19.816C20 18.9603 20 17.8402 20 15.6V9.65097C20 8.864 20 8.39354 19.9425 8M14 2.05752C14.0957 2.07151 14.1869 2.0889 14.2769 2.11052C14.6851 2.20851 15.0753 2.37013 15.4331 2.58944C15.8368 2.83681 16.1827 3.18271 16.8745 3.87452L18.1255 5.12548C18.8173 5.81729 19.1632 6.16319 19.4106 6.56686C19.6299 6.92475 19.7915 7.31493 19.8895 7.72307C19.9111 7.81313 19.9285 7.90429 19.9425 8"
  ],
  /** 完成项目：圈里一个勾（Pikaicons 原图） */
  [COMMAND_ICONS.done]: [
    "M8.5 12.5124L10.8412 14.851C11.9672 12.8821 13.5256 11.1944 15.3987 9.91536L15.5 9.84619M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
  ],
  /** 暂停项目：圈里两竖。免费集里没有暂停，照圆底补画，圆与完成/放弃/重新开始共用同一个 */
  [COMMAND_ICONS.paused]: ["M10 9.5V14.5M14 9.5V14.5", CIRCLE],
  /** 放弃项目：圈里一个叉（Pikaicons 原图） */
  [COMMAND_ICONS.dropped]: [
    "M9.00006 15.0001L12.0001 12.0001M12.0001 12.0001L15.0001 9.00012M12.0001 12.0001L9.00006 9.00012M12.0001 12.0001L15.0001 15.0001M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z"
  ],
  /** 重新开始项目：圈里一个播放三角。三角的三个角都拿曲线收圆，才与圆头描边是同一套语言 */
  [COMMAND_ICONS.active]: [
    "M10.6 9.35C10.6 8.87 11.13 8.58 11.53 8.83L16.06 11.48C16.45 11.71 16.45 12.29 16.06 12.52L11.53 15.17C11.13 15.42 10.6 15.13 10.6 14.65V9.35Z",
    CIRCLE
  ],
  // ---------- 灵感 ----------
  /**
   * 记录灵感：灯泡。免费集里没有，照同一套画法补画——
   * 玻璃泡是半径 6 的大圆弧，下面两道短线是灯头的螺纹。
   * 螺纹保留两道而不是一道：只留一道时它在 18px 下会读成气球或定位针。
   */
  [COMMAND_ICONS.inspiration]: [
    "M8.55 13.1a6 6 0 1 1 6.9 0c-.44.31-.7.82-.7 1.36V15.6h-5.5v-1.14c0-.54-.26-1.05-.7-1.36Z",
    "M9.4 18.4H14.6",
    "M10.6 21.2H13.4"
  ],
  // ---------- 复盘 ----------
  /** 今天的日记：日历框里一个点，一天就是一个点 */
  [COMMAND_ICONS.daily]: [CALENDAR, "M12 15.6H12.01"],
  /** 本周复盘：日历框里一整行，一周就是一行 */
  [COMMAND_ICONS.weekly]: [CALENDAR, "M8 15.6H16"],
  /** 本月复盘：日历框里一片格子，一个月就是一片 */
  [COMMAND_ICONS.monthly]: [
    CALENDAR,
    "M8 13.8H8.01M12 13.8H12.01M16 13.8H16.01M8 17.4H8.01M12 17.4H12.01M16 17.4H16.01"
  ],
  /**
   * 本季复盘：一块四分之一饼。
   * 季与年不再用日历框，是因为再密的格子在 18px 下都和月记长得一样；
   * 而「四分之一」这件事，饼图是它唯一不会被误读的画法。
   */
  [COMMAND_ICONS.quarterly]: ["M12 12V3M12 12H21", CIRCLE],
  /** 本年复盘：一枚勋章。年度复盘是一年的结算，不是更大的一格日历（Pikaicons 原图） */
  [COMMAND_ICONS.yearly]: [
    "M16.735 14.1556C18.1274 12.8762 19 11.04 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 11.1635 5.98154 13.0978 7.52363 14.3819M16.735 14.1556C15.4887 15.3008 13.826 16 12 16C10.2976 16 8.73705 15.3922 7.52363 14.3819M16.735 14.1556L18.5 22L18.1414 21.7793C14.3983 19.4759 9.65688 19.5621 6 22L7.52363 14.3819"
  ],
  /** 写复盘主题：一支笔。主题是五级复盘里唯一要动笔写的字段（Pikaicons 原图） */
  [COMMAND_ICONS.theme]: [
    "M3.06616 18.3151C3.07546 17.9381 3.08011 17.7497 3.12568 17.5726C3.16608 17.4156 3.23007 17.2658 3.31544 17.1282C3.41171 16.973 3.54444 16.8396 3.8099 16.573L16.8626 3.46297C17.3862 2.93708 18.204 2.84896 18.8267 3.25131C19.565 3.7283 20.1957 4.3551 20.6785 5.09146L20.7123 5.14307C20.7368 5.18037 20.749 5.19902 20.7594 5.21582C21.1427 5.83327 21.0616 6.63294 20.5622 7.16005C20.5486 7.17439 20.5329 7.19018 20.5014 7.22177L7.52811 20.2521C7.25274 20.5287 7.11505 20.6669 6.95435 20.7658C6.81188 20.8534 6.65654 20.9178 6.49406 20.9568C6.31079 21.0008 6.11608 21.0005 5.72665 20.9999L3 20.9955L3.06616 18.3151Z"
  ],
  // ---------- 人脉 ----------
  /** 新建人脉：人加一颗心。人脉与客户的分别就在这颗心上（Pikaicons 原图） */
  [COMMAND_ICONS.contact]: [
    "M9 15H7C4.79086 15 3 16.7909 3 19C3 20.1046 3.89543 21 5 21H11M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7ZM17 21C16.6 21 13 19.0556 13 16.3335C13 14.9724 14.2 14.0003 15.4 14.0003C15.9896 14.0003 16.6 14.1947 17 14.778C17.4 14.1947 18 13.9918 18.6 14.0003C19.8 14.0171 21 14.9724 21 16.3335C21 19.0556 17.4 21 17 21Z"
  ],
  /** 记人情：一份礼。人情账本记的就是「谁送出去、谁欠着」（Pikaicons 原图） */
  [COMMAND_ICONS.favor]: [
    "M4.22222 12H19.7778M4.22222 12V17.5556C4.22222 19.1113 4.22222 19.8891 4.52498 20.4833C4.7913 21.006 5.21624 21.4309 5.73892 21.6972C6.33311 22 7.11097 22 8.66667 22H15.3333C16.889 22 17.6669 22 18.2611 21.6972C18.7838 21.4309 19.2087 21.006 19.475 20.4833C19.7778 19.8891 19.7778 19.1113 19.7778 17.5556V12M4.22222 12C3.91259 12 3.75778 12 3.62793 11.9819C2.7919 11.8653 2.13473 11.2081 2.01811 10.3721C2 10.2422 2 10.0874 2 9.77778C2 9.46815 2 9.31334 2.01811 9.18348C2.13473 8.34746 2.7919 7.69029 3.62793 7.57367C3.75778 7.55556 3.91259 7.55556 4.22222 7.55556H19.7778C20.0874 7.55556 20.2422 7.55556 20.3721 7.57367C21.2081 7.69029 21.8653 8.34746 21.9819 9.18348C22 9.31334 22 9.46815 22 9.77778C22 10.0874 22 10.2422 21.9819 10.3721C21.8653 11.2081 21.2081 11.8653 20.3721 11.9819C20.2422 12 20.0874 12 19.7778 12M12 7.55556H14.7778C16.3119 7.55556 17.5556 6.3119 17.5556 4.77778C17.5556 3.24365 16.3119 2 14.7778 2C13.2437 2 12 3.24365 12 4.77778M12 7.55556V4.77778M12 7.55556L12 22M12 7.55556H9.22222C7.6881 7.55556 6.44444 6.3119 6.44444 4.77778C6.44444 3.24365 7.6881 2 9.22222 2C10.7563 2 12 3.24365 12 4.77778"
  ],
  // ---------- 客户 ----------
  /** 初始化客户模块：一只公文包。这条命令做的是「开张」，不是新增某一个客户（Pikaicons 原图） */
  [COMMAND_ICONS.clients]: [
    "M8 7.02163C8 6.09166 8 5.60504 8.10222 5.22354C8.37962 4.18827 9.18827 3.37962 10.2235 3.10222C10.605 3 11.07 3 12 3C12.93 3 13.395 3 13.7765 3.10222C14.8117 3.37962 15.6204 4.18827 15.8978 5.22354C16 5.60504 16 6.09166 16 7.02163M12 15V17M3.0233 11.9607C3.25404 14.2296 5.17027 16 7.5 16H16.5C18.8297 16 20.746 14.2296 20.9767 11.9607M3.0233 11.9607C3 12.4943 3 13.1501 3 14C3 15.8613 3 16.7919 3.24472 17.5451C3.73931 19.0673 4.93273 20.2607 6.45492 20.7553C7.20808 21 8.13872 21 10 21H14C15.8613 21 16.7919 21 17.5451 20.7553C19.0673 20.2607 20.2607 19.0673 20.7553 17.5451C21 16.7919 21 15.8613 21 14C21 13.1501 21 12.4943 20.9767 11.9607M3.0233 11.9607C3.05102 11.3258 3.11174 10.8642 3.24472 10.4549C3.73931 8.93273 4.93273 7.73931 6.45492 7.24472C7.20808 7 8.13872 7 10 7H14C15.8613 7 16.7919 7 17.5451 7.24472C19.0673 7.73931 20.2607 8.93273 20.7553 10.4549C20.8883 10.8642 20.949 11.3258 20.9767 11.9607"
  ],
  /** 新建客户：一个人。客户是陌生人，所以不给他人脉那颗心（Pikaicons 原图） */
  [COMMAND_ICONS.client]: [
    "M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z",
    "M16 15H8C5.79086 15 4 16.7909 4 19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19C20 16.7909 18.2091 15 16 15Z"
  ],
  /** 增加付费：一个钱字。它记的是客户答应给多少（Pikaicons 原图） */
  [COMMAND_ICONS.payment]: [
    "M12 3V21M17 7.5C16.63 5.9473 15.3249 4.8 13.7717 4.8H12H10.3333C8.49238 4.8 7 6.41177 7 8.4C7 10.3882 8.49238 12 10.3333 12H12L13.6667 12C15.5076 12 17 13.6118 17 15.6C17 17.5882 15.5076 19.2 13.6667 19.2H12H10.2283C8.67512 19.2 7.37004 18.0527 7 16.5"
  ],
  /** 记收款：一只钱包。付费是承诺，收款是钱真的进了口袋，两件事两个图（Pikaicons 原图） */
  [COMMAND_ICONS.receipt]: [
    "M2 14.5V11C2 8.19974 2 6.79961 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.79961 3 7.19974 3 10 3H13.5C14.8978 3 15.5967 3 16.1481 3.22836C16.8831 3.53284 17.4672 4.11687 17.7716 4.85195C17.979 5.35251 17.9981 5.97475 17.9998 7.1313M2 14.5C2 15.8297 2 16.9946 2.3806 17.9134C2.88807 19.1386 3.86144 20.1119 5.08658 20.6194C6.00544 21 7.17029 21 9.5 21H14.5C16.8297 21 17.9946 21 18.9134 20.6194C20.1386 20.1119 21.1119 19.1386 21.6194 17.9134C22 16.9946 22 15.8297 22 14.5C22 12.1703 22 11.0054 21.6194 10.0866C21.1119 8.86144 20.1386 7.88807 18.9134 7.3806C18.639 7.26693 18.3426 7.18721 17.9998 7.1313M2 14.5C2 12.1703 2 11.0054 2.3806 10.0866C2.88807 8.86144 3.86144 7.88807 5.08658 7.3806C6.00544 7 7.17029 7 9.5 7H14.5C16.1339 7 17.1949 7 17.9998 7.1313M14 12H17"
  ],
  // ---------- 外观 ----------
  /**
   * 外观开关：一块调色盘。免费集里没有，照同一套画法补画。
   * 盘身是一个被右下角的拇指口咬掉一块的圆，四个点是颜料——
   * 点用「起点终点差 0.01」的零长线段画，靠圆头描边收成圆点，与免费集里的点画法一致。
   */
  [COMMAND_ICONS.appearance]: [
    "M12 21.5C6.75 21.5 2.5 17.25 2.5 12S6.75 2.5 12 2.5C17.25 2.5 21.5 6.35 21.5 11.1C21.5 13.5 19.55 15.45 17.15 15.45H15.9C14.7 15.45 13.72 16.42 13.72 17.63C13.72 18.14 13.9 18.62 14.19 19C14.44 19.32 14.6 19.72 14.6 20.16C14.6 20.9 14 21.5 13.26 21.5H12Z",
    "M7.5 12.6H7.51M9.5 8.7H9.51M13.7 7.5H13.71M17.2 10.4H17.21"
  ]
};
function registerZiminosIcons(plugin) {
  for (const [name, paths] of Object.entries(ARTWORK)) {
    (0, import_obsidian18.addIcon)(name, wrap(paths));
    plugin.register(() => (0, import_obsidian18.removeIcon)(name));
  }
}
function wrap(paths) {
  const body = paths.map((d) => `<path d="${d}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${GRID} ${GRID}" width="${BOX}" height="${BOX}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:${STROKE}">${body}</svg>`;
}

// src/modules/ribbon/dock.ts
var ITEM_CLASS = "ziminos-ribbon-item";
var HIDDEN_CLASS = "ziminos-ribbon-hidden";
var MOBILE_PENDING = "\u5DF2\u53D6\u6D88\u3002\u624B\u673A\u7AEF\u8981\u91CD\u542F Obsidian \u540E\uFF0C\u5B83\u624D\u4F1A\u4ECE\u8FB9\u680F\u83DC\u5355\u91CC\u6D88\u5931\u3002";
function registerRibbon(ctx) {
  const dock = new RibbonDock(ctx);
  return () => dock.syncVisibility();
}
var RibbonDock = class {
  constructor(ctx) {
    /** 已经发出去的按钮，键是命令 id。发出去的收不回来，所以这张表只增不减 */
    this.buttons = /* @__PURE__ */ new Map();
    this.ctx = ctx;
    registerZiminosIcons(ctx.plugin);
    this.syncVisibility();
  }
  /**
   * 让边栏与设置对齐：勾上的建出来（或取消隐藏），取消勾选的藏起来。
   *
   * 这里有两条纪律，都来自 Obsidian 边栏的真实模型，不是口味问题：
   *
   * 其一，**只为勾上的命令建按钮**，而不是一次建齐二十一个再切显隐。
   * Obsidian 的 leftRibbon 自己存着一份 items，手机端底栏的边栏菜单与
   * 桌面「设置 → 外观 → 功能区」的管理弹窗都是遍历这份 items 画出来的，
   * 两处的过滤条件都只有 item.hidden，与 DOM 无关（边栏右键菜单会多看一眼 buttonEl 在不在，
   * 但那对我们没用——被藏起来的按钮 buttonEl 还在）。一次建齐的话，那两处永远列着全部二十一条，
   * 包括「初始化笔记库」这种一辈子只该按一次的——那正是这个功能想消灭的杂乱。
   *
   * 其二，**藏起来走 class 不走 inline display**，理由见 HIDDEN_CLASS。
   *
   * 代价说清楚：Obsidian 没有公开的「撤下某一个边栏按钮」，所以本次会话内取消勾选的
   * 只能先藏着，它在 items 里的那条记录要等下次重载才消失（重载时它压根不会被建出来）。
   * 在那之前，另外三处入口仍然列着它、也点得动：手机端底栏的边栏菜单、
   * 桌面「设置 → 外观 → 功能区」的管理弹窗、以及边栏空白处的右键菜单。
   * 边栏那一列是主入口，用户看到的就是消失了，所以这个残留在桌面上无伤；
   * 手机上则完全看不出变化，那一句 Notice 就是为它准备的。
   */
  syncVisibility() {
    const enabled = new Set(this.ctx.settings.ribbonCommands);
    for (const command of this.ctx.commands.list()) {
      const id = command.spec.id;
      const existing = this.buttons.get(id);
      if (!enabled.has(id)) {
        if (existing && !existing.hasClass(HIDDEN_CLASS)) {
          existing.addClass(HIDDEN_CLASS);
          if (import_obsidian19.Platform.isPhone) new import_obsidian19.Notice(MOBILE_PENDING);
        }
        continue;
      }
      if (existing) {
        existing.removeClass(HIDDEN_CLASS);
        continue;
      }
      const el = this.ctx.plugin.addRibbonIcon(command.spec.icon, command.spec.name, () => {
        command.run();
      });
      el.addClass(ITEM_CLASS);
      this.buttons.set(id, el);
    }
  }
};

// src/modules/setup/init.ts
var import_obsidian20 = require("obsidian");

// src/modules/setup/schemaNote.ts
var SAMPLE_TYPE = "\u793A\u4F8B";
function schemaNoteContent(created, uid) {
  const frontmatter = [
    "---",
    `${FIELDS.aliases}:`,
    "  - \u5C5E\u6027\u8BF4\u660E",
    `${FIELDS.description}: \u5168\u90E8\u7B14\u8BB0\u5C5E\u6027\u5404\u51FA\u73B0\u4E00\u6B21\uFF0C\u7167\u7740\u5B83\u586B\u5C31\u4E0D\u4F1A\u9519`,
    `${FIELDS.created}: ${created}`,
    `${FIELDS.updated}: ${created}`,
    `${FIELDS.tags}:`,
    "  - \u7CFB\u7EDF",
    `${FIELDS.uid}: ${uid}`,
    `${FIELDS.type}: ${SAMPLE_TYPE}`,
    `${FIELDS.status}: active`,
    `${FIELDS.up}:`,
    '  - "[[\u5BFC\u822A]]"',
    `${FIELDS.rating}: 5`,
    `${FIELDS.author}:`,
    "  - \u8D75\u5B50\u6C11",
    `${FIELDS.source}: https://edu.zhaozimin.com`,
    `${FIELDS.archived}: 2026-12-31`,
    `${FIELDS.client}: "[[\u67D0\u4F4D\u5BA2\u6237]]"`,
    `${FIELDS.with}: "[[\u67D0\u4F4D\u540C\u884C\u8005]]"`,
    `${FIELDS.theme}: \u4ECA\u5929\u4E3B\u8981\u505A\u4E86\u4EC0\u4E48\uFF0C\u4E00\u53E5\u8BDD`,
    `${FIELDS.periodStart}: 2026-01-01`,
    `${FIELDS.tier}: ${CONTACT_TIERS[1]}`,
    `${FIELDS.direction}: ${CONTACT_DIRECTIONS[0]}`,
    `${FIELDS.gift}: true`,
    `${FIELDS.address}: \u5F20\u4E09 138-0000-0000 \u5317\u4EAC\u5E02\u671D\u9633\u533A\u793A\u4F8B\u8DEF 1 \u53F7 2 \u5355\u5143 301`,
    `${FIELDS.get}:`,
    "  - \u88C5\u4FEE",
    "  - \u672C\u5730\u4EBA\u8109",
    `${FIELDS.birthday}: 1985-08-15`,
    `${FIELDS.contact}: \u5FAE\u4FE1 demo_wangwu`,
    `${FIELDS.homepage}: https://example.com`,
    "---"
  ].join("\n");
  return [
    frontmatter,
    "",
    "# \u5C5E\u6027\u7C7B\u578B\u793A\u4F8B",
    "",
    "> \u8FD9\u7BC7\u7B14\u8BB0\u4E0D\u662F\u7ED9\u4F60\u5199\u4E1C\u897F\u7528\u7684\uFF0C\u662F**\u4E00\u5F20\u5BF9\u7167\u8868**\u3002",
    "> \u4E0A\u9762\u7684\u5C5E\u6027\u6846\u91CC\uFF0C\u6BCF\u4E00\u4E2A\u5C5E\u6027\u90FD\u586B\u4E86\u4E00\u4E2A\u683C\u5F0F\u6B63\u786E\u7684\u6837\u4F8B\u2014\u2014\u60F3\u77E5\u9053\u67D0\u4E2A\u5C5E\u6027\u8BE5\u600E\u4E48\u586B\uFF0C\u56DE\u6765\u7167\u6284\u3002",
    "> \u7C7B\u578B\u672C\u8EAB\u7531\u7B14\u8BB0\u5E93\u81EA\u5E26\u7684\u914D\u7F6E\u51B3\u5B9A\uFF0C\u4F60\u4E0D\u9700\u8981\u624B\u52A8\u53BB\u6539\u4EFB\u4F55\u4E00\u4E2A\u5C5E\u6027\u7684\u7C7B\u578B\u3002",
    "",
    "## \u{1F4DD} \u6587\u672C\uFF1A\u4E00\u53E5\u8BDD\u3001\u4E00\u4E2A\u8BCD\u3001\u4E00\u4E2A\u94FE\u63A5",
    "",
    "| \u5C5E\u6027 | \u88C5\u4EC0\u4E48 | \u6837\u4F8B |",
    "|---|---|---|",
    `| \`${FIELDS.description}\` | \u4E00\u53E5\u8BDD\u62AB\u9732\uFF1A\u8FD9\u7BC7\u91CC\u6709\u4EC0\u4E48 | \u88C5\u4FEE\u516C\u53F8\u8001\u677F\uFF0C\u672C\u5730\u8D44\u6E90\u591A |`,
    `| \`${FIELDS.source}\` | \u8FD9\u4E1C\u897F\u4ECE\u54EA\u6765 | \u7F51\u5740\u3001\u4E66\u540D\u3001\u8BA4\u8BC6\u7684\u573A\u5408 |`,
    `| \`${FIELDS.type}\` | \u8EAB\u4EFD\u767B\u8BB0\uFF0C\u5C01\u95ED\u53D6\u503C | ${Object.values(NOTE_TYPES).join(" / ")} |`,
    `| \`${FIELDS.status}\` | \u6709\u7EC8\u70B9\u4E4B\u7269\u7684\u8FC7\u7A0B\u72B6\u6001 | active / paused / done / dropped |`,
    `| \`${FIELDS.tier}\` | \u8054\u7CFB\u8282\u594F | ${CONTACT_TIERS.join(" / ")} |`,
    `| \`${FIELDS.direction}\` | \u5173\u7CFB\u4F4D\u52BF | ${CONTACT_DIRECTIONS.join(" / ")} |`,
    `| \`${FIELDS.address}\` | \u6574\u4E32\u5BC4\u4EF6\u4FE1\u606F\uFF0C\u7167\u6284\u5C31\u80FD\u586B\u5FEB\u9012\u5355 | \u6536\u4EF6\u4EBA + \u7535\u8BDD + \u5730\u5740 |`,
    `| \`${FIELDS.contact}\` | \u5BA2\u6237\u7684\u8054\u7CFB\u65B9\u5F0F | \u5FAE\u4FE1\u53F7 / \u624B\u673A\u53F7 / \u5E73\u53F0\u8D26\u53F7 |`,
    `| \`${FIELDS.homepage}\` | \u5BA2\u6237\u7684\u4E3B\u9875 | \u4E00\u4E2A\u7F51\u5740 |`,
    `| \`${FIELDS.theme}\` | \u590D\u76D8\u4E3B\u9898\uFF1A\u5BF9\u4E00\u5929/\u4E00\u5468\u7684**\u7ED3\u8BBA** | \u4ECA\u5929\u4E3B\u8981\u505A\u4E86\u4EC0\u4E48 |`,
    `| \`${FIELDS.client}\` | \u4ED6\u59D4\u6258\u7684\uFF08\u6211\u6B20\u4E00\u4E2A\u4EA4\u4ED8\uFF09 | \`"[[\u5F20\u4E09]]"\` |`,
    `| \`${FIELDS.with}\` | \u548C\u4ED6\u4E00\u8D77\u505A\u7684\uFF08\u65E0\u4EA4\u4ED8\u503A\u52A1\uFF09 | \`"[[\u5F20\u4E09]]"\` |`,
    "",
    `> [!warning] \`${FIELDS.client}\` \u4E0E \`${FIELDS.with}\` \u4E0D\u80FD\u4E92\u6362`,
    `> \u5199\u4E0B \`${FIELDS.client}\` \u7B49\u4E8E\u5BA3\u544A\u300C\u6211\u6B20\u8FD9\u4E2A\u4EBA\u4E00\u4E2A\u4EA4\u4ED8\u300D\uFF0C\u5BA2\u6237\u540D\u5F55\u76F4\u63A5\u7528\u5B83\u53CD\u63A8\u8EAB\u4EFD\u3002`,
    `> \u670B\u53CB\u4E00\u8D77\u505A\u7684\u4E8B\u5FC5\u987B\u8D70 \`${FIELDS.with}\`\uFF0C\u5426\u5219\u670B\u53CB\u4F1A\u88AB\u65E0\u58F0\u6CE8\u518C\u6210\u5BA2\u6237\u3002`,
    "",
    "## \u{1F550} \u65E5\u671F\u548C\u65F6\u95F4\uFF1A\u673A\u5668\u7684\u8BB0\u8D26",
    "",
    "| \u5C5E\u6027 | \u88C5\u4EC0\u4E48 | \u6837\u4F8B |",
    "|---|---|---|",
    `| \`${FIELDS.created}\` | \u8BDE\u751F\u65F6\u523B\uFF0C\u5EFA\u7B14\u8BB0\u65F6\u81EA\u52A8\u586B | 2026-08-12 09:30:00 |`,
    `| \`${FIELDS.updated}\` | \u6700\u540E\u4E00\u6B21\u6539\u52A8\uFF0C\u81EA\u52A8\u7EF4\u62A4 | 2026-08-12 21:15:00 |`,
    "",
    "\u8FD9\u4E24\u4E2A\u4E0D\u7528\u4F60\u7BA1\uFF1A`created` \u5EFA\u7B14\u8BB0\u65F6\u5199\u4E00\u6B21\u5C31\u4E0D\u518D\u53D8\uFF0C`updated` \u7531\u63D2\u4EF6\u5728\u4F60\u505C\u624B\u4E24\u79D2\u540E\u81EA\u52A8\u8BB0\u3002",
    "",
    "## \u{1F4C5} \u65E5\u671F\uFF1A\u53EA\u5230\u5929\uFF0C\u4E0D\u5E26\u65F6\u95F4",
    "",
    "| \u5C5E\u6027 | \u88C5\u4EC0\u4E48 | \u6837\u4F8B |",
    "|---|---|---|",
    `| \`${FIELDS.birthday}\` | \u751F\u65E5\uFF0C\u672C\u6708\u751F\u65E5\u8868\u9760\u5B83 | 1985-08-15 |`,
    `| \`${FIELDS.archived}\` | \u5F52\u6863\u65F6\u523B\uFF0C\u7531\u300C\u5B8C\u6210\u9879\u76EE\u300D\u547D\u4EE4\u5199 | 2026-12-31 |`,
    `| \`${FIELDS.periodStart}\` | \u590D\u76D8\u5468\u671F\u7684\u7B2C\u4E00\u5929\uFF0C\u5EFA\u590D\u76D8\u7B14\u8BB0\u65F6\u81EA\u52A8\u7B97 | 2026-01-01 |`,
    "",
    "## \u{1F522} \u6570\u5B57\uFF1A\u80FD\u6392\u5E8F\u3001\u80FD\u6C42\u548C\u7684\u91CF",
    "",
    "| \u5C5E\u6027 | \u88C5\u4EC0\u4E48 | \u6837\u4F8B |",
    "|---|---|---|",
    `| \`${FIELDS.uid}\` | \u673A\u5668\u4E3B\u952E\uFF0C14 \u4F4D\u65F6\u95F4\u6233\uFF0C\u6539\u540D\u4E5F\u4E0D\u53D8 | ${uid} |`,
    `| \`${FIELDS.rating}\` | \u6211\u7ED9\u5B83\u6253\u51E0\u5206 | 1 \u5230 5 |`,
    "",
    `> [!note] \`${FIELDS.uid}\` \u4E3A\u4EC0\u4E48\u662F 14 \u4F4D\u800C\u4E0D\u662F 17 \u4F4D`,
    "> \u6570\u5B57\u7C7B\u578B\u6709\u4E2A\u786C\u4E0A\u9650\uFF1A\u8D85\u8FC7 16 \u4F4D\u5C31\u4F1A\u88AB\u6084\u6084\u56DB\u820D\u4E94\u5165\uFF0C\u503C\u53D8\u4E86\u8FD8\u4E0D\u62A5\u9519\u3002",
    "> 14 \u4F4D\uFF08\u5E74\u6708\u65E5\u65F6\u5206\u79D2\uFF09\u521A\u597D\u7A33\u7A33\u5728\u5B89\u5168\u7EBF\u5185\uFF0C\u6240\u4EE5\u4E3B\u952E\u53D6 14 \u4F4D\u3002",
    "",
    "## \u{1F4CB} \u5217\u8868\uFF1A\u53EF\u4EE5\u6709\u597D\u51E0\u4E2A",
    "",
    "| \u5C5E\u6027 | \u88C5\u4EC0\u4E48 | \u6837\u4F8B |",
    "|---|---|---|",
    `| \`${FIELDS.aliases}\` | \u522B\u7684\u53EB\u6CD5\uFF0C\u8F93\u5165 \`[[\` \u65F6\u4E5F\u80FD\u641C\u5230 | \u6635\u79F0\u3001\u62FC\u97F3\u3001\u82F1\u6587\u540D |`,
    `| \`${FIELDS.tags}\` | \u6A2A\u5207\u4E3B\u9898\u8BCD | \u4E0D\u88C5\u7C7B\u578B\u3001\u4E0D\u88C5\u5F52\u5C5E\u3001\u4E0D\u88C5\u72B6\u6001 |`,
    `| \`${FIELDS.up}\` | \u6211\u5C5E\u4E8E\u8C01\uFF1A\u5361\u7247\u2192\u9879\u76EE\uFF0C\u4EBA\u2192\u5708\u5B50 | \`[[\u67D0\u4E2A MOC]]\` |`,
    `| \`${FIELDS.author}\` | \u5916\u90E8\u5185\u5BB9\u7684\u539F\u4F5C\u8005 | \u53EF\u4EE5\u6709\u597D\u51E0\u4F4D |`,
    `| \`${FIELDS.get}\` | \u4ED6\u80FD\u7ED9\u6211\u4EC0\u4E48 | \u88C5\u4FEE\u3001\u672C\u5730\u4EBA\u8109 |`,
    "",
    "## \u2611\uFE0F \u52FE\u9009\u6846\uFF1A\u662F\u6216\u5426",
    "",
    "| \u5C5E\u6027 | \u88C5\u4EC0\u4E48 |",
    "|---|---|",
    `| \`${FIELDS.gift}\` | \u613F\u4E0D\u613F\u610F\u6301\u7EED\u5728\u4ED6\u8EAB\u4E0A\u82B1\u94B1\u82B1\u5FC3\u601D\u3002\u52FE\u4E0A\u5373\u8FDB\u300C\u6295\u5582\u540D\u5355\u300D |`,
    "",
    "---",
    "",
    "## \u8FD9\u7BC7\u7B14\u8BB0\u4E3A\u4EC0\u4E48\u4E0D\u4F1A\u6C61\u67D3\u4EFB\u4F55\u7EDF\u8BA1",
    "",
    `\u5168\u90E8\u89C6\u56FE\u90FD\u9760 \`${FIELDS.type}\` \u8BA4\u8EAB\u4EFD\u3002\u8FD9\u7BC7\u7684 \`${FIELDS.type}\` \u662F \`${SAMPLE_TYPE}\`\uFF0C`,
    `\u4E0D\u5728\u7CFB\u7EDF\u8BA4\u5F97\u7684\u53D6\u503C\u91CC\uFF08${Object.values(NOTE_TYPES).join(" / ")}\uFF09\uFF0C\u6240\u4EE5\u5B83\u8C01\u4E5F\u4E0D\u50CF\u2014\u2014`,
    "\u5B83\u4E0D\u4F1A\u51FA\u73B0\u5728\u4EBA\u8109\u540D\u5F55\u3001\u6295\u5582\u540D\u5355\u3001\u9879\u76EE\u770B\u677F\u6216\u4EFB\u4F55\u4E00\u5F20\u8868\u91CC\u3002",
    "",
    "\u4F60\u53EF\u4EE5\u653E\u5FC3\u628A\u5B83\u7559\u7740\u5F53\u5BF9\u7167\u8868\uFF1B\u771F\u4E0D\u60F3\u8981\u4E86\uFF0C\u5220\u6389\u4E5F\u4E0D\u5F71\u54CD\u4EFB\u4F55\u529F\u80FD\u3002",
    ""
  ].join("\n");
}

// src/modules/setup/init.ts
var VAULT_README_PATH = "README.md";
var MESSAGES6 = {
  notEmpty: "\u68C0\u6D4B\u5230\u5DF2\u6709\u7B14\u8BB0\uFF0CziminOS \u53EA\u5728\u7A7A\u5E93\u5F00\u8352\u3002\u8BF7\u65B0\u5EFA\u4E00\u4E2A\u7A7A\u5E93\u518D\u8BD5\u3002",
  done: "\u5F00\u8352\u5B8C\u6210 \u2705",
  failedPrefix: "\u521D\u59CB\u5316\u5931\u8D25\uFF1A"
};
async function initializeVault(ctx, seeds) {
  var _a;
  try {
    const isFirstRun = ctx.settings.initializedAt === "";
    if (isFirstRun && hasUserNotes(ctx)) {
      new import_obsidian20.Notice(MESSAGES6.notEmpty);
      return;
    }
    for (const folder of INIT_FOLDERS) {
      await ensureFolderPath(ctx.app, folder);
    }
    const { stamp, uid } = nowStampAndUid(ctx.settings.dateTimeFormat);
    await createFileIfMissing(ctx, SCHEMA_NOTE, schemaNoteContent(stamp, uid));
    for (const seed of seeds) {
      await applySeed(ctx, seed);
    }
    if (isFirstRun) {
      for (const seed of seeds) {
        await ((_a = seed.finish) == null ? void 0 : _a.call(seed));
      }
    }
    if (isFirstRun) {
      ctx.settings.initializedAt = nowStamp(ctx.settings.dateTimeFormat);
    }
    await ctx.saveSettings();
    new import_obsidian20.Notice(MESSAGES6.done);
    await ctx.app.workspace.openLinkText(NAV_FILE, "", false);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    new import_obsidian20.Notice(MESSAGES6.failedPrefix + message);
  }
}
async function applySeed(ctx, seed) {
  for (const folder of seed.folders) {
    await ensureFolderPath(ctx.app, folder);
  }
  for (const note of seed.notes) {
    await createFileIfMissing(ctx, note.path, note.content);
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

// src/settings.ts
var import_obsidian21 = require("obsidian");
var TEXTS2 = {
  initHeading: "\u5F00\u8352",
  initName: "\u521D\u59CB\u5316\u7B14\u8BB0\u5E93",
  initButton: "\u521D\u59CB\u5316",
  initPending: "\u5C1A\u672A\u521D\u59CB\u5316\u3002\u70B9\u53F3\u8FB9\u7684\u6309\u94AE\uFF0C\u4E3A\u8FD9\u4E2A\u5E93\u94FA\u597D\u4E03\u4E2A\u6587\u4EF6\u5939\u3001\u6A21\u677F\u4E0E\u5BFC\u822A\uFF0C\u5E76\u957F\u51FA\u4EBA\u8109\u4E0E\u590D\u76D8\u4E24\u5957\u7CFB\u7EDF\u3002",
  initReadyPrefix: "\u5DF2\u5C31\u7EEA \u2713 \u9996\u6B21\u5F00\u8352\u4E8E ",
  initReadySuffix: "\u3002\u518D\u70B9\u4E00\u6B21\u53EA\u8865\u9F50\u7F3A\u5931\u7684\u6587\u4EF6\uFF0C\u4E0D\u4F1A\u8986\u76D6\u4F60\u5199\u8FC7\u7684\u4EFB\u4F55\u7B14\u8BB0\u3002",
  autoHeading: "\u81EA\u52A8\u5316",
  autoCardName: "\u65B0\u5EFA\u7B14\u8BB0\u81EA\u52A8\u767B\u8BB0\u4E3A\u5361\u7247",
  autoCardDesc: "\u5728\u9879\u76EE\u6216\u9886\u57DF\u76EE\u5F55\u91CC\u65B0\u5EFA\u7A7A\u7B14\u8BB0\u65F6\uFF0C\u81EA\u52A8\u8865\u9F50\u6807\u51C6\u5B57\u6BB5\uFF0C\u5E76\u94FE\u56DE\u5B83\u6240\u5C5E\u7684 MOC\u3002\u5173\u6389\u540E\u53EF\u7528\u547D\u4EE4\u300C\u521D\u59CB\u5316\u5F53\u524D\u5361\u7247\u300D\u624B\u52A8\u767B\u8BB0\u3002",
  autoUpdatedName: "\u81EA\u52A8\u7EF4\u62A4 updated \u65F6\u95F4",
  autoUpdatedDesc: "\u6539\u5B8C\u5E26 YAML \u7684\u7B14\u8BB0\u3001\u505C\u624B\u4E24\u79D2\u540E\uFF0C\u81EA\u52A8\u8BB0\u4E0B\u8FD9\u6B21\u4FEE\u6539\u65F6\u95F4\u3002\u6CA1\u6709 YAML \u7684\u7B14\u8BB0\u4E00\u4E2A\u5B57\u90FD\u4E0D\u52A8\u3002",
  inspirationHeading: "\u7075\u611F\u6536\u96C6",
  inspirationFolderName: "\u6587\u4EF6\u5939",
  inspirationFolderDesc: "\u7075\u611F\u7B14\u8BB0\u653E\u5728\u54EA\u4E2A\u6587\u4EF6\u5939\u3002\u76F8\u5BF9\u4E8E\u7B14\u8BB0\u5E93\u6839\u76EE\u5F55\u3002",
  inspirationFileName: "\u7B14\u8BB0\u540D\u79F0",
  inspirationFileDesc: "\u7075\u611F\u5199\u5165\u54EA\u4E00\u7BC7\u7B14\u8BB0\uFF1B\u6CA1\u5199 .md \u65F6\u4F1A\u81EA\u52A8\u8865\u9F50\u3002",
  inspirationTargetHeading: "\u5B9A\u4F4D\u6807\u9898",
  inspirationTargetDesc: "\u9009\u62E9\u6807\u9898\u63D2\u5165\u65F6\uFF0C\u7528\u5B83\u5B9A\u4F4D\u5177\u4F53\u533A\u57DF\u3002\u53EF\u5199\u201C\u7075\u611F\u96C6\u201D\u6216\u5B8C\u6574 Markdown \u6807\u9898\u3002",
  inspirationPositionName: "\u63D2\u5165\u4F4D\u7F6E",
  inspirationPositionDesc: "\u51B3\u5B9A\u65B0\u7075\u611F\u5199\u5728\u6807\u9898\u533A\u6216\u6574\u7BC7\u6B63\u6587\u7684\u5934\u5C3E\u3002\u7F6E\u9876\u4F1A\u81EA\u52A8\u907F\u5F00 YAML\u3001\u9875\u9762\u6807\u9898\u548C Dataview \u7B5B\u9009\u533A\u3002",
  inspirationFormatName: "\u5355\u6761\u683C\u5F0F",
  inspirationFormatDesc: "\u5FC5\u987B\u4FDD\u7559 {{content}}\uFF1B\u8FD8\u53EF\u4F7F\u7528 {{date}}\u3001{{time}}\u3001{{datetime}}\u3002",
  ribbonHeading: "\u5DE6\u4FA7\u8FB9\u680F",
  ribbonIntro: "\u52FE\u4E0A\u7684\u547D\u4EE4\u4F1A\u53D8\u6210\u6700\u5DE6\u8FB9\u90A3\u4E00\u5217\u56FE\u6807\uFF0C\u70B9\u4E00\u4E0B\u5C31\u6267\u884C\uFF0C\u4E0D\u7528\u518D\u6253\u5F00\u547D\u4EE4\u9762\u677F\u3002\u56FE\u6807\u662F Pikaicons\uFF0C\u8DDF\u7740\u4E3B\u9898\u7684\u989C\u8272\u4E0E\u63CF\u8FB9\u7C97\u7EC6\u8D70\u3002\u53D6\u6D88\u52FE\u9009\u540E\uFF0C\u5B83\u5728\u300C\u8BBE\u7F6E \u2192 \u5916\u89C2 \u2192 \u529F\u80FD\u533A\u300D\u548C\u624B\u673A\u7AEF\u7684\u8FB9\u680F\u83DC\u5355\u91CC\u8981\u91CD\u542F Obsidian \u624D\u6D88\u5931\uFF1B\u53CD\u8FC7\u6765\uFF0C\u4F60\u5728\u90A3\u4E24\u5904\u85CF\u6389\u7684\u56FE\u6807\uFF0C\u8FD9\u91CC\u52FE\u4E0A\u4E5F\u4E0D\u4F1A\u51FA\u73B0\u2014\u2014\u90A3\u662F Obsidian \u81EA\u5DF1\u7684\u5F00\u5173\uFF0C\u5F97\u56DE\u90A3\u513F\u6253\u5F00\u3002",
  ribbonCountPrefix: "\u5DF2\u6446\u51FA ",
  ribbonCountSeparator: " / ",
  ribbonCountSuffix: " \u6761",
  appearanceHeading: "\u5916\u89C2",
  appearanceSwitchName: "\u72B6\u6001\u680F\u5916\u89C2\u5F00\u5173",
  appearanceSwitchDesc: "\u5728\u53F3\u4E0B\u89D2\u72B6\u6001\u680F\u653E\u4E00\u4E2A \u{1F3A8} \u6309\u94AE\uFF0C\u70B9\u5F00\u5C31\u80FD\u9010\u4E2A\u5F00\u5173 CSS \u7247\u6BB5\uFF0C\u4E0D\u5FC5\u518D\u8FDB\u8BBE\u7F6E\u7FFB\u5916\u89C2\u9875\u3002\u5173\u6389\u53EA\u662F\u6536\u8D77\u6309\u94AE\uFF0C\u547D\u4EE4\u9762\u677F\u91CC\u7684\u300C\u6253\u5F00\u5916\u89C2\u5F00\u5173\u300D\u7167\u5E38\u53EF\u7528\u3002",
  advancedHeading: "\u9AD8\u7EA7\u8BBE\u7F6E\uFF08\u4E00\u822C\u4E0D\u7528\u6539\uFF09",
  modulesHeading: "\u7CFB\u7EDF\u6A21\u5757"
};
var ADVANCED_FIELDS = [
  { key: "projectFolder", name: "\u9879\u76EE\u76EE\u5F55", hint: "\u6B63\u5728\u63A8\u8FDB\u7684\u9879\u76EE\u653E\u5728\u8FD9\u91CC\u3002" },
  { key: "areaFolder", name: "\u9886\u57DF\u76EE\u5F55", hint: "\u957F\u671F\u5173\u6CE8\u3001\u6CA1\u6709\u7EC8\u70B9\u7684\u9886\u57DF\u653E\u5728\u8FD9\u91CC\u3002" },
  { key: "archiveFolder", name: "\u5F52\u6863\u76EE\u5F55", hint: "\u5B8C\u6210\u3001\u6682\u505C\u3001\u653E\u5F03\u7684\u9879\u76EE\u4F1A\u642C\u5230\u8FD9\u91CC\uFF1B\u4EBA\u8109\u6863\u6848\u642C\u8FDB\u6765\u5373\u9000\u51FA\u5168\u90E8\u540D\u5F55\u3002" },
  { key: "diaryFolder", name: "\u590D\u76D8\u76EE\u5F55", hint: "\u65E5/\u5468/\u6708/\u5B63/\u5E74\u4E94\u7EA7\u590D\u76D8\u7684\u65F6\u95F4\u8F74\u6839\u76EE\u5F55\uFF0C\u4E94\u4E2A\u5B50\u76EE\u5F55\u7531\u5B83\u6D3E\u751F\u3002" },
  { key: "contactFolder", name: "\u4EBA\u8109\u76EE\u5F55", hint: "\u4EBA\u7269\u6863\u6848\u5E73\u94FA\u5B58\u653E\u5728\u8FD9\u91CC\uFF1B\u89C6\u56FE\u9760 type \u8BA4\u4EBA\uFF0C\u632A\u8D70\u4E5F\u4E0D\u5F71\u54CD\u3002" },
  { key: "clientFolder", name: "\u5BA2\u6237\u76EE\u5F55", hint: "\u4ED8\u8D39\u7528\u6237\u6863\u6848\u653E\u5728\u8FD9\u91CC\uFF0C\u8FD0\u884C\u300C\u521D\u59CB\u5316\u5BA2\u6237\u6A21\u5757\u300D\u540E\u624D\u4F1A\u7528\u5230\u3002" },
  { key: "clientSources", name: "\u5BA2\u6237\u6E20\u9053", hint: "\u300C\u65B0\u5EFA\u5BA2\u6237\u300D\u7684\u6E20\u9053\u5019\u9009\uFF0C\u7528\u9017\u53F7\u5206\u9694\u3002\u8D70\u9009\u62E9\u800C\u975E\u624B\u6253\uFF0C\u7EDF\u8BA1\u624D\u4E0D\u4F1A\u88AB\u540C\u4E49\u5199\u6CD5\u6253\u6563\u3002" },
  { key: "clientProducts", name: "\u4EA7\u54C1\u6E05\u5355", hint: "\u300C\u589E\u52A0\u4ED8\u8D39\u300D\u7684\u4EA7\u54C1\u5019\u9009\uFF0C\u7528\u9017\u53F7\u5206\u9694\u3002" },
  { key: "dateTimeFormat", name: "\u65F6\u95F4\u683C\u5F0F", hint: "created \u4E0E updated \u5B57\u6BB5\u7684\u5199\u6CD5\uFF0Cmoment \u8BED\u6CD5\u3002" }
];
var SYSTEM_MODULES = [
  { name: "\u{1F4E6} \u9879\u76EE\u7BA1\u7406 v1", status: "\u8FD0\u884C\u4E2D \xB7 \u5EFA\u9879\u76EE\u3001\u5361\u7247\u767B\u8BB0\u3001\u56DB\u6001\u6D41\u8F6C", running: true },
  { name: "\u{1F4A1} \u7075\u611F\u6536\u96C6 v1", status: "\u8FD0\u884C\u4E2D \xB7 Dataview \u672A\u5B8C\u6210\u4EFB\u52A1\u89C6\u56FE\u5DF2\u5C31\u7EEA", running: true },
  { name: "\u{1F465} \u4EBA\u8109\u7BA1\u7406 v1", status: "\u8FD0\u884C\u4E2D \xB7 \u65B0\u5EFA\u4EBA\u8109\u3001\u8BB0\u4EBA\u60C5\uFF0C\u6863\u6848\u4E0E MOC \u5171\u516B\u4E2A\u89C6\u56FE", running: true },
  { name: "\u{1F4D4} \u590D\u76D8 v1", status: "\u8FD0\u884C\u4E2D \xB7 \u4E94\u7EA7\u5468\u671F\u7B14\u8BB0\u3001\u4E3B\u9898\u94FE\u4E0E\u9879\u76EE\u6570\u636E\u5171\u4E94\u4E2A\u89C6\u56FE", running: true },
  {
    name: "\u{1F4B0} \u5BA2\u6237\u4E0E\u4ED8\u8D39 v1",
    status: "\u6309\u9700\u542F\u7528 \xB7 \u547D\u4EE4\u9762\u677F\u8FD0\u884C\u300C\u521D\u59CB\u5316\u5BA2\u6237\u6A21\u5757\u300D\uFF0C\u957F\u51FA MOC \u4E0E\u516B\u4E2A\u89C6\u56FE",
    running: true
  },
  {
    name: "\u{1F3A8} \u5916\u89C2\u5305 v2",
    status: "\u8FD0\u884C\u4E2D \xB7 Minimal + Style Settings + \u5341\u4E8C\u4E2A CSS \u7247\u6BB5\uFF0C\u53F3\u4E0B\u89D2\u4E00\u952E\u5F00\u5173",
    running: true
  },
  {
    name: "\u{1F9ED} \u5DE6\u4FA7\u8FB9\u680F v1",
    status: "\u8FD0\u884C\u4E2D \xB7 \u4E8C\u5341\u4E00\u6761\u547D\u4EE4\u914D Pikaicons \u56FE\u6807\uFF0C\u9ED8\u8BA4\u6446\u51FA\u4E03\u6761",
    running: true
  }
];
var ZiminosSettingTab = class extends import_obsidian21.PluginSettingTab {
  constructor(ctx, actions) {
    super(ctx.app, ctx.plugin);
    /**
     * 「已摆出 N / 21 条」那行字。
     *
     * 这是全页唯一一处持有 DOM 引用的地方，理由很具体：勾选要即时更新这个数，
     * 而重建整页会把滚动条弹回顶部——二十一行排下来，用户勾第十八行时页面一跳，
     * 他就得重新找回刚才那一行。持有的是一个渲染出来的节点，不是第二份状态：
     * 数字仍然现算自设置对象，每次 display 也会把它换成新节点。
     */
    this.ribbonCountEl = null;
    this.ctx = ctx;
    this.actions = actions;
  }
  /** 每次打开设置页都整体重建，保证显示的永远是设置对象的当前值 */
  display() {
    const { containerEl } = this;
    containerEl.empty();
    this.renderInitSection(containerEl);
    this.renderAutomationSection(containerEl);
    this.renderInspirationSection(containerEl);
    this.renderAppearanceSection(containerEl);
    this.renderRibbonSection(containerEl);
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
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.initHeading).setHeading();
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.initName).setDesc(this.describeInitState()).addButton((button) => {
      button.setButtonText(TEXTS2.initButton).setCta().onClick(async () => {
        button.setDisabled(true);
        try {
          await this.actions.initialize();
        } finally {
          this.display();
        }
      });
    });
  }
  /** 用 initializedAt 是否为空来决定说什么：这是「首次开荒」与「幂等补齐」的唯一判据 */
  describeInitState() {
    const { initializedAt } = this.ctx.settings;
    if (!initializedAt) return TEXTS2.initPending;
    return TEXTS2.initReadyPrefix + initializedAt + TEXTS2.initReadySuffix;
  }
  // ============================================================
  // 二、自动化
  // ============================================================
  /** 自动化区：两个开关，对应插件仅有的两个常驻监听 */
  renderAutomationSection(containerEl) {
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.autoHeading).setHeading();
    this.renderToggle(containerEl, "autoCardInit", TEXTS2.autoCardName, TEXTS2.autoCardDesc);
    this.renderToggle(containerEl, "autoUpdated", TEXTS2.autoUpdatedName, TEXTS2.autoUpdatedDesc);
  }
  /**
   * 渲染一个布尔开关。
   *
   * 改动立即落盘。两个自动化开关不需要 onApplied——监听方每次触发都现读设置，
   * 天然看得见新值；只有已经画在屏幕上的东西（状态栏按钮）才需要有人去推它一把。
   */
  renderToggle(containerEl, key, name, desc, onApplied) {
    new import_obsidian21.Setting(containerEl).setName(name).setDesc(desc).addToggle((toggle) => {
      toggle.setValue(this.ctx.settings[key]).onChange(async (value) => {
        this.ctx.settings[key] = value;
        await this.ctx.saveSettings();
        onApplied == null ? void 0 : onApplied();
      });
    });
  }
  // ============================================================
  // 三、灵感收集
  // ============================================================
  /** 灵感区直接展示常用自定义项；这些字段就是「记录灵感」命令的下一次运行参数 */
  renderInspirationSection(containerEl) {
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.inspirationHeading).setHeading();
    this.renderInspirationTextField(
      containerEl,
      "inspirationFolder",
      TEXTS2.inspirationFolderName,
      TEXTS2.inspirationFolderDesc,
      INSPIRATION_DEFAULTS.folder
    );
    this.renderInspirationTextField(
      containerEl,
      "inspirationFileName",
      TEXTS2.inspirationFileName,
      TEXTS2.inspirationFileDesc,
      INSPIRATION_DEFAULTS.fileName
    );
    this.renderInspirationTextField(
      containerEl,
      "inspirationHeading",
      TEXTS2.inspirationTargetHeading,
      TEXTS2.inspirationTargetDesc,
      INSPIRATION_DEFAULTS.heading
    );
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.inspirationPositionName).setDesc(TEXTS2.inspirationPositionDesc).addDropdown((dropdown) => {
      dropdown.addOption("heading-top", "\u6807\u9898\u4E0B\u65B9\uFF08\u65B0\u5185\u5BB9\u5728\u524D\uFF09").addOption("heading-bottom", "\u6807\u9898\u533A\u672B\u5C3E\uFF08\u65B0\u5185\u5BB9\u5728\u540E\uFF09").addOption("file-top", "\u6B63\u6587\u9876\u90E8").addOption("file-bottom", "\u6B63\u6587\u5E95\u90E8").setValue(this.normalizeInspirationPosition(this.ctx.settings.inspirationInsertPosition)).onChange(async (value) => {
        const position = this.normalizeInspirationPosition(value);
        this.ctx.settings.inspirationInsertPosition = position;
        await this.ctx.saveSettings();
      });
    });
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.inspirationFormatName).setDesc(TEXTS2.inspirationFormatDesc).addTextArea((textArea) => {
      textArea.setPlaceholder(INSPIRATION_DEFAULTS.format).setValue(this.ctx.settings.inspirationFormat).onChange(async (value) => {
        this.ctx.settings.inspirationFormat = value;
        await this.ctx.saveSettings();
      });
      textArea.inputEl.rows = 3;
      textArea.inputEl.style.width = "100%";
    });
  }
  /** 灵感目录/文件/标题三个文本设置共用同一条即时落盘路径 */
  renderInspirationTextField(containerEl, key, name, desc, fallback) {
    new import_obsidian21.Setting(containerEl).setName(name).setDesc(desc).addText((text) => {
      text.setPlaceholder(fallback).setValue(this.ctx.settings[key]).onChange(async (value) => {
        this.ctx.settings[key] = value;
        await this.ctx.saveSettings();
      });
    });
  }
  /** 防御手改 data.json 产生的未知枚举值，设置面板与写入模块保持同一回落策略 */
  normalizeInspirationPosition(value) {
    const candidate = value;
    return INSPIRATION_INSERT_POSITIONS.includes(candidate) ? candidate : INSPIRATION_DEFAULTS.insertPosition;
  }
  // ============================================================
  // 四、外观
  // ============================================================
  /** 外观区：只有一个开关，管的是「右下角要不要常驻这个按钮」，不管片段本身开着还是关着 */
  renderAppearanceSection(containerEl) {
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.appearanceHeading).setHeading();
    this.renderToggle(
      containerEl,
      "showAppearanceSwitch",
      TEXTS2.appearanceSwitchName,
      TEXTS2.appearanceSwitchDesc,
      this.actions.syncAppearanceSwitch
    );
  }
  // ============================================================
  // 五、左侧边栏
  // ============================================================
  /**
   * 侧边栏区：一句说明 + 按分组排下来的二十一行。
   *
   * 清单现读花名册而不是自己维护一份，因此它与命令面板里能搜到的命令永远是同一批；
   * 分组标题按「相邻两行的 group 不同」切出来，与外观开关面板用的是同一套画法——
   * 分组顺序不需要另一张表，它就是命令的注册顺序。
   */
  renderRibbonSection(containerEl) {
    const commands = this.ctx.commands.list();
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.ribbonHeading).setHeading();
    const summary = new import_obsidian21.Setting(containerEl).setName(this.describeRibbonCount()).setDesc(TEXTS2.ribbonIntro);
    this.ribbonCountEl = summary.nameEl;
    let currentGroup = "";
    for (const command of commands) {
      if (command.spec.group !== currentGroup) {
        currentGroup = command.spec.group;
        containerEl.createDiv({ cls: "ziminos-ribbon-group", text: currentGroup });
      }
      this.renderRibbonRow(containerEl, command.spec.id, command.spec.icon, command.spec.name);
    }
  }
  /** 只改那一个数字，不重建页面——重建会把滚动条弹回顶部 */
  refreshRibbonCount() {
    if (this.ribbonCountEl) this.ribbonCountEl.setText(this.describeRibbonCount());
  }
  /**
   * 「已摆出 7 / 21 条」。给的是一个量级感：勾多了那条边栏会变成谁也不看的图标柱。
   * 总数现算自花名册，不写死——这一区不认识任何一条具体命令，也就不该认识它们有几条。
   */
  describeRibbonCount() {
    const total = this.ctx.commands.list().length;
    return TEXTS2.ribbonCountPrefix + this.ctx.settings.ribbonCommands.length + TEXTS2.ribbonCountSeparator + total + TEXTS2.ribbonCountSuffix;
  }
  /** 一行：图标 + 命令名 + 开关。图标就是它在边栏上的样子，勾之前先看见 */
  renderRibbonRow(containerEl, id, icon, name) {
    const label = createFragment((frag) => {
      const iconEl = frag.createSpan({ cls: "ziminos-ribbon-icon" });
      (0, import_obsidian21.setIcon)(iconEl, icon);
      frag.createSpan({ text: name });
    });
    new import_obsidian21.Setting(containerEl).setName(label).setClass("ziminos-ribbon-row").addToggle((toggle) => {
      toggle.setValue(this.ctx.settings.ribbonCommands.includes(id)).onChange(async (value) => {
        this.ctx.settings.ribbonCommands = this.nextRibbonCommands(id, value);
        await this.ctx.saveSettings();
        this.actions.syncRibbon();
        this.refreshRibbonCount();
      });
    });
  }
  /**
   * 算出勾选之后的新清单。
   *
   * 一律照花名册重排一遍而不是往旧数组里增删：其一，边栏顺序因此永远等于命令的注册顺序，
   * 与用户先勾哪个无关；其二，data.json 里若混进了不认识的 id（换过版本、手改过文件），
   * 第一次勾选就顺手扫掉，不会留一条永远没人认领的记录。
   * 返回的是新数组，绝不原地改——ribbonCommands 在用户没调过时与 DEFAULT_SETTINGS 共用引用。
   */
  nextRibbonCommands(id, enabled) {
    const chosen = new Set(this.ctx.settings.ribbonCommands);
    if (enabled) chosen.add(id);
    else chosen.delete(id);
    return this.ctx.commands.list().map((command) => command.spec.id).filter((candidate) => chosen.has(candidate));
  }
  // ============================================================
  // 六、高级
  // ============================================================
  /**
   * 高级区：默认折叠。
   * 目录名与时间格式是课程内容的一部分，改了会让学员的库与课程讲义对不上，
   * 所以既要留出口，又不能摆在明面上诱导人去动它。
   */
  renderAdvancedSection(containerEl) {
    const details = containerEl.createEl("details");
    const summary = details.createEl("summary", { text: TEXTS2.advancedHeading });
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
    new import_obsidian21.Setting(containerEl).setName(field.name).setDesc(`${field.hint}\u8BFE\u7A0B\u9ED8\u8BA4\u503C ${fallback}\uFF0C\u6539\u524D\u4E09\u601D\u3002`).addText((text) => {
      text.setPlaceholder(fallback).setValue(this.ctx.settings[field.key]).onChange(async (value) => {
        this.ctx.settings[field.key] = value;
        await this.ctx.saveSettings();
      });
    });
  }
  // ============================================================
  // 七、系统模块
  // ============================================================
  /** 模块区：纯展示，没有任何控件。未上线的模块以禁用态呈现，看得见但点不动 */
  renderModulesSection(containerEl) {
    new import_obsidian21.Setting(containerEl).setName(TEXTS2.modulesHeading).setHeading();
    for (const entry of SYSTEM_MODULES) {
      const item = new import_obsidian21.Setting(containerEl).setName(entry.name).setDesc(entry.status);
      if (!entry.running) item.setDisabled(true);
    }
  }
};

// src/main.ts
var ZiminosPlugin = class extends import_obsidian22.Plugin {
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
      guard: new SelfWriteGuard(),
      // 注册台同样全库唯一：它手里那份花名册就是左侧边栏与设置页看到的命令清单
      commands: new CommandRegistry(this)
    };
    const collectSeeds = () => [
      projectsSeed(ctx),
      reviewSeed(ctx),
      contactsSeed(ctx)
    ];
    ctx.commands.register(INIT_VAULT_COMMAND, () => {
      void initializeVault(ctx, collectSeeds());
    });
    registerCreateProjectCommand(ctx, (title, quiet) => pickPerson(ctx, title, quiet));
    registerCardInitCommand(ctx);
    registerCardAutoInit(ctx);
    registerTransitionCommands(ctx);
    registerUpdatedMaintainer(ctx);
    registerInspirationCaptureCommand(ctx);
    registerPeriodicCommands(ctx);
    registerThemeCommand(ctx);
    registerCreateContactCommand(ctx);
    registerRecordFavorCommand(ctx, () => openPeriodNote(ctx, PERIODS.daily, { reveal: false }));
    registerClientCommands(ctx, (seed) => applySeed(ctx, seed));
    const syncAppearanceSwitch = registerAppearanceSwitch(ctx);
    const syncRibbon = registerRibbon(ctx);
    registerViewCodeBlock(ctx, [
      ...reviewThemeViews,
      ...reviewProjectViews,
      ...personViews,
      ...circleViews,
      // 客户视图始终注册：视图是只读的，注册它零成本，
      // 而用开关控制注册会让「块能不能渲染」变成需要重启才生效的事
      ...clientViews
    ]);
    this.addSettingTab(
      new ZiminosSettingTab(ctx, {
        initialize: () => initializeVault(ctx, collectSeeds()),
        syncAppearanceSwitch,
        syncRibbon
      })
    );
  }
  /**
   * 读取持久化设置并补齐缺省值。
   * 用「默认值打底、存档覆盖」的顺序合并：新版本新增的字段对老库自动生效，
   * 老库里已有的选择则一个都不会被冲掉。首次安装时 loadData 返回 null，结果即纯默认值。
   */
  async loadSettings() {
    const stored = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...stored != null ? stored : {} };
    this.settings.ribbonCommands = normalizeRibbonCommands(this.settings.ribbonCommands);
  }
};
