/**
 * [INPUT]: 依赖 node:test/assert/fs/path/url 与 esbuild，直接编译并载入 src 中的纯 TypeScript 模块
 * [OUTPUT]: 提供 npm test 的审计回归集，覆盖版本镜像、ISBN 校验、日期严格性、
 *           划线身份与批次归并、设置验形、外观配置保护、换行符保真、桌面数据库选择、
 *           项目回滚、Gitee 安装入口与作者名片同构、公开源码隐私边界与移动端 Node 边界，
 *           并在专业版源码存在时额外覆盖出库单的分隔符往返
 * [POS]: tests 的唯一可执行入口；只验证公开行为与关键平台边界，不复制业务实现
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadTypeScript(relativePath, options = {}) {
    const plugins = options.stubObsidian
        ? [
              {
                  name: 'obsidian-test-stub',
                  setup(builder) {
                      builder.onResolve({ filter: /^obsidian$/ }, () => ({
                          path: 'obsidian',
                          namespace: 'test-stub',
                      }));
                      builder.onLoad({ filter: /.*/, namespace: 'test-stub' }, () => ({
                          contents: "import moment from 'moment'; export { moment };",
                          loader: 'js',
                          resolveDir: ROOT,
                      }));
                  },
              },
          ]
        : [];
    const result = await build({
        entryPoints: [path.join(ROOT, relativePath)],
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node20',
        write: false,
        logLevel: 'silent',
        plugins,
    });
    const source = result.outputFiles[0].text;

    return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

const { isbnUid } = await loadTypeScript('src/modules/books/isbn.ts');
const { formatMarkdown } = await loadTypeScript('src/core/markdownStyle.ts');
const { insertIntoSection, toggleTaskLine } = await loadTypeScript('src/core/markdown.ts');
const { coalesceHighlights, normalizedHighlightKey } = await loadTypeScript(
    'src/modules/books/highlightIdentity.ts',
);
const { dayText } = await loadTypeScript('src/core/time.ts', { stubObsidian: true });
const { DEFAULT_SETTINGS, normalizeSettings } = await loadTypeScript('src/core/types.ts');
const { setSnippetEnabled } = await loadTypeScript('src/modules/appearance/snippets.ts');

test('package 版本是唯一事实源，manifest 镜像已同步', () => {
    const packageJson = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const manifest = JSON.parse(
        readFileSync(path.join(ROOT, 'vault/.obsidian/plugins/ziminos/manifest.json'), 'utf8'),
    );

    assert.equal(manifest.version, packageJson.version);
});

test('README 与安装契约共同指向 Gitee 唯一部署源', () => {
    const readme = readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    const skill = readFileSync(path.join(ROOT, 'skill/SKILL.md'), 'utf8');
    const skillUrl = 'https://gitee.com/ziminzhao/zimin-os-v1/blob/main/skill/SKILL.md';
    const cloneUrl = 'https://gitee.com/ziminzhao/zimin-os-v1.git';
    const retiredGitHubUrl = 'https://github.com/zhaozimin/ziminOS';

    assert.ok(readme.includes(skillUrl));
    assert.ok(skill.includes(`git clone --depth 1 "${cloneUrl}"`));
    assert.equal(readme.includes(retiredGitHubUrl), false);
    assert.equal(skill.includes(retiredGitHubUrl), false);
});

test('作者名片把 Gitee 主页放在中国大陆分组', () => {
    const source = readFileSync(path.join(ROOT, 'src/modules/about/view.ts'), 'utf8');
    const mainlandStart = source.indexOf("label: '中国大陆'");
    const mainlandEnd = source.indexOf('],\n    },', mainlandStart);

    assert.notEqual(mainlandStart, -1);
    assert.notEqual(mainlandEnd, -1);

    const mainland = source.slice(mainlandStart, mainlandEnd);
    const giteeIndex = mainland.indexOf("name: 'Gitee'");
    const bilibiliIndex = mainland.indexOf("name: '哔哩哔哩'");

    assert.notEqual(giteeIndex, -1);
    assert.match(mainland, /url: 'https:\/\/gitee\.com\/ziminzhao'/);
    assert.match(mainland, /path: GITEE_PATH, color: '#C71D23'/);
    assert.ok(giteeIndex < bilibiliIndex);
});

