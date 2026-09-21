const JCLASS={"US Federal":"j-fed","US State":"j-state"};
const MMAP=Object.fromEntries(MECHS);
const STATUSES=["law","moving","pending","stalled"];
const SLABEL={law:"Enacted / in force",moving:"Moving",pending:"Pending",stalled:"Stalled"};
/* The column shows the CATEGORY in words, with the specific circumstance in
   parentheses after it — "Pending (in committee)", "Pending (proposed)". The
   category used to be carried by a colour dot alone, which told a reader
   using a screen reader, or not distinguishing the colours, nothing at all.
   The parenthetical is dropped where the specific status is the category. */
const SCAT={law:"Enacted",moving:"Moving",pending:"Pending",stalled:"Stalled"};
function statusText(d){
  const cat=SCAT[d.statusClass]||d.statusClass, sp=String(d.status||"");
  return sp.toLowerCase()===cat.toLowerCase()?cat:`${cat} (${sp.charAt(0).toLowerCase()+sp.slice(1)})`;
}
function statusHTML(d,extra){
  const cat=SCAT[d.statusClass]||d.statusClass, sp=String(d.status||"");
  const same=sp.toLowerCase()===cat.toLowerCase();
  return `<span class="st ${d.statusClass}"${extra||""} data-gl="st:${d.statusClass}">${esc(cat)}${
    same?"":` <span class="sq">(${esc(sp.charAt(0).toLowerCase()+sp.slice(1))})</span>`}</span>`;
}
/* youth focus — whether the legislation is aimed at minors */
const YOUTHS=["only","duties","none"];
const YLABEL={only:"Minors only",duties:"Minor-specific duties",none:"No minor-specific rules"};
const YSHORT={only:"Minors only",duties:"Minor duties",none:"None"};
/* the longer gloss on each youth value lives in GLOSSARY as "youth:<v>",
   so the tooltip and the coding table cannot drift apart */
const YORDER={only:0,duties:1,none:2};

/* ---------- mechanism clusters ---------- */
/* Five families over the sixteen mechanism keys. The cluster is what the
   coverage view groups by, what the matrix bands its columns by, and what
   the filter select's "any mechanism in this cluster" options match on. */
const GMAP=Object.fromEntries(MECHGROUPS.map(g=>[g.key,g]));
const MGROUP={}; MECHGROUPS.forEach(g=>g.mechs.forEach(k=>{MGROUP[k]=g.key}));
/* mechanisms in cluster order — the column order of the matrix */
const MECH_ORDER=MECHGROUPS.flatMap(g=>g.mechs);
/* first mechanism of each cluster, for the divider rule in the matrix */
const GSTART=new Set(MECHGROUPS.map(g=>g.mechs[0]));
const inGroup=(d,gk)=>d.mechs.some(k=>MGROUP[k]===gk);
const groupCount=gk=>DATA.filter(d=>inGroup(d,gk)).length;
const nMech=k=>DATA.filter(d=>d.mechs.includes(k)).length;

/* ---------- chronology ---------- */
/* Dates are recorded at whatever precision the source supports: a day
   ("2026-04-30"), a month ("2026-02") or a year ("2026"). Half the corpus
   is dated only to the year, so where a partial date sits inside its
   period decides how the whole corpus reads. It resolves to the MIDPOINT:
   a year becomes 30 June, a month becomes the 15th. Resolving to the start
   would sort every "enacted 2026" law behind everything dated January
   2026; resolving to the end would push all twenty-two of them above a
   bill that actually moved in August. The midpoint is the least-wrong
   single point, and on this dataset it never puts a latest action before
   the first action on the same record. */
function stamp(v){
  if(!v)return null;
  const p=String(v).split("-"), y=+p[0];
  const m=p.length>1?+p[1]:6;
  const d=p.length>2?+p[2]:(p.length>1?15:30);
  return y*10000+m*100+d;
}
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL=["January","February","March","April","May","June","July","August","September","October","November","December"];
function dateLabel(v){
  if(!v)return "—";
  const p=String(v).split("-");
  if(p.length===1)return p[0];
  const mo=MONTHS[+p[1]-1]||"";
  return p.length===2?`${mo} ${p[0]}`:`${+p[2]} ${mo} ${p[0]}`;
}
/* year-only and month-only dates are flagged in the table so the reader
   knows the ordering within that period is an estimate, not a record */
const datePrec=v=>v?String(v).split("-").length:0;

/* ---------- sort options ---------- */
/* Direction labels are per key: "newest first" only means something on a
   date, and "A → Z" only means something on a name. */
const SORTOPTS=[
  {k:"status",    l:"Status",                 asc:"Enacted first",   desc:"Pending first"},
  {k:"latest",    l:"Date — latest action",   asc:"Oldest first",    desc:"Newest first",   date:true},
  {k:"first",     l:"Date — first action",    asc:"Oldest first",    desc:"Newest first",   date:true},
  {k:"effective", l:"Date — takes effect",    asc:"Earliest first",  desc:"Latest first",   date:true},
  {k:"name",      l:"Name",                   asc:"A → Z",           desc:"Z → A"},
  {k:"juris",     l:"Jurisdiction",           asc:"A → Z",           desc:"Z → A"},
  {k:"youth",     l:"Youth focus",            asc:"Minors first",    desc:"All users first"},
  {k:"test",      l:"Functional test",        asc:"A → Z",           desc:"Z → A"},
  {k:"narrowing", l:"Narrowing device",       asc:"A → Z",           desc:"Z → A"},
  {k:"reaches",   l:"Reaches assistants",     asc:"Yes first",       desc:"No first"},
  {k:"nmech",     l:"Mechanisms carried",     asc:"Most first",      desc:"Fewest first"}
];
const SOPT=Object.fromEntries(SORTOPTS.map(o=>[o.k,o]));
/* a date sort opens newest-first, everything else opens ascending */
const defaultDir=k=>SOPT[k]&&SOPT[k].date?-1:1;

const state={q:"",j:new Set(),s:new Set(),y:new Set(),m:"",r:"",sort:"status",dir:1,open:new Set(),tile:null,mech:null,
  /* timeline: reading direction, and which kinds of event are shown */
  tldir:-1, tlk:new Set(["first","latest","effective"])};

const el=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- glossary tooltips ----------
   Any element carrying data-gl="<key>" gets a definition on hover, on
   keyboard focus and on tap. Keys resolve against GLOSSARY, or against
   MECHDEF and MECHGROUPS through the "mech:" and "group:" prefixes, so a
   mechanism definition never has to be written down twice. */
const TIP=document.createElement("div");
TIP.className="tip"; TIP.id="tip"; TIP.setAttribute("role","tooltip"); TIP.hidden=true;
document.body.appendChild(TIP);
let tipFor=null;

function glossLookup(key){
  if(!key)return null;
  if(key.indexOf("mech:")===0){
    const k=key.slice(5), m=MECHDEF[k];
    if(!m)return null;
    return {tag:MGROUP[k]?GMAP[MGROUP[k]].label:"Mechanism", t:MMAP[k]||k, d:m.def, line:m.line};
  }
  if(key.indexOf("group:")===0){
    const g=GMAP[key.slice(6)];
    return g?{tag:"Mechanism cluster", t:g.label, d:g.def}:null;
  }
  const e=GLOSSARY[key];
  return e?{t:e.t, d:e.d}:null;
}
/* below the term, flipped above it when there is no room, clamped to the
   viewport on both axes */
