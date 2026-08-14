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

**`mechs`** — keys only, from the `MECHS` list at the top of `data.js`:

`disclosure` · `crisis` · `reporting` · `minorContent` · `ageAssurance` · `parental` · `engagement` · `dependence` · `memory` · `proImpersonation` · `sentience` · `audit` · `training` · `accessBan` · `humanTakeover` · `causation`

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

- **`memory`** means a constraint on retention or on using retained data — *not* merely using memory as a definitional trigger. The Youth AI Privacy Act caps retention and is coded `memory`. Illinois SB 3262 uses memory only as a trigger, and its `memory` coding is a known inconsistency with this convention — see the note in its `PHRASING` entry.
- **`engagement`** means a limit on features designed to extend use (variable rewards, streaks, push alerts, retention prompts). A periodic break reminder is `disclosure`, not `engagement`.
- **`causation`** means a duty to test whether the provider's *own design* produces harm. Counting crisis referrals is `reporting`. Only one piece of legislation in the corpus meets the `causation` bar.
- **`testNote`** should quote the operative definition where the text is available. Quote rather than paraphrase wherever you can.

## Verifying a change

There is no build step. Open `index.html` in a browser and confirm the row renders, the counts update, and the console is clean. To sanity-check the whole file:

```bash
node -e "
  const f = new Function(require('fs').readFileSync('data.js','utf8')+';return {DATA,MECHS,MECHDEF,PHRASING}');
  const {DATA,MECHS,MECHDEF,PHRASING}=f(); const keys=new Set(MECHS.map(m=>m[0]));
  DATA.forEach(d=>d.mechs.forEach(k=>{ if(!keys.has(k)) console.log('bad mech',d.id,k) }));
  DATA.forEach(d=>{ if(!['only','duties','none'].includes(d.youth)) console.log('bad youth',d.id,d.youth) });
  [...keys].forEach(k=>{ if(!MECHDEF[k]) console.log('mechanism with no definition',k) });
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
  console.log('phrasing',filled+'/'+pairs,'pairs');
"
```

## Sourcing

Link to the primary source where one exists — a legislature bill page, an official statute, or an authoritative translation. Where you rely on a secondary analysis, say so in the `note` field so a later reader knows what to re-check.
