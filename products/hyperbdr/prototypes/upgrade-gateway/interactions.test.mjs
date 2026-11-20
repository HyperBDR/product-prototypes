import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const dir=path.dirname(fileURLToPath(import.meta.url));
const html=readFileSync(path.join(dir,'index.html'),'utf8');
const source=html.match(/<script id="prototype-model">([\s\S]*?)<\/script>/)[1];
function setup(){const ctx=vm.createContext({structuredClone,Date});vm.runInContext(source+';globalThis.Model=UpgradeModel;globalThis.eligible=canUpgrade;',ctx);return {model:new ctx.Model(),eligible:ctx.eligible};}
test('each scene has exactly one gateway for each source host state',()=>{const {model}=setup();for(const scene of ['dr','breakBack']){assert.equal(model.rows(scene).length,8);assert.equal(new Set(model.rows(scene).map(r=>r.status)).size,8);}});
test('only waiting and failed gateways can be selected for upgrades',()=>{const {model,eligible}=setup();assert.deepEqual(Array.from(model.rows('dr').filter(eligible),r=>r.status),['failed','waiting']);});
test('upgrade transitions queued → upgrading → completed; version history is immutable',()=>{const {model}=setup();const row=model.rows('dr')[1],old=JSON.stringify(row.versions);assert.equal(model.start([row.id],1000).length,1);assert.equal(row.status,'queued');assert.equal(row.tasks[0].status,'waiting');assert.equal(model.tick(6999),false);model.tick(7000);assert.equal(row.status,'upgrading');assert.equal(row.tasks[0].status,'running');assert.equal(model.cancel(row.id,8000),false);model.tick(17000);assert.equal(row.status,'completed');assert.equal(row.tasks[0].status,'done');assert.equal(JSON.stringify(row.tasks[0].pre),old);assert.equal(JSON.stringify(row.tasks[0].post),JSON.stringify(row.target));assert.equal(JSON.stringify(row.versions),JSON.stringify(row.target));});
test('queued cancellation creates aborted history and cannot finish later',()=>{const {model}=setup();const row=model.rows('dr')[1];model.start([row.id],1000);assert.equal(model.cancel(row.id,2000),true);assert.equal(row.status,'waiting');assert.equal(row.tasks[0].status,'aborted');model.tick(20000);assert.equal(row.status,'waiting');assert.equal(row.tasks[0].status,'aborted');assert.ok(row.tasks[0].end);});
test('duplicate and ineligible starts do not create extra tasks',()=>{const {model}=setup();const rows=model.rows('dr');const tasks=model.start(rows.map(r=>r.id).concat(rows[0].id),1000);assert.equal(tasks.length,2);assert.equal(model.start([rows[0].id],2000).length,0);});
test('scenes and gateway histories never leak into one another',()=>{const {model}=setup();const original=JSON.stringify(model.rows('breakBack'));const row=model.rows('dr')[1];model.start([row.id],1000);model.tick(17000);assert.equal(JSON.stringify(model.rows('breakBack')),original);for(const r of model.rows('dr'))assert.ok(r.tasks.every(t=>t.hostId===r.id));});
test('persisted in-progress task resumes after refresh',()=>{const {model}=setup();const row=model.rows('dr')[1];model.start([row.id],1000);const restored=new model.constructor(JSON.parse(JSON.stringify(model.scenes)));restored.tick(18000);assert.equal(restored.find(row.id).status,'completed');});
test('fixtures cover all five record states',()=>{const {model}=setup();const states=new Set(model.rows('dr').flatMap(r=>r.tasks).map(t=>t.status));assert.deepEqual([...states].sort(),['aborted','done','failed','running','waiting']);});
test('markup and scripts parse; all local assets exist',()=>{for(const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);for(const match of html.matchAll(/(?:src|href)="(assets\/[a-zA-Z0-9_.-]+)"/g))assert.ok(existsSync(path.join(dir,match[1])),match[1]);for(const name of ['openstack','aliyun_bs','huawei_bs','vmware'])assert.ok(existsSync(path.join(dir,'assets',name+'.svg')));assert.ok(!/https?:\/\//.test(html));assert.match(html,/--primary:#457ab0/);assert.match(html,/\.topbar\{height:56px/);});

test('fixed-column shadow is a single scroll-aware layer, not per-cell decoration',()=>{
 assert.match(html,/<div class="table-frame"><div class="table-wrap" id="mainTableScroll">/);
 assert.equal((html.match(/class="fixed-column-shadow"/g)||[]).length,1);
 assert.match(html,/\.fixed-column-shadow\{opacity:0;[^}]*box-shadow:5px 0 10px 0 rgba\(0,0,0,\.08\)/);
 assert.match(html,/scroller\.scrollWidth>scroller\.clientWidth&&scroller\.scrollLeft>0/);
 assert.match(html,/addEventListener\('scroll',syncFixedColumnShadow/);
 assert.match(html,/\.fixed-name\{box-shadow:none\}/);
});
test('uses the Element UI font actually imported by newmuse main.js',()=>{
 assert.match(html,/success:before\{content:'\\e79c'/);
 assert.match(html,/error:before\{content:'\\e79d'/);
 assert.match(html,/refresh:before\{content:'\\e6d0'/);
 assert.ok(readFileSync(path.join(dir,'assets/element-icons.woff')).length>20000);
});
function renderTask(status){
 const app=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const helpers=app.slice(app.indexOf('function logsFor(t){'),app.indexOf('function changeScene(next){'));
 const scroller={scrollTop:0,scrollHeight:1200};
 const box={innerHTML:'',querySelector:()=>scroller};
 const task={id:'task-demo',status,start:'2026-11-13 15:55:29',created:'2026-11-13 15:55:22',end:'2026-11-13 15:57:06',message:'example failure <not-html>'};
 const context=vm.createContext({task,box,scroller,t:(key)=>({ 'detail.status':'状态：','detail.description':'描述：','detail.details':'详情：','detail.steps':'步骤','detail.refresh':'刷新任务详情','action.collapse':'收起','action.showMore':'显示更多'}[key]||key),statusLabel:(status)=>({failed:'升级失败',running:'升级中',done:'升级完成'}[status]||status)});
 vm.runInContext("const detailTask='task-demo',showDetails=true;const TASK_LABELS="+JSON.stringify({failed:'升级失败',running:'升级中',done:'升级完成'})+";const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');const $=()=>box;const getTask=()=>task;"+helpers+";drawDetail('bottom');globalThis.logs=logsFor(task);",context);
 return {context,box,scroller};
}
test('detail renders source getUpgradeLog nested timeline with inline timestamps and no copy actions',()=>{
 const {box,scroller}=renderTask('failed');
 assert.match(box.innerHTML,/class="el-timeline box-container"/);
 assert.match(box.innerHTML,/class="el-timeline-item box failed"/);
 assert.match(box.innerHTML,/class="el-timeline"/);
 assert.match(box.innerHTML,/<span>\[2026-11-13 15:55:29<\/span> <span>GMT\+08:00\]<\/span> <span>-<\/span>/);
 assert.match(box.innerHTML,/<span>步骤<\/span>/);
 assert.match(box.innerHTML,/详情：/);
 assert.ok(!box.innerHTML.includes('data-copy-log'));
 assert.ok(!box.innerHTML.includes('log-copy'));
 assert.ok(!box.innerHTML.includes('<not-html>'));
 assert.equal(scroller.scrollTop,1200);
});
test('multi-line logs preserve real newlines; info nodes have no fabricated success icon',()=>{
 const {context,box}=renderTask('done');
 assert.ok(context.logs.at(-1).line.includes('\n'));
 assert.ok(!context.logs.at(-1).line.includes('\\n'));
 assert.match(box.innerHTML,/el-timeline-item info/);
 assert.match(box.innerHTML,/el-timeline-item__node--normal"><\/div>/);
 vm.runInContext("drawDetail('top')",context);
 assert.equal(context.scroller.scrollTop,0);
});

test('gateway versions are a dash for unreported and completed, including persisted and newly upgraded rows',()=>{
 const ctx=vm.createContext({structuredClone,Date});
 vm.runInContext(source+';globalThis.Model=UpgradeModel;globalThis.displayVersions=gatewayVersions;',ctx);
 const model=new ctx.Model();
 for(const scene of ['dr','breakBack']){
  for(const row of model.rows(scene)){
   const display=ctx.displayVersions(row);
   assert.equal(display.length,['unreported','completed'].includes(row.status)?0:row.versions.length);
  }
 }
 const row=model.rows('dr')[1];
 model.start([row.id],1000);model.tick(17000);
 assert.equal(ctx.displayVersions(row).length,0);
 assert.equal(row.tasks[0].post.length,2);
 const restored=new ctx.Model(JSON.parse(JSON.stringify(model.scenes)));
 assert.equal(ctx.displayVersions(restored.find(row.id)).length,0);
 assert.match(html,/versionHtml\(gatewayVersions\(r\)\)/);
});

test('removes only the saved duplicate completed .201 example and retains .204',()=>{
 const {model}=setup();
 const scenes=JSON.parse(JSON.stringify(model.scenes));
 scenes.dr.find(r=>r.id==='dr-gw-3').status='completed';
 const originalFailback=JSON.stringify(scenes.breakBack);
 const restored=new model.constructor(scenes);
 assert.equal(restored.rows('dr').length,7);
 assert.equal(restored.rows('dr').filter(r=>r.status==='completed').length,1);
 assert.equal(restored.rows('dr').find(r=>r.status==='completed').name,'CLOUD_SYNC_GATEWAY_192.168.14.204');
 assert.ok(!restored.find('dr-gw-3'));
 assert.equal(JSON.stringify(restored.rows('breakBack')),originalFailback);
 const again=new model.constructor(JSON.parse(JSON.stringify(restored.scenes)));
 assert.equal(again.rows('dr').length,7);
 assert.equal(model.find('dr-gw-3').status,'queued');
});

test('failback tab is visibly disabled and cannot switch the active scene',()=>{
 const tab=html.match(/<button[^>]*id="tab-breakBack"[^>]*>/)[0];
 assert.match(tab,/aria-disabled="true"/);
 assert.match(tab,/\sdisabled(?:\s|>)/);
 assert.match(tab,/aria-selected="false"/);
 assert.match(html,/el\?\.dataset\.scene&&!el\.disabled/);
});

test('bilingual catalog follows network-configuration pattern and uses newmuse English labels',()=>{
 const translations=readFileSync(path.join(dir,'translations.js'),'utf8');
 const context=vm.createContext({});
 vm.runInContext(translations+';globalThis.messages=UI_MESSAGES;',context);
 assert.equal(context.messages.en['page.gatewayTip'],'Note: The cloud sync gateway version is below v6.2.0. Please promptly upgrade to the latest version manually. Only gateways using the S3Block data transfer protocol can be upgraded.');
 assert.equal(context.messages.en['status.unreported'],'Failed to retrieve the version');
 assert.equal(context.messages.en['status.completed'],'Completed');
 assert.equal(context.messages.en['records.pre'],'Pre-Upgrade Version');
 assert.match(readFileSync(path.join(dir,'i18n.js'),'utf8'),/LANGUAGE_STORAGE_KEY/);
 assert.match(html,/script src="translations\.js"/);
 assert.match(html,/script src="i18n\.js"/);
 assert.match(html,/id="language-toggle"/);
});
