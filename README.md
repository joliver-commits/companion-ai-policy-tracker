# companion-ai-policy-tracker

A working tracker of legislation regulating AI companions and conversational AI systems, covering the United States at federal and state level, the European Union, and China. It was built to support the companion AI policy paper and is intended to stay useful afterwards as a standing reference for BKC staff.

The site is a static page: `index.html` (layout and styling), `data.js` (the dataset), `app.js` (rendering, filters and the written analysis). There is no build step — open `index.html` in a browser.

---

## What this is

It is deliberately not just a bill list. Several good bill lists already exist — the Future of Privacy Forum's chatbot tracker and MultiState's updates are the best of them, and both are cited below. What this adds is the **definitional coding**: for each piece of legislation, the term it uses, the test that determines what the term covers, the narrowing device that pulls things back out, and a judgement about whether it reaches general-purpose assistants. That coding is the analytical contribution and it is not available anywhere else.

## What is and is not tracked

The tracker monitors **proposed, active and enacted policy only**. Concretely, every record carries one of four `statusClass` values:

| Value | Meaning |
|---|---|
| `law` | Enacted or in force |
| `moving` | Advanced out of committee or passed a chamber |
| `pending` | Introduced, filed, or a discussion draft |
| `stalled` | Carried over, continued or held — dormant, but still a live vehicle in the next session |

Legislation that dies, is vetoed, goes inactive, or is superseded is **removed from `data.js`** rather than kept with a "dead" status. The rationale is that a tracker whose counts include failed bills misstates the state of the law, which is the number most readers take away from it.

The following nine pieces of legislation were removed under this policy in August 2026. They are recorded here because several of them are analytically interesting and at least one is routinely miscatalogued as enacted; the git history holds their full coding.

| Legislation | Body | Fate |
|---|---|---|
| CS/SB 482 (AI Bill of Rights) | Florida | Passed Senate 35–2 on 4 Mar 2026; **died in Messages 13 Mar 2026**. Frequently and wrongly reported as enacted. |
| HB 2311 | Arizona | Vetoed by Gov. Hobbs. A datapoint on where the political ceiling on the Oregon template sits. |
| LD 2162 | Maine | Inactive. Unusually direct definition — sentience, distress and emotional attachment named as the imitated qualities. |
| HB 952 | Maryland | Inactive. Hourly disclosure would have been at the demanding end of the enacted range. |
| HB 3544 / SB 1521 | Oklahoma | Inactive. |
| HB 438 | Utah | Inactive. Utah's HB 452 on mental health chatbots remains in force and is still tracked. |
| SB 5984 | Washington | Inactive; superseded by HB 2225, which was enacted and is tracked. |
| HB 1728 / HB 1782 | Hawaii | Inactive; superseded by SB 3001, which was enacted and is tracked. |
| LB 1185 | Nebraska | Inactive; superseded by LB 525, which is tracked. |

Because Florida CS/SB 482 is no longer in the corpus, two passages in the Gaps & analysis view were adjusted: it is no longer listed among the use carve-out states, and the count of distinct definitional constructs is now five rather than six.

## How to read the coding

- **Test** — the kind of question the definition asks. `capability` (what can it do), `behaviour` (what does it do in interaction), `purpose` (what was it built for), `conduct` (what did it say), `training objective` (what was it optimised for), `technique + effect` (the EU route).
- **Narrowing device** — what pulls things back out of the definition: a marketing carve-out, a use carve-out, a purpose-primacy gate, an age gate, or none.
- **Reaches general assistants** — a judgement, not a measurement. `yes` means the text plainly covers ChatGPT-class systems; `arguably` means a plausible reading covers them and a plausible reading does not; `partial` means some obligations reach them and others do not; `no` means the gating language excludes them by construction; `unclear` means the definitional clause has not been read against the enrolled text.
- **Youth focus** (`youth`) — who the legislation actually binds:

| Value | Column reads | Meaning |
|---|---|---|
| `only` | Minors only | Applies to minors only |
| `duties` | Minor duties | Applies to all users, and carries duties specific to minors |
| `none` | — | Applies to all users, with no minor-specific rules |

Youth focus is filterable in the Legislation view and available as a stat tile. It is coded from the `scope` field and must stay consistent with it: if you change one, change the other. The split matters to the analysis — the legislation that covers all users is disproportionately the legislation that triggers functionally.

## Mechanism definitions and operative phrasing

The Mechanism coverage view is a drill-down. Clicking a mechanism — in the bar chart, in a matrix column header, or on a mechanism tag inside a legislation row — opens a panel with three things: what the mechanism is as a legal rule, where this dataset draws the line around it, and how each piece of legislation carrying it is actually worded.

Two structures in `data.js` drive this.

**`MECHDEF`** — one entry per mechanism key, with `def` (the rule, stated independently of any one statute) and `line` (the coding boundary, e.g. that a break reminder is disclosure rather than an engagement limit). Every mechanism has a definition; these are the tracker's own, not quotations.

**`PHRASING`** — keyed by record id, then by mechanism key. Each entry carries the wording and its provenance:

```js
"ca-sb243":{
  disclosure:{k:"quote", t:"disclose to the user that the user is interacting with artificial intelligence",
    n:"Owed where the operator knows the user is a minor. …"}
}
```

