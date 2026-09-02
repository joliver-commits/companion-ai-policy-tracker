const JCLASS={"US Federal":"j-fed","US State":"j-state","EU":"j-eu","China":"j-cn"};
const JVAR={"US Federal":"var(--j-fed)","US State":"var(--j-state)","EU":"var(--j-eu)","China":"var(--j-cn)"};
const MMAP=Object.fromEntries(MECHS);
const STATUSES=["law","moving","pending","stalled"];
const SLABEL={law:"Enacted / in force",moving:"Moving",pending:"Pending",stalled:"Stalled"};
/* youth focus — whether the legislation is aimed at minors */
const YOUTHS=["only","duties","none"];
const YLABEL={only:"Minors only",duties:"Minor-specific duties",none:"All users"};
const YSHORT={only:"Minors only",duties:"Minor duties",none:"—"};
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

const state={q:"",j:new Set(),s:new Set(),y:new Set(),m:"",r:"",sort:"status",dir:1,open:new Set(),tile:null,mech:null};

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
  {v:DATA.filter(d=>d.mechs.includes("memory")).length, l:"Cap memory", hint:"Filter", alert:true,
   tip:"No legislation in the corpus caps memory — see Mechanism coverage for the two that come closest", f:{m:"memory"}},
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
  `<button class="chip" data-j="${j}" aria-pressed="false"><span class="dot" style="background:${JVAR[j]}"></span>${j}</button>`).join("");
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
    const hay=[d.name,d.cite,d.body,d.juris,d.status,d.term,d.test,d.testNote,d.narrowing,
      d.note,d.dates,d.scope,YLABEL[d.youth],d.interval,d.enforce.join(" "),d.mechs.map(m=>MMAP[m]).join(" "),
      d.mechs.map(m=>GMAP[MGROUP[m]].label).join(" "),d.chron.first,d.chron.latest,d.chron.effective||"",
      Object.values(ph).map(p=>p.t+" "+(p.n||"")).join(" ")]
      .join(" ").toLowerCase();
    if(!hay.includes(state.q))return false;
  }
  return true;
}
const SORDER={law:0,moving:1,pending:2,stalled:3,dead:4};
const RORDER={yes:0,arguably:1,partial:2,no:3,unclear:4};
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
  const o=SOPT[state.sort]||{l:state.sort};
  el("count").innerHTML=`${rows.length} of ${DATA.length} pieces of legislation · sorted by `+
    `${esc(o.l.toLowerCase())}, ${esc((state.dir===1?o.asc:o.desc)||"").toLowerCase()}`;
  el("tb").innerHTML=rows.map(d=>{
    const open=state.open.has(d.id);
    return `<tr class="row" data-id="${d.id}">
      <td><div class="nm">${esc(d.name)}</div><div class="cite">${esc(d.body)} · ${esc(d.cite)}</div></td>
      <td><span class="badge ${JCLASS[d.juris]}" data-gl="juris">${esc(d.juris)}</span></td>
      <td><span class="st ${d.statusClass}" data-gl="st:${d.statusClass}">${esc(d.status)}</span></td>
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
        <span class="st ${d.statusClass}">${esc(d.status)}</span>
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
      return `<td class="${GSTART.has(k)?"gstart":""}"><div class="cellbox" title="${esc(d.name)} — ${esc(MMAP[k])}: ${on?'yes':'no'}" style="background:${on?'var(--seq-400)':'var(--grid)'};color:${on?'#fff':'transparent'}">${on?'●':'·'}</div></td>`;
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
       <div class="cite">${esc(d.body)} · <span class="st ${d.statusClass}" style="font-size:12px" data-gl="st:${d.statusClass}">${esc(d.status)}</span></div></td>
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

el("gaps").innerHTML=`
<p class="glhint" style="margin-bottom:18px">Hover — or tap, or tab to — any <b>dotted term</b> for its definition.</p>
<h2>What the corpus agrees on</h2>
<p>Read across all ${DATA.length} pieces of legislation, the convergence is striking and almost entirely unacknowledged by the drafters themselves. Nearly every piece of legislation defines its object by <b class="gl" data-gl="functional">what the system does</b> — simulating interaction, sustaining a relationship, recognising and responding to emotion, retaining memory — rather than by what kind of product it is. The <span class="gl" data-gl="categorical">categorical thinking</span> survives in the vocabulary, and decisively in the exclusions, but not in the tests.</p>
<p>The operative provisions cluster just as tightly. Four moves recur almost everywhere: a non-human disclosure, a crisis and self-harm protocol with referral to a hotline, content restrictions for minors, and some form of periodic reminder. Beyond that quartet the legislation thins out fast.</p>

<div class="cards2">
  <div class="card ok"><h4>Disclosure is universal</h4><p>Almost every piece of legislation requires the system to say it is not human. It is the cheapest intervention available and the one on which everyone agrees.</p></div>
  <div class="card ok"><h4>Crisis protocols are near-universal</h4><p>Detection of suicidal ideation plus referral to a crisis line appears in nearly every enacted law. China alone requires a human to take over the conversation.</p></div>
  <div class="card partial"><h4>Engagement design is reached only at the edges</h4><p>Oregon names variable-reward affirmations, Illinois names simulated distress for retention, the Youth AI Privacy Act names push alerts and typing indicators. Everywhere else the design layer is untouched.</p></div>
  <div class="card gap"><h4>Nobody regulates duration</h4><p>No legislation in any jurisdiction sets a session cap, a cooling-off period, or an overnight restriction for minors. China's two-hour break reminder is the closest thing that exists, and it is still a reminder.</p></div>
  <div class="card gap"><h4>Nobody caps memory</h4><p>Persistent memory appears throughout the corpus as a <i>definitional signal</i> — evidence that a system is a companion — and nowhere as a design property to be limited. No instrument states how long a system may keep what a user told it.</p></div>
</div>

<h2>The five recurring weaknesses</h2>

<h3>1. Policies agree where the intervention is cheapest and fall silent where it bites</h3>
<p>Disclosure regulates the user's <i>awareness</i> of a design property. It does not touch the property. A regime built on telling a fourteen-year-old every three hours that the thing she is confiding in is not a person leaves entirely intact the memory that makes it feel like a relationship, the availability that makes it feel like a friend, and the validation that makes it feel better than her friends. The legislation converges on the label and diverge — or say nothing — on the mechanism.</p>

<h3>2. Three narrowing devices quietly reintroduce classification by self-presentation</h3>
<p>A functional test that is then narrowed can end up back at a product category. Three devices do this work, and it is worth naming them separately because they are gameable to very different degrees:</p>
<ul>
  <li><b class="gl" data-gl="narrow:marketing">The marketing carve-out</b> — New York alone. GBL § 1700(4)(c) excludes "any system that is primarily designed <i>and marketed</i> for providing efficiency improvements or, research or technical assistance." A developer exits the regime by rewriting copy. This is the most gameable device in circulation and it is enacted law. It is not, however, the only device New York uses: the same subsection carries two use-based exclusions alongside it, so Article 47 belongs on both of the first two lines of this list.</li>
  <li><b class="gl" data-gl="narrow:use">The use carve-out</b> — California, Oregon, Missouri, New York and now China. Excludes systems used "only for" or "solely for the purpose of" customer service, productivity, education and the like; New York's limbs reach systems used "solely for customer service" and "solely for internal purposes or employee productivity." Harder to game, because it turns on what the product is actually used for rather than how it is described — and California's, gated on <i>only</i>, arguably fails to exclude ChatGPT at all.</li>
  <li><b class="gl" data-gl="narrow:primacy">The purpose-primacy gate</b> — the CHAT Act. No exclusions are needed because the words "exists for the primary purpose of" do the exclusionary work inside the definition. On the usage evidence, companionship is a use a general assistant is <i>put to</i> rather than the purpose it was <i>built for</i>, so a primacy test exempts precisely the tools where most relational use occurs.</li>
</ul>
<p>Illinois SB 3262 is the only legislation that refuses all three, defining its object "irrespective of how the system is marketed or labeled." It is also still sitting in committee.</p>

<h3>3. Every piece of legislation picks a different feature set</h3>
<p>New York takes memory, unprompted emotional questioning and personal dialogue. California takes adaptive response, social needs, anthropomorphism and sustained relationship. Oregon takes design purpose. Illinois takes emotional resonance plus a memory presumption. China takes simulated personality plus continuous emotional interaction. Five pieces of legislation, five constructs — all circling the same underlying object, none acknowledging the others.</p>
<p>The consequence is not academic. A developer operating in twelve states faces twelve overlapping definitions of the same thing, which is an argument for federal preemption that the industry will make and that a clearly stated functional definition would answer better.</p>

<h3>4. The same design property is put to opposite work</h3>
<p>New York's Article 47 uses "asking unprompted or unsolicited emotion-based questions" as a <i>test for identifying</i> a companion. The Youth AI Privacy Act would <i>prohibit</i> unprompted outputs as a design feature. One makes proactive emotional questioning the trigger for regulation; the other bans it. Both are functional. They simply cannot both be right about what the property is for.</p>

<h3>5. Enforcement design varies more than substance</h3>
<p>The single most consequential variable in this corpus is not what a statute requires but who can sue. Connecticut is attorney-general only with no <span class="gl" data-gl="pra">private right of action</span>. Oregon carries a private right of action at $1,000 per violation. New York's enacted Article 47 is AG-only; its Assembly twin A6767 is substantively identical but lets harmed individuals sue. And the Youth AI Privacy Act's private right of action was stripped in the 5 August 2026 markup. Two statutes with identical operative text and different enforcement routes are, in practice, different laws.</p>

<h2>The gaps — what no legislation does</h2>

<div class="card gap"><h4>No <span class="gl" data-gl="retention">cap on memory</span> anywhere in the corpus</h4><p>Persistent memory is the feature most heavily advertised by the products and the one most central to making an exchange feel like an accumulating relationship. <b>Not one piece of legislation in this corpus — enacted, moving or proposed — caps it.</b> Two come closest and neither arrives. Illinois SB 3262 makes persistent memory the rebuttable <i>trigger</i> for its regime, which constrains nothing about retention. The Youth AI Privacy Act limits the data a deployer may <i>process</i> to personalise outputs, session-scoped and within an FTC-set recency window — a limit on personalisation, not on how long the record of a conversation may be kept. A cap on memory would state a retention period. Nothing states one.</p></div>

<div class="card gap"><h4>No limit on duration anywhere</h4><p>No session cap, no cooling-off period after extended use, no overnight restriction for minors, in any of the jurisdictions surveyed. Constant availability is one of the four functions and it is regulated exclusively by reminder.</p></div>

<div class="card gap"><h4>Nothing addresses re-engagement using retained emotional disclosures</h4><p>Illinois bars <i>simulated distress</i> deployed when a user tries to leave. China requires intervention on detected dependency. But no legislation, enacted or proposed, prohibits a system from using a child's actual retained disclosures — the breakup, the diagnosis, the fight with a parent — to draw a lapsed user back. This is the sharpest unoccupied space in the corpus.</p></div>

<div class="card gap"><h4>No duty to investigate causation</h4><p>Numerous pieces of legislation require reporting how many users were referred to crisis resources. Illinois and California SB 1119 would require a third-party compliance audit. <b>Not one requires a company to test whether its own design choices produce the crises it is counting.</b> That asymmetry lets a company demonstrate compliance while remaining structurally incurious about causation. It is the clearest gap in the entire landscape and the one where a research institution has the most to contribute.</p></div>

<div class="card partial"><h4>Protection often stops at eighteen</h4><p>Most legislation covers minors only. On the current trajectory an adult using a product designed to simulate emotional dependence has no protection from a design property prohibited when the user is seventeen. Notably, the legislation that covers all users — New York, Illinois, Kansas, the People-First Chatbot Act, the EU AI Act, China — are disproportionately the ones that trigger functionally. Once the object is defined by what it does, restricting the remedy by user age becomes harder to justify.</p></div>

<div class="card partial"><h4>The empathic / manipulative line remains undrawn</h4><p>Four state laws prohibit simulating emotional dependence without defining it. The People-First Chatbot Act defines it by the user's <i>state</i> — reliance as a primary source of support — which is measurable after the fact but offers a drafter no guidance on which features to constrain in advance. A functional definition does not dissolve this problem. It relocates it from "what kind of product is this" to "which behaviours count as manipulative", which is a better question but not an easy one.</p></div>

<div class="card gap"><h4>The disclosure interval is a guess repeated</h4><p>Intervals in force or proposed run from every 30 minutes to every 3 hours to once per day — a sixfold spread with no stated rationale anywhere. Either the interval should be set from evidence about belief and attachment, or the mechanism should be recognised as expressive rather than protective and weighted accordingly.</p></div>

<h2>What policymakers should know</h2>

<div class="card"><h4>You are already regulating functionally — the problem is the qualifier, not the noun</h4><p>The most common misconception is that these laws target a special category of companion app while <span class="gl" data-gl="assistants">general assistants</span> go unregulated. As a matter of statutory text that is largely false. Most legislation defines its object by design features. California's may already reach ChatGPT on the face of its text. The gap is not between product-category drafting and functional drafting; it is between what has been <i>drafted</i> and what has been <i>passed</i>, and between a functional test and the carve-out that narrows it.</p></div>

<div class="card"><h4>Industry lobbying tells you what the text actually reaches</h4><p>SIIA asked Virginia to add a safe harbour covering "customer-service chatbots, educational tutors, productivity assistants," arguing HB 635 is "currently broad enough to capture beneficial conversational AI systems." Lobbying to <i>add</i> a general-assistant exemption is direct evidence that one is currently absent. When in doubt about whether a definition reaches assistants, read the comment letters.</p></div>

<div class="card"><h4>Reach sits in the verb phrase, not the vocabulary</h4><p>The CHAT Act and the federal discussion draft build their definitions from the same four limbs — interpersonal or emotional interaction, friendship, companionship, therapeutic communication. The CHAT Act gates them on "exists for the primary purpose of." The draft gates them on "is designed to encourage or facilitate the simulation of." One word-list, two verb phrases, opposite reach. Anyone assessing a bill should read the gating clause before the defined term.</p></div>

<div class="card"><h4>Three drafting routes exist, and the third is underused</h4><p>A <b class="gl" data-gl="test:capability">capability</b> test asks what the system can do (California, Illinois). A <b class="gl" data-gl="test:purpose">purpose</b> test asks what it was built for (Oregon, CHAT Act). Kansas SB 405 and Tennessee SB 1493 show a third: trigger on the <b class="gl" data-gl="test:training">training objective</b> — prohibiting the training of systems designed to act as a companion, provide emotional support, or impersonate a sentient being. It is easier to evidence than deployed behaviour and much harder to argue around, since a developer cannot rewrite marketing copy to escape what it optimised for. The two are near-textual twins that agree on the trigger and disagree completely on the consequence: Kansas civil liability, Tennessee a Class A felony.</p></div>

<div class="card"><h4>China is now ahead of the United States on in-force scope</h4><p>The CAC measures took effect 15 July 2026. They are the only framework anywhere requiring a human to take over a conversation on explicit suicide risk and to contact a guardian, the only one requiring real-time dependency detection with dynamic reminders, and among the few reaching all users rather than minors alone. Whatever one thinks of the wider regulatory context, the design-level ambition is higher than anything enacted in the US — and it arrives at the same use-based carve-out California chose, by a different route.</p></div>

<div class="card"><h4>The EU shows the object can be named without a product category</h4><p>AI Act Article 5 prohibits a technique joined to an effect and never mentions a chatbot. It is proof of concept that the regulatory object is specifiable without deciding what a companion is. The cost is that no companion-specific machinery follows from it — the Digital Fairness Act and the Parliament's minors report are where that detail is being worked out.</p></div>

<h2>Five recommendations</h2>
<ul>
  <li><b>Adopt Illinois's formula.</b> A definition that applies "irrespective of how the system is marketed or labeled," paired with the rebuttable memory presumption, forecloses the classification move companies already make.</li>
  <li><b>Prefer the least gameable narrowing device.</b> Some narrowing is needed or the definition reaches every conversational interface. A use-based carve-out is the least gameable of the three in circulation. Replace marketing-based exemptions; drop the purpose-primacy gate.</li>
  <li><b>Regulate memory as trigger <i>and</i> constraint — and note that the constraint has no model to copy.</b> Illinois's presumption supplies the trigger. For the constraint there is no precedent in this corpus to adapt: a drafter has to write the retention period, and the nearest analogue, the Youth AI Privacy Act's session-scoped personalisation limit, governs processing rather than retention. Add to it the prohibition nobody has written either, on using retained emotional disclosures for re-engagement.</li>
  <li><b>Constrain availability, do not merely annotate it.</b> Pair the Youth AI Privacy Act's feature list, the most granular design regulation in the corpus, with a duration limit, which nothing yet attempts. The feature-level half is the better-supported half; a drafter should be honest that the evidence does not yet say where to put a numerical threshold.</li>
  <li><b>Require research on design against harm.</b> Convert the reporting mechanism from an output count into a research obligation: a duty to test, and publish, the relationship between engagement-optimising features and harm outcomes. This is a gap in the whole landscape rather than a preference between existing options, and it is where an academic institution can be most useful.</li>
</ul>
`;
