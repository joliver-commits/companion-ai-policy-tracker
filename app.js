const JCLASS={"US Federal":"j-fed","US State":"j-state","EU":"j-eu","China":"j-cn"};
const JVAR={"US Federal":"var(--j-fed)","US State":"var(--j-state)","EU":"var(--j-eu)","China":"var(--j-cn)"};
const MMAP=Object.fromEntries(MECHS);
const STATUSES=["law","moving","pending","stalled","dead"];
const SLABEL={law:"Enacted / in force",moving:"Moving",pending:"Pending",stalled:"Stalled",dead:"Dead or vetoed"};
const state={q:"",j:new Set(),s:new Set(),m:"",r:"",sort:"status",dir:1,open:new Set()};

const el=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- stat tiles ---------- */
(function(){
  const n=s=>DATA.filter(d=>d.statusClass===s).length;
  const tiles=[
    [DATA.length,"Instruments"],
    [n("law"),"Enacted / in force"],
    [new Set(DATA.filter(d=>d.juris==="US State"&&d.statusClass==="law").map(d=>d.body)).size,"US states with law"],
    [n("moving"),"Moving"],
    [DATA.filter(d=>d.mechs.includes("memory")).length,"Constrain memory"],
    [DATA.filter(d=>d.mechs.includes("causation")).length,"Duty to test design"]
  ];
  el("tiles").innerHTML=tiles.map(([v,l],i)=>
    `<div class="tile"><div class="v" ${i>=4?'style="color:var(--critical)"':''}>${v}</div><div class="l">${l}</div></div>`).join("");
})();

/* ---------- filter controls ---------- */
el("fj").innerHTML=Object.keys(JCLASS).map(j=>
  `<button class="chip" data-j="${j}" aria-pressed="false"><span class="dot" style="background:${JVAR[j]}"></span>${j}</button>`).join("");
el("fs").innerHTML=STATUSES.map(s=>
  `<button class="chip" data-s="${s}" aria-pressed="false">${SLABEL[s]}</button>`).join("");
el("fm").innerHTML+=MECHS.map(([k,l])=>`<option value="${k}">${l}</option>`).join("");

el("fj").onclick=e=>{const b=e.target.closest("[data-j]");if(!b)return;
  const v=b.dataset.j;state.j.has(v)?state.j.delete(v):state.j.add(v);
  b.setAttribute("aria-pressed",state.j.has(v));render();};
el("fs").onclick=e=>{const b=e.target.closest("[data-s]");if(!b)return;
  const v=b.dataset.s;state.s.has(v)?state.s.delete(v):state.s.add(v);
  b.setAttribute("aria-pressed",state.s.has(v));render();};
el("q").oninput=e=>{state.q=e.target.value.toLowerCase();render();};
el("fm").onchange=e=>{state.m=e.target.value;render();};
el("fr").onchange=e=>{state.r=e.target.value;render();};
el("clearall").onclick=()=>{
  state.q="";state.j.clear();state.s.clear();state.m="";state.r="";
  el("q").value="";el("fm").value="";el("fr").value="";
  document.querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed","false"));
  render();
};
document.querySelectorAll("#tbl th").forEach(th=>th.onclick=()=>{
  const k=th.dataset.k;
  if(state.sort===k)state.dir*=-1;else{state.sort=k;state.dir=1;}
  render();
});

/* ---------- filtering ---------- */
function match(d){
  if(state.j.size&&!state.j.has(d.juris))return false;
  if(state.s.size&&!state.s.has(d.statusClass))return false;
  if(state.m&&!d.mechs.includes(state.m))return false;
  if(state.r&&d.reaches!==state.r)return false;
  if(state.q){
    const hay=[d.name,d.cite,d.body,d.juris,d.status,d.term,d.test,d.testNote,d.narrowing,
      d.note,d.dates,d.scope,d.interval,d.enforce.join(" "),d.mechs.map(m=>MMAP[m]).join(" ")]
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
    case "reaches":return String(RORDER[d.reaches]).padStart(2,"0")+d.name;
    case "nmech":return String(99-d.mechs.length).padStart(3,"0")+d.name;
    case "test":return d.test+d.name;
    case "narrowing":return d.narrowing+d.name;
    default:return (d.body||"")+d.name;
  }
}