function placeTip(node){
  const r=node.getBoundingClientRect(), w=TIP.offsetWidth, h=TIP.offsetHeight, pad=10;
  let left=r.left+r.width/2-w/2;
  left=Math.max(pad,Math.min(left,window.innerWidth-w-pad));
  let top=r.bottom+8;
  if(top+h>window.innerHeight-pad&&r.top-h-8>pad)top=r.top-h-8;
  TIP.style.left=left+"px"; TIP.style.top=Math.max(pad,top)+"px";
}
function showTip(node){
  /* a click that re-renders the table hands us a detached node */
  if(!node.isConnected){hideTip();return;}
  const g=glossLookup(node.dataset.gl); if(!g)return;
  tipFor=node;
  TIP.innerHTML=(g.tag?`<div class="tip-tag">${esc(g.tag)}</div>`:"")+
    `<div class="tip-t">${esc(g.t)}</div><div class="tip-d">${esc(g.d)}</div>`+
    (g.line?`<div class="tip-l"><b>Where this dataset draws the line.</b> ${esc(g.line)}</div>`:"");
  TIP.hidden=false;
  placeTip(node);
  TIP.classList.add("on");
  node.setAttribute("aria-describedby","tip");
}
function hideTip(){
  if(tipFor)tipFor.removeAttribute("aria-describedby");
  tipFor=null; TIP.classList.remove("on"); TIP.hidden=true;
}
/* Hover is a mouse gesture only. A tap emits a synthetic mouseover as well
   as a click, and letting both through made the click toggle straight back
   off whatever the mouseover had just opened — so pointer type decides
   which handler owns the interaction. */
