# Contributing

Corrections, additions and status updates are welcome. This is a research dataset — accuracy matters more than completeness, and a well-sourced correction to one row is more useful than ten unsourced new ones.

## What helps most

1. **Enrolled statutory text** for legislation currently coded from a tracker or law-firm summary. The definitional clause and its carve-out drive the `reaches` judgement, which is the column the analysis rests on.
2. **Status changes.** Bills move, die, get vetoed, and take effect on dates well after enactment. Effective dates matter as much as enactment dates here — roughly half the enacted US state laws do not bite until 2027. A bill that has died should be removed, not recoded — see the `statusClass` table below.
3. **New legislation**, especially outside the United States. Coverage of jurisdictions beyond the US, EU and China is currently thin.
4. **Disagreement with a coding.** The `reaches`, `test` and `narrowing` fields are interpretive judgements. If you read a definition differently, open an issue with the text and your reasoning.

## How to edit

All data lives in `data.js`. Nothing else needs to change — every view, count, filter and matrix rebuilds from that array.

A record looks like this:

```js
{
  id:"oh-hb123", juris:"US State", body:"Ohio", cite:"HB 123",
  name:"Companion chatbot act", status:"Enacted", statusClass:"law",
  dates:"Introduced Jan 2027 · enacted Jun 2027 · effective 1 Jan 2028",
  chron:{first:"2027-01", latest:"2027-06", effective:"2028-01-01"},
  scope:"Minors",
  youth:"only",
  term:"Companion chatbot", test:"capability",
  testNote:"Quote or close paraphrase of the operative definition",
  narrowing:"Use carve-out", reaches:"arguably",
  mechs:["disclosure","crisis"],
  enforce:["State AG"],
  interval:"Every 3 hours",
  note:"Why this legislation matters, and anything unusual about it.",
  link:"https://..."
}
```

### Controlled vocabularies

These must match exactly or the row will render wrong or drop out of the matrix.

**`juris`** — `US Federal` · `US State` · `EU` · `China`
(adding a new jurisdiction also requires a colour slot in `index.html` and an entry in `JCLASS`/`JVAR` in `app.js`)

**`statusClass`** — drives the status dot and sort order:

| Value | Meaning |
|---|---|
| `law` | Enacted or in force |
| `moving` | Advanced out of committee or passed a chamber |
| `pending` | Introduced, filed, or a discussion draft |
| `stalled` | Carried over, continued, or held — dormant, but still a live vehicle |

There is no `dead` value. The tracker covers proposed, active and enacted policy only: when a piece of legislation dies, is vetoed, goes inactive or is superseded, **delete the record** and add a line to the removal table in the README so the fate stays documented.

**`reaches`** — whether the text covers general-purpose assistants:

| Value | Meaning |
|---|---|
| `yes` | The text plainly covers ChatGPT-class systems |
| `arguably` | A plausible reading covers them and a plausible reading does not |
| `partial` | Some obligations reach them, others do not |
| `no` | The gating language excludes them by construction |
| `unclear` | The definitional clause has not been read against the enrolled text |

**`youth`** — who the legislation binds. Must stay consistent with `scope`:

| Value | Meaning |
|---|---|
| `only` | Applies to minors only |
| `duties` | Applies to all users, and carries duties specific to minors |
| `none` | Applies to all users, with no minor-specific rules |

**`mechs`** — keys only, from the `MECHS` list at the top of `data.js`, grouped here by the cluster each belongs to in `MECHGROUPS`:

| Cluster | Keys |
|---|---|
| Honesty about what the system is | `disclosure` · `sentience` · `proImpersonation` |
| Harm response | `crisis` · `humanTakeover` |
| Age gating and parental control | `ageAssurance` · `accessBan` · `minorContent` · `parental` |
| Design and data constraints | `engagement` · `dependence` · `memory` · `training` |
| Accountability and evidence | `reporting` · `audit` · `causation` |

A new mechanism needs three things, not one: a `MECHS` entry (key, full label, short label for the matrix), a `MECHDEF` entry (the rule and the coding line), and a place in exactly one `MECHGROUPS` cluster. A key missing from a cluster is dropped from the coverage view and the matrix without an error.

**`chron`** — the dates the chronological sort orders on. `first` and `latest` are required; `effective` only where the text states a date.

| Field | What it records |
|---|---|
| `chron.first` | When the legislation first entered the record: introduced, filed, proposed, published as a draft |
| `chron.latest` | The most recent thing that actually **happened** — a committee vote, passage, enactment, entry into force. Not the effective date |
| `chron.effective` | When the obligations start to bind. Optional. For a bill not yet enacted, the date the text proposes |

Write each as `YYYY-MM-DD`, `YYYY-MM` or `YYYY`, at whatever precision the source actually supports — do not invent a month or a day to make a row look precise. A partial date is placed at the midpoint of its period for sorting (a year sorts as 30 June, a month as the 15th) and is marked on the site as an estimate, so a real month is worth finding where one exists. Keep `chron` consistent with the human-readable `dates` string: if you change one, change the other.

### Adding operative wording

The most useful thing you can add. `PHRASING` at the foot of `data.js` records how each piece of legislation words each mechanism it carries; it is currently about 20% complete, and everything missing renders as *not yet transcribed* on the site.

```js
const PHRASING = {
  "oh-hb123":{
    disclosure:{k:"quote", t:"exact words of the operative clause",
      n:"optional context — who it is owed to, what triggers it"}
  }
};
```

- `k` must be `quote` (verbatim text of the legislation) or `summary` (close paraphrase from a secondary analysis or from a `note` in this dataset). Tag honestly: a paraphrase marked as a quote is worse than no entry.
- Quote the operative clause, not the whole section. Keep `t` to a sentence or two and put the qualifications in `n`.
- The mechanism key must be one the record already carries in `mechs`, or the entry will never render.
- If a single clause supplies several mechanisms — as Kansas SB 405's training prohibition does — give each mechanism its own entry rather than repeating the whole clause.