test('公开源码隔离运行时凭据与本机路径', () => {
    const rootIgnore = readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    const vaultIgnore = readFileSync(path.join(ROOT, 'vault/.obsidian/.gitignore'), 'utf8');
    const specifications = [
        readFileSync(path.join(ROOT, 'docs/设计规格书.md'), 'utf8'),
        readFileSync(path.join(ROOT, 'docs/设计规格书-V2.md'), 'utf8'),
    ].join('\n');

    for (const rule of [
        '/vault/.obsidian/workspace*.json',
        '/vault/.obsidian/plugins/ziminos/data.json',
        '/vault/.obsidian/plugins/ziminos/holiday-cache.json',
        '/vault/.obsidian/plugins/ziminos/recent-files.json',
        '/vault/.obsidian/plugins/ziminos/cursor-positions.json',
        '/vault/.obsidian/plugins/dataview/data.json',
    ]) {
        assert.ok(rootIgnore.includes(rule), `源码忽略规则缺失：${rule}`);
    }
    for (const rule of [
        'workspace*.json',
        'plugins/ziminos/data.json',
        'plugins/ziminos/holiday-cache.json',
        'plugins/ziminos/recent-files.json',
        'plugins/ziminos/cursor-positions.json',
        'plugins/dataview/data.json',
    ]) {
        assert.ok(vaultIgnore.includes(rule), `部署库隐私规则缺失：${rule}`);
    }

    assert.doesNotMatch(specifications, /\/(?:Users|Volumes|private\/tmp)\//);
});

test('ISBN-13 只接受正确前缀与校验位', () => {
    assert.equal(isbnUid('978-7-115-56467-2'), 9787115564672);
    assert.equal(isbnUid('9787115564673'), null);
    assert.equal(isbnUid('1234567890128'), null);
});

test('ISBN-10 先验真再无损换成 ISBN-13', () => {
    assert.equal(isbnUid('0-306-40615-2'), 9780306406157);
    assert.equal(isbnUid('0-8044-2957-X'), 9780804429573);
    assert.equal(isbnUid('0-306-40615-3'), null);
});

test('CRLF 笔记整理后仍通篇使用 CRLF', () => {
    const input = '---\r\ntitle: test\r\n---\r\n正文English\r\n';
    const output = formatMarkdown(input, ['cjk-space']);

    assert.match(output, /正文 English/);
    assert.equal(output.replaceAll('\r\n', '').includes('\n'), false);
    assert.equal(output.includes('\r\n'), true);
});

test('传统 CR 笔记整理后不被混成 LF', () => {
    const output = formatMarkdown('中文English\r下一行', ['cjk-space']);

    assert.equal(output, '中文 English\r下一行');
});

test('小节写入与任务翻转都保留 CRLF', () => {
    const inserted = insertIntoSection('## 记录\r\n-\r\n', '## 记录', '- [ ] 跟进');
    const toggled = toggleTaskLine(inserted, 1, false);

    assert.equal(inserted.replaceAll('\r\n', '').includes('\n'), false);
    assert.equal(toggled, '## 记录\r\n- [x] 跟进\r\n');
});

test('同批次重复划线合并想法，不被先到的空记录吞掉', () => {
    const highlights = coalesceHighlights([
        { chapter: '', text: '同 一条划线', thoughts: [] },
        { chapter: '第一章', text: '**同一条划线**', thoughts: ['后到的想法'] },
        { chapter: '第二章', text: '同一条划线', thoughts: ['后到的想法'] },
    ]);

    assert.deepEqual(highlights, [
        { chapter: '第一章', text: '同 一条划线', thoughts: ['后到的想法'] },
    ]);
});

test('划线身份只忽略成对强调与空白，不删除正文语义字符', () => {
    assert.equal(normalizedHighlightKey('**== x=1 ==**'), normalizedHighlightKey('x=1'));
    assert.notEqual(normalizedHighlightKey('x=1'), normalizedHighlightKey('x1'));
    assert.notEqual(normalizedHighlightKey('a_b'), normalizedHighlightKey('ab'));
    assert.notEqual(normalizedHighlightKey('约等于~10'), normalizedHighlightKey('约等于10'));

    assert.equal(
        coalesceHighlights([
            { chapter: '', text: 'x=1', thoughts: [] },
            { chapter: '', text: '**x=1**', thoughts: ['同一条的想法'] },
            { chapter: '', text: 'x1', thoughts: [] },
        ]).length,
        2,
    );
});

test('日期前缀只接受真实存在的日期', () => {
    assert.equal(dayText('2028-02-29T12:00:00'), '2028-02-29');
    assert.equal(dayText('2026-02-29'), null);
    assert.equal(dayText('2026-13-01'), null);
    assert.equal(dayText(new Date(Number.NaN)), null);
    assert.equal(dayText(Number.POSITIVE_INFINITY), null);
});

test('全部规则关闭时逐字节原样返回', () => {
    const input = '\ufeff中文English\r\n\r\n';

    assert.equal(formatMarkdown(input, []), input);
});

test('持久化设置在进入运行时前逐字段验形', () => {
    const normalized = normalizeSettings({
        autoUpdated: 'yes',
        clientSources: null,
        wereadCookie: 42,
        inspirationInsertPosition: 'somewhere',
        bookTagCount: 99,
        ribbonCommands: null,
        formatRules: [],
        projectFolder: '',
    });

    assert.equal(normalized.autoUpdated, DEFAULT_SETTINGS.autoUpdated);
    assert.equal(normalized.clientSources, DEFAULT_SETTINGS.clientSources);
    assert.equal(normalized.wereadCookie, DEFAULT_SETTINGS.wereadCookie);
    assert.equal(normalized.inspirationInsertPosition, DEFAULT_SETTINGS.inspirationInsertPosition);
    assert.equal(normalized.bookTagCount, DEFAULT_SETTINGS.bookTagCount);
    assert.deepEqual(normalized.ribbonCommands, DEFAULT_SETTINGS.ribbonCommands);
    assert.deepEqual(normalized.formatRules, []);
    assert.equal(normalized.projectFolder, '');
});

test('损坏的 appearance.json 被拒绝，不覆盖用户外观配置', async () => {
    let writes = 0;
    const app = {
        vault: {
            configDir: '.obsidian',
            adapter: {
                exists: async () => true,
                read: async () => '{ invalid json',
                write: async () => {
                    writes += 1;
                },
            },
        },
    };

    await assert.rejects(setSnippetEnabled(app, '【测试】片段', true), /无法读取外观配置/);
    assert.equal(writes, 0);
});

test('本机书源不在模块顶层静态引入 Node 内建模块', () => {
    for (const relativePath of [
        'src/modules/books/sourceAppleBooks.ts',
        'src/modules/books/sourceKindle.ts',
    ]) {
        const source = readFileSync(path.join(ROOT, relativePath), 'utf8');

        assert.doesNotMatch(source, /from ['"](?:fs|path|child_process|os)['"]/);
        assert.ok(source.indexOf('Platform.isDesktopApp') < source.indexOf("require('"));
    }
});

test('可用书源漏匹配时逐一交代，不伪装成没有划线', () => {
    const source = readFileSync(path.join(ROOT, 'src/modules/books/sources.ts'), 'utf8');
    const unmatchedBranches = source.match(/hits\.push\(unmatchedHit\(/g) ?? [];

    assert.equal(unmatchedBranches.length, 3);
    assert.match(source, /没有匹配到这本书/);
});

test('三条读书异步命令统一收口异常，取数提示失败也会关闭', () => {
    const source = readFileSync(path.join(ROOT, 'src/modules/books/readBook.ts'), 'utf8');

    assert.match(source, /runBookCommand\(\(\) => readBook/);
    assert.match(source, /runBookCommand\(\(\) => syncCurrentBook/);
    assert.match(source, /runBookCommand\(async \(\) =>/);
    assert.match(source, /finally\s*{[^}]*pulling\.hide\(\)/s);
});

test('苹果图书从新到旧验目标表，不再读取目录中的任意数据库', () => {
    const source = readFileSync(
        path.join(ROOT, 'src/modules/books/sourceAppleBooks.ts'),
        'utf8',
    );

    assert.match(source, /statSync\(path\)\.mtimeMs/);
    assert.match(source, /sqlite_master/);
    assert.doesNotMatch(source, /return\s+found\.length\s+\?[^;]*found\[0\]/);
});

test('项目流转异常后以源目标路径事实决定回滚', () => {
    const source = readFileSync(
        path.join(ROOT, 'src/modules/projects/transitions.ts'),
        'utf8',
    );

    assert.match(source, /const sourceEntry = .*sourceProjectPath/);
    assert.match(source, /const targetEntry = .*targetProjectPath/);
    assert.match(source, /trace\.frontmatterVisited = true/);
    assert.match(source, /trace\.basePathChanged = true/);
    assert.doesNotMatch(source, /interface TransitionProgress/);
});

const manifestPath = path.join(ROOT, 'src/modules/eternal/manifest.ts');

if (existsSync(manifestPath)) {
    const { manifestLine, parseManifestLine } = await loadTypeScript('src/modules/eternal/manifest.ts');

    test('出库单项目名与路径含可见分隔符时仍能无损往返', () => {
        const entry = {
            done: false,
            stamp: '2026-08-18 09:30',
            kindLabel: '项目',
            name: '西风 · 庄园',
            folderPath: '70-archive/西风 · 庄园',
            uid: '20260818093000',
        };

        assert.deepEqual(parseManifestLine(manifestLine(entry)), entry);
        assert.equal(parseManifestLine('- [ ] 一条没有 UID 的手写备注'), null);
    });
}