/* ---------- render table ---------- */
function render(){
  const rows=DATA.filter(match).sort((a,b)=>sortKey(a)<sortKey(b)?-state.dir:sortKey(a)>sortKey(b)?state.dir:0);
  el("count").textContent=`${rows.length} of ${DATA.length} instruments`;
  el("tb").innerHTML=rows.map(d=>{
    const open=state.open.has(d.id);
    return `<tr class="row" data-id="${d.id}">
      <td><div class="nm">${esc(d.name)}</div><div class="cite">${esc(d.body)} · ${esc(d.cite)}</div></td>
      <td><span class="badge ${JCLASS[d.juris]}">${esc(d.juris)}</span></td>
      <td><span class="st ${d.statusClass}">${esc(d.status)}</span></td>
      <td style="font-size:13px">${esc(d.test)}</td>
      <td style="font-size:13px">${esc(d.narrowing)}</td>
      <td><span class="reach r-${d.reaches}">${d.reaches}</span></td>
      <td style="font-variant-numeric:tabular-nums">${d.mechs.length}</td>
    </tr>`+(open?detail(d):"");
  }).join("");
  el("tb").querySelectorAll("tr.row").forEach(tr=>tr.onclick=()=>{
    const id=tr.dataset.id;
    state.open.has(id)?state.open.delete(id):state.open.add(id);
    render();
  });
}
function detail(d){
  return `<tr class="detail"><td colspan="7"><div class="dwrap">
    <div class="dgrid">
      <div class="dcell"><div class="k">Timeline</div><div class="v">${esc(d.dates)}</div></div>
      <div class="dcell"><div class="k">Scope</div><div class="v">${esc(d.scope)}</div></div>
      <div class="dcell"><div class="k">Term used</div><div class="v">${esc(d.term)}</div></div>
      <div class="dcell"><div class="k">Disclosure interval</div><div class="v">${esc(d.interval)}</div></div>
      <div class="dcell"><div class="k">Enforcement</div><div class="v">${d.enforce.map(esc).join(" · ")}</div></div>
    </div>
    <div class="dcell" style="margin-bottom:4px"><div class="k">Functional test</div></div>
    <div class="quote">${esc(d.testNote)}</div>
    <div class="dnote">${esc(d.note)}</div>
    <div class="mlist">${d.mechs.map(m=>`<span class="mtag">${esc(MMAP[m])}</span>`).join("")}</div>
    <a class="dlink" href="${d.link}" target="_blank" rel="noopener">Source ↗</a>
  </div></td></tr>`;
}

/* ---------- coverage bars ---------- */
(function(){
  const counts=MECHS.map(([k,l])=>[l,DATA.filter(d=>d.mechs.includes(k)).length]).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(...counts.map(c=>c[1]),1);
  el("bars").innerHTML=counts.map(([l,n])=>
    `<div class="bar"><div class="bl">${esc(l)}</div>
     <div class="btrack"><div class="bfill ${n===0?'zero':''}" style="width:${n===0?1.5:Math.max(2,n/max*100)}%"></div></div>
     <div class="bv">${n}</div></div>`).join("");
})();

/* ---------- matrix ---------- */
(function(){
  const rows=DATA.filter(d=>d.statusClass==="law"||d.statusClass==="moving"||d.key)
    .sort((a,b)=>(SORDER[a.statusClass]-SORDER[b.statusClass])||a.juris.localeCompare(b.juris));
  const head=`<thead><tr><th class="rot" style="width:200px">Instrument</th>`+
    MECHS.map(([,l,s])=>`<th class="colh">${esc(s||l)}</th>`).join("")+`</tr></thead>`;
  const body=`<tbody>`+rows.map(d=>
    `<tr><th class="rot"><span class="badge ${JCLASS[d.juris]}" style="font-size:10px">${esc(d.body)}</span> ${esc(d.cite)}</th>`+
    MECHS.map(([k])=>{
      const on=d.mechs.includes(k);
      return `<td><div class="cellbox" title="${esc(d.name)} — ${esc(MMAP[k])}: ${on?'yes':'no'}" style="background:${on?'var(--seq-400)':'var(--grid)'};color:${on?'#fff':'transparent'}">${on?'●':'·'}</div></td>`;
    }).join("")+`</tr>`).join("")+`</tbody>`;
  el("mx").innerHTML=head+body;
})();