- `k:"quote"` — verbatim text of the legislation itself. Rendered in quotation marks and tagged **verbatim text**.
- `k:"summary"` — close paraphrase drawn from secondary analysis or from this tracker's own coding notes. Tagged **close paraphrase**; verify against the enrolled text before quoting it in published work.
- `n` — optional context on the clause.

**This layer is deliberately incomplete.** 36 of the 179 mechanism/legislation pairs currently carry wording; the rest render as *not yet transcribed* with a link to the source, and the panel header states the transcribed count for that mechanism. Nothing is invented to fill a gap: a pair with no sourced wording shows no wording. Every mechanism has at least one worked example, and the analytically load-bearing ones — memory, dependence, engagement, human takeover, duty to test design — are covered in full.

Transcribing the remaining pairs from enrolled text is now the highest-value contribution to this repository.

### Frequently miscatalogued legislation

Several bills circulate in secondary summaries with the wrong status.

- **Florida CS/SB 482** did not become law — it cleared the Senate 35–2 on 4 March 2026 and died in Messages on 13 March. It is no longer carried in the dataset.
- **Missouri HB 1742** is coded here as introduced, not enacted.
- The **Youth AI Privacy Act**'s private right of action was removed in the 5 August 2026 markup.
- **China's measures are no longer a draft** — they were finalised and took effect 15 July 2026.
- **Virginia HB 635** was continued to the next session on 9 February 2026, so it is coded `stalled` rather than dropped.

## Updating the tracker

All data lives in the `DATA` array in `data.js`. To add or amend a piece of legislation, edit that array — nothing else needs to change, and every view, filter, count, tile and matrix rebuilds from it automatically.

A record looks like this:

```js
{
  id:"oh-hb123", juris:"US State", body:"Ohio", cite:"HB 123",
  name:"Companion chatbot act", status:"Enacted", statusClass:"law",
  dates:"Introduced Jan 2027 · enacted Jun 2027 · effective 1 Jan 2028",
  scope:"Minors",
  youth:"only",                         // only | duties | none
  term:"Companion chatbot", test:"capability",
  testNote:"Quote or close paraphrase of the operative definition",
  narrowing:"Use carve-out", reaches:"arguably",
  mechs:["disclosure","crisis"],        // keys from the MECHS list
  enforce:["State AG"],
  interval:"Every 3 hours",
  note:"Why this legislation matters to the argument.",
  link:"https://..."
}
```

`statusClass` must be one of `law`, `moving`, `pending`, `stalled` — it drives the status dot colour and the sort order. `youth` must be one of `only`, `duties`, `none`. `reaches` must be one of `yes`, `arguably`, `partial`, `no`, `unclear`. Mechanism keys must match the `MECHS` list at the top of `data.js` exactly or the matrix will silently drop them. Wording for each mechanism goes in the `PHRASING` map at the foot of the file, not in the record. Add `key:true` to pending legislation that the analysis relies on, so it appears in the instrument × mechanism matrix alongside enacted and moving law.

When a piece of legislation dies, delete its record and add a row to the removal table above.

To sanity-check the file after an edit:

```bash
node -e "
  const f = new Function(require('fs').readFileSync('data.js','utf8')+';return {DATA,MECHS}');
  const {DATA,MECHS}=f(); const keys=new Set(MECHS.map(m=>m[0]));
  DATA.forEach(d=>d.mechs.forEach(k=>{ if(!keys.has(k)) console.log('bad mech',d.id,k) }));
  const ids=DATA.map(d=>d.id);
  console.log('records',DATA.length,'| dupes',ids.filter((v,i)=>ids.indexOf(v)!==i));
"
```

## Contributing

Corrections and additions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the controlled vocabularies and coding conventions. The two highest-value contributions are **enrolled statutory text for legislation currently coded from tracker summaries** — the definitional clause and carve-out determine the "reaches general assistants" judgement, which is the analytically load-bearing column — and **operative wording for the `PHRASING` map**, which is 20% populated. Open an issue or a pull request against `data.js`.

## Suggested review cadence

- **Monthly during state sessions (January–June).** This is when the volume is: the 2026 wave went from five enacted laws to more than a dozen between January and July.
- **On any federal committee action.** The GUARD Act and the Youth AI Privacy Act have both moved out of committee in 2026 and both changed materially in markup.
- **Watch the effective dates, not just the enactment dates.** A large share of the enacted state laws do not take effect until 1 January or 1 July 2027, so the compliance picture in 2027 will look very different from the statute book today.
- **Prune as you go.** Check the `stalled` and `pending` rows each cycle; move anything that has died out of `data.js` and into the removal table.

## Sources

Primary bill and statutory text via Congress.gov, state legislature records and China Law Translate. Status verification and gap-filling via the Future of Privacy Forum 2026 Chatbot Legislation Tracker, MultiState, Orrick, Troutman Pepper, the Transparency Coalition legislative updates, FPF's analysis of Connecticut SB 5, Hunton and Bird & Bird on the CAC measures, EPIC on the Youth AI Privacy Act, LegiScan and the Florida Senate bill history. Codings are drawn from statutory and bill text where obtainable and from legislative trackers and law-firm analyses otherwise; the source link on each record points to the best available reference for that record.

## Licence

CC BY 4.0 for the data and written analysis; MIT for the code.
