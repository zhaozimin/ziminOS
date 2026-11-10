/**
 * [INPUT]: 依赖 node:test/assert、esbuild 与真实容器创建/转换入口，宿主替身只提供文件与问答。
 * [OUTPUT]: 验证新建 active、六向迁移、归属三选项、取消、防覆盖、并发与回滚，保留原文和引用。
 * [POS]: 容器分类行为回归；直接编译生产源码，故障注入发生在真实事务边界。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const require = createRequire(import.meta.url);
const notices = [];
globalThis.__conversionNotices = notices;
const stub = `
export { default as moment } from 'moment';
export class TFile { static [Symbol.hasInstance](x) { return x?.kind === 'file'; } }
export class TFolder { static [Symbol.hasInstance](x) { return x?.kind === 'folder'; } }
export class MarkdownView {}
export class Notice { constructor(text) { globalThis.__conversionNotices.push(text); } }
export class Modal { constructor(app) { this.app = app; } open() { this.app.preview(this); } }
export class ButtonComponent {}
export const normalizePath = text => text;
export class Vault { static recurseChildren(folder, visit) {
    for (const child of folder.children) { visit(child); if (child.kind === 'folder') this.recurseChildren(child, visit); }
} }
export function parseYaml(text) {
    const result = {};
    for (const line of text.split(/\\r?\\n/)) {
        const match = /^([A-Za-z_]+):\\s*(.*)$/.exec(line);
        if (!match) continue;
        const [,key,value] = match;
        if (Object.hasOwn(result,key)) throw Error('重复键');
        try { result[key] = JSON.parse(value); } catch { result[key] = value; }
    }
    return result;
}
export const stringifyYaml = value => Object.entries(value).map(([k,v]) => k+': '+JSON.stringify(v)).join('\\n')+'\\n';
`;
const result = await build({ stdin: {
    contents: `export * from './src/modules/projects/convertContainer'; export * from './src/modules/projects/createContainer'; export * from './src/modules/projects/renameContainer'; export * from './src/core/markdownProperties';`,
    resolveDir: process.cwd(),
}, bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'silent', plugins: [{ name: 'host', setup(builder) {
    builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: 'host', namespace: 'stub' }));
    builder.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: stub, resolveDir: process.cwd() }));
    builder.onResolve({ filter: /core\/modals$/ }, () => ({ path: 'choices', namespace: 'input' }));
    builder.onLoad({ filter: /.*/, namespace: 'input' }, () => ({ contents: `
        export class TextInputModal { constructor(app,options) { this.app=app; this.options=options; }
            async openAndGetValue() { return this.app.inputs.shift() ?? null; } }
        export class ChoiceModal { constructor(app,options) { this.app=app; this.options=options; }
            async openAndGetChoice() { this.app.questions.push(this.options); const answer=this.app.answers.shift();
                return answer == null ? null : this.options.items[answer]; } }
    ` }));
} }] });
const module = { exports: {} };
new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,require);
const m = module.exports;
const roots = { project:'01-projects', area:'02-areas', resource:'03-resources' };
function fixture(type='area', options={}) {
    notices.length=0;
    const files=new Map(), operations=[];
    const makeFolder = path => { const f={kind:'folder',path,name:path.split('/').at(-1),children:[]}; files.set(path,f); return f; };
    for (const root of [...Object.values(roots),'04-archives']) makeFolder(root);
    const source = options.root ?? roots[type];
    const folder=makeFolder(source+'/转换样本');
    function add(path,content) {
        const name=path.split('/').at(-1);
        const f={kind:'file',path,name,basename:name.slice(0,-3),extension:'md',content};
        files.set(path,f);
        if(path.startsWith(folder.path+'/')) { folder.children.push(f); f.parent=folder; }
        return f;
    }
    const moc=add(folder.path+'/'+(options.legacy?'转换样本':'MOC-转换样本')+'.md',
        ['---','# 保留属性注释','aliases: "原别名"','description: "原始概述"','UID: 123456789','created: "2026-01-02 03:04:05"',
        'custom: "原值"','type: '+type,...(options.noStatus?[]:['status: active']),...(options.extra??[]),'---','','正文：一个字也不能改。','',
        '```base','filters:','  - file.folder == "'+folder.path+'"','```',''].join(options.crlf?'\r\n':'\n'));
    const card=add(folder.path+'/卡片.md','---\nup: "[['+moc.path.slice(0,-3)+'|转换样本]]"\n---\n\n卡片正文');
    const reference=add('其他.md','[['+moc.path.slice(0,-3)+'#结论|保留别名]]');
    let active=moc;
    const app={
        inputs:[],answers:[],questions:[],preview:modal=>modal.resolveResult(true),
        workspace:{getActiveFile:()=>active,iterateAllLeaves(){},getLeaf:()=>({openFile:async()=>{}})},
        metadataCache:{
            getFirstLinkpathDest:(link,source)=>{
                const decoded=decodeURIComponent(link).replace(/^\//,'');
                if(files.has(decoded)) return files.get(decoded);
                if(files.has(decoded+'.md')) return files.get(decoded+'.md');
                if(link.startsWith('../')||link.startsWith('./')) {
                    const segments=source.split('/').slice(0,-1);
                    for(const part of decoded.split('/')) { if(part==='..')segments.pop();else if(part!=='.')segments.push(part); }
                    return files.get(segments.join('/'))??files.get(segments.join('/')+'.md')??null;
                }
                return [...files.values()].find(f=>f.kind==='file' && f.basename===decoded)??null;
            },
            getFileCache:file=>{
                const fm=/^---\r?\n[\s\S]*?\r?\n---/.exec(file.content);
                const links=[...file.content.matchAll(/\[\[[^\]]+\]\]|\[[^\]]+\]\([^\)]+\)/g)]
                    .filter(match=>!fm||match.index>=fm[0].length).map(match=>({original:match[0],position:{start:{offset:match.index},end:{offset:match.index+match[0].length}}}));
                return {frontmatter:m.yamlOf(file.content),links,frontmatterPosition:fm?{start:{offset:0},end:{offset:fm[0].length}}:undefined};
            },
        },
        vault:{getAbstractFileByPath:path=>files.get(path),getMarkdownFiles:()=>[...files.values()].filter(f=>f.kind==='file'),
            cachedRead:async file=>file.content,
            createFolder:async path=>{operations.push(['mkdir',path]);if(files.has(path))throw Error('冲突');return makeFolder(path);},
            create:async(path,content)=>{operations.push(['create',path]);if(files.has(path))throw Error('冲突');return add(path,content);},
            process:async(file,transform)=>{operations.push(['process',file.path]);file.content=transform(file.content);},
            rename:async(entry,target)=>{
                operations.push(['rename',entry.path,target]);
                if(files.get(entry.path)!==entry||files.has(target))throw Error('身份或目标冲突');
                const old=entry.path;
                const moving=[...files.values()].filter(f=>f===entry||entry.kind==='folder'&&f.path.startsWith(old+'/'));
                for(const f of moving)files.delete(f.path);
                for(const f of moving){f.path=target+f.path.slice(old.length);f.name=f.path.split('/').at(-1);if(f.kind==='file')f.basename=f.name.slice(0,-3);files.set(f.path,f);}
            },
        },
    };
    const ctx={app,settings:{projectFolder:roots.project,areaFolder:roots.area,archiveFolder:'04-archives',contactFolder:'02-areas/人脉',clientFolder:'02-areas/客户',dateTimeFormat:'YYYY-MM-DD HH:mm:ss'},guard:{mark(){}}};
    return {ctx,files,operations,folder,moc,card,reference,add,makeFolder,setActive:file=>{active=file;}};
}
function choose(f,target,ownership=0){const types=['project','area','resource'].filter(t=>t!==m.yamlOf(f.moc.content).type);f.ctx.app.answers=[types.indexOf(target),ownership];}
const props=f=>m.yamlOf(f.moc.content);