/* ---------- definitional anatomy table ---------- */
(function(){
  const rows=[...DATA].sort((a,b)=>(SORDER[a.statusClass]-SORDER[b.statusClass])||a.body.localeCompare(b.body));
  el("deftbl").innerHTML=`<thead><tr>
      <th style="cursor:default">Instrument</th><th style="cursor:default">Term used</th>
      <th style="cursor:default">Test</th><th style="cursor:default">Narrowing device</th>
      <th style="cursor:default">Reaches assistants</th><th style="cursor:default">Scope</th>
    </tr></thead><tbody>`+rows.map(d=>
    `<tr><td><div class="nm" style="font-size:13.5px">${esc(d.cite)}</div>
       <div class="cite">${esc(d.body)} · <span class="st ${d.statusClass}" style="font-size:12px">${esc(d.status)}</span></div></td>
     <td style="font-size:13px">${esc(d.term)}</td>
     <td style="font-size:13px">${esc(d.test)}</td>
     <td style="font-size:13px">${esc(d.narrowing)}</td>
     <td><span class="reach r-${d.reaches}">${d.reaches}</span></td>
     <td style="font-size:13px">${esc(d.scope)}</td></tr>`).join("")+`</tbody>`;
})();

/* ---------- tabs & theme ---------- */
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll("nav.tabs button").forEach(x=>x.setAttribute("aria-selected","false"));
  b.setAttribute("aria-selected","true");
  document.querySelectorAll("section.view").forEach(s=>s.classList.remove("on"));
  el("v-"+b.dataset.v).classList.add("on");
  window.scrollTo({top:0,behavior:"smooth"});
});
el("themebtn").onclick=()=>{
  const d=document.documentElement.getAttribute("data-theme")==="dark";
  document.documentElement.setAttribute("data-theme",d?"light":"dark");
  el("themebtn").textContent=d?"Dark":"Light";
};
render();

