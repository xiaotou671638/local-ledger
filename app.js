const $=id=>document.getElementById(id);
const EXP=["餐饮","交通","购物","日用品","住房","水电通信","医疗","娱乐","旅行","保险","其他"];
const INC=["工资","奖金","兼职","投资","退款","其他"];
const DBKEY="localLedgerPWA_v1";
let db={entries:[],budgets:{JPY:100000,CNY:3000},rate:20,recurring:[]};
let activeType="expense";
const today=()=>new Date().toISOString().slice(0,10);
const ym=(d)=>String(d).slice(0,7);
const num=v=>Number(v||0);
const fmt=(v,c)=>new Intl.NumberFormat("zh-CN",{minimumFractionDigits:c==="JPY"?0:2,maximumFractionDigits:c==="JPY"?0:2}).format(v)+" "+c;
const monthNow=ym(today());
function save(){localStorage.setItem(DBKEY,JSON.stringify(db));$("localStatus").textContent="● 已保存到本机";}
function load(){try{const x=JSON.parse(localStorage.getItem(DBKEY)||"null");if(x)db={...db,...x};}catch(e){console.warn(e)}}
function sum(type,currency,month=monthNow){return db.entries.filter(e=>e.type===type&&e.currency===currency&&ym(e.date)===month).reduce((a,e)=>a+num(e.amount),0)}
function showMessage(t){$("messageText").textContent=t;$("messageDialog").showModal()}
function openDialog(id){$(id).showModal()}
function categories(){const list=activeType==="expense"?EXP:INC;$("category").innerHTML=list.map(x=>`<option>${x}</option>`).join("")}
function render(){
 const c=$("overviewCurrency").value, income=sum("income",c), expense=sum("expense",c), budget=num(db.budgets[c]);
 $("monthLabel").textContent=new Date().toLocaleDateString("zh-CN",{year:"numeric",month:"long"});
 $("balance").textContent=fmt(income-expense,c);$("income").textContent=fmt(income,c);$("expense").textContent=fmt(expense,c);
 $("budgetSpent").textContent="已支出 "+fmt(expense,c);$("budgetTotal").textContent="预算 "+fmt(budget,c);
 const pct=budget>0?expense/budget:0;$("budgetProgress").style.width=Math.min(100,pct*100)+"%";
 $("budgetProgress").style.background=pct>=1?"#d84d4d":pct>=.8?"#e59a3b":"#2876b9";
 $("budgetAlert").textContent=pct>=1?"⚠ 本月预算已超支":pct>=.8?"预算已使用 80% 以上":budget===0?"尚未设置预算":"预算使用正常";
 renderEntries();renderCharts();
}
function renderEntries(){
 const q=$("search").value.trim().toLowerCase(),type=$("typeFilter").value,cur=$("currencyFilter").value,only=$("monthOnly").checked;
 const list=db.entries.filter(e=>(!q||[e.title,e.category,e.note].join(" ").toLowerCase().includes(q))&&(type==="all"||e.type===type)&&(cur==="all"||e.currency===cur)&&(!only||ym(e.date)===monthNow)).sort((a,b)=>b.date.localeCompare(a.date)||b.created-b.created);
 $("count").textContent=list.length+" 笔";
 $("entries").innerHTML=list.length?list.map(e=>`<div class="entry"><div class="entryIcon">${e.type==="expense"?"↗":"↙"}</div><div class="entryInfo"><b>${esc(e.title||e.category)}</b><small>${esc(e.category)} · ${e.date} · ${e.currency}${e.note?" · "+esc(e.note):""}</small></div><div class="entryAmount ${e.type==="income"?"incomeColor":""}">${e.type==="expense"?"−":"+"}${fmt(num(e.amount),e.currency)}</div><button aria-label="删除" data-del="${e.id}" style="border:0;background:none;color:#b7bec8;font-size:17px">×</button></div>`).join(""):'<div class="empty">暂无账单记录</div>';
 $("entries").querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{if(confirm("确定删除这笔账单？")){db.entries=db.entries.filter(e=>e.id!==b.dataset.del);save();render()}});
}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderCharts(){
 const c=$("chartCurrency").value,months=[];
 for(let i=5;i>=0;i--){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);months.push(d.toISOString().slice(0,7))}
 const vals=months.map(m=>db.entries.filter(e=>e.type==="expense"&&e.currency===c&&ym(e.date)===m).reduce((a,e)=>a+num(e.amount),0));
 const max=Math.max(1,...vals);
 $("trend").innerHTML=months.map((m,i)=>`<div class="barCol"><div class="bar" title="${fmt(vals[i],c)}" style="height:${Math.max(2,vals[i]/max*95)}%"></div><span class="barLabel">${m.slice(5)}月</span></div>`).join("");
 const groups={};db.entries.filter(e=>e.type==="expense"&&e.currency===c&&ym(e.date)===monthNow).forEach(e=>groups[e.category]=(groups[e.category]||0)+num(e.amount));
 const arr=Object.entries(groups).sort((a,b)=>b[1]-a[1]),total=arr.reduce((a,x)=>a+x[1],0)||1;
 $("categories").innerHTML=arr.length?arr.map(([name,v])=>`<div class="catRow"><b>${esc(name)}</b><div class="catTrack"><i style="width:${v/Math.max(...arr.map(x=>x[1]))*100}%"></i></div><span>${Math.round(v/total*100)}%</span></div>`).join(""):'<div class="empty">本月暂无支出</div>';
}
function openEntry(type){activeType=type;categories();$("entryTitle").textContent=type==="expense"?"记一笔支出":"记一笔收入";document.querySelectorAll(".seg button").forEach(b=>b.classList.toggle("chosen",b.dataset.type===type));$("amount").value="";$("title").value="";$("note").value="";$("date").value=today();$("entryDialog").showModal()}
document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{activeType=b.dataset.type;categories();document.querySelectorAll(".seg button").forEach(x=>x.classList.toggle("chosen",x===b))});
$("addExpense").onclick=()=>openEntry("expense");$("addIncome").onclick=()=>openEntry("income");
$("saveEntry").onclick=e=>{if(!$("entryForm").reportValidity())return;const amount=num($("amount").value);if(amount<=0)return;db.entries.push({id:crypto.randomUUID(),created:Date.now(),type:activeType,amount,currency:$("currency").value,category:$("category").value,title:$("title").value.trim(),date:$("date").value,note:$("note").value.trim()});save();render()};
$("settingsBtn").onclick=()=>{$("budgetJPY").value=db.budgets.JPY;$("budgetCNY").value=db.budgets.CNY;$("rate").value=db.rate;$("settingsDialog").showModal()};
$("budgetBtn").onclick=$("settingsBtn").onclick;
$("saveSettings").onclick=()=>{const j=num($("budgetJPY").value),c=num($("budgetCNY").value),r=num($("rate").value);if(j<0||c<0||r<=0){showMessage("请检查预算和汇率输入。");return}db.budgets={JPY:j,CNY:c};db.rate=r;save();render()};
["overviewCurrency","chartCurrency","search","typeFilter","currencyFilter","monthOnly"].forEach(id=>$(id).addEventListener("input",render));
$("rateBtn").onclick=()=>{$("rateText").textContent="当前参考汇率：1 CNY = "+db.rate+" JPY";$("rateDialog").showModal();convert()};
$("doConvert").onclick=convert;
function convert(){const a=num($("convertAmount").value),f=$("fromCurrency").value,t=$("toCurrency").value;const result=f===t?a:f==="CNY"?a*db.rate:a/db.rate;$("convertResult").textContent=fmt(result,t)}
$("exportCsv").onclick=()=>{const rows=[["日期","类型","分类","名称","金额","币种","备注"],...db.entries.map(e=>[e.date,e.type==="expense"?"支出":"收入",e.category,e.title,e.amount,e.currency,e.note])];const csv="\ufeff"+rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");download(new Blob([csv],{type:"text/csv;charset=utf-8"}),"随手记账_账单.csv")};
function download(blob,name){const a=document.createElement("a"),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
$("backupBtn").onclick=()=>$("backupDialog").showModal();
$("jsonExport").onclick=()=>download(new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),...db},null,2)],{type:"application/json"}),"随手记账_备份.json");
async function derive(password,salt){const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:200000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
$("encryptedExport").onclick=async()=>{const p=$("backupPassword").value;if(p.length<8){showMessage("备份密码至少需要 8 个字符。");return}try{const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await derive(p,salt),plain=new TextEncoder().encode(JSON.stringify({version:1,...db})),cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,plain);const out=new Uint8Array(4+16+12+cipher.byteLength);out.set(new TextEncoder().encode("LLB1"),0);out.set(salt,4);out.set(iv,20);out.set(new Uint8Array(cipher),32);download(new Blob([out],{type:"application/octet-stream"}),"随手记账_加密备份.llbackup");$("backupPassword").value="";}catch(e){showMessage("加密失败："+e.message)}};
$("restoreFile").onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{const data=new Uint8Array(await f.arrayBuffer());let raw;if(new TextDecoder().decode(data.slice(0,4))==="LLB1"){const p=prompt("请输入备份密码");if(p===null)return;const salt=data.slice(4,20),iv=data.slice(20,32),cipher=data.slice(32),key=await derive(p,salt);raw=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,cipher)}else raw=data;const obj=JSON.parse(new TextDecoder().decode(raw));if(!Array.isArray(obj.entries)||!obj.budgets)throw Error("备份文件内容不完整");if(!confirm("恢复备份会覆盖当前账本，确定继续吗？"))return;db={entries:obj.entries,budgets:obj.budgets,rate:obj.rate||20,recurring:obj.recurring||[]};save();render();showMessage("备份恢复成功。")}catch(e){showMessage("恢复失败：密码错误、文件损坏或格式不支持。")}finally{ev.target.value=""}};
$("recurringBtn").onclick=()=>{renderRecurring();$("recurringDialog").showModal()};
function renderRecurring(){$("recurringItems").innerHTML=db.recurring.length?db.recurring.map(r=>`<div class="recItem"><span>${esc(r.title)} · 每月${r.day}日 · ${fmt(r.amount,r.currency)}</span><button data-rdel="${r.id}">删除</button></div>`).join(""):'<p class="hint">还没有定期账单模板。</p>';$("recurringItems").querySelectorAll("[data-rdel]").forEach(b=>b.onclick=()=>{db.recurring=db.recurring.filter(r=>r.id!==b.dataset.rdel);save();renderRecurring()})}
$("saveRecurring").onclick=()=>{const r={id:crypto.randomUUID(),title:$("recTitle").value.trim(),amount:num($("recAmount").value),currency:$("recCurrency").value,type:$("recType").value,day:Math.min(31,Math.max(1,num($("recDay").value))),lastMonth:null};if(!r.title||r.amount<=0)return;db.recurring.push(r);save();generateRecurring();renderRecurring();$("recTitle").value="";$("recAmount").value=""};
function generateRecurring(){const now=new Date(),month=ym(today()),day=now.getDate();let changed=false;for(const r of db.recurring){if(r.lastMonth===month||day<r.day)continue;const d=new Date(now.getFullYear(),now.getMonth(),Math.min(r.day,new Date(now.getFullYear(),now.getMonth()+1,0).getDate()));db.entries.push({id:crypto.randomUUID(),created:Date.now(),type:r.type,amount:r.amount,currency:r.currency,category:r.type==="expense"?"其他":"其他",title:r.title,date:d.toISOString().slice(0,10),note:"定期账单自动生成"});r.lastMonth=month;changed=true}if(changed)save()}
load();generateRecurring();categories();render();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(console.warn);
