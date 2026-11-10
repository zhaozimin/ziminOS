/**
 * [INPUT]: 依赖 node:test/assert/fs/path/url 与 esbuild，直接编译 projects/templates/baseMigration 事实源
 * [OUTPUT]: 验证导航 Emoji 状态、书籍 aliases 封面卡片、MOC 三视图、系统目录递归排除、
 *           手动模板同源、两条建书路径与初始化种子、流转零 Base 改写，以及存量 Base 的
 *           旧版识别、CRLF 保真、冲突拒写与批次失败回滚
 * [POS]: tests 的 Obsidian Bases 专项契约；高层钉用户可见的 YAML 与迁移事务，不复制生成器实现
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadModule(relativePath) {
    const result = await build({
        entryPoints: [path.join(ROOT, relativePath)],
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node20',
        write: false,
        logLevel: 'silent',
    });

    const source = result.outputFiles[0].text;
    return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

const { mocBaseBlock, mocContent, mocTemplateFile, navContent } = await loadModule(
    'src/modules/projects/templates.ts',
);
const { projectsSeed } = await loadModule('src/modules/projects/seed.ts');
const {
    applyMigrationBatch,
    isContainerMocIdentity,
    MigrationBatchError,
    planMocBaseUpgrade,
    planNavigationBaseUpgrade,
} = await loadModule('src/modules/projects/baseMigration.ts');

/** v0.22.7–v0.40.0 的 MOC 模板：项目文件与全部混入了位置判据 */
const PREVIOUS_MOC_BASE = `\`\`\`base
filters:
  and:
    - file.path != this.file.path
    - '!file.inFolder("90-system")'
properties:
  note.description:
    displayName: 概述
  note.rating:
    displayName: 评分
views:
  - type: table
    name: 项目文件
    filters:
      or:
        - up.contains(this.file.asLink())
        - file.folder == this.file.folder
    order:
      - file.name
      - description
      - rating
    sort:
      - property: rating
        direction: DESC
    columnSize:
      file.name: 170
      note.description: 421
  - type: table
    name: 附件
    filters:
      and:
        - file.inFolder(this.file.folder)
        - file.ext != "md"
    order:
      - file.name
      - file.ext
      - file.mtime
    sort:
      - property: file.mtime
        direction: DESC
  - type: table
    name: 全部
    filters:
      or:
        - up.contains(this.file.asLink())
        - file.inFolder(this.file.folder)
    order:
      - file.name
      - file.ext
      - description
      - file.mtime
    sort:
      - property: file.mtime
        direction: DESC

\`\`\``;

const MOC_BASE = `\`\`\`base
filters:
  and:
    - file.path != this.file.path
    - '!file.inFolder("90-system")'
formulas:
  kind: if(file.ext == "md", "笔记", "附件")
properties:
  note.description:
    displayName: 概述
  note.rating:
    displayName: 评分
  formula.kind:
    displayName: 类型
views:
  - type: table
    name: 全部
    filters:
      or:
        - list(up).contains(this.file.asLink())
        - and:
            - file.inFolder(this.file.folder)
            - file.ext != "md"
    order:
      - file.name
      - description
      - rating
    sort:
      - property: formula.kind
        direction: ASC
      - property: rating
        direction: DESC
  - type: table
    name: 项目文件
    filters:
      and:
        - list(up).contains(this.file.asLink())
        - file.ext == "md"
    order:
      - file.name
      - description
      - rating
    sort:
      - property: rating
        direction: DESC
    columnSize:
      file.name: 170
      note.description: 421
  - type: table
    name: 附件
    filters:
      and:
        - file.inFolder(this.file.folder)
        - file.ext != "md"
    order:
      - file.name
      - file.ext
      - file.mtime
    sort:
      - property: file.mtime
        direction: DESC

\`\`\``;

