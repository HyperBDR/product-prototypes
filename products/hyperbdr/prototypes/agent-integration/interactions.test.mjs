import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const dir=path.dirname(fileURLToPath(import.meta.url));
const html=readFileSync(path.join(dir,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)?.[1]||'';
test('prototype has the new settings integration entry and prompt source copy',()=>{assert.match(html,/智能体集成/);assert.match(html,/npx hyperbdr-agent-kit install/);assert.match(html,/sl_agent_/);assert.match(html,/只显示一次/);assert.match(html,/--api-key/);assert.doesNotMatch(html,/npx skills add hyperbdr/);assert.doesNotMatch(html,/安装 HyperBDR skills/);});
test('prototype includes creation, one-time reveal, toggle and delete controls',()=>{assert.match(html,/id="new"/);assert.match(html,/id="submit"/);assert.match(html,/id="created"/);assert.match(html,/data-toggle/);assert.match(html,/data-delete/);assert.match(html,/confirmDisable/);assert.match(html,/confirmDelete/);assert.match(html,/全部禁用/);});
test('all static assets resolve and script parses',()=>{
 new vm.Script(script);
 for(const m of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g))assert.ok(existsSync(path.join(dir,m[1])),m[1]);
 const metadata=JSON.parse(readFileSync(path.join(dir,'prototype.json'),'utf8'));
 assert.ok(typeof metadata.thumbnail==='string'&&metadata.thumbnail.length>0,'prototype.json must declare a thumbnail');
 assert.ok(existsSync(path.join(dir,metadata.thumbnail)),`Missing configured thumbnail: ${metadata.thumbnail}`);
});