test('新建项目、领域、资源都真实写入 status active，并共享三个 Base 视图',async()=>{
    for(const kind of [m.PROJECT_KIND,m.AREA_KIND,m.RESOURCE_KIND]){
        const f=fixture();
        const created=await m.createContainer(f.ctx,kind,{name:'新建样本',description:'原话',quiet:true});
        assert.ok(created);assert.equal(m.yamlOf(created.content).status,'active');assert.equal(m.yamlOf(created.content).type,kind.type);
        for(const view of ['项目文件','附件','全部'])assert.ok(created.content.includes(view));
    }
});
for(const from of Object.keys(roots))for(const to of Object.keys(roots).filter(t=>t!==from)){
    test(`${from} → ${to}：整目录迁移、类型和 active 一起提交，原始身份和正文保留`,async()=>{
        const f=fixture(from,{noStatus:true,crlf:true}),before=props(f);
        choose(f,to);await m.runContainerConversion(f.ctx);
        assert.equal(f.folder.path,roots[to]+'/转换样本');assert.equal(props(f).type,to);assert.equal(props(f).status,'active');
        for(const key of ['UID','created','description','aliases','custom'])assert.deepEqual(props(f)[key],before[key]);
        assert.ok(f.moc.content.includes('# 保留属性注释\r\n'));assert.ok(f.moc.content.includes('正文：一个字也不能改。'));
        assert.ok(f.moc.content.includes('file.folder == "'+roots[to]+'/转换样本"'));
        assert.ok(f.card.content.includes(roots[to]+'/转换样本/MOC-转换样本'));
        assert.ok(f.reference.content.includes(roots[to]+'/转换样本/MOC-转换样本#结论|保留别名'));
        assert.equal(f.ctx.app.questions.length,to==='project'?2:1);
        assert.equal(f.moc.content.replace(/\r\n/g,'').includes('\n'),false);
    });
}
test('两种转项目路径都显示原有三种归属，客户与协作者写完整路径',async()=>{
    for(const from of ['area','resource'])for(const ownership of [1,2]){
        const f=fixture(from);choose(f,'project',ownership);
        const person={path:'02-areas/人脉/张三.md',basename:'张三'};
        let asked;await m.runContainerConversion(f.ctx,async title=>{asked=title;return person;});
        assert.deepEqual(f.ctx.app.questions[1].items.map(x=>x.label),['自己做（只有我，不挂任何人）','和别人一起做（写 with，不算客户）','客户委托的（写 client，我欠他一个交付）']);
        assert.equal(props(f)[ownership===1?'with':'client'],'[[02-areas/人脉/张三|张三]]');assert.ok(asked);
    }
});
test('取消目标、取消归属、取消客户或取消预览都不改变任何文件',async()=>{
    for(const cancel of ['target','ownership','client','collaborator','preview']){
        const f=fixture(),before=[...f.files].map(([p,x])=>[p,x.content]);choose(f,'project',cancel==='client'?2:cancel==='collaborator'?1:0);
        if(cancel==='target')f.ctx.app.answers=[null];if(cancel==='ownership')f.ctx.app.answers=[0,null];
        if(cancel==='preview')f.ctx.app.preview=modal=>modal.resolveResult(false);
        await m.runContainerConversion(f.ctx,async()=>null);
        assert.deepEqual([...f.files].map(([p,x])=>[p,x.content]),before);assert.equal(f.operations.length,0);
    }
});
test('转换非项目会移除 client/with/archived；转回自己做不继承旧归属',async()=>{
    const f=fixture('project',{extra:['client: "[[客户]]"','with: "[[协作者]]"','archived: "2026-01-01"']});
    choose(f,'area');await m.runContainerConversion(f.ctx);
    for(const key of ['client','with','archived'])assert.equal(Object.hasOwn(props(f),key),false);
    choose(f,'project');await m.runContainerConversion(f.ctx);
    assert.equal(props(f).type,'project');assert.equal(Object.hasOwn(props(f),'client'),false);
});
test('目标重名或预览期间出现重名均拒绝覆盖',async()=>{
    for(const late of [false,true]){
        const f=fixture();choose(f,'resource');
        const occupy=()=>f.makeFolder('03-resources/转换样本');
        if(late)f.ctx.app.preview=modal=>{occupy();modal.resolveResult(true);};else occupy();
        await m.runContainerConversion(f.ctx);assert.equal(f.folder.path,'02-areas/转换样本');assert.equal(f.operations.length,0);
    }
});
test('预览期间修改正文或替换 MOC 对象均停止旧计划',async()=>{
    for(const change of ['body','object']){
        const f=fixture();choose(f,'resource');
        f.ctx.app.preview=modal=>{if(change==='body')f.card.content='用户新正文';else f.files.set(f.moc.path,{...f.moc});modal.resolveResult(true);};
        await m.runContainerConversion(f.ctx);assert.equal(f.folder.path,'02-areas/转换样本');assert.equal(f.operations.length,0);
        if(change==='body')assert.equal(f.card.content,'用户新正文');
    }
});
test('写入失败或目录已提交才报错，都恢复类型、原文和全部路径',async()=>{
    for(const failure of ['folder','content','after-content']){
        const f=fixture(),before=[...f.files].map(([p,x])=>[p,x.content]);choose(f,'resource');
        const rename=f.ctx.app.vault.rename,process=f.ctx.app.vault.process;let calls=0;
        if(failure==='folder')f.ctx.app.vault.rename=async(...args)=>{await rename(...args);if(calls++===0)throw Error('移动后失败');};
        else f.ctx.app.vault.process=async(...args)=>{if(failure==='after-content')await process(...args);if(calls++===1)throw Error('写盘失败');if(failure==='content')await process(...args);};
        await m.runContainerConversion(f.ctx);
        assert.deepEqual([...f.files].map(([p,x])=>[p,x.content]).sort(),before.sort());
        assert.match(notices.at(-1),/失败/);
    }
});
test('旧同名 MOC 转换时保留文件名，容器内任意笔记均可发起',async()=>{
    const f=fixture('resource',{legacy:true});f.setActive(f.card);choose(f,'area');await m.runContainerConversion(f.ctx);
    assert.equal(f.moc.path,'02-areas/转换样本/转换样本.md');assert.equal(props(f).type,'area');
});
test('类型与目录不一致、书籍、归档、专用总控台和重合根目录均给出原因且不写入',async()=>{
    for(const scenario of ['mismatch','book','archive','special','roots']){
        const f=fixture('area',scenario==='archive'?{root:'04-archives'}:{});choose(f,'project');
        if(scenario==='mismatch'||scenario==='book')f.moc.content=f.moc.content.replace('type: area','type: '+(scenario==='book'?'book':'resource'));
        if(scenario==='special')f.ctx.settings.contactFolder=f.folder.path;
        if(scenario==='roots')f.ctx.settings.areaFolder=roots.project;
        await m.runContainerConversion(f.ctx);assert.equal(f.operations.length,0);assert.match(notices.at(-1),/失败/);
    }
});
test('迁出后相对 Markdown 外链和显式相对双链仍解析到原来的外部笔记',async()=>{
    const f=fixture('project');const outside=f.add('01-projects/旁边/参考.md','参考原文');
    f.card.content+='\n[参考](../旁边/参考.md#段落)\n[[../旁边/参考#段落|保留]]';choose(f,'area');
    await m.runContainerConversion(f.ctx);
    assert.ok(f.card.content.includes('../../01-projects/'));assert.ok(f.card.content.includes('[[01-projects/旁边/参考#段落|保留]]'));
    assert.equal(outside.content,'参考原文');
});