test('MOC 用一份相对上下文查询展示笔记、附件与全部内容', () => {
    assert.equal(mocBaseBlock(), MOC_BASE);
    assert.doesNotMatch(MOC_BASE, /01-projects|04-archives|link\("MOC-/);

    // 笔记看归属（up 直接指向本 MOC），附件看位置（文件夹树里的非 .md）；全部排第一个
    const views = [...MOC_BASE.matchAll(/^    name: (.+)$/gm)].map((match) => match[1]);
    assert.deepEqual(views, ['全部', '项目文件', '附件']);
    assert.doesNotMatch(MOC_BASE, /file\.folder == this\.file\.folder/);
    assert.doesNotMatch(MOC_BASE, /(?<!list\()up\.contains/);
    assert.match(MOC_BASE, /kind: if\(file\.ext == "md", "笔记", "附件"\)/);

    // 全部只显示名称、概述、评分；类型只作第一排序键，不进列
    const allView = MOC_BASE.slice(MOC_BASE.indexOf('    name: 全部'), MOC_BASE.indexOf('    name: 项目文件'));
    assert.match(allView, /    order:\n      - file\.name\n      - description\n      - rating\n    sort:/);
    assert.doesNotMatch(allView, /      - formula\.kind\n|file\.mtime/);
});

test('自动建容器与手动 MOC 模板共用同一个 Base 事实源', () => {
    const generated = mocContent({
        description: '测试项目',
        created: '2026-09-08 12:00',
        uid: 20260908120000,
        type: 'project',
        status: 'active',
    });

    assert.ok(generated.endsWith(`${MOC_BASE}\n`));
    assert.ok(mocTemplateFile().endsWith(`${MOC_BASE}\n`));
    assert.equal((mocTemplateFile().match(/\`\`\`base/g) ?? []).length, 1);
});

test('导航用 Emoji 翻译状态，书籍以 aliases 封面卡片展示', () => {
    const navigation = navContent();

    assert.match(navigation, /- '!file\.inFolder\("90-system"\)'/);
    assert.match(navigation, /status_icon: if\(status == "active", "🟢 进行中"/);
    assert.match(navigation, /status == "paused", "🟡 搁置"/);
    assert.match(navigation, /status == "done", "✅ 完成"/);
    assert.match(navigation, /status == "dropped", "⚫️ 弃"/);
    assert.equal((navigation.match(/formula\.status_icon/g) ?? []).length, 4);
    // 名称去掉 MOC- 前缀但仍链接原文件；三张表格与书籍卡片都用它
    assert.match(
        navigation,
        /moc_name: file\.asLink\(if\(file\.name\.startsWith\("MOC-"\), file\.name\.slice\(4\), file\.name\)\)/,
    );
    assert.match(navigation, /formula\.moc_name:\n    displayName: 名称/);
    assert.equal((navigation.match(/      - formula\.moc_name/g) ?? []).length, 4);

    // 正在进行中按 active 筛出，状态列只会重复表名
    const activeView = navigation.slice(navigation.indexOf('    name: 正在进行中'), navigation.indexOf('    name: 项目'));
    assert.doesNotMatch(activeView, /formula\.status_icon/);
    // 书籍卡片与表格同一条规则：去 MOC- 前缀的文件名，不再读 aliases
    assert.doesNotMatch(navigation, /book_title|aliases/);
    const bookView = navigation.slice(navigation.indexOf('  - type: cards\n    name: 书籍'));

    assert.match(bookView, /^    name: 书籍/m);
    assert.match(bookView, /  - type: cards/);
    assert.match(bookView, /      - formula\.moc_name/);
    assert.doesNotMatch(bookView, /      - file\.name/);
    assert.match(bookView, /    image: note\.cover/);
    assert.match(bookView, /    imageAspectRatio: 1\.35/);
    assert.match(bookView, /    imageFit: contain/);
    assert.match(bookView, /    cardSize: 200/);

    const projectView = navigation.slice(
        navigation.indexOf('    name: 项目'),
        navigation.indexOf('    name: 领域'),
    );

    assert.match(projectView, /    sort:\n      - property: formula\.status_icon\n        direction: DESC/);

    const areaView = navigation.slice(navigation.indexOf('    name: 领域'), navigation.indexOf('    name: 书籍'));
    assert.doesNotMatch(areaView, /formula\.status_icon/);
});

test('两条建书路径都写入真实书名，初始化导航与运行时同源', () => {
    const manual = readFileSync(path.join(ROOT, 'src/modules/books/createBook.ts'), 'utf8');
    const automatic = readFileSync(path.join(ROOT, 'src/modules/books/readBook.ts'), 'utf8');
    const seededNavigation = projectsSeed().notes.find((note) => note.path.endsWith('/导航.md'));
    const bookMoc = mocContent({
        description: '测试书籍',
        created: '2026-09-15 12:00',
        uid: 9787115564672,
        type: 'book',
        status: 'active',
        aliases: ['卡片笔记写作法'],
    });

    assert.match(manual, /const trueName = unwrapBookTitle\(nameInput\.trim\(\)\)/);
    assert.match(manual, /if \(!trueName\)/);
    assert.match(manual, /create\(\{ name, aliases: \[trueName\], description/);
    assert.match(automatic, /const trueTitle = fullTitle \|\| detail\.title/);
    assert.match(automatic, /aliases: \[trueTitle\]/);
    assert.match(bookMoc, /aliases:\n  - "卡片笔记写作法"/);
    assert.equal(seededNavigation?.content, navContent());
});

test('项目流转只移动容器与更新状态，不改写 MOC Base 代码', () => {
    const source = readFileSync(
        path.join(ROOT, 'src/modules/projects/transitions.ts'),
        'utf8',
    );

    assert.match(source, /renameFile\(plan\.projectFolder, plan\.targetProjectPath\)/);
    assert.match(source, /processFrontMatter\(movedMoc/);
    assert.doesNotMatch(source, /updateMocBaseFolderPath|basePathChanged/);
    assert.doesNotMatch(source, /file\.folder == \$\{JSON\.stringify/);
    assert.doesNotMatch(source, /没有找到需要更新的 file\.folder/);
});

test('上一版 MOC 模板升级为归属/位置分开的检索，用户拖过的列宽跟着视图名走', () => {
    const widened = PREVIOUS_MOC_BASE
        .replace('      file.name: 170\n      note.description: 421', '      file.name: 145\n      note.description: 412');
    const result = planMocBaseUpgrade(`---\ntype: project\n---\n\n${widened}\n`);

    assert.equal(result.status, 'change');
    assert.equal(result.action, '替换旧 Base');
    assert.equal(result.afterBlock, MOC_BASE.replace('      file.name: 170\n      note.description: 421', '      file.name: 145\n      note.description: 412'));

    // 当前模板只动了显示偏好：视为已是最新，不碰
    const tweaked = MOC_BASE
        .replace('      file.name: 170', '      file.name: 200')
        .replace('      - property: rating\n        direction: DESC', '      - property: file.name\n        direction: ASC');
    assert.deepEqual(planMocBaseUpgrade(tweaked), { status: 'unchanged' });

    // 全部视图也被拖过列宽时，补在那一视图末尾
    const allSized = PREVIOUS_MOC_BASE.replace(
        '      - property: file.mtime\n        direction: DESC\n\n```',
        '      - property: file.mtime\n        direction: DESC\n    columnSize:\n      file.name: 300\n\n```',
    );
    const allResult = planMocBaseUpgrade(allSized);
    assert.match(allResult.afterBlock, /    name: 全部[\s\S]*?    columnSize:\n      file\.name: 300\n  - type: table\n    name: 项目文件/);
});

test('§87 首版的全部视图：仍是模板默认显示就跟着更新，用户调过就不动', () => {
    // §87 首版：检索与当前相同，全部显示类型与修改时间、按修改时间排
    const firstDisplay = MOC_BASE.replace(
        '      - file.name\n      - description\n      - rating\n    sort:\n      - property: formula.kind\n        direction: ASC\n      - property: rating\n        direction: DESC',
        '      - file.name\n      - formula.kind\n      - description\n      - file.mtime\n    sort:\n      - property: formula.kind\n        direction: ASC\n      - property: file.mtime\n        direction: DESC',
    );

    assert.notEqual(firstDisplay, MOC_BASE);

    const sized = firstDisplay.replace('      file.name: 170', '      file.name: 145');
    const upgraded = planMocBaseUpgrade(sized);

    assert.equal(upgraded.status, 'change');
    assert.equal(upgraded.afterBlock, MOC_BASE.replace('      file.name: 170', '      file.name: 145'));

    // 用户在首版上自己改过排序：显示偏好是他的，不覆盖
    const userSorted = firstDisplay.replace(
        '      - property: file.mtime\n        direction: DESC\n  - type: table\n    name: 项目文件',
        '      - property: file.name\n        direction: ASC\n  - type: table\n    name: 项目文件',
    );
    assert.deepEqual(planMocBaseUpgrade(userSorted), { status: 'unchanged' });
});

test('存量硬编码 MOC Base 只在检索条件吻合旧模板时升级', () => {
    const legacy = `\`\`\`base
filters:
  and:
    - file.path != this.file.path
properties:
  note.description:
    displayName: 概述
  note.rating:
    displayName: 评分
views:
  - type: table
    name: 项目文件
    filters:
      or:
        - up == link("MOC-写本书")
        - file.folder == "01-projects/写本书"
    order:
      - file.name
      - description
      - rating
    sort:
      - property: rating
        direction: DESC
    columnSize:
      file.name: 170
      note.description: 421

\`\`\``;
    const result = planMocBaseUpgrade(`---\ntype: project\n---\n\n正文\n\n${legacy}\n`);

    assert.equal(result.status, 'change');
    assert.equal(result.action, '替换旧 Base');
    assert.ok(result.content.includes(MOC_BASE));
    assert.doesNotMatch(result.content, /01-projects\/写本书|up == link/);

    // 排序、列顺序、列宽只是显示偏好：改过它们的旧模板照样升级
    const resorted = planMocBaseUpgrade(
        legacy
            .replace('    sort:\n      - property: rating', '    sort:\n      - property: file.name\n        direction: DESC\n      - property: rating')
            .replace('      - rating\n', '')
            .replace('file.name: 170', 'file.name: 138'),
    );
    assert.equal(resorted.status, 'change');
    assert.match(resorted.content, /    name: 项目文件[\s\S]*?      file\.name: 138/);

    // 检索条件改过才是自定义
    const custom = planMocBaseUpgrade(legacy.replace('        - file.folder == "01-projects/写本书"', '        - file.inFolder("01-projects/写本书")'));
    assert.deepEqual(custom, { status: 'conflict', reason: 'Base 含有自定义内容，不会自动覆盖' });
});

test('单视图相对 Base 可升级，无 Base 的 CRLF MOC 只追加代码块并保留行尾', () => {
    const oneView = PREVIOUS_MOC_BASE.replace(/\n  - type: table\n    name: 附件[\s\S]*\n\n\`\`\`$/, '\n\n```');
    const replaceResult = planMocBaseUpgrade(oneView);

    assert.equal(replaceResult.status, 'change');
    assert.equal(replaceResult.action, '替换旧 Base');
    assert.equal(replaceResult.content, MOC_BASE);

    const appendResult = planMocBaseUpgrade('---\r\ntype: area\r\n---\r\n\r\n正文\r\n');

    assert.equal(appendResult.status, 'change');
    assert.equal(appendResult.action, '补上缺失 Base');
    assert.match(appendResult.content, /\r\n```base\r\n/);
    assert.doesNotMatch(appendResult.content, /(?<!\r)\n/);
});

test('导航只认旧系统模板，当前版本幂等，自定义与多 Base 进入冲突', () => {
    const legacyNavBase = `\`\`\`base
properties:
  note.description:
    displayName: 概述
  note.status:
    displayName: 状态
views:
  - type: table
    name: 正在进行中
    filters:
      and:
        - status == "active"
    order:
      - file.name
      - description
      - status
  - type: table
    name: 项目
    filters:
      and:
        - type == "project"
    order:
      - file.name
      - description
      - status
  - type: table
    name: 领域
    filters:
      and:
        - type == "area"
    order:
      - file.name
      - description
      - status
  - type: table
    name: 书籍
    filters:
      and:
        - type == "book"
    order:
      - file.name
      - description
      - status

\`\`\``;
    const migrated = planNavigationBaseUpgrade(`自定义导语\n\n${legacyNavBase}\n`);
    // v0.40.0 去前缀那一版：表格已用 moc_name，书籍卡片仍读 aliases
    const mocNameNavigation = navContent()
        .replace('  moc_name:', '  book_title: file.asLink(if(aliases.isEmpty(), file.name, list(aliases)[0]))\n  moc_name:')
        .replace(
            '  formula.moc_name:\n    displayName: 名称\n',
            '  formula.book_title:\n    displayName: 书名\n  formula.moc_name:\n    displayName: 名称\n',
        )
        .replace(
            '        - type == "book"\n    order:\n      - formula.moc_name\n',
            '        - type == "book"\n    order:\n      - formula.book_title\n',
        );
    const mocNameMigration = planNavigationBaseUpgrade(mocNameNavigation);
    // v0.34.1–v0.40.0 的导航：表格陈列带 MOC- 前缀的文件名，正在进行中带状态列
    const bookTitleNavigation = mocNameNavigation
        .replace(/  moc_name: .*\n/, '')
        .replace('  formula.moc_name:\n    displayName: 名称\n', '')
        .replaceAll('      - formula.moc_name\n', '      - file.name\n')
        .replace(
            '        - status == "active"\n    order:\n      - file.name\n      - description\n',
            '        - status == "active"\n    order:\n      - file.name\n      - description\n      - formula.status_icon\n',
        );
    const bookTitleMigration = planNavigationBaseUpgrade(bookTitleNavigation);
    const fileNameTableNavigation = bookTitleNavigation
        .replace('  book_title: file.asLink(if(aliases.isEmpty(), file.name, list(aliases)[0]))\n', '')
        .replace('  formula.book_title:\n    displayName: 书名\n', '')
        .replace('  - type: cards\n    name: 书籍', '  - type: table\n    name: 书籍')
        .replace('      - formula.book_title\n', '      - file.name\n')
        .replace('    sort:\n      - property: formula.status_icon\n        direction: DESC\n', '')
        .replace('    image: note.cover\n    imageAspectRatio: 1.35\n    imageFit: contain\n    cardSize: 200\n', '');
    const userCardNavigation = `\`\`\`base
filters:
  and:
    - file.folder != "90-system"
formulas:
  status_icon: if(status == "active", "🟢 进行中", if(status == "paused", "🟡 搁置", if(status == "done", "✅ 完成", if(status == "dropped", "⚫️ 弃", if(status.isEmpty(), "", "⚠️ " + status)))))
properties:
  note.description:
    displayName: 概述
  note.status:
    displayName: 状态
  formula.status_icon:
    displayName: 状态
views:
  - type: table
    name: 正在进行中
    filters:
      and:
        - status == "active"
    order:
      - file.name
      - description
      - formula.status_icon
  - type: table
    name: 项目
    filters:
      and:
        - type == "project"
    order:
      - file.name
      - description
      - formula.status_icon
    sort:
      - property: formula.status_icon
        direction: DESC
  - type: table
    name: 领域
    filters:
      and:
        - type == "area"
    order:
      - file.name
      - description
  - type: cards
    name: 书籍
    filters:
      and:
        - type == "book"
    order:
      - file.name
      - description
      - formula.status_icon
    image: note.cover
    imageAspectRatio: 1.35
    imageFit: contain
    cardSize: 200

\`\`\``;
    const tableMigration = planNavigationBaseUpgrade(fileNameTableNavigation);
    const cardMigration = planNavigationBaseUpgrade(userCardNavigation);

    assert.equal(migrated.status, 'change');
    assert.equal(migrated.action, '升级导航 Base');
    assert.ok(migrated.content.startsWith('自定义导语\n\n'));
    assert.ok(migrated.content.includes('formula.status_icon'));
    assert.equal(mocNameMigration.status, 'change');
    assert.equal(mocNameMigration.content, navContent());
    assert.notEqual(bookTitleNavigation, navContent());
    assert.equal(bookTitleMigration.status, 'change');
    assert.equal(bookTitleMigration.content, navContent());
    assert.equal(tableMigration.status, 'change');
    assert.equal(cardMigration.status, 'change');
    assert.ok(cardMigration.content.includes('formula.moc_name'));
    assert.ok(cardMigration.content.includes('  - type: cards\n    name: 书籍'));
    assert.ok(cardMigration.content.includes('    imageAspectRatio: 1.35'));
    assert.deepEqual(planNavigationBaseUpgrade(navContent()), { status: 'unchanged' });

    const custom = planNavigationBaseUpgrade(legacyNavBase.replace('      - status', '      - file.mtime'));
    assert.equal(custom.status, 'conflict');
    assert.equal(planMocBaseUpgrade(`${MOC_BASE}\n\n${MOC_BASE}`).status, 'conflict');
});

test('批次第二项失败时逆序恢复已触达文件，并保留完整回滚失败清单', async () => {
    const items = [
        { path: 'A.md', before: '旧 A', after: '新 A' },
        { path: 'B.md', before: '旧 B', after: '新 B' },
    ];
    const state = new Map(items.map((item) => [item.path, item.before]));

    await assert.rejects(
        applyMigrationBatch(
            items,
            async (item) => {
                state.set(item.path, item.after);

                // 模拟底层已经写入磁盘、Promise 随后才拒绝的歧义失败；当前项也必须进回滚栈。
                if (item.path === 'B.md') throw new Error('模拟写入失败');
            },
            async (item) => {
                const current = state.get(item.path);

                if (current === item.before) return;
                if (current !== item.after) throw new Error('内容冲突');

                state.set(item.path, item.before);
            },
            (item) => item.path,
        ),
        (error) => {
            assert.ok(error instanceof MigrationBatchError);
            assert.match(error.message, /本轮已修改文件已全部回滚/);
            assert.deepEqual(error.rollbackFailures, []);

            return true;
        },
    );

    assert.deepEqual([...state.entries()], [['A.md', '旧 A'], ['B.md', '旧 B']]);
});

test('迁移命令只由主装配显式注册，状态流转不会偷偷调用它', () => {
    const commands = readFileSync(path.join(ROOT, 'src/core/commands.ts'), 'utf8');
    const main = readFileSync(path.join(ROOT, 'src/main.ts'), 'utf8');
    const migration = readFileSync(path.join(ROOT, 'src/modules/projects/migrateBases.ts'), 'utf8');
    const transitions = readFileSync(path.join(ROOT, 'src/modules/projects/transitions.ts'), 'utf8');

    assert.match(commands, /id: 'migrate-moc-bases'/);
    assert.match(commands, /name: '升级存量 MOC 数据库'/);
    assert.match(main, /registerBaseMigrationCommand\(ctx\)/);
    assert.match(migration, /--- 当前/);
    assert.match(migration, /\+\+\+ 升级后/);
    assert.match(migration, /current !== change\.before/);
    assert.match(migration, /applyMigrationBatch\(/);
    assert.doesNotMatch(transitions, /migrateBases|BaseMigration|planMocBaseUpgrade/);
});

test('批次回滚不会因第一项恢复失败而吞掉其余失败清单', async () => {
    const items = [{ path: 'A.md' }, { path: 'B.md' }];

    await assert.rejects(
        applyMigrationBatch(
            items,
            async (item) => {
                if (item.path === 'B.md') throw new Error('停止写入');
            },
            async (item) => {
                throw new Error(`无法恢复 ${item.path}`);
            },
            (item) => item.path,
        ),
        (error) => {
            assert.ok(error instanceof MigrationBatchError);
            assert.deepEqual(error.rollbackFailures, [
                'B.md（无法恢复 B.md）',
                'A.md（无法恢复 A.md）',
            ]);

            return true;
        },
    );
});

test('存量扫描只认项目领域书籍容器，不把人脉 MOC 当成缺 Base 的项目 MOC', () => {
    assert.equal(isContainerMocIdentity('MOC-写本书', '写本书', 'project'), true);
    assert.equal(isContainerMocIdentity('老项目', '老项目', 'project'), true);
    assert.equal(isContainerMocIdentity('MOC-原则', '原则', 'area'), true);
    assert.equal(isContainerMocIdentity('MOC-穷查理宝典', '穷查理宝典', 'book'), true);
    assert.equal(isContainerMocIdentity('MOC-人脉', '人脉', 'area'), false);
    assert.equal(isContainerMocIdentity('MOC-客户', '客户', 'area'), false);
    assert.equal(isContainerMocIdentity('人脉MOC', '人脉', 'area'), false);
    assert.equal(isContainerMocIdentity('客户MOC', '客户', 'area'), false);
    assert.equal(isContainerMocIdentity('MOC-普通卡片', '普通卡片', 'note'), false);
});