test('shared shell and controls follow the newmuse geometry',()=>{
 assert.match(html,/--font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Helvetica,Arial,"PingFang SC"/);
 assert.match(html,/\.body\{display:flex;height:calc\(100vh - 56px\)/);
 assert.match(html,/\.agent-side a\.child\{padding-left:26px;font-size:14px/);
 assert.match(html,/\.primary\{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:36px/);
 assert.match(html,/\.mh\{padding:24px 24px 0/);
 assert.doesNotMatch(html,/<i class="icon">|font:13px.*Consolas|background:linear-gradient/);
});

const referenceNow=Date.parse('2026-11-17T12:00:00+08:00');
function modelSetup(){const context=vm.createContext({Date});const code=script.match(/\/\* TOKEN_MODEL_START \*\/([\s\S]*?)\/\* TOKEN_MODEL_END \*\//)[1];vm.runInContext(code+';globalThis.Store=TokenStore;globalThis.state=tokenStatus;',context);return{store:new context.Store(),context};}
test('enable/disable preserves metadata and does not extend expiry',()=>{const {store,context}=modelSetup();const t=store.find(1),expiry=t.e,prefix=t.p;assert.equal(store.toggle(1,referenceNow),true);assert.equal(t.s,'disabled');assert.equal(store.toggle(1,referenceNow),true);assert.equal(t.s,'active');assert.equal(t.e,expiry);assert.equal(t.p,prefix);assert.equal(context.state(t,referenceNow),'active');});
test('expiry takes precedence over enabled state and expired tokens cannot be enabled',()=>{const {store,context}=modelSetup();const t=store.find(4);assert.equal(context.state(t,referenceNow),'expired');assert.equal(store.toggle(4,referenceNow),false);t.s='disabled';assert.equal(store.toggle(4,referenceNow),false);assert.equal(context.state(t,referenceNow),'expired');});
test('deletion removes only the target token and cannot be toggled back',()=>{const {store}=modelSetup();assert.equal(store.delete(1),true);assert.equal(store.find(1),undefined);assert.equal(store.toggle(1,referenceNow),false);assert.equal(store.records.length,3);assert.ok(store.find(2));assert.equal(store.delete(1),false);});
test('bulk disable changes only currently enabled, unexpired tokens',()=>{const {store}=modelSetup();assert.equal(store.disable([1,2,3,4],referenceNow),2);assert.equal(store.find(1).s,'disabled');assert.equal(store.find(2).s,'disabled');assert.equal(store.find(3).s,'disabled');assert.equal(store.find(4).s,'active');});
test('new tokens store only a masked prefix and use GMT+08 timestamps',()=>{const {store}=modelSetup();const raw='hbd_pat_'+'a'.repeat(64),t=store.create({n:'Agent',d:'demo',days:30},raw,referenceNow);assert.equal(t.c,'2026-11-17 12:00:00');assert.equal(t.e,'2026-12-17 12:00:00');assert.equal(t.p,raw.slice(0,13)+'...');assert.ok(!JSON.stringify(store.records).includes(raw));assert.throws(()=>store.create({n:'',d:'',days:30},raw,referenceNow));assert.throws(()=>store.create({n:'demo',d:'',days:0},raw,referenceNow));});
function uiSetup(access=false,beforeStartup=''){
 const handlers={},nodes=new Map();let document;
 function element(id){if(!nodes.has(id))nodes.set(id,{id,hidden:['create','created','confirm','toast','auditDetail','tokenMoreMenu','promptTokenDropdown','promptTokenNoMatch','promptTokenClear'].includes(id),value:id==='days'?'30':'',textContent:'',innerHTML:'',disabled:false,isConnected:true,dataset:{},style:{},attributes:{},setAttribute(name,value){this.attributes[name]=String(value);},classList:{values:new Set(),toggle(name,force){const on=force===undefined?!this.values.has(name):force;on?this.values.add(name):this.values.delete(name);return on;},contains(name){return this.values.has(name);}},focus(){document.activeElement=this;},click(){if(this.onclick)this.onclick({});},querySelector(){return element('confirmationCancel');},querySelectorAll(){return[];},getClientRects(){return[{}];}});return nodes.get(id);}
 const fake={querySelector:()=>({querySelector:()=>element('fake'),querySelectorAll:()=>[],innerHTML:'',textContent:''}),querySelectorAll:()=>[]};document={getElementById:element,querySelector:()=>fake,querySelectorAll:()=>[],documentElement:{},body:{style:{}},activeElement:null,addEventListener(type,fn){handlers[type]=fn;}};
 const context=vm.createContext({window:{__TEST__:true,addEventListener(){},AGENT_MESSAGES:{zh:{statuses:{active:'active',disabled:'disabled',expired:'expired'},confirmDisableAllLead:'{n}',confirmDisableLead:'{name}',confirmEnableLead:'{name}',confirmDeleteLead:'{name}',confirmDisableBody:'body',confirmEnableBody:'body',confirmDisableNote:'note',confirmEnableNote:'note',confirmDeleteBody:'body',confirmDeleteNote:'danger',confirmCreateLead:'policy',confirmCreateBody:'body',confirmCreateNote:'note',name:'Name',expiry:'Expiration',expiryAt:'Expiration',actions:{enable:'enable',disable:'disable',delete:'delete',cannotEnable:'cannotEnable'},count:(n,a)=>String(n)},en:{statuses:{active:'active',disabled:'disabled',expired:'expired'},confirmDisableAllLead:'{n}',confirmDisableLead:'{name}',confirmEnableLead:'{name}',confirmDeleteLead:'{name}',confirmDisableBody:'body',confirmEnableBody:'body',confirmDisableNote:'note',confirmEnableNote:'note',confirmDeleteBody:'body',confirmDeleteNote:'danger',confirmCreateLead:'policy',confirmCreateBody:'body',confirmCreateNote:'note',name:'Name',expiry:'Expiration',expiryAt:'Expiration',actions:{enable:'enable',disable:'disable',delete:'delete',cannotEnable:'cannotEnable'},count:(n,a)=>String(n)}},AgentI18n:{language:'zh',t:(k)=>k,toggle(){}}},document,Date:class extends Date{constructor(...args){super(...(args.length?args:[referenceNow]));}static now(){return referenceNow;}},Uint8Array,crypto:{getRandomValues(arr){arr.fill(13);return arr;}},navigator:{clipboard:{writeText:async()=>{}}},setTimeout(){return 1;},clearTimeout(){},setInterval(){}});
 const dictionary=vm.createContext({window:{}});vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),dictionary);for(const language of ['zh','en'])context.window.AGENT_MESSAGES[language].list=dictionary.window.AGENT_MESSAGES[language].list;
 vm.runInContext(script.replace('const store=new TokenStore(),$=id=>document.getElementById(id);','const store=new TokenStore(),$=id=>document.getElementById(id);'+beforeStartup),context);if(access)vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),context);
 const click=(attr,id)=>handlers.click({target:{closest(selector){if(selector===attr)return{id,disabled:false,dataset:attr==='[data-prompt-token]'?{promptToken:id}:attr==='[data-token-page]'?{tokenPage:id}:attr==='[data-audit-page]'?{auditPage:id}:attr==='[data-audit-detail]'?{auditDetail:id}:attr==='[data-close]'?{close:id}:attr==='[data-toggle]'?{toggle:id}:{delete:id}};return null;}}});
 const selectToken=(id,checked)=>handlers.change({target:{closest:selector=>selector==='[data-token-select]'?{checked,dataset:{tokenSelect:String(id)}}:null}});
 return{element,context,click,selectToken,key:e=>handlers.keydown({...e,preventDefault(){}})};
}
test('disable and delete require confirmation; cancel does not mutate rows',()=>{const {element,click}=uiSetup();const before=element('rows').innerHTML;click('[data-toggle]',1);assert.equal(element('confirm').hidden,false);assert.match(element('confirmCopy').innerHTML,/production-cli/);assert.equal(element('rows').innerHTML,before);click('[data-close]','confirm');assert.equal(element('rows').innerHTML,before);element('confirmOk').onclick();assert.equal(element('rows').innerHTML,before);click('[data-toggle]',1);element('confirmOk').onclick();assert.match(element('rows').innerHTML,/<td class="disabled">/);const after=element('rows').innerHTML;click('[data-delete]',1);assert.match(element('confirmCopy').innerHTML,/danger/);assert.equal(element('rows').innerHTML,after);element('confirmOk').onclick();assert.ok(!element('rows').innerHTML.includes('production-cli'));});
test('create confirmation previews policy, cancellation preserves draft, and raw token is cleared on closing',()=>{const {element,click,key}=uiSetup();element('new').onclick();element('name').value='Agent';element('desc').value='description';element('days').value='30';const before=element('rows').innerHTML;element('submit').onclick();assert.match(element('confirmCopy').innerHTML,/30 天/);assert.match(element('confirmCopy').innerHTML,/2026-12-17 12:00:00/);key({key:'Escape'});assert.equal(element('confirm').hidden,true);assert.equal(element('create').hidden,false);assert.equal(element('name').value,'Agent');assert.equal(element('rows').innerHTML,before);element('submit').onclick();element('confirmOk').onclick();assert.equal(element('created').hidden,false);const raw=element('outToken').textContent;assert.ok(raw.startsWith('sl_agent_'));assert.equal(raw.length,73);assert.ok(!element('rows').innerHTML.includes(raw));click('[data-close]','created');assert.equal(element('outToken').textContent,'');});
test('bulk disable cancellation and empty-list rendering are safe',()=>{const {element,click}=uiSetup();const before=element('rows').innerHTML;element('all').onclick();assert.match(element('confirmCopy').innerHTML,/2/);click('[data-close]','confirm');assert.equal(element('rows').innerHTML,before);for(const id of [1,2,3,4]){click('[data-delete]',id);element('confirmOk').onclick();}assert.match(element('rows').innerHTML,/暂无符合条件的令牌/);assert.equal(element('all').disabled,true);});

test('token table omits the recent-use column',()=>{assert.doesNotMatch(html,/最近使用/);assert.doesNotMatch(html,/t\.u/);});

test('bilingual assets and language sources are wired',()=>{assert.match(html,/translations\.js/);assert.match(html,/i18n\.js/);assert.ok(existsSync(path.join(dir,'translations.js')));assert.ok(existsSync(path.join(dir,'i18n.js')));const messages=readFileSync(path.join(dir,'translations.js'),'utf8');assert.match(messages,/Global Settings/);assert.match(messages,/language:/);assert.match(messages,/Agent Integration/);assert.match(messages,/全局设置/);});
test('English copy covers confirmation and token action vocabulary',()=>{const messages=readFileSync(path.join(dir,'translations.js'),'utf8');for(const text of ['Confirm Access Token Creation','Confirm Disable Token','Confirm Enable Token','Confirm Delete Token','Enable','Disable','Delete','Token shown only once'])assert.ok(messages.includes(text),text);});

test('agent integration is a first-level module with separate submenu pages',()=>{assert.match(html,/class="agent-side"/);assert.match(html,/id="navAgent"/);assert.match(html,/id="navTokens"/);assert.match(html,/id="navAudit"/);assert.match(html,/id="agentPage"/);assert.match(html,/id="tokenPage"/);assert.match(html,/#token-management/);assert.doesNotMatch(html,/id="pageTab"/);assert.doesNotMatch(html,/class="tabs"/);});

test('agent page can select a token and generate an installation prompt',()=>{assert.match(html,/id="promptToken"/);assert.match(html,/id="generatePrompt"/);assert.match(html,/npx hyperbdr-agent-kit install/);assert.match(html,/--api-key/);assert.match(html,/令牌编号/);assert.match(html,/promptCopied/);});


test('single-column pages use full-width containers without horizontal overflow',()=>{assert.match(html,/body\{min-width:0;/);assert.match(html,/\.token-card\{width:100%/);});


test('access audit has exactly the requested eight columns and detail drawer',()=>{
 const header=html.match(/<table class="audit-table">[\s\S]*?<thead>([\s\S]*?)<\/thead>/)[1];
 assert.deepEqual([...header.matchAll(/<th>(.*?)<\/th>/g)].map(m=>m[1]),['访问时间','使用令牌','来源 IP','请求方法','请求接口','状态码','耗时','操作']);
 for(const id of ['auditToken','auditResult','auditSearch','auditRows','auditPrev','auditNext'])assert.ok(html.includes(`id="${id}"`));
 assert.match(html,/audit-drawer-mask/);assert.match(html,/data-audit-detail/);assert.match(html,/colspan="8"/);assert.doesNotMatch(html,/id="auditAction"/);
});
function accessSetup(){const c=vm.createContext({Date});const model=script.match(/\/\* ACCESS_MODEL_START \*\/([\s\S]*?)\/\* ACCESS_MODEL_END \*\//)[1];vm.runInContext(model+';globalThis.fixtures=accessFixtures;globalThis.filter=filterAccess;globalThis.page=accessPage;globalThis.status=accessStatusClass;globalThis.related=relatedAccessEvents',c);return c;}
const defaultAccessState={token:'all',result:'all',search:'',page:1,pageSize:10};
test('access fixtures cover methods, missing responses, IPv6 and token metadata fallback without secrets',()=>{
 const c=accessSetup(),records=c.fixtures();assert.equal(records.length,16);assert.ok(records.some(r=>r.method==='DELETE'));assert.ok(records.some(r=>r.remote_ip.includes(':')));assert.ok(records.some(r=>r.http_status===null));assert.ok(records.some(r=>r.duration_ms===0));assert.ok(records.some(r=>r.access_token_id==='token-archived-007'));assert.ok(!JSON.stringify(records).includes('sl_agent_'));assert.ok(!records.some(r=>r.action==='created'));
});
test('access filtering combines token, result and IP only before pagination',()=>{
 const c=accessSetup(),r=c.fixtures();assert.equal(c.filter(r,{...defaultAccessState,token:'2',result:'failed',search:'172.16.10.2'}).length,2);assert.equal(c.filter(r,{...defaultAccessState,search:'production-cli'}).length,0);assert.equal(c.filter(r,{...defaultAccessState,search:'2001:db8'}).length,1);assert.equal(c.filter(r,{...defaultAccessState,result:'unknown'}).length,1);
});
test('access pagination is bounded and ordered by occurrence time descending',()=>{
 const c=accessSetup(),r=c.fixtures();const first=c.page(r,defaultAccessState),last=c.page(r,{...defaultAccessState,page:2});assert.equal(first.items.length,10);assert.equal(first.total,12);assert.equal(last.items.length,2);assert.equal(first.items[0].id,'access-01');assert.equal(c.page(r,{...defaultAccessState,page:99}).page,2);const empty=c.page(r,{...defaultAccessState,search:'no-match',page:99});assert.equal(empty.total,0);assert.equal(empty.page,1);assert.equal(empty.pages,1);
});
test('HTTP codes are not conflated with related task completion',()=>{
 const c=accessSetup();assert.equal(c.status(null),'missing');assert.equal(c.status(403),'client-error');assert.equal(c.status(503),'server-error');assert.equal(c.status(202),'ok');const r=c.fixtures().find(r=>r.http_status===202);assert.equal(c.related[r.trace_id].at(-1).result,'failed');assert.equal(c.fixtures().find(r=>r.id==='access-07').trace_id,null);
});
test('access translations have identical bilingual contracts',()=>{
 const c=vm.createContext({window:{}});vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),c);const {zh,en}=c.window.AGENT_MESSAGES;assert.equal(zh.access.headers.length,8);assert.equal(en.access.headers.length,8);assert.deepEqual(Object.keys(zh.access).sort(),Object.keys(en.access).sort());assert.match(en.access.noTrace,/Trace ID/);assert.match(en.access.warning,/do not confirm/);
});

test('access view handlers paginate, reset, filter, and escape detail text',()=>{
 const {element,click,key,context}=uiSetup(true);
 element('auditReset').onclick();assert.equal(element('auditCount').textContent,'共 12 条访问记录');element('auditNext').onclick();assert.equal(element('auditPageNumber').textContent,'2 / 2');assert.match(element('auditRows').innerHTML,/0?18 ms/);element('auditSearch').value='2001:db8';element('auditSearch').oninput();assert.equal(element('auditPageNumber').textContent,'1 / 1');assert.equal(element('auditCount').textContent,'共 1 条访问记录');
 click('[data-audit-detail]','access-02');assert.equal(element('auditDetail').hidden,false);assert.match(element('auditDetailCopy').innerHTML,/恢复任务执行失败/);assert.match(element('auditDetailCopy').innerHTML,/202/);assert.ok(!element('auditDetailCopy').innerHTML.includes('sl_agent_'));key({key:'Escape'});assert.equal(element('auditDetail').hidden,true);
 click('[data-audit-detail]','access-07');assert.match(element('auditDetailCopy').innerHTML,/未记录 Trace ID/);click('[data-close]','auditDetail');
 // Untrusted search input is never rendered as HTML and unmatched results retain the 8-column empty state.
 element('auditSearch').value='<img src=x onerror=alert(1)>';element('auditSearch').oninput();assert.match(element('auditRows').innerHTML,/colspan="8"/);assert.ok(!element('auditRows').innerHTML.includes('<img'));element('auditReset').onclick();
 context.window.AgentI18n.language='en';element('auditResult').value='unknown';element('auditResult').onchange();assert.equal(element('auditCount').textContent,'1 access record');
});


test('list layout matches newmuse toolbars and inset custom tables',()=>{
 assert.match(html,/class="token-card-title" hidden/);
 assert.match(html,/\.audit-filters\{display:flex;justify-content:flex-end/);
 assert.match(html,/\.table-wrap\{overflow:auto;width:100%/);
 assert.match(html,/\.tokens th,\.audit-table th\{[^}]*font-size:14px/);
 assert.match(html,/\.tokens,\.audit-table\{[^}]*font-size:12px/);
 assert.match(html,/id="auditPageCurrent"/);
 assert.match(html,/assets\/select-arrow.svg/);
});

test('clipboard success waits for the write and failures use an error message',async()=>{
 const body=script.match(/async function copyText\(value,success\)\{([^\n]*)/)[0];
 const events=[];let finish;
 const context=vm.createContext({navigator:{clipboard:{writeText:()=>new Promise(resolve=>{finish=resolve;})}},toast:(...args)=>events.push(args),msg:()=> 'copy failed'});
 vm.runInContext(body+';globalThis.copy=copyText;',context);
 const copying=context.copy('mock-secret','copied');assert.equal(events.length,0);finish();await copying;assert.equal(events[0][0],'copied');
 context.navigator.clipboard.writeText=async()=>{throw new Error('denied')};await context.copy('mock-secret','copied');assert.equal(events[1][1],'error');
 assert.doesNotMatch(script,/\$\('copyPrompt'\)\.onclick=/);
});


test('token list supports tenant-style search, status filtering and bounded pagination',()=>{
 const {store,context}=modelSetup(),state={searchType:'name',search:'PRODUCTION',status:'all',page:1,pageSize:10};
 assert.equal(context.tokenPage(store.records,state,referenceNow).total,1);
 assert.equal(context.tokenPage(store.records,{...state,searchType:'prefix',search:'zQ2a'},referenceNow).items[0].id,3);
 assert.equal(context.tokenPage(store.records,{...state,searchType:'status',status:'expired'},referenceNow).items[0].id,4);
 assert.equal(context.tokenPage(store.records,{...state,searchType:'status',status:'active'},referenceNow).total,2);
 assert.equal(context.tokenPage(store.records,{...state,search:'',pageSize:2,page:99},referenceNow).page,2);
 assert.equal(context.tokenPage(store.records,{...state,search:'<img src=x>'},referenceNow).total,0);
});

test('token selection enables only valid bulk actions and still requires confirmation',()=>{
 const {element,selectToken,click}=uiSetup();selectToken(1,true);selectToken(4,true);
 assert.equal(element('tokenSelected').textContent,'已选 2 条');assert.equal(element('tokenBulkEnable').disabled,true);assert.equal(element('tokenBulkDisable').disabled,false);
 const before=element('rows').innerHTML;element('tokenBulkDisable').onclick();assert.equal(element('confirm').hidden,false);assert.match(element('confirmCopy').innerHTML,/production-cli/);assert.doesNotMatch(element('confirmCopy').innerHTML,/temporary-test/);assert.equal(element('rows').innerHTML,before);
 click('[data-close]','confirm');assert.equal(element('rows').innerHTML,before);element('tokenBulkDisable').onclick();element('confirmOk').onclick();assert.equal(element('tokenBulkDisable').disabled,true);assert.equal(element('tokenBulkEnable').disabled,false);
 element('tokenBulkDelete').onclick();click('[data-close]','confirm');assert.match(element('rows').innerHTML,/production-cli/);element('tokenBulkDelete').onclick();element('confirmOk').onclick();assert.doesNotMatch(element('rows').innerHTML,/production-cli|temporary-test/);assert.equal(element('tokenSelected').textContent,'已选 0 条');
});

test('DR and failback are distinct audit scopes before filtering and pagination',()=>{
 const c=accessSetup(),all=c.fixtures(),dr=c.filter(all,defaultAccessState),back=c.filter(all,{...defaultAccessState,scene:'breakBack'});
 assert.equal(dr.length,12);assert.equal(back.length,4);assert.ok(back.every(r=>r.scene==='breakBack'));assert.ok(!dr.some(r=>back.some(b=>b.id===r.id)));
 assert.equal(c.filter(all,{...defaultAccessState,scene:'breakBack',result:'unknown'}).length,1);
 assert.ok(c.related['trace-failback-01'].some(e=>e.action==='failbackCompleted'));
});

test('audit scene changes reset filters and page, preserve page size, and support keyboard tabs',()=>{
 const {element}=uiSetup(true);element('auditReset').onclick();element('auditNext').onclick();assert.equal(element('auditPageNumber').textContent,'2 / 2');
 element('auditToken').value='2';element('auditToken').onchange();element('auditSearch').value='2001:db8';element('auditSearch').oninput();
 element('auditSceneBreakBack').onclick();assert.equal(element('auditSearch').value,'');assert.equal(element('auditToken').value,'all');assert.equal(element('auditCount').textContent,'共 4 条访问记录');assert.equal(element('auditPageNumber').textContent,'1 / 1');assert.equal(element('auditPage').classList.contains('break-back'),true);assert.equal(element('auditSceneBreakBack').attributes['aria-selected'],'true');
 element('auditSceneBreakBack').onkeydown({key:'ArrowLeft',preventDefault(){}});assert.equal(element('auditCount').textContent,'共 12 条访问记录');assert.equal(element('auditPage').classList.contains('break-back'),false);
 element('auditPageSize').value='20';element('auditPageSize').onchange();assert.equal(element('auditPageNumber').textContent,'1 / 1');element('auditSceneBreakBack').onclick();element('auditSceneDr').onclick();assert.equal(element('auditPageSize').value,'20');
 element('auditPageSize').value='10';element('auditPageSize').onchange();element('auditJump').value='2';element('auditJump').onchange();assert.equal(element('auditPageNumber').textContent,'2 / 2');element('auditJump').value='99';element('auditJump').onchange();assert.equal(element('auditPageNumber').textContent,'2 / 2');
});

test('reference layout includes scene tabs outside the card, token selection and full pagers',()=>{
 assert.match(html,/<div class="audit-scene-tabs" role="tablist"/);assert.match(html,/data-scene="breakBack"/);assert.match(html,/--bp:#922b62/);
 for(const id of ['tokenMore','tokenSearchType','tokenSearch','tokenRefresh','tokenSelectAll','tokenSelected','tokenPageSize','tokenJump','auditJump'])assert.ok(html.includes(`id="${id}"`),id);
 assert.match(html,/id="token-summary"|class="token-summary" hidden/);
 const c=vm.createContext({window:{}});vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),c);assert.deepEqual(Object.keys(c.window.AGENT_MESSAGES.zh.list).sort(),Object.keys(c.window.AGENT_MESSAGES.en.list).sort());assert.equal(c.window.AGENT_MESSAGES.en.access.scenes.breakBack,'Failback');
});


test('audit details match the operation log drawer structure and retain audit facts',()=>{
 assert.match(html,/\.audit-detail-modal\{width:60%;height:calc\(100vh - 56px\)/);
 assert.match(html,/\.audit-drawer-mask\{padding:56px 0 0/);
 assert.match(html,/id="auditOverviewTab"[^>]*role="tab"/);
 assert.match(html,/\.audit-detail-fields\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(html,/\.audit-detail-field dd\{[^}]*margin:4px 0 0/);
 const drawer=html.slice(html.indexOf('<div id="auditDetail"'),html.indexOf('<div id="confirm"'));
 assert.doesNotMatch(drawer,/<footer/);assert.doesNotMatch(html,/class="related-events"|class="event-top"/);
 const {click,element}=uiSetup(true);click('[data-audit-detail]','access-02');
 assert.match(element('auditDetailCopy').innerHTML,/audit-info-section/);assert.match(element('auditDetailCopy').innerHTML,/访问令牌信息/);assert.match(element('auditDetailCopy').innerHTML,/恢复任务执行失败/);assert.match(element('auditDetailCopy').innerHTML,/状态码与访问结果/);
 click('[data-close]','auditDetail');click('[data-audit-detail]','access-06');assert.match(element('auditDetailCopy').innerHTML,/detail-value-status unknown/);assert.doesNotMatch(element('auditDetailCopy').innerHTML,/sl_agent_|undefined/);
});

test('creation and explanatory copy consistently call the credential an access token',()=>{
 const messages=readFileSync(path.join(dir,'translations.js'),'utf8');assert.doesNotMatch(html+messages,/CLI Access Token/);
 const c=vm.createContext({window:{}});vm.runInContext(messages,c);const {zh,en}=c.window.AGENT_MESSAGES;
 for(const key of ['create','createToken','createTitle','newPrompt']){assert.equal(zh[key],'创建访问令牌');assert.equal(en[key],'Create Access Token');}
 assert.equal(zh.access.overview,'概览');assert.equal(en.access.overview,'Dashboard');
 assert.deepEqual(Object.keys(zh.access).sort(),Object.keys(en.access).sort());
});


test('integration uses the requested title, prominent labels and a default eligible token in the searchable combobox',()=>{
 const c=vm.createContext({window:{}});vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),c);
 assert.equal(c.window.AGENT_MESSAGES.zh.promptTitle,'生成智能体安装提示词');assert.equal(c.window.AGENT_MESSAGES.en.promptSelect,'Please Select');
 assert.doesNotMatch(html,/生成 Agent 安装提示词|<select id="promptToken"/);
 assert.match(html,/id="promptToken"[^>]*role="combobox"[^>]*aria-autocomplete="list"/);
 assert.match(html,/#promptTokenLabel,\.prompt-result-label\{[^}]*font-weight:700;color:#262626/);
 const {element}=uiSetup(true);element('promptToken').onfocus();assert.equal(element('promptToken').value,'');assert.match(element('promptToken').placeholder,/production-cli/);assert.equal(element('generatePrompt').disabled,false);assert.match(element('promptTokenOptions').innerHTML,/production-cli|staging-agent/);assert.doesNotMatch(element('promptTokenOptions').innerHTML,/old-macbook|temporary-test/);
});

test('token search matches name, ID and masked prefix without indexing secrets or unavailable tokens',()=>{
 const {store,context}=modelSetup();assert.equal(context.filterPromptTokens(store.records,'STAGING',referenceNow)[0].id,2);assert.equal(context.filterPromptTokens(store.records,'8vJq',referenceNow)[0].id,2);assert.equal(context.filterPromptTokens(store.records,'2',referenceNow)[0].id,2);
 assert.equal(context.filterPromptTokens(store.records,'old-macbook',referenceNow).length,0);assert.equal(context.filterPromptTokens(store.records,'n8Hp',referenceNow).length,0);assert.equal(context.filterPromptTokens(store.records,'WspW6A0aXish',referenceNow).length,0);
});

test('choosing a token is explicit and searching retains the committed selection until replaced or cleared',()=>{
 const {element}=uiSetup(true);const input=element('promptToken'),key=(value)=>input.onkeydown({key:value,preventDefault(){}});
 input.onfocus();input.value='stag';input.oninput();assert.match(element('promptTokenOptions').innerHTML,/staging-agent/);assert.doesNotMatch(element('promptTokenOptions').innerHTML,/production-cli/);key('Enter');
 assert.match(input.value,/staging-agent/);assert.equal(element('generatePrompt').disabled,false);assert.doesNotMatch(element('promptOutput').innerHTML,/npx hyperbdr/);
 element('generatePrompt').onclick();assert.match(element('promptOutput').innerHTML,/npx hyperbdr-agent-kit install/);
 const generated=element('promptOutput').innerHTML;input.onfocus();assert.equal(element('generatePrompt').disabled,false);input.value='not-found';input.oninput();assert.equal(element('generatePrompt').disabled,false);assert.equal(element('promptOutput').innerHTML,generated);assert.equal(element('promptTokenNoMatch').textContent,'无匹配数据');assert.equal(element('promptTokenNoMatch').hidden,false);key('Escape');assert.match(input.value,/staging-agent/);
 input.onfocus();key('ArrowDown');key('Enter');assert.match(input.value,/production-cli/);element('promptTokenClear').onclick();assert.equal(input.value,'');assert.equal(element('generatePrompt').disabled,true);
});

test('invalidated selections return to empty instead of silently selecting the next token',()=>{
 const {element,click}=uiSetup(true);element('promptToken').onfocus();click('[data-prompt-token]',1);element('generatePrompt').onclick();click('[data-toggle]',1);element('confirmOk').onclick();assert.equal(element('promptToken').value,'');assert.equal(element('generatePrompt').disabled,true);assert.doesNotMatch(element('promptOutput').innerHTML,/npx hyperbdr/);
 click('[data-toggle]',2);element('confirmOk').onclick();element('promptToken').onfocus();assert.equal(element('promptTokenNoMatch').textContent,'暂无已启用令牌');assert.equal(element('promptTokenOptions').innerHTML,'');
});

test('agent-flow creation selects the new token but does not auto-generate and canceled intent is cleared',()=>{
 const {element,click}=uiSetup(true);element('newPromptToken').onclick();element('name').value='New Agent';element('submit').onclick();element('confirmOk').onclick();assert.match(element('promptToken').value,/New Agent/);assert.equal(element('generatePrompt').disabled,false);assert.doesNotMatch(element('promptOutput').innerHTML,/npx hyperbdr/);click('[data-close]','created');
 const other=uiSetup(true);other.element('newPromptToken').onclick();other.click('[data-close]','create');other.element('new').onclick();other.element('name').value='Manager Token';other.element('submit').onclick();other.element('confirmOk').onclick();assert.match(other.element('promptToken').value,/production-cli/);assert.equal(other.element('generatePrompt').disabled,false);assert.doesNotMatch(other.element('promptToken').value,/Manager Token/);
});


test('reopening, searching and reselecting never disable a valid committed token or discard its prompt',()=>{
 const {element,click}=uiSetup(true),input=element('promptToken');input.onfocus();click('[data-prompt-token]',1);element('generatePrompt').onclick();const original=element('promptOutput').innerHTML;
 input.onfocus();assert.equal(element('generatePrompt').disabled,false);assert.equal(element('promptOutput').innerHTML,original);
 input.value='stag';input.oninput();assert.equal(element('generatePrompt').disabled,false);assert.equal(element('promptOutput').innerHTML,original);
 // Generating while a different token is only being searched still uses the committed token.
 element('generatePrompt').onclick();assert.match(element('promptOutput').innerHTML,/--api-key sl_agent_xrJlWsp/);assert.doesNotMatch(element('promptOutput').innerHTML,/--api-key sl_agent_8vJq/);
 input.onkeydown({key:'Escape',preventDefault(){}});assert.match(input.value,/production-cli/);click('[data-prompt-token]',1);assert.equal(element('promptOutput').innerHTML,original);assert.equal(element('generatePrompt').disabled,false);
 // Committing a different valid option changes the token, but not button availability.
 input.onfocus();input.value='stag';input.oninput();click('[data-prompt-token]',2);assert.equal(element('generatePrompt').disabled,false);assert.doesNotMatch(element('promptOutput').innerHTML,/npx hyperbdr/);element('generatePrompt').onclick();assert.match(element('promptOutput').innerHTML,/--api-key sl_agent_8vJq/);
 element('promptTokenClear').onclick();assert.equal(element('generatePrompt').disabled,true);assert.doesNotMatch(element('promptOutput').innerHTML,/npx hyperbdr/);
});


test('agent usage examples follow the prompt card and describe customer tasks rather than installation steps',()=>{
 const start=html.indexOf('<section class="card agent-usage"');
 const end=html.indexOf('<div id="tokenPage"',start);
 const section=html.slice(start,end);
 assert.ok(start>html.indexOf('id="promptNote"'));
 assert.ok(end>start);
 assert.match(section,/aria-labelledby="agentUsageTitle"/);
 assert.match(section,/您可以这样使用智能体/);
 assert.equal((section.match(/<h3 id="agentUsageTitle[1-6]"/g)||[]).length,6);
 assert.equal((section.match(/class="agent-usage-prompts" id="agentUsagePrompt[1-6]"/g)||[]).length,6);
 for(const title of ['创建源端','创建目标端','启动配置','数据同步','演练启动','资源清理'])assert.ok(section.includes(title));
 assert.match(section,/待我确认后再操作/);
 assert.match(section,/<ol class="agent-usage-flow">/);
 assert.equal((section.match(/class="agent-usage-arrow"/g)||[]).length,5);
 assert.doesNotMatch(section,/<button|aria-current|aria-valuenow/);
 assert.doesNotMatch(section,/npx |hyperbdrctl|安装 skills|使用指南|sl_agent_/);
 assert.ok(html.includes('const m=L();renderAgentUsage();'));
});

test('usage copy has matching bilingual fields and keeps confirmation and network requirements',()=>{
 const c=vm.createContext({window:{}});vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),c);
 const {zh,en}=c.window.AGENT_MESSAGES;
 assert.deepEqual(Object.keys(zh.usage).sort(),Object.keys(en.usage).sort());
 for(const lang of [zh,en]){assert.equal(lang.usage.examples.length,6);for(const example of lang.usage.examples)assert.deepEqual(Object.keys(example).sort(),['detail','prompts','title']);}
 for(const example of zh.usage.examples)assert.match(example.prompts.join(''),/待我确认后/);
 for(const example of en.usage.examples)assert.match(example.prompts.join(' '),/wait for my confirmation/i);
 assert.match(zh.usage.reminder,/说明影响.*确认执行/);
 assert.match(en.usage.reminder,/impact before confirming/);
 assert.match(zh.usage.networkBefore,/智能体运行环境.*HTTPS/);
 assert.match(en.usage.networkBefore,/agent runtime.*HTTPS/);
});

test('usage renderer switches languages with safe text output and shares the installation service domain',()=>{
 const dictionary=vm.createContext({window:{}});vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),dictionary);
 const nodes=new Map(),element=id=>{if(!nodes.has(id))nodes.set(id,{textContent:''});return nodes.get(id);};
 const c=vm.createContext({window:{AgentI18n:{language:'zh'}},$:element,L:()=>dictionary.window.AGENT_MESSAGES[c.window.AgentI18n.language],text:(node,value)=>{node.textContent=value;}});
 const constant=script.match(/const AGENT_SERVICE_URL='[^']+';/)[0];
 const renderer=script.match(/function renderAgentUsage\(\)\{[\s\S]*?\n\}/)[0];
 vm.runInContext(constant+renderer+';renderAgentUsage();',c);
 assert.equal(element('agentUsageTitle').textContent,'您可以这样使用智能体');
 assert.match(element('agentUsagePrompt1Line1').textContent,/选择 Agent 或 Agentless/);
 assert.equal(element('agentUsageDetail1').textContent,'Agent / Agentless');
 assert.equal(element('agentUsageTitle6').textContent,'资源清理');
 assert.equal(element('agentUsageFlowTitle').textContent,'参考操作流程');
 assert.equal(element('agentUsageDomain').textContent,'hyperbdr.com');
 c.window.AgentI18n.language='en';vm.runInContext('renderAgentUsage()',c);
 assert.equal(element('agentUsageTitle').textContent,'Ways to use your agent');
 assert.match(element('agentUsagePrompt2Line1').textContent,/Alibaba Cloud/);
 assert.equal(element('agentUsageTitle6').textContent,'Clean up resources');
 assert.equal(element('agentUsagePromptLabel').textContent,'Example prompts');
 dictionary.window.AGENT_MESSAGES.en.usage.examples[0].prompts[0]='<img src=x onerror=alert(1)>';
 vm.runInContext('renderAgentUsage()',c);assert.match(element('agentUsagePrompt1Line1').textContent,/<img src=x/);
 assert.ok(script.includes('install --url ${AGENT_SERVICE_URL} --api-key'));
});


test('workflow copy follows source, target, boot configuration, sync, drill and cleanup in both languages',()=>{
 const c=vm.createContext({window:{}});vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),c);
 const {zh,en}=c.window.AGENT_MESSAGES;
 assert.deepEqual(Array.from(zh.usage.examples,e=>e.title),['创建源端','创建目标端','启动配置','数据同步','演练启动','资源清理']);
 assert.deepEqual(Array.from(en.usage.examples,e=>e.title),['Set up source','Set up target','Boot configuration','Data sync','Start DR drill','Clean up resources']);
 assert.equal(zh.usage.examples[0].detail,'Agent / Agentless');
 assert.match(zh.usage.examples[1].detail,/启动到哪个云/);
 assert.match(zh.usage.examples[5].prompts.join(''),/依赖关系.*清理范围和影响.*保留仍在使用/);
 assert.match(en.usage.examples[5].prompts.join(' '),/dependencies.*scope and impact.*still in use/);
 assert.match(zh.usage.intro,/提示词示例.*实际环境/);
 assert.ok(html.includes('grid-template-columns:var(--usage-stage-width) minmax(0,1fr)'));
 assert.match(html,/@media\(max-width:640px\)\{\.agent-usage-flow-head/);
});


test('workflow has no visible numbering or quotation wrappers and offers multiple plain-language prompt lines',()=>{
 const start=html.indexOf('<section class="card agent-usage"');const section=html.slice(start,html.indexOf('</section>',start));
 assert.doesNotMatch(section,/agent-usage-order|<blockquote|[“”「」‘’]/);
 assert.equal((section.match(/id="agentUsagePrompt[1-6]Line[12]"/g)||[]).length,12);
 assert.match(html,/\.agent-usage-flow\{list-style:none/);
 assert.match(html,/\.agent-usage-prompts p\+p\{margin-top:8px/);
 const c=vm.createContext({window:{}});vm.runInContext(readFileSync(path.join(dir,'translations.js'),'utf8'),c);
 for(const lang of ['zh','en'])for(const example of c.window.AGENT_MESSAGES[lang].usage.examples){
  assert.equal(example.prompts.length,2);
  for(const line of example.prompts){assert.ok(line.trim().length>0);assert.doesNotMatch(line,/[“”「」‘’]/);}
 }
 assert.ok(script.includes("'Line'+(line+1)),prompt)"));
});


test('never-expiring tokens have a null expiry and retain enable, disable and delete behavior',()=>{
 const {store,context}=modelSetup();const raw='sl_agent_'+'x'.repeat(40);
 const token=store.create({n:'Never expires',d:'',days:'never'},raw,referenceNow);
 assert.equal(token.e,null);assert.equal(context.state(token,Date.parse('2099-01-01')), 'active');
 assert.equal(store.toggle(token.id,referenceNow),true);assert.equal(context.state(token,referenceNow),'disabled');assert.equal(token.e,null);
 assert.equal(store.toggle(token.id,referenceNow),true);assert.equal(context.state(token,referenceNow),'active');
 assert.equal(store.disable([token.id],referenceNow),1);assert.equal(token.e,null);
 assert.equal(store.delete(token.id),true);assert.equal(store.find(token.id),undefined);
 assert.ok(!JSON.stringify(store.records).includes(raw));
});

test('expiry selector defaults to Never Expires and both creation entry points reset it',()=>{
 assert.match(html,/<option value="never" selected>永不过期<\/option>/);
 for(const days of [7,30,90,180,365])assert.ok(html.includes('value="'+days+'"'));
 const {element,click}=uiSetup(true);
 element('new').onclick();assert.equal(element('days').value,'never');element('days').value='90';click('[data-close]','create');
 element('newPromptToken').onclick();assert.equal(element('days').value,'never');element('days').value='7';click('[data-close]','create');
 element('new').onclick();assert.equal(element('days').value,'never');
});

test('never-expiring creation is confirmed, cancellable and rendered without fabricated dates',()=>{
 const {element,click}=uiSetup(true);element('new').onclick();element('name').value='Long lived';element('submit').onclick();
 assert.match(element('confirmCopy').innerHTML,/永不过期/);assert.match(element('confirmCopy').innerHTML,/无到期时间/);
 assert.doesNotMatch(element('confirmCopy').innerHTML,/GMT\+08|Invalid|NaN|到期后/);
 click('[data-close]','confirm');assert.equal(element('days').value,'never');assert.equal(element('create').hidden,false);
 element('submit').onclick();element('confirmOk').onclick();assert.equal(element('created').hidden,false);assert.equal(element('outExp').value,'永不过期');
 assert.match(element('rows').innerHTML,/Long lived/);assert.match(element('rows').innerHTML,/>永不过期<\/td>/);assert.doesNotMatch(element('rows').innerHTML,/>null</);
});

test('English Never Expires and finite expiry creation retain their distinct policy and output',()=>{
 const {element,context}=uiSetup(true);context.window.AgentI18n.language='en';element('new').onclick();element('name').value='English token';element('submit').onclick();
 assert.match(element('confirmCopy').innerHTML,/Never Expires/);assert.match(element('confirmCopy').innerHTML,/no expiration date/);assert.doesNotMatch(element('confirmCopy').innerHTML,/GMT\+08|NaN/);
 element('confirmOk').onclick();assert.equal(element('outExp').value,'Never Expires');assert.match(element('rows').innerHTML,/Never Expires/);
 const finite=uiSetup(true);finite.element('new').onclick();finite.element('days').value='7';finite.element('name').value='Finite';finite.element('submit').onclick();assert.match(finite.element('confirmCopy').innerHTML,/7 天/);assert.match(finite.element('confirmCopy').innerHTML,/2026-11-24 12:00:00 GMT\+08:00/);finite.element('confirmOk').onclick();assert.equal(finite.element('outExp').value,'2026-11-24 12:00:00 GMT+08:00');
});

test('startup selects the first eligible token in list order and prepares its localized prompt without a generation event',()=>{
 const first=uiSetup(true);assert.match(first.element('promptToken').value,/production-cli/);assert.equal(first.element('generatePrompt').disabled,false);assert.match(first.element('promptOutput').innerHTML,/npx hyperbdr-agent-kit install/);assert.match(first.element('copyPrompt').dataset.prompt,/--api-key sl_agent_xrJlWsp/);
 assert.doesNotMatch(first.element('auditRows').innerHTML,/生成了 HyperBDR/);
 const reordered=uiSetup(true,'store.records.reverse();');assert.match(reordered.element('promptToken').value,/staging-agent/);assert.match(reordered.element('copyPrompt').dataset.prompt,/--api-key sl_agent_8vJq/);
 const skip=uiSetup(true,"store.records[0].s='disabled';");assert.match(skip.element('promptToken').value,/staging-agent/);
});

test('startup without eligible tokens stays empty and explicit clear never reselects a token',()=>{
 for(const seed of ['store.records=[];',"store.records.forEach(t=>t.s='disabled');"]){const {element}=uiSetup(true,seed);assert.equal(element('promptToken').value,'');assert.equal(element('generatePrompt').disabled,true);assert.doesNotMatch(element('promptOutput').innerHTML,/npx hyperbdr/);}
 const {element}=uiSetup(true);element('promptTokenClear').onclick();element('tokenRefresh').onclick();assert.equal(element('promptToken').value,'');assert.equal(element('generatePrompt').disabled,true);assert.doesNotMatch(element('promptOutput').innerHTML,/npx hyperbdr/);
});


test('workflow alignment shares column widths, aligns first text lines and centers connecting arrows',()=>{
 assert.match(html,/\.agent-usage-content\{--usage-stage-width:176px/);
 assert.equal((html.match(/grid-template-columns:var\(--usage-stage-width\) minmax\(0,1fr\)/g)||[]).length,2);
 assert.match(html,/\.agent-usage-flow-head>span:first-child\{padding-left:17px/);
 assert.match(html,/\.agent-usage-stage\{[^}]*justify-content:flex-start;[^}]*padding:12px 16px;border:1px/);
 assert.match(html,/\.agent-usage-prompts\{align-self:stretch;min-width:0;padding:13px 0/);
 assert.match(html,/\.agent-usage-arrow\{[^}]*left:calc\(var\(--usage-stage-width\)\/2 - 6px\)/);
 assert.match(html,/@media\(max-width:900px\)\{\.agent-usage-content\{--usage-stage-width:144px/);
});
