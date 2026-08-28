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

- **Chronology** (`chron`) — two dates on every record and a third where the text states one:

| Field | Meaning |
|---|---|
| `chron.first` | The date the legislation first entered the record — introduced, filed, proposed, or published as a draft |
| `chron.latest` | The most recent thing that actually happened to it: a committee vote, passage, enactment, entry into force |
| `chron.effective` | When the obligations start to bind, where the text states a date. Optional — most bills state none |

See [Dates and chronological sorting](#dates-and-chronological-sorting) below for how precision is recorded and how it affects the ordering.

## Mechanism clusters

The sixteen mechanisms are grouped into five families by the `MECHGROUPS` array at the top of `data.js`. The clusters drive three things: the optgroups in the mechanism filter (each cluster also offers an *any mechanism in this cluster* option), the grouping of the coverage bars and the cluster summary above them, and the column order and banding of the legislation × mechanism matrix.

| Cluster | Mechanisms | What it covers |
|---|---|---|
| Honesty about what the system is | `disclosure` `sentience` `proImpersonation` | What the system may say about its own nature and standing |
| Harm response | `crisis` `humanTakeover` | Duties that fire when a user is in danger |
| Age gating and parental control | `ageAssurance` `accessBan` `minorContent` `parental` | Rules that turn on how old the user is |
| Design and data constraints | `engagement` `dependence` `memory` `training` | Rules constraining the product itself, and what it retains |
| Accountability and evidence | `reporting` `audit` `causation` | What must be documented, audited or investigated |

Grouping is what makes the central result of the coverage view legible: honesty obligations reach 36 of the 45 records and harm-response obligations 26, while the cluster that constrains the product's own design reaches 20 and accountability 12. Sixteen ungrouped bars do not show that; five clusters do.

Every key in `MECHS` must appear in exactly one cluster's `mechs` list. A key in no cluster is dropped from the coverage view and the matrix silently, so the check is in the validation snippet below.

## Dates and chronological sorting

The Legislation view can be ordered by first action, latest action, or effective date, newest-first or oldest-first, from the **Sort** control or by clicking the *Latest action* column heading.

Dates in `chron` are recorded at whatever precision the source supports — `"2026-04-30"`, `"2026-02"` or `"2026"` — and about half the corpus is dated only to the year, because that is all a state record often gives. Where the month or day is missing, the date is placed at the **midpoint** of the period it is known to fall in: a year sorts as 30 June, a month as the 15th. Resolving to the start of the period would sort every "enacted 2026" law behind anything dated January 2026; resolving to the end would push all twenty-two of them above a bill that actually moved in August. The midpoint is the least-wrong single point, and on the present dataset it never places a record's latest action before its first action.

Two consequences worth knowing when reading the site or adding a record:

- Ordering **between** a year-only row and a precisely dated row in the same year is an estimate, not a record. Such dates carry a dotted underline in the table and a tooltip saying so. Record a real month or day whenever the source supports one.
- Legislation with no `chron.effective` sorts **last** under the effective-date order in both directions, rather than jumping to the top when the direction is flipped.

## Hover definitions

Coded terms on the site carry a definition that appears on hover, on keyboard focus, and on tap. They are marked with a dotted underline.

The definitions live in the `GLOSSARY` map at the foot of `data.js` and are referenced from the markup and the renderers as `data-gl="<key>"`. Two families resolve programmatically instead of being listed twice: `data-gl="mech:<key>"` reads `MECHDEF`, and `data-gl="group:<key>"` reads `MECHGROUPS`. Anything covered is covered once — a mechanism's definition is written in `MECHDEF` and appears in the drill-down panel, on the coverage bars, on the matrix column headings and on the mechanism tags inside a legislation row without being duplicated.

Column headings, filter labels, the status, youth-focus and reach chips inside the table, the provenance tags in the mechanism panel, and the named drafting devices in the Gaps view all carry one. The `test` and `narrowing` values are free text that combines and qualifies its families ("capability + purpose", "Use carve-out gated on 'only'"), so the family is read off the value by first mention; an unrecognised value simply gets no tooltip rather than a wrong one.

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

**This layer is deliberately incomplete.** 36 of the 181 mechanism/legislation pairs currently carry wording; the rest render as *not yet transcribed* with a link to the source, and the panel header states the transcribed count for that mechanism. Nothing is invented to fill a gap: a pair with no sourced wording shows no wording. Every mechanism has at least one worked example, and the analytically load-bearing ones — memory, dependence, engagement, human takeover, duty to test design — are covered in full.

Transcribing the remaining pairs from enrolled text is now the highest-value contribution to this repository.

### Frequently miscatalogued legislation

Several bills circulate in secondary summaries with the wrong status.

- **Florida CS/SB 482** did not become law — it cleared the Senate 35–2 on 4 March 2026 and died in Messages on 13 March. It is no longer carried in the dataset.
- **Missouri HB 1742** is not enacted. It was prefiled 1 December 2025, had its first reading on 7 January 2026 and was referred to House Emerging Issues on 15 May 2026, where it remains — coded `pending`, status "In committee".
- The **Youth AI Privacy Act**'s private right of action was removed in the 5 August 2026 markup, so `enforce` carries the FTC and state attorneys general only.
- **China's measures are no longer a draft** — issued 10 April 2026 by five bodies jointly (the CAC, the NDRC, the MIIT, the Ministry of Public Security and the SAMR) and in force since 15 July 2026.
- **Tennessee has two separate instruments**, and they are routinely merged. SB 1580 is the enacted clinical-licensure conduct rule; SB 1493 / HB 1455 is a distinct pending bill criminalising the training of AI for companionship. Both are carried, separately.
- **New York GBL Art. 47 has a use carve-out as well as its marketing carve-out.** § 1700(4)(c) contains three exclusions, and summaries that mention only the marketing limb understate how much the section pulls back out.
- **Virginia HB 635** was continued to the next session on 9 February 2026, so it is coded `stalled` rather than dropped.

## Related resources

Three other trackers cover this ground, and a reader comparing them should know what each is for.

| Tracker | Access | Coverage | Frames its object as |
|---|---|---|---|
| [Future of Privacy Forum](https://fpf.org/) 2026 Chatbot Legislation Tracker | Free | US state and federal | "Chatbots" generally |
| [MultiState](https://www.multistate.ai/) | Paid subscription | US state only | Bill status and obligations |
| [White & Case, AI Watch: Global Regulatory Tracker](https://www.whitecase.com/insight-our-thinking/ai-watch-global-regulatory-tracker) | Free | Global, 40+ jurisdictions; companion chatbot statutes sit inside its US page | National AI regulation |

Those three track **status and obligations** — what a bill requires and how far it has travelled. This tracker codes the **definitional test**, the **narrowing device**, and whether the definition **reaches general-purpose assistants**. Use FPF or MultiState to find out whether a bill has moved; use this one to find out what its definition actually catches. Where a status here disagrees with theirs, theirs is more likely to be current and this file should be corrected — see the review cadence below.

## Reviewed and excluded

General AI governance statutes are **out of scope** where they reach companion products only as an instance of a broader class. The test applied is whether the instrument says something about the relationship between a system and its user, rather than something about AI outputs or AI decisions in general. A statute that would catch a companion chatbot the same way it catches a hiring algorithm is not tracked here.

Instruments checked against that test and excluded are recorded below, so a later reader knows they were considered rather than missed.

| Instrument | Status | Why excluded |
|---|---|---|
| Texas HB 149 (TRAIGA) | Signed 22 Jun 2025, effective 1 Jan 2026 | Prohibits AI used to "incite or encourage self-harm, crime, or violence", alongside CSAM, deepfake and discrimination provisions. Never uses the words "companion" or "chatbot"; its prohibitions operate on output content irrespective of any relationship with the user. |
| Colorado SB 24-205 | Signed 17 May 2024, obligations from 1 Feb 2026 | General algorithmic-discrimination statute for high-risk AI making consequential decisions. No chatbot, companion or relational provision. |

Colorado SB 24-205 is **not** the Colorado record in the dataset. `co-hb1263` is Colorado's companion chatbot statute and is tracked; SB 24-205 is a separate, general instrument and is not. The two are easily conflated in secondary summaries.

## Updating the tracker

All data lives in the `DATA` array in `data.js`. To add or amend a piece of legislation, edit that array — nothing else needs to change, and every view, filter, count, tile, matrix and ordering rebuilds from it automatically. The only edits outside `DATA` are a new mechanism (which needs a `MECHS` entry, a `MECHDEF` definition and a place in a `MECHGROUPS` cluster) and a new term to define on hover (a `GLOSSARY` entry plus a `data-gl` reference).

A record looks like this:

```js
{
  id:"oh-hb123", juris:"US State", body:"Ohio", cite:"HB 123",
  name:"Companion chatbot act", status:"Enacted", statusClass:"law",
  dates:"Introduced Jan 2027 · enacted Jun 2027 · effective 1 Jan 2028",
  chron:{first:"2027-01", latest:"2027-06", effective:"2028-01-01"},
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

`statusClass` must be one of `law`, `moving`, `pending`, `stalled` — it drives the status dot colour and the sort order. `youth` must be one of `only`, `duties`, `none`. `reaches` must be one of `yes`, `arguably`, `partial`, `no`, `unclear`. Mechanism keys must match the `MECHS` list at the top of `data.js` exactly, and must each belong to a cluster in `MECHGROUPS`, or the matrix will silently drop them. `chron.first` and `chron.latest` are required and must read `YYYY`, `YYYY-MM` or `YYYY-MM-DD`; `chron.effective` is optional and takes the same form. Keep `chron` consistent with the human-readable `dates` string: if you change one, change the other. Wording for each mechanism goes in the `PHRASING` map at the foot of the file, not in the record. Add `key:true` to pending legislation that the analysis relies on, so it appears in the instrument × mechanism matrix alongside enacted and moving law.

When a piece of legislation dies, delete its record and add a row to the removal table above.

To sanity-check the file after an edit:

```bash
node -e "
  const f = new Function(require('fs').readFileSync('data.js','utf8')+';return {DATA,MECHS,MECHGROUPS}');
  const {DATA,MECHS,MECHGROUPS}=f(); const keys=new Set(MECHS.map(m=>m[0]));
  const grouped=MECHGROUPS.flatMap(g=>g.mechs);
  DATA.forEach(d=>d.mechs.forEach(k=>{ if(!keys.has(k)) console.log('bad mech',d.id,k) }));
  [...keys].forEach(k=>{ if(grouped.filter(x=>x===k).length!==1)
    console.log('mechanism not in exactly one cluster',k) });
  const D=/^\d{4}(-\d{2}){0,2}\$/;
  DATA.forEach(d=>{ const c=d.chron||{};
    ['first','latest'].forEach(f=>{ if(!D.test(c[f]||'')) console.log('bad chron.'+f,d.id,c[f]) });
    if(c.effective&&!D.test(c.effective)) console.log('bad chron.effective',d.id,c.effective) });
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