el("gaps").innerHTML=`
<h2>What the corpus agrees on</h2>
<p>Read across all ${DATA.length} instruments, the convergence is striking and almost entirely unacknowledged by the drafters themselves. Nearly every instrument defines its object by <b>what the system does</b> — simulating interaction, sustaining a relationship, recognising and responding to emotion, retaining memory — rather than by what kind of product it is. The categorical thinking survives in the vocabulary, and decisively in the exclusions, but not in the tests.</p>
<p>The operative provisions cluster just as tightly. Four moves recur almost everywhere: a non-human disclosure, a crisis and self-harm protocol with referral to a hotline, content restrictions for minors, and some form of periodic reminder. Beyond that quartet the instruments thin out fast.</p>

<div class="cards2">
  <div class="card ok"><h4>Disclosure is universal</h4><p>Almost every instrument requires the system to say it is not human. It is the cheapest intervention available and the one on which everyone agrees.</p></div>
  <div class="card ok"><h4>Crisis protocols are near-universal</h4><p>Detection of suicidal ideation plus referral to a crisis line appears in nearly every enacted law. China alone requires a human to take over the conversation.</p></div>
  <div class="card partial"><h4>Engagement design is reached only at the edges</h4><p>Oregon names variable-reward affirmations, Illinois names simulated distress for retention, the Youth AI Privacy Act names push alerts and typing indicators. Everywhere else the design layer is untouched.</p></div>
  <div class="card gap"><h4>Nobody regulates duration</h4><p>Not one instrument in any jurisdiction sets a session cap, a cooling-off period, or an overnight restriction for minors. China's two-hour break reminder is the closest thing that exists, and it is still a reminder.</p></div>
</div>

<h2>The five recurring weaknesses</h2>

<h3>1. Policies agree where the intervention is cheapest and fall silent where it bites</h3>
<p>Disclosure regulates the user's <i>awareness</i> of a design property. It does not touch the property. A regime built on telling a fourteen-year-old every three hours that the thing she is confiding in is not a person leaves entirely intact the memory that makes it feel like a relationship, the availability that makes it feel like a friend, and the validation that makes it feel better than her friends. The instruments converge on the label and diverge — or say nothing — on the mechanism.</p>

<h3>2. Three narrowing devices quietly reintroduce classification by self-presentation</h3>
<p>A functional test that is then narrowed can end up back at a product category. Three devices do this work, and it is worth naming them separately because they are gameable to very different degrees:</p>
<ul>
  <li><b>The marketing carve-out</b> — New York alone. Article 47 excludes systems "primarily designed <i>and marketed</i> for efficiency improvements, research, or technical assistance." A developer exits the regime by rewriting copy. This is the most gameable device in circulation and it is enacted law.</li>
  <li><b>The use carve-out</b> — California, Oregon, Missouri, Florida, and now China. Excludes systems used "only for" or "solely for the purpose of" customer service, productivity, education and the like. Harder to game, because it turns on what the product is actually used for rather than how it is described — and California's, gated on <i>only</i>, arguably fails to exclude ChatGPT at all.</li>
  <li><b>The purpose-primacy gate</b> — the CHAT Act. No exclusions are needed because the words "exists for the primary purpose of" do the exclusionary work inside the definition. On the usage evidence, companionship is a use a general assistant is <i>put to</i> rather than the purpose it was <i>built for</i>, so a primacy test exempts precisely the tools where most relational use occurs.</li>
</ul>
<p>Illinois SB 3262 is the only instrument that refuses all three, defining its object "irrespective of how the system is marketed or labeled." It is also still sitting in committee.</p>

<h3>3. Every instrument picks a different feature set</h3>
<p>New York takes memory, unprompted emotional questioning and personal dialogue. California takes adaptive response, social needs, anthropomorphism and sustained relationship. Oregon takes design purpose. Florida joined California's and New York's with "and", producing a fourth construct. Illinois takes emotional resonance plus a memory presumption. China takes simulated personality plus continuous emotional interaction. Six instruments, six constructs — all circling the same underlying object, none acknowledging the others.</p>
<p>The consequence is not academic. A developer operating in twelve states faces twelve overlapping definitions of the same thing, which is an argument for federal preemption that the industry will make and that a clearly stated functional definition would answer better.</p>

<h3>4. The same design property is put to opposite work</h3>
<p>New York's Article 47 uses "asking unprompted or unsolicited emotion-based questions" as a <i>test for identifying</i> a companion. The Youth AI Privacy Act would <i>prohibit</i> unprompted outputs as a design feature. One instrument makes proactive emotional questioning the trigger for regulation; the other bans it. Both are functional. They simply cannot both be right about what the property is for.</p>

<h3>5. Enforcement design varies more than substance</h3>
<p>The single most consequential variable in this corpus is not what a statute requires but who can sue. Connecticut is attorney-general only with no private right of action. Oregon carries a private right of action at $1,000 per violation. New York's enacted Article 47 is AG-only; its Assembly twin A6767 is substantively identical but lets harmed individuals sue. And the Youth AI Privacy Act's private right of action was stripped in the 5 August 2026 markup. Two statutes with identical operative text and different enforcement routes are, in practice, different laws.</p>

<h2>The gaps — what no instrument does</h2>

<div class="card gap"><h4>No retention ceiling in any enacted law</h4><p>Persistent memory is the feature most heavily advertised by the products and the one most central to making an exchange feel like an accumulating relationship. Illinois would use memory to <i>trigger</i> the regime; only the Youth AI Privacy Act would <i>cap</i> it, via session-scoping plus an FTC-set maximum. Neither is law. Every instrument currently in force treats memory as a definitional signal and none treats it as a design property to be constrained.</p></div>

<div class="card gap"><h4>No limit on duration anywhere</h4><p>No session cap, no cooling-off period after extended use, no overnight restriction for minors, in any of the thirteen jurisdictions surveyed. Constant availability is one of the four functions and it is regulated exclusively by reminder.</p></div>

<div class="card gap"><h4>Nothing addresses re-engagement using retained emotional disclosures</h4><p>Illinois bars <i>simulated distress</i> deployed when a user tries to leave. China requires intervention on detected dependency. But no instrument, enacted or proposed, prohibits a system from using a child's actual retained disclosures — the breakup, the diagnosis, the fight with a parent — to draw a lapsed user back. This is the sharpest unoccupied space in the corpus.</p></div>

<div class="card gap"><h4>No duty to investigate causation</h4><p>Numerous instruments require reporting how many users were referred to crisis resources. Illinois and California SB 1119 would require a third-party compliance audit. <b>Not one requires a company to test whether its own design choices produce the crises it is counting.</b> That asymmetry lets a company demonstrate compliance while remaining structurally incurious about causation. It is the clearest gap in the entire landscape and the one where a research institution has the most to contribute.</p></div>

<div class="card partial"><h4>Protection often stops at eighteen</h4><p>Most instruments cover minors only. On the current trajectory an adult using a product designed to simulate emotional dependence has no protection from a design property prohibited when the user is seventeen. Notably, the instruments that cover all users — New York, Illinois, Kansas, the People-First Chatbot Act, the EU AI Act, China — are disproportionately the ones that trigger functionally. Once the object is defined by what it does, restricting the remedy by user age becomes harder to justify.</p></div>

<div class="card partial"><h4>The empathic / manipulative line remains undrawn</h4><p>Four state instruments prohibit simulating emotional dependence without defining it. The People-First Chatbot Act defines it by the user's <i>state</i> — reliance as a primary source of support — which is measurable after the fact but offers a drafter no guidance on which features to constrain in advance. A functional definition does not dissolve this problem. It relocates it from "what kind of product is this" to "which behaviours count as manipulative", which is a better question but not an easy one.</p></div>

<div class="card gap"><h4>The disclosure interval is a guess repeated</h4><p>Intervals in force or proposed run from every 30 minutes to every 3 hours to once per day — a sixfold spread with no stated rationale anywhere. Either the interval should be set from evidence about belief and attachment, or the mechanism should be recognised as expressive rather than protective and weighted accordingly.</p></div>

<h2>What policymakers should know</h2>

<div class="card"><h4>You are already regulating functionally — the problem is the qualifier, not the noun</h4><p>The most common misconception is that these laws target a special category of companion app while general assistants go unregulated. As a matter of statutory text that is largely false. Most instruments define their object by design features. California's may already reach ChatGPT on the face of its text. The gap is not between product-category drafting and functional drafting; it is between what has been <i>drafted</i> and what has been <i>passed</i>, and between a functional test and the carve-out that narrows it.</p></div>

<div class="card"><h4>Industry lobbying tells you what the text actually reaches</h4><p>SIIA asked Virginia to add a safe harbour covering "customer-service chatbots, educational tutors, productivity assistants," arguing HB 635 is "currently broad enough to capture beneficial conversational AI systems." Lobbying to <i>add</i> a general-assistant exemption is direct evidence that one is currently absent. When in doubt about whether a definition reaches assistants, read the comment letters.</p></div>

<div class="card"><h4>Reach sits in the verb phrase, not the vocabulary</h4><p>The CHAT Act and the federal discussion draft build their definitions from the same four limbs — interpersonal or emotional interaction, friendship, companionship, therapeutic communication. The CHAT Act gates them on "exists for the primary purpose of." The draft gates them on "is designed to encourage or facilitate the simulation of." One word-list, two verb phrases, opposite reach. Anyone assessing a bill should read the gating clause before the defined term.</p></div>

<div class="card"><h4>Three drafting routes exist, and the third is underused</h4><p>A <b>capability</b> test asks what the system can do (California, Illinois). A <b>purpose</b> test asks what it was built for (Oregon, CHAT Act). Kansas SB 405 shows a third: trigger on the <b>training objective</b> — prohibiting the training of systems designed to act as a companion, provide emotional support, or impersonate a sentient being. It is easier to evidence than deployed behaviour and much harder to argue around, since a developer cannot rewrite marketing copy to escape what it optimised for.</p></div>

<div class="card"><h4>China is now ahead of the United States on in-force scope</h4><p>The CAC measures took effect 15 July 2026. They are the only framework anywhere requiring a human to take over a conversation on explicit suicide risk and to contact a guardian, the only one requiring real-time dependency detection with dynamic reminders, and among the few reaching all users rather than minors alone. Whatever one thinks of the wider regulatory context, the design-level ambition is higher than anything enacted in the US — and it arrives at the same use-based carve-out California chose, by a different route.</p></div>

<div class="card"><h4>The EU shows the object can be named without a product category</h4><p>AI Act Article 5 prohibits a technique joined to an effect and never mentions a chatbot. It is proof of concept that the regulatory object is specifiable without deciding what a companion is. The cost is that no companion-specific machinery follows from it — the Digital Fairness Act and the Parliament's minors report are where that detail is being worked out.</p></div>

<h2>Five recommendations</h2>
<ul>
  <li><b>Adopt Illinois's formula.</b> A definition that applies "irrespective of how the system is marketed or labeled," paired with the rebuttable memory presumption, forecloses the classification move companies already make.</li>
  <li><b>Prefer the least gameable narrowing device.</b> Some narrowing is needed or the definition reaches every conversational interface. A use-based carve-out is the least gameable of the three in circulation. Replace marketing-based exemptions; drop the purpose-primacy gate.</li>
  <li><b>Regulate memory as trigger <i>and</i> constraint.</b> Illinois's presumption as the trigger, the Youth AI Privacy Act's session-scoping plus an FTC-set ceiling as the constraint — and add the prohibition nobody has written yet, on using retained emotional disclosures for re-engagement.</li>
  <li><b>Constrain availability, do not merely annotate it.</b> Pair the Youth AI Privacy Act's feature list, the most granular design regulation in the corpus, with a duration limit, which nothing yet attempts. The feature-level half is the better-supported half; a drafter should be honest that the evidence does not yet say where to put a numerical threshold.</li>
  <li><b>Require research on design against harm.</b> Convert the reporting mechanism from an output count into a research obligation: a duty to test, and publish, the relationship between engagement-optimising features and harm outcomes. This is a gap in the whole landscape rather than a preference between existing options, and it is where an academic institution can be most useful.</li>
</ul>
`;