### Coding conventions

- **`memory`** means a clear and explicit cap on retention — a rule stating how long a system may keep what a user told it. **No record currently carries it, and the mechanism is kept in the list to mark the gap.** Do not code it for legislation that merely uses persistent memory as a definitional trigger (Illinois SB 3262) or that limits the data processed to personalise outputs (the Youth AI Privacy Act). Both were coded `memory` until September 2026 and both were wrong.
- **`engagement`** means a limit on features designed to extend use (variable rewards, streaks, push alerts, retention prompts). A periodic break reminder is `disclosure`, not `engagement`.
- **`causation`** means a duty to test whether the provider's *own design* produces harm. Counting crisis referrals is `reporting`. Only one piece of legislation in the corpus meets the `causation` bar.
- **`testNote`** should quote the operative definition where the text is available. Quote rather than paraphrase wherever you can.
- **`chron.latest`** is the last thing that *happened*, never a scheduled future event. An enacted law that does not bite until 2027 has `latest` at its enactment and `effective` in 2027 — putting the effective date in `latest` would report the law as more recent activity than it is.

## Defining a term on hover

Coded terms on the site carry a definition that appears on hover, on keyboard focus and on tap, marked by a dotted underline. The definitions are in the `GLOSSARY` map at the foot of `data.js`, referenced from the markup and the renderers as `data-gl="<key>"`:

```js
const GLOSSARY = {
  narrowing:{t:"Narrowing device",
    d:"What pulls things back out of a definition that would otherwise be broad — …"}
};
```

Two families resolve programmatically and must not be duplicated into `GLOSSARY`: `data-gl="mech:<key>"` reads `MECHDEF`, and `data-gl="group:<key>"` reads `MECHGROUPS`. Adding a mechanism definition to `MECHDEF` is therefore enough to make it appear on the coverage bars, the matrix column headings and the mechanism tags inside a legislation row.

- `t` is the term as a reader would name it; `d` is one or two sentences. These are the tracker's own definitions, not quotations — where a term is a term of art in this corpus rather than in general usage, say so in `d`.
- Add the `gl` class alongside `data-gl` on anything that should carry the dotted underline. Chips and badges take `data-gl` alone, since an underline inside a coloured pill reads as damage.
- Value-level keys are namespaced by field: `st:law`, `r:arguably`, `youth:only`, `test:capability`, `narrow:use`, `prov:quote`. The free-text `test` and `narrowing` values are matched to a family by first mention in `app.js`, so a new phrasing that no pattern recognises gets no tooltip rather than a wrong one — extend the pattern list there if you add one.

## Verifying a change

There is no build step. Open `index.html` in a browser and confirm the row renders, the counts update, the row appears where you expect under each of the three chronological orderings, and the console is clean. To sanity-check the whole file:

```bash
node -e "
  const f = new Function(require('fs').readFileSync('data.js','utf8')+';return {DATA,MECHS,MECHDEF,PHRASING,MECHGROUPS,GLOSSARY}');
  const {DATA,MECHS,MECHDEF,PHRASING,MECHGROUPS,GLOSSARY}=f(); const keys=new Set(MECHS.map(m=>m[0]));
  DATA.forEach(d=>d.mechs.forEach(k=>{ if(!keys.has(k)) console.log('bad mech',d.id,k) }));
  DATA.forEach(d=>{ if(!['only','duties','none'].includes(d.youth)) console.log('bad youth',d.id,d.youth) });
  [...keys].forEach(k=>{ if(!MECHDEF[k]) console.log('mechanism with no definition',k) });
  const grouped=MECHGROUPS.flatMap(g=>g.mechs);
  [...keys].forEach(k=>{ if(grouped.filter(x=>x===k).length!==1)
    console.log('mechanism not in exactly one cluster',k) });
  grouped.forEach(k=>{ if(!keys.has(k)) console.log('cluster references unknown mechanism',k) });
  Object.entries(GLOSSARY).forEach(([k,e])=>{ if(!e.t||!e.d) console.log('incomplete glossary entry',k) });
  const D=/^\\d{4}(-\\d{2}){0,2}\$/;
  DATA.forEach(d=>{ const c=d.chron||{};
    ['first','latest'].forEach(f=>{ if(!D.test(c[f]||'')) console.log('bad chron.'+f,d.id,c[f]) });
    if(c.effective&&!D.test(c.effective)) console.log('bad chron.effective',d.id,c.effective) });
  let pairs=0, filled=0;
  DATA.forEach(d=>d.mechs.forEach(k=>{ pairs++; if((PHRASING[d.id]||{})[k]) filled++ }));
  Object.entries(PHRASING).forEach(([id,o])=>{ const d=DATA.find(x=>x.id===id);
    if(!d) return console.log('phrasing for unknown record',id);
    Object.entries(o).forEach(([k,p])=>{
      if(!d.mechs.includes(k)) console.log('phrasing for uncarried mechanism',id,k);
      if(!['quote','summary'].includes(p.k)) console.log('bad provenance',id,k,p.k);
    }) });
  const ids=DATA.map(d=>d.id);
  console.log('records',DATA.length,'| dupes',ids.filter((v,i)=>ids.indexOf(v)!==i));
  console.log('phrasing',filled+'/'+pairs,'pairs | clusters',MECHGROUPS.length,
    '| glossary',Object.keys(GLOSSARY).length);
"
```

## Sourcing

Link to the primary source where one exists — a legislature bill page, an official statute, or an authoritative translation. Where you rely on a secondary analysis, say so in the `note` field so a later reader knows what to re-check.
