# Dates still to source

13 of 81 dates in `data.js` are not yet recorded to the day, across 13 of 36 records.

Every date is held at the precision its source actually supports — `YYYY-MM-DD`, `YYYY-MM` or `YYYY` — and a partial date is placed at the midpoint of its period for sorting (a year sorts as 30 June, a month as the 15th) and marked as an estimate on the site. Nothing here is wrong; it is simply less precise than it could be. See the `chron` section of [CONTRIBUTING.md](CONTRIBUTING.md) before filling one in, and keep the human-readable `dates` string in step with any change.

This file is generated. After editing `data.js`, run `node tools/date-gaps.mjs` to refresh it.

## Priority 1 — no month recorded (2 records)

A year-only date can be up to six months out when it is sorted and placed on the timeline, so these move the needle most.

| Record | Missing | Currently | `dates` as written | Source |
|---|---|---|---|---|
| **California SB 1119 / AB 2023**<br><span>Chatbot risk assessment and audit</span> | First action — no month | `2026` | Passed 10 Sept 2026 · introduction date not yet recorded | [source](https://leginfo.legislature.ca.gov/) |
| **US Senate S. 4407**<br><span>CHATBOT Act</span> | First action — no month | `2026` | Filed 2026 · ordered to be reported favorably by Senate Commerce, Science and Transportation, with an amendment in the nature of a substitute, 5 Aug 2026 | [source](https://www.congress.gov/) |

## Priority 2 — month recorded, day missing (11 records)

These sort into the right month already. A day makes the timeline exact and lets the record carry a citable date.

| Record | Missing | Currently | `dates` as written | Source |
|---|---|---|---|---|
| **California SB 867**<br><span>Ban on chatbot companions in toys</span> | First action — no day | `2026-03` | Introduced Mar 2026 · passed 10 Sept 2026 | [source](https://leginfo.legislature.ca.gov/) |
| **Colorado HB 1263**<br><span>Companion chatbot protections</span> | First action — no day | `2026-02` | Introduced Feb 2026 · passed 1 June 2026 | [source](https://leg.colorado.gov/) |
| **Georgia SB 540**<br><span>Companion chatbot act</span> | First action — no day | `2026-02` | Introduced Feb 2026 · passed 11 May 2026 | [source](https://www.legis.ga.gov/) |
| **Hawaii SB 3001**<br><span>Companion chatbot act</span> | First action — no day | `2026-01` | Introduced Jan 2026 · passed 14 July 2026 | [source](https://www.capitol.hawaii.gov/) |
| **Idaho SB 1297**<br><span>Conversational AI safety act</span> | First action — no day | `2026-02` | Introduced Feb 2026 · passed 1 Apr 2026 · effective 1 Jul 2027 | [source](https://legislature.idaho.gov/) |
| **New York GBL Art. 47 (S3008)**<br><span>AI Companion Models</span> | First action — no day | `2025-05` | Introduced May 2025 · enacted 7 Nov 2025 · effective 5 Nov 2025 as recorded — the effective date now precedes the enactment date and one of the two needs re-checking | [source](https://www.nysenate.gov/legislation/bills/2025/S3008) |
| **New York S7263**<br><span>Chatbot conduct rules</span> | First action — no day | `2025-04` | Introduced Apr 2025 · committed to Rules 5 June 2026 | [source](https://www.nysenate.gov/) |
| **Oregon SB 1546**<br><span>Relating to artificial intelligence companions</span> | First action — no day | `2026-03` | Introduced Mar 2026 · passed 6 Apr 2026 · effective 1 Jan 2027 | [source](https://olis.oregonlegislature.gov/) |
| **Pennsylvania HB 2006**<br><span>Chatbot crisis and disclosure</span> | First action — no day | `2025-11` | Introduced Nov 2025 · re-committed to Appropriations 1 July 2026 | [source](https://www.legis.state.pa.us/) |
| **US Congress S. 3062 / H.R. 8623**<br><span>GUARD Act</span> | First action — no day | `2025-10` | Introduced Oct 2025 · advanced Senate Judiciary 30 Apr 2026 · placed on the Senate Legislative Calendar under General Orders, Cal. No. 406, 11 May 2026 | [source](https://www.congress.gov/bill/119th-congress/senate-bill/3062/text) |
| **Virginia HB 635**<br><span>Artificial Intelligence Chatbots Act</span> | First action — no day | `2026-01` | Introduced Jan 2026 · continued to 2027 in House Communications, Technology and Innovation 9 Feb 2026 | [source](https://legiscan.com/VA/research/HB635/2026) |
