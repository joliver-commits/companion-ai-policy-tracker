# Contributing

Corrections, additions and status updates are welcome. This is a research dataset — accuracy matters more than completeness, and a well-sourced correction to one row is more useful than ten unsourced new ones.

## What helps most

1. **Enrolled statutory text** for an instrument currently coded from a tracker or law-firm summary. The definitional clause and its carve-out drive the `reaches` judgement, which is the column the analysis rests on.
2. **Status changes.** Bills move, die, get vetoed, and take effect on dates well after enactment. Effective dates matter as much as enactment dates here — roughly half the enacted US state laws do not bite until 2027.
3. **New instruments**, especially outside the United States. Coverage of jurisdictions beyond the US, EU and China is currently thin.
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
  term:"Companion chatbot", test:"capability",
  testNote:"Quote or close paraphrase of the operative definition",
  narrowing:"Use carve-out", reaches:"arguably",
  mechs:["disclosure","crisis"],
  enforce:["State AG"],
  interval:"Every 3 hours",
  note:"Why this instrument matters, and anything unusual about it.",
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
| `stalled` | Carried over, continued, or held |
| `dead` | Failed, vetoed, or died |

**`reaches`** — whether the text covers general-purpose assistants:

| Value | Meaning |
|---|---|
| `yes` | The text plainly covers ChatGPT-class systems |
| `arguably` | A plausible reading covers them and a plausible reading does not |
| `partial` | Some obligations reach them, others do not |
| `no` | The gating language excludes them by construction |
| `unclear` | The definitional clause has not been read against the enrolled text |

**`mechs`** — keys only, from the `MECHS` list at the top of `data.js`:

`disclosure` · `crisis` · `reporting` · `minorContent` · `ageAssurance` · `parental` · `engagement` · `dependence` · `memory` · `proImpersonation` · `sentience` · `audit` · `training` · `accessBan` · `humanTakeover` · `causation`

### Coding conventions

- **`memory`** means a constraint on retention or on using retained data — *not* merely using memory as a definitional trigger. Illinois uses memory as a trigger and is not coded `memory`; the Youth AI Privacy Act caps retention and is.
- **`engagement`** means a limit on features designed to extend use (variable rewards, streaks, push alerts, retention prompts). A periodic break reminder is `disclosure`, not `engagement`.
- **`causation`** means a duty to test whether the provider's *own design* produces harm. Counting crisis referrals is `reporting`. Only one instrument in the corpus meets the `causation` bar.
- **`testNote`** should quote the operative definition where the text is available. Quote rather than paraphrase wherever you can.

## Verifying a change

There is no build step. Open `index.html` in a browser and confirm the row renders, the counts update, and the console is clean. To sanity-check the whole file:

```bash
node -e "
  const f = new Function(require('fs').readFileSync('data.js','utf8')+';return {DATA,MECHS}');
  const {DATA,MECHS}=f(); const keys=new Set(MECHS.map(m=>m[0]));
  DATA.forEach(d=>d.mechs.forEach(k=>{ if(!keys.has(k)) console.log('bad mech',d.id,k) }));
  const ids=DATA.map(d=>d.id);
  console.log('records',DATA.length,'| dupes',ids.filter((v,i)=>ids.indexOf(v)!==i));
"
```

## Sourcing

Link to the primary source where one exists — a legislature bill page, an official statute, or an authoritative translation. Where you rely on a secondary analysis, say so in the `note` field so a later reader knows what to re-check.