el("method").innerHTML=`
<h2>What this is</h2>
<p>A working tracker of legislation regulating AI companions and conversational AI systems, covering the United States at federal and state level, the European Union, and China. It was built to support ongoing research at the Berkman Klein Center and is maintained as an open reference.</p>
<p>It is deliberately not just a bill list. Several good bill lists already exist — the Future of Privacy Forum's chatbot tracker and MultiState's updates are the best of them, and both are cited below. What this adds is the <b>definitional coding</b>: for each instrument, the term it uses, the test that determines what the term covers, the narrowing device that pulls things back out, and a judgement about whether it reaches general-purpose assistants. That coding is the analytical contribution and it is not available anywhere else.</p>

<h2>How to read the coding</h2>
<ul>
  <li><b>Test</b> — the kind of question the definition asks. <code>capability</code> (what can it do), <code>behaviour</code> (what does it do in interaction), <code>purpose</code> (what was it built for), <code>conduct</code> (what did it say), <code>training objective</code> (what was it optimised for), <code>technique + effect</code> (the EU route).</li>
  <li><b>Narrowing device</b> — what pulls things back out of the definition: a marketing carve-out, a use carve-out, a purpose-primacy gate, an age gate, or none.</li>
  <li><b>Reaches general assistants</b> — a judgement, not a measurement. <code>yes</code> means the text plainly covers ChatGPT-class systems; <code>arguably</code> means a plausible reading covers them and a plausible reading does not; <code>no</code> means the gating language excludes them by construction; <code>unclear</code> means the definitional clause has not been read against the enrolled text.</li>

</ul>

<div class="callout"><b>Frequently miscatalogued instruments.</b> Several bills circulate in secondary summaries with the wrong status. <b>Florida CS/SB 482</b> did not become law — it cleared the Senate 35–2 on 4 March 2026 and died in Messages on 13 March. <b>Missouri HB 1742</b> is coded here as introduced, not enacted. The <b>Youth AI Privacy Act</b>'s private right of action was removed in the 5 August 2026 markup. <b>China's measures are no longer a draft</b> — they were finalised and took effect 15 July 2026. <b>Virginia HB 635</b> was continued to the next session on 9 February 2026.</div>

<h2>Updating the tracker</h2>
<p>All data lives in a single <code>DATA</code> array in a <code>&lt;script&gt;</code> block near the bottom of this file. To add or amend an instrument, edit that array — nothing else needs to change, and every view, filter, count and matrix rebuilds from it automatically.</p>
<p>A record looks like this:</p>
<pre style="background:var(--page);border:1px solid var(--ring);border-radius:8px;padding:12px 14px;font-size:12px;overflow-x:auto">{
  id:"xx-000", juris:"US State", body:"Ohio", cite:"HB 123",
  name:"Companion chatbot act", status:"Enacted", statusClass:"law",
  dates:"Introduced Jan 2027 · enacted ...",
  scope:"Minors",
  term:"Companion chatbot", test:"capability",
  testNote:"Quote or close paraphrase of the operative definition",
  narrowing:"Use carve-out", reaches:"arguably",
  mechs:["disclosure","crisis"],        // keys from the MECHS list
  enforce:["State AG"],
  interval:"Every 3 hours",
  note:"Why this instrument matters to the argument.",
  conf:"secondary", link:"https://..."
}</pre>
<p><code>statusClass</code> must be one of <code>law</code>, <code>moving</code>, <code>pending</code>, <code>stalled</code>, <code>dead</code> — it drives the status dot colour and the sort order. <code>reaches</code> must be one of <code>yes</code>, <code>arguably</code>, <code>partial</code>, <code>no</code>, <code>unclear</code>. Mechanism keys must match the <code>MECHS</code> list exactly or the matrix will silently drop them.</p>

<h2>Contributing</h2>\n<p>Corrections and additions are welcome. The highest-value contributions are <b>enrolled statutory text for instruments currently coded from tracker summaries</b> — the definitional clause and carve-out determine the “reaches general assistants” judgement, which is the analytically load-bearing column. Open an issue or a pull request against <code>data.js</code>.</p>\n<h2>Suggested review cadence</h2>
<ul>
  <li><b>Monthly during state sessions (January–June).</b> This is when the volume is: the 2026 wave went from five enacted instruments to more than a dozen between January and July.</li>
  <li><b>On any federal committee action.</b> The GUARD Act and the Youth AI Privacy Act have both moved out of committee in 2026 and both changed materially in markup.</li>
  <li><b>Watch the effective dates, not just the enactment dates.</b> A large share of the enacted state laws do not take effect until 1 January or 1 July 2027, so the compliance picture in 2027 will look very different from the statute book today.</li>
</ul>

<h2>Sources</h2>
<p style="font-size:13.5px;color:var(--ink-2)">Primary bill and statutory text via Congress.gov, state legislature records and China Law Translate. Status verification and gap-filling via the Future of Privacy Forum 2026 Chatbot Legislation Tracker, MultiState, Orrick, Troutman Pepper, the Transparency Coalition legislative updates, FPF's analysis of Connecticut SB 5, Hunton and Bird &amp; Bird on the CAC measures, EPIC on the Youth AI Privacy Act, LegiScan and the Florida Senate bill history. Codings are drawn from statutory and bill text where obtainable and from legislative trackers and law-firm analyses otherwise; the source link on each record points to the best available reference for that instrument.</p>
`;
