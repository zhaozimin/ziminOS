/**
 * [INPUT]: 依赖 esbuild 的打包能力、builtin-modules 的 Node 内建模块清单、process 的命令行参数
 * [OUTPUT]: 把 src/main.ts 打包为 CommonJS 单文件，直接落位到 vault 内的插件目录
 * [POS]: 构建链的唯一出口。产物路径即 vault 模板区的插件目录，构建完成即就位，
 *        因此不需要任何同步脚本；dev 模式常驻 watch，production 模式一次性构建并退出
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import esbuild from 'esbuild';
import process from 'process';
import builtins from 'builtin-modules';

// 产物顶部说明：提醒读者这是构建产物，源码在 src/
const banner = `/*
本文件由 esbuild 自 src/ 目录打包生成，请勿直接编辑。
需要修改行为请改 src/ 下的 TypeScript 源码，然后运行 npm run build。
*/
`;

// 命令行第三个参数为 production 时进入生产构建
const isProduction = process.argv[2] === 'production';

// 构建产物直接写入 vault 模板区的插件目录，学员拿到仓库即可用
const OUT_FILE = 'vault/.obsidian/plugins/ziminos/main.js';

const context = await esbuild.context({
    banner: { js: banner },
    entryPoints: ['src/main.ts'],
    bundle: true,
    // Obsidian 运行时已提供的模块与 Node 内建模块一律不打包
    external: [
        'obsidian',
        'electron',
        '@codemirror/*',
        '@lezer/*',
        ...builtins,
    ],
    format: 'cjs',
    target: 'es2018',
    logLevel: 'info',
    // 刻意不压缩：脚本驱动的产品要让使用者能读懂、能改
    minify: false,
    sourcemap: isProduction ? false : 'inline',
    treeShaking: true,
    outfile: OUT_FILE,
});

if (isProduction) {
    await context.rebuild();
    await context.dispose();
    process.exit(0);
} else {
    await context.watch();
}
