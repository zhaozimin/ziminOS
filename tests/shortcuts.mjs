/**
 * [INPUT]: 依赖 node:test/assert、esbuild 与快捷操作事实源。
 * [OUTPUT]: 验证配置升级、侧栏恢复、命令上下文、检索、自定义名称与配置写入失败。
 * [POS]: 快捷操作专项。执行真实视图和命令台，宿主替身只提供 DOM 与工作区边界。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
class Element {
    constructor(tag = 'div', options = {}) {
        this.tag = tag;
        this.text = options.text ?? '';
        this.attrs = { ...options.attr };
        this.classes = new Set((options.cls ?? '').split(/\s+/));
        this.children = [];
        this.listeners = {};
        this.style = {};
        this.value = options.value ?? '';
        this.disabled = false;
    }
    createEl(tag, options) { const child = new Element(tag, options); this.children.push(child); return child; }
    createDiv(options) { return this.createEl('div', options); }
    createSpan(options) { return this.createEl('span', options); }
    empty() { this.children = []; }
    addClass(cls) { this.classes.add(cls); }
    addEventListener(event, callback) { this.listeners[event] = callback; }
    focus() { this.focused = true; }
    select() {}
    setText(text) { this.text = text; }
    setAttribute(name, value) { this.attrs[name] = value; }
    click() { if (!this.disabled) this.listeners.click?.(); }
    all(predicate) { return [this, ...this.children.flatMap(child => child.all(() => true))].filter(predicate); }
}
const notices = [];
const modals = [];
const menus = [];
globalThis.__shortcutTestHost = { Element, notices, modals, menus };

const compiled = await build({
    stdin: {
        contents: `export * from './src/modules/shortcuts/view';
            export * from './src/core/shortcutSettings';
            export * from './src/modules/shortcuts/preferences';
            export * from './src/core/commands';
            export { normalizeSettings } from './src/core/types';
            export { MarkdownView } from 'obsidian';`,
        resolveDir: ROOT, loader: 'ts',
    },
    bundle: true, format: 'esm', platform: 'node', write: false, logLevel: 'silent',
    plugins: [{
        name: 'shortcut-host', setup(builder) {
            builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: 'obsidian', namespace: 'stub' }));
            builder.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
                contents: `export class ItemView {
                    constructor(leaf) { this.app = leaf.app; this.contentEl = new globalThis.__shortcutTestHost.Element(); this.events = []; this.actions = []; }
                    addAction(icon, title, callback) { this.actions.push({icon, title, callback}); return new globalThis.__shortcutTestHost.Element(); }
                    onPaneMenu() {}
                    registerDomEvent(element, event, callback) { element.addEventListener(event, callback); }
                    registerEvent(event) { this.events.push(event); }
                }
                export class Modal {
                    constructor(app) { this.app=app; this.contentEl=new globalThis.__shortcutTestHost.Element(); this.titleEl=new globalThis.__shortcutTestHost.Element(); }
                    open() { globalThis.__shortcutTestHost.modals.push(this); this.onOpen?.(); }
                    close() { this.onClose?.(); const all=globalThis.__shortcutTestHost.modals; const i=all.indexOf(this); if(i>=0) all.splice(i,1); }
                }
                export class FuzzySuggestModal extends Modal {}
                export class ButtonComponent {
                    constructor(parent) { this.el=parent.createEl('button'); }
                    setButtonText(text) { this.el.text=text; return this; }
                    setCta() { return this; }
                    onClick(callback) { this.el.addEventListener('click',callback); return this; }
                }
                export class Menu {
                    constructor() { this.items=[]; globalThis.__shortcutTestHost.menus.push(this); }
                    addItem(callback) {
                        const item={setTitle(v){this.title=v; return this;},setIcon(){return this;},setDisabled(v){this.disabled=v;return this;},onClick(v){this.callback=v;return this;}};
                        callback(item);this.items.push(item);return this;
                    }
                    addSeparator() {}
                    showAtMouseEvent() {}
                }
                export class MarkdownView {}
                export class Notice { constructor(message) { globalThis.__shortcutTestHost.notices.push(message); } }
                export function setIcon(element, icon) { element.iconName = icon; }`,
            }));
        },
    }],
});
const api = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const tick = () => new Promise(resolve => setImmediate(resolve));

function harness({ restore = false, save = async () => {}, ids, labels } = {}) {
    const commands = [];
    const events = [];
    const ensures = [];
    const lifecycle = [];
    const runs = [];
    let factory;
    let boot;
    let restored = restore;
    const note = { path: '01-projects/示例/卡片.md', basename: '卡片', extension: 'md' };
    const mainLeaf = { view: new api.MarkdownView() };
    mainLeaf.view.file = note;
    const app = {
        workspace: {
            getLeavesOfType: () => restored ? [{}] : [],
            onLayoutReady: callback => { boot = callback; },
            ensureSideLeaf: async (type, side, options) => { ensures.push({ type, side, options }); },
            getActiveFile: () => app.file,
            getMostRecentLeaf: () => mainLeaf,
            setActiveLeaf: (leaf, options) => { app.active = leaf; app.file = leaf.view.file; app.focus = options.focus; },
            on: (name, callback) => { const event = { name, callback }; events.push(event); return event; },
        },
        vault: { on: (name, callback) => { const event = { name, callback }; events.push(event); return event; } },
        file: note, active: null,
    };
    const plugin = {
        addCommand: command => commands.push(command),
        register: callback => lifecycle.push(callback),
        // 模拟注册台重建时，旧叶子同步变成 empty。
        registerView: (_type, creator) => { factory = creator; restored = false; },
    };
    const ctx = {
        app, plugin, settings: api.normalizeSettings({ ...(ids ? { quickActionCommands: ids } : {}), quickActionLabels: labels }),
        saveSettings: save, commands: new api.CommandRegistry(plugin),
    };
    const specs = [
        api.INSPIRATION_COMMAND, api.PERIOD_COMMANDS.daily, api.PROJECT_COMMANDS.create,
        api.PLANNER_COMMANDS.open, api.BOOK_COMMANDS.read, api.CONTACT_COMMANDS.create,
        api.CONTACT_COMMANDS.favor, api.THEME_COMMAND, api.FORMAT_COMMAND,
        api.EXPORT_COMMAND, api.COPY_PATH_COMMAND, api.PROJECT_COMMANDS.card,
        api.PROJECT_COMMANDS.resource,
    ];
    for (const spec of specs) ctx.commands.register(spec, () => runs.push({ id: spec.id, leaf: app.active }));
    api.registerQuickActions(ctx);
    return {
        ctx, app, commands, ensures, lifecycle, runs, mainLeaf,
        boot: () => boot(),
        mount: async () => { const view = factory({ app }); await view.onOpen(); return view; },
        emit: name => events.filter(event => event.name === name).forEach(event => event.callback()),
    };
}

test('快捷清单升级验形保留主动清空，去重且不修改左侧配置', () => {
    for (const invalid of [undefined, null, {}, true, 'create-project']) {
        assert.deepEqual(api.normalizeQuickActionCommands(invalid), api.DEFAULT_QUICK_ACTION_COMMANDS);
    }
    assert.deepEqual(api.normalizeQuickActionCommands([]), []);
    assert.deepEqual(api.normalizeQuickActionCommands(['x', 3, 'x', '', '  ', 'missing']), ['x', 'missing']);
    const settings = api.normalizeSettings({ ribbonCommands: [], quickActionCommands: ['x', 'x'] });
    assert.deepEqual(settings.ribbonCommands, []);
    assert.deepEqual(settings.quickActionCommands, ['x']);
});

test('冷启动只补右侧标签；热重载与主区旧叶子交给宿主还原', async () => {
    const cold = harness();
    cold.boot();
    await tick();
    assert.deepEqual(cold.ensures, [{
        type: api.QUICK_ACTIONS_VIEW_TYPE, side: 'right',
        options: { active: false, reveal: false, split: false },
    }]);
    const hot = harness({ restore: true });
    hot.boot();
    await tick();
    assert.equal(hot.ensures.length, 0);
    hot.commands.find(command => command.id === api.QUICK_ACTIONS_COMMAND.id).callback();
    await tick();
    assert.equal(hot.ensures[0].options.active, true);
    assert.equal(hot.ensures[0].options.reveal, true);
    const unloaded = harness();
    unloaded.lifecycle.forEach(callback => callback());
    unloaded.boot();
    assert.equal(unloaded.ensures.length, 0);
});

test('笔记按钮先恢复主区上下文，再执行原命令；没有笔记时禁用', async () => {
    const h = harness();
    const view = await h.mount();
    const buttons = view.contentEl.all(el => el.attrs['data-command-id'] === api.FORMAT_COMMAND.id);
    buttons[0].click();
    assert.deepEqual(h.runs, [{ id: api.FORMAT_COMMAND.id, leaf: h.mainLeaf }]);
    assert.equal(h.app.focus, false);
    h.app.file = null;
    h.mainLeaf.view.file = null;
    h.emit('file-open');
    const grid = view.contentEl.all(el => el.classes.has('ziminos-quick-note-grid'))[0];
    assert.equal(grid.children.length, 4);
    assert.ok(grid.children.every(button => button.disabled));
    h.app.file = { path: '新路径.md', basename: '新名字', extension: 'md' };
    h.mainLeaf.view.file = h.app.file;
    h.emit('rename');
    assert.ok(view.contentEl.all(el => el.classes.has('ziminos-quick-note-grid'))[0].children.every(button => button.title.includes('新路径.md')));
    await view.onClose();
    assert.equal(view.contentEl.children.length, 0);
});

test('侧栏另一篇笔记不改变主区操作对象，分散注册的同组命令合并显示', async () => {
    const h = harness();
    const view = await h.mount();
    h.app.file = { path: '侧栏笔记.md', basename: '侧栏笔记', extension: 'md' };
    h.emit('active-leaf-change');
    assert.ok(view.contentEl.all(el => el.classes.has('ziminos-quick-note-grid'))[0].children.every(button => button.title.includes('01-projects/示例/卡片.md')));
    const noteButton = view.contentEl.all(el => el.attrs['data-command-id'] === api.COPY_PATH_COMMAND.id)[0];
    noteButton.click();
    assert.equal(h.app.file, h.mainLeaf.view.file);
    view.actions[0].callback();
    assert.equal(modals.at(-1).contentEl.all(el => el.tag === 'h4' && el.text === '复盘').length, 1);
});

test('检索不丢输入焦点，固定只写配置，失败恢复并通知所有视图', async () => {
    let rejectSave;
    const h = harness({ save: () => new Promise((_resolve, reject) => { rejectSave = reject; }) });
    const view = await h.mount();
    const second = await h.mount();
    const before = h.ctx.settings.quickActionCommands;
    const ribbonBefore = h.ctx.settings.ribbonCommands;
    view.actions[0].callback();
    const settings = modals.at(-1);
    const search = settings.contentEl.all(el => el.tag === 'input')[0];
    search.value = '资源';
    search.focus();
    search.listeners.input();
    const row = settings.contentEl.all(el => el.classes.has('ziminos-quick-command-row'));
    assert.equal(row.length, 1);
    row[0].children[2].click();
    assert.ok(h.ctx.settings.quickActionCommands.includes(api.PROJECT_COMMANDS.resource.id));
    const favorites = second.contentEl.all(el => el.classes.has('ziminos-quick-grid'))[0];
    assert.equal(favorites.children.length, 9);
    assert.equal(h.runs.length, 0);
    assert.equal(search.value, '资源');
    assert.equal(search.focused, true);
    assert.equal(h.ctx.settings.ribbonCommands, ribbonBefore);
    rejectSave(new Error('disk full'));
    await tick();
    assert.deepEqual(h.ctx.settings.quickActionCommands, before);
    assert.equal(favorites.children.length, 8);
    assert.match(notices.at(-1), /已恢复原配置/);
});

test('固定成功、移除与恢复默认可持久化，未知命令不制造空按钮', async () => {
    let saves = 0;
    const h = harness({ ids: ['missing', api.PROJECT_COMMANDS.resource.id], save: async () => { saves++; } });
    const view = await h.mount();
    const favorites = view.contentEl.all(el => el.classes.has('ziminos-quick-grid'))[0];
    assert.equal(favorites.children.length, 1);
    view.actions[0].callback();
    const settings = modals.at(-1);
    const pin = settings.contentEl.all(el => el.attrs['aria-label'] === `从常用移除：${api.PROJECT_COMMANDS.resource.name}`)[0];
    pin.click();
    await tick();
    assert.deepEqual(h.ctx.settings.quickActionCommands, ['missing']);
    assert.equal(favorites.children.length, 0);
    settings.contentEl.all(el => el.text === '恢复默认组合')[0].click();
    await tick();
    assert.deepEqual(h.ctx.settings.quickActionCommands, api.DEFAULT_QUICK_ACTION_COMMANDS);
    assert.equal(saves, 2);
    assert.equal(favorites.children.length, 8);
});

test('自定义名称只接受非空文本，旧设置补空映射，原命令身份保持不变', () => {
    for (const invalid of [undefined, null, [], true, '名称']) {
        assert.deepEqual(api.normalizeQuickActionLabels(invalid), {});
    }
    assert.deepEqual(api.normalizeQuickActionLabels({ a: '  随手记  ', b: '', c: '  ', d: 3, e: {} }), { a: '随手记' });
    assert.deepEqual(api.normalizeSettings({}).quickActionLabels, {});
    const labels = api.normalizeQuickActionLabels(JSON.parse('{"__proto__":"安全文本"}'));
    assert.equal(Object.getPrototypeOf(labels), Object.prototype);
    assert.equal(Object.getOwnPropertyDescriptor(labels, '__proto__').value, '安全文本');
});

test('侧栏正文只有按钮，配置与名称编辑放在按需弹窗', async () => {
    const h = harness();
    const view = await h.mount();
    assert.equal(view.contentEl.all(el => ['h3', 'h4', 'p', 'summary', 'input'].includes(el.tag)).length, 0);
    assert.equal(view.contentEl.all(el => el.tag === 'button').length, 12);
    assert.equal(view.actions[0].title, '自定义按钮');
    h.app.file = null;
    h.mainLeaf.view.file = null;
    h.emit('file-open');
    assert.equal(view.contentEl.all(el => el.tag === 'button').length, 12);
    assert.equal(view.contentEl.all(el => el.text === '先打开一篇 Markdown 笔记').length, 0);
});

function renameDialog(view, id) {
    const button = view.contentEl.all(el => el.attrs['data-command-id'] === id)[0];
    button.listeners.contextmenu({ preventDefault() {}, stopPropagation() {} });
    menus.at(-1).items.find(item => item.title === '修改按钮名称').callback();
    return modals.at(-1);
}

function submitDialog(dialog, value) {
    dialog.contentEl.all(el => el.tag === 'input')[0].value = value;
    dialog.contentEl.all(el => el.text === '确认')[0].click();
}

test('右键改名同步全部视图，纯文本显示，重载后保留并仍执行原命令', async () => {
    let saved;
    const h = harness({ save: async () => { saved = JSON.stringify(h.ctx.settings); } });
    const view = await h.mount();
    const second = await h.mount();
    const spec = api.INSPIRATION_COMMAND;
    const originalName = spec.name;
    const ribbon = h.ctx.settings.ribbonCommands;
    const alias = '<b>随手记</b>';
    const dialog = renameDialog(view, spec.id);
    assert.equal(dialog.contentEl.all(el => el.tag === 'input')[0].value, originalName);
    submitDialog(dialog, `  ${alias}  `);
    await tick();
    for (const current of [view, second]) {
        const button = current.contentEl.all(el => el.attrs['data-command-id'] === spec.id)[0];
        assert.equal(button.children.at(-1).text, alias);
        assert.equal(button.children.at(-1).children.length, 0);
        assert.equal(button.attrs.title, originalName);
    }
    assert.equal(spec.name, originalName);
    assert.equal(h.ctx.settings.ribbonCommands, ribbon);
    const restored = api.normalizeSettings(JSON.parse(saved));
    const reloaded = await harness({ labels: restored.quickActionLabels }).mount();
    assert.equal(reloaded.contentEl.all(el => el.attrs['data-command-id'] === spec.id)[0].children.at(-1).text, alias);
    view.contentEl.all(el => el.attrs['data-command-id'] === spec.id)[0].click();
    assert.deepEqual(h.runs, [{ id: spec.id, leaf: h.mainLeaf }]);

    view.actions[0].callback();
    const settings = modals.at(-1);
    const search = settings.contentEl.all(el => el.tag === 'input')[0];
    for (const query of ['随手记', originalName]) {
        search.value = query;
        search.listeners.input();
        assert.equal(settings.contentEl.all(el => el.classes.has('ziminos-quick-command-row')).length, 1);
    }
});

test('取消改名不写设置，空白恢复原名，笔记按钮也能改名', async () => {
    let saves = 0;
    const spec = api.FORMAT_COMMAND;
    const h = harness({ labels: { [spec.id]: '排版' }, save: async () => { saves++; } });
    const view = await h.mount();
    const cancelled = renameDialog(view, spec.id);
    cancelled.contentEl.all(el => el.text === '取消')[0].click();
    await tick();
    assert.equal(saves, 0);
    assert.equal(h.ctx.settings.quickActionLabels[spec.id], '排版');
    submitDialog(renameDialog(view, spec.id), '   ');
    await tick();
    assert.equal(h.ctx.settings.quickActionLabels[spec.id], undefined);
    assert.equal(view.contentEl.all(el => el.attrs['data-command-id'] === spec.id)[0].children.at(-1).text, spec.name);
    assert.equal(saves, 1);

    const pending = renameDialog(view, spec.id);
    h.lifecycle.forEach(callback => callback());
    await tick();
    assert.ok(!modals.includes(pending));
    assert.equal(saves, 1);
});

test('改名写盘失败时恢复名称，保留按钮组合和原命令回调', async () => {
    let rejectSave;
    const spec = api.INSPIRATION_COMMAND;
    const h = harness({ labels: { [spec.id]: '灵光' }, save: () => new Promise((_resolve, reject) => { rejectSave = reject; }) });
    const view = await h.mount();
    const ids = h.ctx.settings.quickActionCommands;
    submitDialog(renameDialog(view, spec.id), '随手记');
    await tick();
    assert.equal(h.ctx.settings.quickActionLabels[spec.id], '随手记');
    rejectSave(new Error('disk full'));
    await tick();
    assert.equal(h.ctx.settings.quickActionLabels[spec.id], '灵光');
    assert.equal(h.ctx.settings.quickActionCommands, ids);
    assert.equal(view.contentEl.all(el => el.attrs['data-command-id'] === spec.id)[0].children.at(-1).text, '灵光');
    assert.equal(h.runs.length, 0);
    assert.match(notices.at(-1), /已恢复原配置/);
});