const PTR="onpointerover" in window;
document.addEventListener(PTR?"pointerover":"mouseover",e=>{
  if(PTR&&e.pointerType&&e.pointerType!=="mouse")return;
  const n=e.target.closest("[data-gl]");
  if(n===tipFor)return;
  if(n)showTip(n); else if(tipFor)hideTip();
});
document.addEventListener("focusin",e=>{
  const n=e.target.closest("[data-gl]");
  n?showTip(n):hideTip();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")hideTip()});
/* On a touch device the term itself is the affordance, since there is no
   hover. Skipped where the tap is also a control that opens the mechanism
   panel or changes the view: the definition is in what the tap opens, and
   a tooltip that flashes and dies as the view rebuilds is worse than none. */
document.addEventListener("click",e=>{
  const n=e.target.closest("[data-gl]");
  if(!n||n.closest("[data-mech],[data-group]")){hideTip();return;}
  tipFor===n?hideTip():showTip(n);
});
/* follow the term rather than dismissing on scroll — a tap on a phone
   scrolls the term into view, which would otherwise close the definition
   the moment it opened */
function trackTip(){
  if(!tipFor)return;
  tipFor.isConnected?placeTip(tipFor):hideTip();
}
window.addEventListener("scroll",trackTip,true);
window.addEventListener("resize",trackTip);

/* ---------- stat tiles (each one is a filter) ---------- */
const nStatus=s=>DATA.filter(d=>d.statusClass===s).length;
const stateLaw=DATA.filter(d=>d.juris==="US State"&&d.statusClass==="law");
const TILES=[
  {v:DATA.length, l:"Legislation", hint:"Show all", tip:"Clear every filter and show all legislation", f:{}},
  {v:nStatus("law"), l:"Enacted / in force", hint:"Filter", tip:"Filter to enacted and in-force legislation", f:{s:["law"]}},
  {v:new Set(stateLaw.map(d=>d.body)).size, l:"US states with law", hint:"Filter",
   tip:`Filter to enacted US state law — ${stateLaw.length} pieces of legislation across ${new Set(stateLaw.map(d=>d.body)).size} states`,
   f:{j:["US State"],s:["law"]}},
  {v:nStatus("moving"), l:"Moving", hint:"Filter", tip:"Filter to legislation that has advanced out of committee or passed a chamber", f:{s:["moving"]}},
  {v:DATA.filter(d=>d.youth==="only").length, l:"Youth-specific", hint:"Filter", youth:true,
   tip:"Filter to legislation that applies to minors only", f:{y:["only"]}},
  {v:DATA.filter(d=>d.mechs.includes("causation")).length, l:"Duty to test design", hint:"Filter", alert:true,
   tip:"Filter to legislation imposing a duty to test the provider's own design against harm", f:{m:"causation"}}
];
el("tiles").innerHTML=TILES.map((t,i)=>
  `<button type="button" class="tile" data-t="${i}" aria-pressed="false" title="${esc(t.tip)}">
     <div class="v"${t.alert?' style="color:var(--critical)"':t.youth?' style="color:var(--youth)"':''}>${t.v}</div>
     <div class="l">${esc(t.l)}</div>
     <div class="h">${esc(t.hint)} →</div>
   </button>`).join("");
const nt=el("ntotal"); if(nt) nt.textContent=DATA.length;
const nss=el("sum-states"); if(nss) nss.textContent=new Set(stateLaw.map(d=>d.body)).size;

el("tiles").onclick=e=>{
  const b=e.target.closest("[data-t]"); if(!b)return;
  const i=+b.dataset.t, f=TILES[i].f;
  resetFilters();
  (f.j||[]).forEach(v=>state.j.add(v));
  (f.s||[]).forEach(v=>state.s.add(v));
  (f.y||[]).forEach(v=>state.y.add(v));
  state.m=f.m||"";
  state.tile=i;
  syncControls();
  showView("legislation");
  render();
};

/* clear every filter without touching the tile highlight or re-rendering */
function resetFilters(){
  state.q="";state.j.clear();state.s.clear();state.y.clear();state.m="";state.r="";state.tile=null;
}
/* push state back into the filter controls */
function syncControls(){
  el("q").value=state.q;
  el("fm").value=state.m;
  el("fr").value=state.r;
  document.querySelectorAll("#fj [data-j]").forEach(c=>c.setAttribute("aria-pressed",String(state.j.has(c.dataset.j))));
  document.querySelectorAll("#fs [data-s]").forEach(c=>c.setAttribute("aria-pressed",String(state.s.has(c.dataset.s))));
  document.querySelectorAll("#fy [data-y]").forEach(c=>c.setAttribute("aria-pressed",String(state.y.has(c.dataset.y))));
}
function paintTiles(){
  document.querySelectorAll("#tiles [data-t]").forEach(b=>
    b.setAttribute("aria-pressed",String(state.tile===+b.dataset.t)));
}

/* ---------- filter controls ---------- */
el("fj").innerHTML=Object.keys(JCLASS).map(j=>
  `<button class="chip" data-j="${j}" aria-pressed="false" data-gl="juris">${j}</button>`).join("");
el("fs").innerHTML=STATUSES.map(s=>
  `<button class="chip" data-s="${s}" aria-pressed="false">${SLABEL[s]}</button>`).join("");
el("fy").innerHTML=YOUTHS.map(y=>
  `<button class="chip" data-y="${y}" aria-pressed="false" data-gl="youth:${y}">${esc(YLABEL[y])}</button>`).join("");
/* mechanism select, grouped by cluster. Each cluster also offers an
   "any mechanism in this cluster" option, value "g:<cluster key>". */
el("fm").innerHTML+=MECHGROUPS.map(g=>
  `<optgroup label="${esc(g.label)}">`+
  `<option value="g:${g.key}">Any mechanism in this cluster (${groupCount(g.key)})</option>`+
  g.mechs.map(k=>`<option value="${k}">${esc(MMAP[k])} (${nMech(k)})</option>`).join("")+
  `</optgroup>`).join("");

/* sort controls */
el("fsort").innerHTML=SORTOPTS.map(o=>`<option value="${o.k}">${esc(o.l)}</option>`).join("");
function dirLabel(){
  const o=SOPT[state.sort]||{asc:"Ascending",desc:"Descending"};
  return state.dir===1?o.asc+" ↑":o.desc+" ↓";
}
function syncSort(){
  el("fsort").value=state.sort;
  el("fdir").textContent=dirLabel();
  el("fdir").setAttribute("aria-label","Sort direction: "+dirLabel());
  document.querySelectorAll("#tbl th[data-k]").forEach(th=>{
    const on=th.dataset.k===state.sort, ar=th.querySelector(".ar");
    th.setAttribute("aria-sort",on?(state.dir===1?"ascending":"descending"):"none");
    if(ar){ar.textContent=on?(state.dir===1?"↑":"↓"):"↕"; ar.style.opacity=on?"1":"";}
  });
}
el("fsort").onchange=e=>{state.sort=e.target.value;state.dir=defaultDir(state.sort);render();};
el("fdir").onclick=()=>{state.dir*=-1;render();};

el("fj").onclick=e=>{const b=e.target.closest("[data-j]");if(!b)return;
  const v=b.dataset.j;state.j.has(v)?state.j.delete(v):state.j.add(v);
  b.setAttribute("aria-pressed",state.j.has(v));state.tile=null;render();};
el("fs").onclick=e=>{const b=e.target.closest("[data-s]");if(!b)return;
  const v=b.dataset.s;state.s.has(v)?state.s.delete(v):state.s.add(v);
  b.setAttribute("aria-pressed",state.s.has(v));state.tile=null;render();};
el("fy").onclick=e=>{const b=e.target.closest("[data-y]");if(!b)return;
  const v=b.dataset.y;state.y.has(v)?state.y.delete(v):state.y.add(v);
  b.setAttribute("aria-pressed",state.y.has(v));state.tile=null;render();};
el("q").oninput=e=>{state.q=e.target.value.toLowerCase();state.tile=null;render();};
el("fm").onchange=e=>{state.m=e.target.value;state.tile=null;render();};
el("fr").onchange=e=>{state.r=e.target.value;state.tile=null;render();};
el("clearall").onclick=()=>{
  resetFilters();
  syncControls();
  render();
};
document.querySelectorAll("#tbl th[data-k]").forEach(th=>th.onclick=()=>{
  const k=th.dataset.k;
  if(state.sort===k)state.dir*=-1;else{state.sort=k;state.dir=defaultDir(k);}
  render();
});

/* ---------- filtering ---------- */
function match(d){
  if(state.j.size&&!state.j.has(d.juris))return false;
  if(state.s.size&&!state.s.has(d.statusClass))return false;
  if(state.y.size&&!state.y.has(d.youth))return false;
  if(state.m){
    /* "g:<key>" matches any mechanism in that cluster */
    if(state.m.indexOf("g:")===0){ if(!inGroup(d,state.m.slice(2)))return false; }
    else if(!d.mechs.includes(state.m))return false;
  }
  if(state.r&&d.reaches!==state.r)return false;
  if(state.q){
    const ph=PHRASING[d.id]||{};
    const hay=[d.name,d.cite,d.body,d.juris,d.status,statusText(d),d.term,d.test,d.testNote,d.narrowing,
      d.note,d.dates,d.scope,YLABEL[d.youth],d.interval,d.enforce.join(" "),d.mechs.map(m=>MMAP[m]).join(" "),
      d.mechs.map(m=>GMAP[MGROUP[m]].label).join(" "),d.chron.first,d.chron.latest,d.chron.effective||"",
      Object.values(ph).map(p=>p.t+" "+(p.n||"")).join(" ")]
      .join(" ").toLowerCase();
    if(!hay.includes(state.q))return false;
  }
  return true;
}
const SORDER={law:0,moving:1,pending:2,stalled:3,dead:4};
const RORDER={yes:0,possibly:1,partial:2,no:3,unclear:4};
function sortKey(d){
  switch(state.sort){
    case "juris":return d.juris+d.body;
    case "status":return String(SORDER[d.statusClass]).padStart(2,"0")+d.name;
    case "youth":return String(YORDER[d.youth]).padStart(2,"0")+d.name;
    case "reaches":return String(RORDER[d.reaches]).padStart(2,"0")+d.name;
    case "nmech":return String(99-d.mechs.length).padStart(3,"0")+d.name;
    case "test":return d.test+d.name;
    case "narrowing":return d.narrowing+d.name;
    /* chronological — see stamp() on how an imprecise date is placed */
    case "latest":return stamp(d.chron.latest);
    case "first":return stamp(d.chron.first);
    case "effective":return stamp(d.chron.effective);
    default:return (d.body||"")+d.name;
  }
}
/* Legislation carrying no date on the chosen key — nothing states an
   effective date for most bills — sorts last in BOTH directions rather
   than jumping to the top when the order is reversed. */
function compare(a,b){
  const x=sortKey(a), y=sortKey(b);
  if(x===null&&y===null)return a.name.localeCompare(b.name);
  if(x===null)return 1;
  if(y===null)return -1;
  if(x<y)return -state.dir;
  if(x>y)return state.dir;
  return a.name.localeCompare(b.name);
}

/* ---------- render table ---------- */
function render(){
  hideTip();
  const rows=DATA.filter(match).sort(compare);
  paintTiles();
  syncSort();
  renderTimeline(rows);   /* same filtered set, read as dated actions */
  const o=SOPT[state.sort]||{l:state.sort};
  el("count").innerHTML=`${rows.length} of ${DATA.length} pieces of legislation · sorted by `+
    `${esc(o.l.toLowerCase())}, ${esc((state.dir===1?o.asc:o.desc)||"").toLowerCase()}`;
  el("tb").innerHTML=rows.map(d=>{
    const open=state.open.has(d.id);
    return `<tr class="row" data-id="${d.id}">
      <td><div class="nm">${esc(d.name)}</div><div class="cite">${esc(d.body)} · ${esc(d.cite)}</div></td>
      <td><span class="badge ${JCLASS[d.juris]}" data-gl="juris">${esc(d.juris)}</span></td>
      <td>${statusHTML(d)}</td>
      <td class="dt">${dateCell(d)}</td>
      <td><span class="yb ${d.youth}" data-gl="youth:${d.youth}">${esc(YSHORT[d.youth])}</span></td>
      <td style="font-size:13px"><span${glAttr(testFamily(d.test))}>${esc(d.test)}</span></td>
      <td style="font-size:13px"><span${glAttr(narrowFamily(d.narrowing))}>${esc(d.narrowing)}</span></td>
      <td><span class="reach r-${d.reaches}" data-gl="r:${d.reaches}">${d.reaches}</span></td>
      <td style="font-variant-numeric:tabular-nums">${d.mechs.length}</td>
    </tr>`+(open?detail(d):"");
  }).join("");
  if(!rows.length)el("tb").innerHTML=
    `<tr><td colspan="8" style="color:var(--muted);padding:22px 12px">No legislation matches these filters.${
      state.m?` Nothing in the corpus carries <b>${esc(MMAP[state.m])}</b> — open Mechanism coverage for what comes closest and why it falls short.`:""}</td></tr>`;
  el("tb").querySelectorAll("tr.row").forEach(tr=>tr.onclick=()=>{
    const id=tr.dataset.id;
    state.open.has(id)?state.open.delete(id):state.open.add(id);
    render();
  });
}
/* the emphasis attribute for a glossary term, or nothing if the value has
   no family we can resolve */
const glAttr=k=>k?` class="gl" data-gl="${k}"`:"";
/* the free-text `test` and `narrowing` values combine and qualify their
   families ("capability + purpose", "Use carve-out gated on 'only'"), so
   the family is read off the value by first mention rather than matched
   exactly. An unrecognised value simply gets no tooltip. */
function family(v,pairs){
  const t=String(v).toLowerCase();
  let best=null, at=Infinity;
  pairs.forEach(([re,k])=>{const i=t.search(re); if(i>-1&&i<at){at=i;best=k}});
  return best;
}
const testFamily=v=>family(v,[
  [/training objective/,"test:training"],[/technique/,"test:technique"],
  [/product form/,"test:form"],[/conduct/,"test:conduct"],[/behaviour/,"test:behaviour"],
  [/capability/,"test:capability"],[/purpose/,"test:purpose"]]);
const narrowFamily=v=>family(v,[
  [/marketing/,"narrow:marketing"],[/use carve-out/,"narrow:use"],
  [/purpose-primacy/,"narrow:primacy"],[/age-gated|age gate/,"narrow:age"],
  [/product-form/,"narrow:form"],[/mental health/,"narrow:mentalhealth"],
  [/^not applicable|^n\/a/,"narrow:na"],[/^unverified/,"narrow:unverified"],
  [/^none/,"narrow:none"]]);

/* the date column: latest action, with the effective date beneath it */
function dateCell(d){
  const c=d.chron, prec=datePrec(c.latest);
  const eff=c.effective
    ? `<div class="dt-e" data-gl="effective">${d.statusClass==="law"?"eff.":"would take eff."} ${esc(dateLabel(c.effective))}</div>`
    : "";
  return `<div class="dt-m${prec<3?" approx":""}"${prec<3?' data-gl="datePrecision"':''}>${esc(dateLabel(c.latest))}</div>`+eff;
}

function detail(d){
  const c=d.chron;
  return `<tr class="detail"><td colspan="9"><div class="dwrap">
    <div class="dgrid">
      <div class="dcell"><div class="k gl" data-gl="timeline">Timeline</div><div class="v">${esc(d.dates)}</div>
        <div class="v dts">
          <span data-gl="first">First action <b>${esc(dateLabel(c.first))}</b></span> ·
          <span data-gl="latest">latest action <b>${esc(dateLabel(c.latest))}</b></span>${
          c.effective?` · <span data-gl="effective">${d.statusClass==="law"?"takes effect":"would take effect"} <b>${esc(dateLabel(c.effective))}</b></span>`:""}
        </div></div>
      <div class="dcell"><div class="k gl" data-gl="scope">Scope</div><div class="v">${esc(d.scope)}</div>
        <div class="v" style="margin-top:3px"><span class="yb ${d.youth}" data-gl="youth:${d.youth}">${esc(YSHORT[d.youth])}</span></div></div>
      <div class="dcell"><div class="k gl" data-gl="term">Term used</div><div class="v">${esc(d.term)}</div></div>
      <div class="dcell"><div class="k gl" data-gl="interval">Disclosure interval</div><div class="v">${esc(d.interval)}</div></div>
      <div class="dcell"><div class="k gl" data-gl="enforce">Enforcement</div><div class="v">${d.enforce.map(esc).join(" · ")}</div></div>
    </div>
    <div class="dcell" style="margin-bottom:4px"><div class="k gl" data-gl="test">Functional test</div></div>
    <div class="quote">${esc(d.testNote)}</div>
    <div class="dnote">${esc(d.note)}</div>
    <div class="mlist">${d.mechs.map(m=>
      `<button type="button" class="mtag" data-mech="${m}" data-gl="mech:${m}">${esc(MMAP[m])} →</button>`).join("")}</div>
    <a class="dlink" href="${d.link}" target="_blank" rel="noopener">Source ↗</a>
  </div></td></tr>`;
}


/* ---------- timeline ----------
   One row per dated EVENT rather than per record, so a bill that was
   introduced in January, passed in June and bites in 2027 appears three
   times, where it belongs. Grouping is by year and then by month, and
   year-only dates get their own bucket inside the year instead of being
   placed in a month the source does not actually support. */
const TLKINDS=[
  ["first",     "First action"],
  ["latest",    "Latest action"],
  ["effective", "Takes effect"]
];
const NOWSTAMP=(()=>{const n=new Date();
  return n.getFullYear()*10000+(n.getMonth()+1)*100+n.getDate();})();

function tlEvents(rows){
  const ev=[];
  rows.forEach(d=>{
    const c=d.chron||{};
    const same=c.first&&c.latest&&c.first===c.latest;
    if(c.first)
      ev.push({d, date:c.first, kinds:same?["first","latest"]:["first"],
               cls:same?"latest":"first", label:same?statusText(d):"First action"});
    if(c.latest&&!same)
      ev.push({d, date:c.latest, kinds:["latest"], cls:"latest", label:statusText(d)});
    if(c.effective)
      ev.push({d, date:c.effective, kinds:["effective"], cls:"effective",
               label:d.statusClass==="law"?"Takes effect":"Would take effect"});
  });
  return ev;
}
function tlItem(e){
  const d=e.d, st=stamp(e.date), up=st>NOWSTAMP, prec=datePrec(e.date);
  return `<li class="tl-item k-${e.cls}${up?" upcoming":""}">
    <div class="tl-top">
      <span class="tl-date${prec<3?" approx":""}"${prec<3?' data-gl="datePrecision"':''}>${esc(dateLabel(e.date))}</span>
      <span class="tl-kind k-${e.cls}">${esc(e.label)}</span>
      ${up?'<span class="tl-up">upcoming</span>':""}
    </div>
    <button type="button" class="tl-title" data-open="${esc(d.id)}">${esc(d.name)}</button>
    <div class="tl-meta">
      <span class="badge ${JCLASS[d.juris]}" data-gl="juris">${esc(d.body)}</span>
      <span class="cite">${esc(d.cite)}</span>
      ${e.cls==="latest"?"":statusHTML(d)}
      ${d.youth==="none"?"":`<span class="yb ${d.youth}" data-gl="youth:${d.youth}">${esc(YSHORT[d.youth])}</span>`}
    </div>
  </li>`;
}
function renderTimeline(rows){
  const dir=state.tldir;
  const ev=tlEvents(rows).filter(e=>e.kinds.some(k=>state.tlk.has(k)))
    .sort((a,b)=>(stamp(a.date)-stamp(b.date))*dir);
  const nUp=ev.filter(e=>stamp(e.date)>NOWSTAMP).length;
  el("tlsum").textContent=ev.length
    ? `${ev.length} dated ${ev.length===1?"action":"actions"} across ${rows.length} of ${DATA.length} pieces of legislation`+
      (nUp?` · ${nUp} still to come`:"")
    : "";
  if(!ev.length){
    el("tl").innerHTML=`<p class="tl-empty">No dated actions match these filters.</p>`;
    return;
  }
  /* year -> month key -> events; "" is the bucket for year-only dates */
  const years=new Map();
  ev.forEach(e=>{
    const p=String(e.date).split("-"), y=p[0], mo=p.length>1?p[1]:"";
    if(!years.has(y))years.set(y,new Map());
    const ms=years.get(y);
    if(!ms.has(mo))ms.set(mo,[]);
    ms.get(mo).push(e);
  });
  el("tl").innerHTML=[...years.keys()].map(y=>{
    const ms=years.get(y);
    /* months in reading order; the undated bucket always sits last */
    const keys=[...ms.keys()].filter(k=>k).sort((a,b)=>(+a-+b)*dir);
    if(ms.has(""))keys.push("");
    const n=[...ms.values()].reduce((t,l)=>t+l.length,0);
    return `<section class="tl-year">
      <h2 class="tl-year-h">${esc(y)}<span class="n">${n} ${n===1?"action":"actions"}</span></h2>
      ${keys.map(mo=>`<div class="tl-month">
        <h3>${mo?esc(MONTHS_FULL[+mo-1]):"Month not recorded"}</h3>
        <ol class="tl-list">${ms.get(mo).map(tlItem).join("")}</ol>
      </div>`).join("")}
    </section>`;
  }).join("");
}

/* controls */
el("tldir").innerHTML=[[-1,"Newest first"],[1,"Oldest first"]].map(([v,l])=>
  `<button class="chip" data-dir="${v}" aria-pressed="${v===-1}">${l}</button>`).join("");
el("tlk").innerHTML=TLKINDS.map(([k,l])=>
  `<button class="chip" data-k="${k}" aria-pressed="true">${esc(l)}</button>`).join("");
el("tldir").onclick=e=>{const b=e.target.closest("[data-dir]"); if(!b)return;
  state.tldir=+b.dataset.dir;
  document.querySelectorAll("#tldir [data-dir]").forEach(x=>x.setAttribute("aria-pressed",String(+x.dataset.dir===state.tldir)));
  render();};
el("tlk").onclick=e=>{const b=e.target.closest("[data-k]"); if(!b)return;
  const k=b.dataset.k;
  /* never leave every kind off — the last one on stays on */
  if(state.tlk.has(k)&&state.tlk.size>1)state.tlk.delete(k); else state.tlk.add(k);
  b.setAttribute("aria-pressed",String(state.tlk.has(k)));
  render();};
el("tlclear").onclick=()=>{resetFilters();syncControls();render();};

/* a title in the timeline opens that record on the Legislation tab */
el("tl").addEventListener("click",e=>{
  const b=e.target.closest("[data-open]"); if(!b)return;
  const id=b.dataset.open;
  state.open.add(id);
  showView("legislation");
  render();
  const row=document.querySelector(`#tb tr.row[data-id="${id}"]`);
  if(row)row.scrollIntoView({behavior:"smooth",block:"center"});
});

/* ---------- coverage: clusters, then the mechanisms inside them ---------- */
(function(){
  /* one scale for every bar, so a bar in one cluster is comparable with a
     bar in another */
  const max=Math.max(...MECHS.map(([k])=>nMech(k)),1);

  /* cluster summary — how much legislation carries ANY mechanism in the
     cluster. This is the comparison the detailed bars cannot make. */
  el("clusters").innerHTML=MECHGROUPS.map(g=>{
    const n=groupCount(g.key);
    return `<button type="button" class="cl" data-group="${g.key}"
        aria-label="Filter to legislation carrying any ${esc(g.label.toLowerCase())} mechanism">
      <div class="cl-v">${n}<span class="cl-of">/${DATA.length}</span></div>
      <div class="cl-l gl" data-gl="group:${g.key}">${esc(g.label)}</div>
      <div class="cl-track"><div class="cl-fill" style="width:${Math.max(1.5,n/DATA.length*100)}%"></div></div>
      <div class="cl-h">${g.mechs.length} mechanisms · filter →</div>
    </button>`;
  }).join("");

  /* detailed bars, grouped by cluster and ordered by coverage within it */
  el("bars").innerHTML=MECHGROUPS.map(g=>{
    const rows=g.mechs.map(k=>[k,MMAP[k],nMech(k)]).sort((a,b)=>b[2]-a[2]);
    return `<div class="bgroup">
      <div class="bghd">
        <span class="bgt gl" data-gl="group:${g.key}">${esc(g.label)}</span>
        <span class="bgn">${groupCount(g.key)} of ${DATA.length} carry at least one</span>
        <button type="button" class="bgf" data-group="${g.key}">Filter →</button>
      </div>`+
      rows.map(([k,l,n])=>
        `<button type="button" class="bar" data-mech="${k}" aria-expanded="false">
         <div class="bl"><span class="gl" data-gl="mech:${k}">${esc(l)}</span></div>
         <div class="btrack"><div class="bfill ${n===0?'zero':''}" style="width:${n===0?1.5:Math.max(2,n/max*100)}%"></div></div>
         <div class="bv">${n}</div><div class="bc">▶</div></button>`).join("")+
    `</div>`;
  }).join("");
})();

/* a cluster heading or summary card filters the legislation view */
function filterByGroup(gk){
  resetFilters();
  state.m="g:"+gk;
  syncControls();
  showView("legislation");
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}
el("clusters").onclick=e=>{
  const b=e.target.closest("[data-group]"); if(!b)return;
  filterByGroup(b.dataset.group);
};

/* ---------- mechanism drill-down ---------- */
const PROVLAB={quote:"verbatim text",summary:"close paraphrase"};
function openMech(k,scroll){
  if(state.mech===k){closeMech();return;}
  state.mech=k;
  const label=MMAP[k], def=MECHDEF[k]||{}, grp=GMAP[MGROUP[k]];
  /* enacted law first, and within each status the legislation whose wording we hold */
  const has=d=>PHRASING[d.id]&&PHRASING[d.id][k]?0:1;
  const rows=DATA.filter(d=>d.mechs.includes(k))
    .sort((a,b)=>(SORDER[a.statusClass]-SORDER[b.statusClass])||(has(a)-has(b))
      ||a.juris.localeCompare(b.juris)||a.body.localeCompare(b.body));
  const nPhrased=rows.filter(d=>PHRASING[d.id]&&PHRASING[d.id][k]).length;
  const items=rows.map(d=>{
    const p=(PHRASING[d.id]||{})[k];
    const body=p
      ? `<p class="mp-q">${p.k==="quote"?"“"+esc(p.t)+"”":esc(p.t)}</p>`+(p.n?`<p class="mp-n">${esc(p.n)}</p>`:"")
      : `<p class="mp-todo">Wording not yet transcribed from the ${d.statusClass==="law"?"enacted text":"bill text"} — <a class="dlink" href="${d.link}" target="_blank" rel="noopener">read the source ↗</a></p>`;
    return `<div class="mp-item">
      <div class="mp-hd">
        <span class="badge ${JCLASS[d.juris]}">${esc(d.body)}</span>
        <span class="nm">${esc(d.cite)}</span>
        ${statusHTML(d)}
        ${d.youth==="none"?"":`<span class="yb ${d.youth}" data-gl="youth:${d.youth}">${esc(YSHORT[d.youth])}</span>`}
        <span class="prov ${p?p.k:"none"}" data-gl="prov:${p?p.k:"none"}">${p?esc(PROVLAB[p.k]):"not yet transcribed"}</span>
      </div>
      ${body}
    </div>`;
  }).join("");
  el("mechpanel").innerHTML=`<div class="mp">
    <button type="button" class="mp-close" id="mpclose">Close ✕</button>
    <p class="mp-grp"><button type="button" class="mp-gb gl" data-group="${grp.key}" data-gl="group:${grp.key}">${esc(grp.label)}</button></p>
    <h3>${esc(label)}</h3>
    <p class="mp-sub">${rows.length} of ${DATA.length} pieces of legislation carry this mechanism · wording transcribed for ${nPhrased} ·
      ${groupCount(grp.key)} carry at least one mechanism in this cluster</p>
    <p class="mp-def">${esc(def.def||"")}</p>
    ${def.line?`<p class="mp-line"><b>Where this dataset draws the line.</b> ${esc(def.line)}</p>`:""}
    <h4>How each piece of legislation words it</h4>
    ${items||'<p class="mp-todo">No legislation in the dataset carries this mechanism.</p>'}
    <p class="mp-key"><span class="prov quote" data-gl="prov:quote">verbatim text</span> quoted from the legislation itself ·
      <span class="prov summary" data-gl="prov:summary">close paraphrase</span> drawn from secondary analysis or this tracker's coding notes —
      verify against the enrolled text before quoting in published work.</p>
  </div>`;
  el("mpclose").onclick=closeMech;
  el("mechpanel").querySelectorAll("[data-group]").forEach(b=>b.onclick=()=>filterByGroup(b.dataset.group));
  document.querySelectorAll("#bars .bar").forEach(b=>b.setAttribute("aria-expanded",String(b.dataset.mech===k)));
  if(scroll!==false)el("mechpanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function closeMech(){
  state.mech=null;
  el("mechpanel").innerHTML="";
  document.querySelectorAll("#bars .bar").forEach(b=>b.setAttribute("aria-expanded","false"));
}
el("bars").onclick=e=>{
  const g=e.target.closest("[data-group]");
  if(g){filterByGroup(g.dataset.group);return;}
  const b=e.target.closest("[data-mech]"); if(!b)return;
  openMech(b.dataset.mech);
};
/* mechanism tags inside a legislation row jump to the same panel */
el("tb").addEventListener("click",e=>{
  const b=e.target.closest("[data-mech]"); if(!b)return;
  e.stopPropagation();
  showView("coverage");
  state.mech=null;
  openMech(b.dataset.mech);
});

/* ---------- matrix ---------- */
(function(){
  const rows=DATA.filter(d=>d.statusClass==="law"||d.statusClass==="moving"||d.key)
    .sort((a,b)=>(SORDER[a.statusClass]-SORDER[b.statusClass])||a.juris.localeCompare(b.juris));
  /* columns run in cluster order, with a band row naming each cluster and
     a divider on the column that starts one */
  const SHORT=Object.fromEntries(MECHS.map(([k,l,sh])=>[k,sh||l]));
  const head=`<thead>
    <tr><th class="rot mxcorner"></th>`+
      MECHGROUPS.map(g=>`<th class="mxband gstart" colspan="${g.mechs.length}"><span class="gl" data-gl="group:${g.key}">${esc(g.short)}</span></th>`).join("")+
    `</tr>
    <tr><th class="rot" style="width:200px"><span class="gl" data-gl="legislation">Legislation</span></th>`+
      MECH_ORDER.map(k=>`<th class="colh${GSTART.has(k)?" gstart":""}" data-mech="${k}" style="cursor:pointer"><span data-gl="mech:${k}">${esc(SHORT[k])}</span></th>`).join("")+
    `</tr></thead>`;
  const body=`<tbody>`+rows.map(d=>
    `<tr><th class="rot"><span class="badge ${JCLASS[d.juris]}" style="font-size:10px">${esc(d.body)}</span> ${esc(d.cite)}</th>`+
    MECH_ORDER.map(k=>{
      const on=d.mechs.includes(k);
      const lab=`${esc(d.cite)} — ${esc(MMAP[k])}: ${on?'yes':'no'}`;
      return `<td class="${GSTART.has(k)?"gstart":""}"><div class="cellbox ${on?'on':'off'}" role="img" aria-label="${lab}" title="${esc(d.name)} — ${esc(MMAP[k])}: ${on?'yes':'no'}"><span aria-hidden="true">${on?'●':'·'}</span></div></td>`;
    }).join("")+`</tr>`).join("")+`</tbody>`;
  el("mx").innerHTML=head+body;
  el("mx").onclick=e=>{
    const th=e.target.closest("th[data-mech]"); if(!th)return;
    state.mech=null;
    openMech(th.dataset.mech);
  };
})();

/* ---------- definitional anatomy table ---------- */
(function(){
  const rows=[...DATA].sort((a,b)=>(SORDER[a.statusClass]-SORDER[b.statusClass])||a.body.localeCompare(b.body));
  el("deftbl").innerHTML=`<thead><tr>
      <th style="cursor:default"><span class="gl" data-gl="legislation">Legislation</span></th>
      <th style="cursor:default"><span class="gl" data-gl="term">Term used</span></th>
      <th style="cursor:default"><span class="gl" data-gl="test">Test</span></th>
      <th style="cursor:default"><span class="gl" data-gl="narrowing">Narrowing device</span></th>
      <th style="cursor:default"><span class="gl" data-gl="reaches">Reaches assistants</span></th>
      <th style="cursor:default"><span class="gl" data-gl="scope">Scope</span></th>
    </tr></thead><tbody>`+rows.map(d=>
    `<tr><td><div class="nm" style="font-size:13.5px">${esc(d.cite)}</div>
       <div class="cite">${esc(d.body)} · ${statusHTML(d,' style="font-size:12px"')}</div></td>
     <td style="font-size:13px">${esc(d.term)}</td>
     <td style="font-size:13px"><span${glAttr(testFamily(d.test))}>${esc(d.test)}</span></td>
     <td style="font-size:13px"><span${glAttr(narrowFamily(d.narrowing))}>${esc(d.narrowing)}</span></td>
     <td><span class="reach r-${d.reaches}" data-gl="r:${d.reaches}">${d.reaches}</span></td>
     <td style="font-size:13px">${esc(d.scope)}</td></tr>`).join("")+`</tbody>`;
})();

/* ---------- tabs & theme ---------- */
function showView(v){
  document.querySelectorAll("nav.tabs button").forEach(x=>x.setAttribute("aria-selected",String(x.dataset.v===v)));
  document.querySelectorAll("section.view").forEach(s=>s.classList.toggle("on",s.id==="v-"+v));
}
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>{
  showView(b.dataset.v);
  window.scrollTo({top:0,behavior:"smooth"});
});
el("themebtn").onclick=()=>{
  const d=document.documentElement.getAttribute("data-theme")==="dark";
  document.documentElement.setAttribute("data-theme",d?"light":"dark");
  el("themebtn").textContent=d?"Dark":"Light";
};
render();

/* ==================================================================
   HOW TO USE THIS TRACKER
   Everything numeric below is computed from DATA, PHRASING and MECHS
   at render time. Nothing here is typed in by hand, so the copy
   cannot drift away from the dataset it describes.
   ================================================================== */
(function(){
  const n=DATA.length;
  const nJuris=j=>DATA.filter(d=>d.juris===j).length;
  const nReach=v=>DATA.filter(d=>d.reaches===v).length;
  const nYouth=v=>DATA.filter(d=>d.youth===v).length;
  const stLaw=DATA.filter(d=>d.juris==="US State"&&d.statusClass==="law");
  const nStates=new Set(stLaw.map(d=>d.body)).size;
  /* enacted law that does not bite yet — why status is not the same as bite */
  const later=DATA.filter(d=>d.statusClass==="law"&&d.chron.effective&&
    +String(d.chron.effective).slice(0,4)>=2027);
  const laterYears=[...new Set(later.map(d=>String(d.chron.effective).slice(0,4)))].sort();
  /* how far the reading behind each row goes */
  const nUnver=DATA.filter(d=>/unverified|assumed/i.test(d.narrowing)).length;
  const nUnclear=nReach("unclear");
  let pairs=0, transcribed=0;
  DATA.forEach(d=>d.mechs.forEach(k=>{pairs++; if((PHRASING[d.id]||{})[k])transcribed++;}));
  const pctT=Math.round(transcribed/pairs*100);
  const nPRA=DATA.filter(d=>d.enforce.some(e=>/private/i.test(e))).length;
  const jurisLine=Object.keys(JCLASS).map(j=>`${nJuris(j)} ${j}`).join(" · ");
  const statusLine=STATUSES.map(s=>`${nStatus(s)} ${SLABEL[s].toLowerCase()}`).join(" · ");
  const REACHV=["yes","possibly","partial","no","unclear"];
  /* the counts are computed, so the noun after one of them has to agree with whatever comes back */
  const plural=(v,w)=>`${v} ${w}${v===1?"":"s"}`;
  const ofAll=v=>`${v} of the ${n} records`;
  const vb=(v,one,many)=>v===1?one:many;

  /* the worked example is read out of its own record, so amending the
     record amends the paragraph */
  const ex=DATA.find(d=>d.id==="ny-art47");
  const worked=ex?`
<p><b>A worked example.</b> Take <b>${esc(ex.name)}</b> (${esc(ex.body)} · ${esc(ex.cite)}). Its term is
“${esc(ex.term)}” — a categorical noun that reads like the name of a product class. Its test is
<b>${esc(ex.test)}</b>: ${esc(ex.testNote)} — a description of things a system does, which a system never
marketed as a companion can satisfy. Its narrowing device is <b>${esc(ex.narrowing)}</b>, which takes back
out what the test caught. The tracker codes it
<span class="reach r-${ex.reaches}" data-gl="r:${ex.reaches}">${esc(ex.reaches)}</span> on reach.</p>
<p>Read the term on its own and you would answer that the statute covers companion apps. Read the test on its
own and you would answer that it covers anything with memory that asks after you. Read the carve-out on its own
and you would answer that ordinary software is exempt. The coding in the last column is the product of all
three fields, and any one of them read alone gives a different answer from the row.</p>`:"";

  /* six questions the tracker is built to answer, and the filter path to
     each; the heading counts the list so the two cannot disagree */
  const QS=[
    ["What must I comply with now?",
     `Filter <b>Status → Enacted / in force</b> in the Legislation view, or press the
      <b>Enacted / in force</b> tile. That gives ${nStatus("law")} of ${n} records. Then read the
      <i>eff.</i> line under each date: ${later.length} of them do not take effect until
      ${laterYears.join(" or ")}.`],
    ["Does any of this reach a general assistant?",
     `Use the <b>Reaches assistants</b> filter, or sort by that column. ${nReach("yes")} records are coded
      <span class="reach r-yes">yes</span> and ${nReach("possibly")}
      <span class="reach r-possibly">possibly</span>; ${nUnclear} are
      <span class="reach r-unclear">unclear</span> and have not been read against the enrolled text yet.
      The Definitional anatomy view puts the coding next to the term, test and carve-out it came from.`],
    ["Which laws cover adults, not just minors?",
     `Filter <b>Youth focus → No minor-specific rules</b> for the ${nYouth("none")} records that draw no line at eighteen, and
      add <b>Minor-specific duties</b> for the further ${nYouth("duties")} that bind everyone but ask more where
      the user is a minor. The remaining ${nYouth("only")} apply to minors only.`],
    ["Who can enforce it, and can an individual sue?",
     `Open any row and read the <b class="gl" data-gl="enforce">Enforcement</b> cell, which lists the routes the
      text provides. ${ofAll(nPRA)} name${vb(nPRA,"s","")} a private action of some kind; the rest run through a
      regulator, an attorney general, or the criminal law.`],
    ["Is anyone regulating <i>X</i>?",
     `Pick <i>X</i> from the <b>Mechanism</b> filter, which is grouped into the same
      <span class="gl" data-gl="cluster">clusters</span> as the coverage view, and carries the count next to
      each option. A mechanism may return nothing:
      <b>${esc(MMAP.memory)}</b> is carried by ${plural(nMech("memory"),"record")} and stays in the list so the absence
      is visible.`],
    ["What does one particular bill say about disclosure?",
     `Go to <b>Mechanism coverage</b>, click the mechanism, and read down the panel: every record carrying it
      appears with its wording, tagged <i>verbatim text</i>, <i>close paraphrase</i>, or
      <i>not yet transcribed</i> with a link to the source. The same panel opens from a mechanism tag inside an
      expanded row, or from a column heading in the matrix.`]
  ];
  const NUMWORD=["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten"];
  const qCount=NUMWORD[QS.length]||String(QS.length);

  el("howto").innerHTML=`
<p class="glhint" style="margin-bottom:18px">Hover — or tap, or tab to — any <b>dotted term</b> for its definition.</p>

<h2>What this tracker is</h2>
<p>A coded dataset of ${n} pieces of legislation regulating AI companions and conversational systems:
${jurisLine}. By status, that is ${statusLine}. Enacted law sits in ${nStates} US states
(${stLaw.length} records) alongside the federal bills still in motion.</p>
<p>Other trackers answer two questions well: what stage a bill has reached, and what it obliges an operator to
do. This one records a third thing. For every instrument it codes the <b class="gl" data-gl="term">term</b> the
text uses for the thing it regulates, the <b class="gl" data-gl="test">test</b> that decides what falls inside
that term, the <b class="gl" data-gl="narrowing">narrowing device</b> that pulls things back out, and a
judgement about whether the resulting definition
<b class="gl" data-gl="reaches">reaches general-purpose assistants</b> of the ChatGPT class rather than only
purpose-built companion apps. If you need to know whether a bill has moved this week, use one of the status
trackers listed at the foot of this page. If you need to know what its definition actually catches, use this.</p>
<div class="callout"><b>The corpus is live, not cumulative.</b> Legislation that dies, is vetoed, goes inactive
or is superseded is deleted from the dataset rather than kept with a “dead” status, so the ${n} records
describe the landscape as it stands rather than everything that has ever been filed. Nine instruments were
removed on that basis in August 2026, among them a Florida bill that is still widely reported as enacted. This
is why the totals here will not match a tracker that archives failed bills — the removals, and the reason for
each, are listed in the README.</div>

<h2>Start here: term, test, narrowing</h2>
<p>Asking whether a bill “covers companion apps or chatbots generally” collapses three separate questions that
this dataset keeps apart. They are coded in three separate columns because they routinely disagree with one
another.</p>
<div class="cards3">
  <div class="card"><h4><span class="gl" data-gl="term">Term</span></h4><p>The defined phrase the text actually
    uses — “companion chatbot”, “AI companion”, “AI chatbot”, or in several instruments no product term at all.
    It is the most visible part of a definition and the least load-bearing.</p></div>
  <div class="card"><h4><span class="gl" data-gl="test">Test</span></h4><p>The kind of question the definition
    asks to decide what the term covers: what the system can do, what it does in interaction, what it was built
    for, what it said, what it was trained for, or what technique it deploys to what effect.</p></div>
  <div class="card"><h4><span class="gl" data-gl="narrowing">Narrowing device</span></h4><p>What pulls things
    back out again — a marketing carve-out, a use carve-out, a purpose-primacy gate, an age gate, a
    product-form limit, or nothing. A broad test with a wide exclusion can end up back at a product
    category.</p></div>
</div>
${worked}

<h2>Reading a row</h2>
<p>The Legislation view is one row per instrument; clicking a row expands it. What each field holds:</p>
<ul>
  <li><b>Status</b> — how far the instrument has travelled:
    ${STATUSES.map(s=>`<span class="st ${s}" data-gl="st:${s}">${esc(SLABEL[s])}</span>`).join(" · ")}.
    Status is not the same as bite. ${later.length} of the ${nStatus("law")} enacted records carry an effective
    date in ${laterYears.join(" or ")}, so they are law today and impose nothing yet.</li>
  <li><b>Latest action</b> and the <b>Sort</b> control — the date column shows the most recent thing that
    happened, with the effective date beneath it where the text states one. Dates are recorded at whatever
    precision the source supports and a
    <span class="gl" data-gl="datePrecision">year-only date</span> is placed at the middle of its period, which
    is marked with a dotted underline. The Sort control orders by first action, latest action or effective date
    as well as by any coded column; the direction label changes with the key, so “newest first” only appears on
    a date.</li>
  <li><b class="gl" data-gl="youth">Youth focus</b> — who the instrument binds:
    ${YOUTHS.map(y=>`<span class="yb ${y}" data-gl="youth:${y}">${esc(YLABEL[y])}</span>`).join(" · ")}.
    It is derived from the Scope field in the expanded row and reads the same way.</li>
  <li><b class="gl" data-gl="test">Test</b> and <b class="gl" data-gl="narrowing">Narrowing device</b> — the
    two definitional columns. Both are free text that names a family and then qualifies it, so “capability +
    purpose” and “Use carve-out gated on&nbsp;'only'” each hover to the family they lead with. The full
    definitional clause, quoted or closely paraphrased, is in the expanded row under <i>Functional test</i>.</li>
  <li><b class="gl" data-gl="reaches">Reaches assistants</b> — the coding this tracker exists for:
    ${REACHV.map(v=>`<span class="reach r-${v}" data-gl="r:${v}">${v}</span>&nbsp;(${nReach(v)})`).join(" · ")}.
    It is an interpretive reading of the text, not a measurement — see the next section.</li>
  <li><b class="gl" data-gl="nmech">Mechs</b> — how many of the ${MECHS.length} coded mechanisms the instrument
    imposes, grouped into ${MECHGROUPS.length} clusters. It counts breadth and not stringency: one demanding
    obligation and six weak ones both read as a number. The tags in the expanded row open the mechanism panel,
    where the wording of that obligation in every instrument carrying it sits side by side.</li>
</ul>

<h2>${qCount} questions, and how to get the answer</h2>
<div class="cards2">
  ${QS.map(([q,a])=>`<div class="card"><h4>${q}</h4><p>${a}</p></div>`).join("")}
</div>

<h2>How much weight each cell will bear</h2>
<p>The rows are not read to the same depth, and the dataset says which is which rather than levelling them out.
Some records are coded against the enrolled or introduced text; some are coded from legislative-tracker
summaries and law-firm analyses; and for some the definitional clause has not been read at all. Three figures
locate the boundary:</p>
<ul>
  <li><b>${ofAll(nUnver)}</b> ${vb(nUnver,"carries","carry")} a narrowing device marked <i>unverified</i> or <i>assumed</i> —
    the carve-out has not been checked against the text of the instrument itself.</li>
  <li><b>${ofAll(nUnclear)}</b> ${vb(nUnclear,"is","are")} coded
    <span class="reach r-unclear" data-gl="r:unclear">unclear</span> on reach, which records that the
    definitional clause has not been read against the enrolled text. It is a gap in the coding, not a finding
    about the instrument.</li>
  <li><b>${transcribed} of the ${pairs} mechanism–instrument pairs (${pctT}%)</b> ${vb(transcribed,"carries","carry")} sourced operative wording
    in the mechanism panel. The remaining ${pairs-transcribed} render as <i>not yet transcribed</i> with a link
    to the source; nothing is paraphrased from nothing to fill the space.</li>
</ul>
<p><b>“Reaches assistants” is an interpretive judgement about statutory language, not an observation about the
world.</b> Nobody has litigated most of these definitions, and a court could read any of them differently. The
five values mean:</p>
<ul>
  ${REACHV.map(v=>`<li><span class="reach r-${v}" data-gl="r:${v}">${v}</span> (${plural(nReach(v),"record")}) —
    ${esc((GLOSSARY["r:"+v]||{}).d||"")}</li>`).join("")}
</ul>
<p>The mechanism coding is a different kind of claim and a firmer one: it records whether an instrument imposes
an obligation of a given kind, not how demanding that obligation is. Two records carrying the same mechanism
may be very far apart in what they require, and the panel for that mechanism is where the wording can be
compared.</p>

<h2>What this tracker will not do for you</h2>
<div class="card"><h4>It is not compliance advice</h4><p>The coding is a research instrument for comparing how
  instruments define their object. It is not legal advice, it is not a compliance checklist, and no cell here
  should be relied on for an operational decision. Read the source text — every record links to it — and take
  advice on it.</p></div>
<div class="card"><h4>It is not a status feed</h4><p>Statuses are re-verified on a review cycle, not
  continuously, and a bill can move between cycles. For currency, the Future of Privacy Forum's chatbot
  legislation tracker, MultiState and White &amp; Case's AI Watch are all better sources, and where any of them
  disagrees with a status here, they are more likely to be right. Tell us, on the
  <a href="https://github.com/joliver-commits/companion-ai-policy-tracker/issues" target="_blank" rel="noopener">issues page</a>,
  and the record gets corrected.</p></div>
<div class="card"><h4>It does not carry every bill that mentions a chatbot</h4><p>Inclusion has two limbs: the
  instrument must be live — proposed, active or enacted, with dead, vetoed and superseded legislation deleted
  rather than archived — and it must say something about the relationship between a system and its user, rather
  than about AI outputs or AI decisions in general. A statute that catches a companion chatbot the same way it
  catches a hiring algorithm is out of scope. Instruments checked against that second limb and excluded are
  listed by name, with the reason, in the README's <i>Reviewed and excluded</i> table, so a reader can see they
  were considered rather than missed.</p></div>
<div class="card"><h4>It does not rank or score</h4><p>There is no index, no grade and no league table. The
  mechanism count is a count. Nothing in the dataset asserts that one instrument is stronger, better drafted or
  more advisable than another, and the ordering of any view is a sort key rather than a verdict.</p></div>

<h2>Method, sources and corrections</h2>
<p>The full method sits in the
  <a href="https://github.com/joliver-commits/companion-ai-policy-tracker#readme" target="_blank" rel="noopener">repository README</a>:
  the controlled vocabularies for every coded field, the inclusion and removal rules, how partial dates are
  resolved, what each mechanism means and where the coding draws its line, and the review cadence. The record
  shape and the coding conventions for a new entry are in CONTRIBUTING.md. Primary bill and statutory text is
  the first source for every record; where it was not obtainable, legislative trackers and law-firm analyses
  are, and the link on each record points at the best available reference for it.</p>
<p><b>The two most useful things anyone can send.</b> First, <b>transcribed enrolled or introduced text</b> for
  the ${pairs-transcribed} mechanism–instrument pairs still lacking wording — the operative sentence, with its
  section number, for a mechanism a record already carries. Second, <b>the definitional clause and its
  carve-out</b> for the ${plural(nUnclear,"record")} coded
  <span class="reach r-unclear" data-gl="r:unclear">unclear</span> on reach and the ${nUnver} whose narrowing
  device is unverified; those two clauses are what the reach coding is read from, and quoting them is what
  turns a gap into a coding. Both go in as a pull request against <code>data.js</code>, or as an
  <a href="https://github.com/joliver-commits/companion-ai-policy-tracker/issues" target="_blank" rel="noopener">issue</a>
  with the text pasted in.</p>
<p>Corrections to a coding are welcome on the same terms, with the clause you read it from. What is not needed
  here is argument about the framework: the analysis this dataset was built for lives in the accompanying
  paper, and this tracker documents its coding rather than reasoning from it.</p>
`;
})();
