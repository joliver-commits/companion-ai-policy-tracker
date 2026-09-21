# Dates still to source

71 of 91 dates in `data.js` are not yet recorded to the day, across 37 of 41 records.

Every date is held at the precision its source actually supports — `YYYY-MM-DD`, `YYYY-MM` or `YYYY` — and a partial date is placed at the midpoint of its period for sorting (a year sorts as 30 June, a month as the 15th) and marked as an estimate on the site. Nothing here is wrong; it is simply less precise than it could be. See the `chron` section of [CONTRIBUTING.md](CONTRIBUTING.md) before filling one in, and keep the human-readable `dates` string in step with any change.

This file is generated. After editing `data.js`, run `node tools/date-gaps.mjs` to refresh it.

## Priority 1 — no month recorded (21 records)

A year-only date can be up to six months out when it is sorted and placed on the timeline, so these move the needle most.

| Record | Missing | Currently | `dates` as written | Source |
|---|---|---|---|---|
| **California SB 1119 / AB 2023**<br><span>Chatbot risk assessment and audit</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | 2026 session | [source](https://leginfo.legislature.ca.gov/) |
| **California AB 1988**<br><span>Crisis interruption requirement</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | 2026 session | [source](https://leginfo.legislature.ca.gov/) |
| **Colorado HB 1263**<br><span>Companion chatbot protections</span> | First action — no day<br>Latest action — no month | `2026-02`<br>`2026` | Introduced Feb 2026 · enacted 2026 | [source](https://leg.colorado.gov/) |
| **Georgia SB 540**<br><span>Companion chatbot act</span> | First action — no day<br>Latest action — no month | `2026-02`<br>`2026` | Introduced Feb 2026 · enacted 2026 | [source](https://www.legis.ga.gov/) |
| **Hawaii SB 3001**<br><span>Companion chatbot act</span> | First action — no day<br>Latest action — no month | `2026-01`<br>`2026` | Introduced Jan 2026 · sent to Governor · enacted 2026 | [source](https://www.capitol.hawaii.gov/) |
| **Idaho SB 1297**<br><span>Conversational AI safety act</span> | First action — no day<br>Latest action — no month | `2026-02`<br>`2026` | Introduced Feb 2026 · enacted · effective 1 Jul 2027 | [source](https://legislature.idaho.gov/) |
| **Iowa SF 2417**<br><span>Companion chatbot provisions</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Enacted 2026 | [source](https://www.legis.iowa.gov/) |
| **Maine LD 1727**<br><span>Chatbot disclosure</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Enacted 2026 | [source](https://legislature.maine.gov/) |
| **Michigan SB 760**<br><span>Companion chatbot act</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | 2026 session | [source](https://www.legislature.mi.gov/) |
| **Nebraska LB 525**<br><span>Conversational AI safety act</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Enacted 2026 · effective 1 Jul 2027 | [source](https://nebraskalegislature.gov/) |
| **New Hampshire HB 143**<br><span>Chatbot minor protections</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Enacted 2026 | [source](https://www.gencourt.state.nh.us/) |
| **New York S 9008C**<br><span>Minor age assurance for chatbots</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Enacted 2026 | [source](https://www.nysenate.gov/) |
| **New York S 9051**<br><span>Chatbot design and data act</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | 2026 session | [source](https://www.nysenate.gov/) |
| **New York S 9408**<br><span>Minor access ban — toys and young users</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | 2026 session | [source](https://www.nysenate.gov/) |
| **Pennsylvania SB 1090**<br><span>Chatbot safety act</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Passed chamber 2026 | [source](https://www.legis.state.pa.us/) |
| **Rhode Island SB 2195**<br><span>Companion chatbot provisions</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Enacted 2026 | [source](https://webserver.rilegislature.gov/) |
| **Tennessee SB 1580**<br><span>Prohibition on AI claiming clinical licensure</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Enacted 2026 · effective 1 Jul 2026 | [source](https://www.capitol.tn.gov/) |
| **US House H.R. 7757**<br><span>KIDS Act</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Passed House 2026 | [source](https://www.congress.gov/) |
| **US Senate S. 4407**<br><span>CHATBOT Act</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Filed 2026 | [source](https://www.congress.gov/) |
| **Utah HB 452**<br><span>Mental health chatbot regulation</span> | First action — no month<br>Latest action — no month | `2025`<br>`2025` | Enacted 2025 | [source](https://le.utah.gov/) |
| **Washington HB 2225**<br><span>Chatbot Disclosure Act</span> | First action — no month<br>Latest action — no month | `2026`<br>`2026` | Enacted 2026 · effective 1 Jan 2027 | [source](https://app.leg.wa.gov/) |

## Priority 2 — month recorded, day missing (16 records)

These sort into the right month already. A day makes the timeline exact and lets the record carry a citable date.

| Record | Missing | Currently | `dates` as written | Source |
|---|---|---|---|---|
| **California SB 243**<br><span>Companion Chatbots Act</span> | First action — no day<br>Latest action — no day | `2025-10`<br>`2025-10` | Enacted Oct 2025 · effective 1 Jan 2026 | [source](https://leginfo.legislature.ca.gov/) |
| **California SB 300**<br><span>Companion chatbot safety protocols</span> | First action — no day<br>Latest action — no day | `2026-01`<br>`2026-01` | Introduced Jan 2026 | [source](https://leginfo.legislature.ca.gov/) |
| **California SB 867**<br><span>Ban on chatbot companions in toys</span> | First action — no day<br>Latest action — no day | `2026-03`<br>`2026-03` | Introduced Mar 2026 | [source](https://leginfo.legislature.ca.gov/) |
| **Connecticut SB 5**<br><span>AI companion provisions of the omnibus AI Act</span> | First action — no day<br>Latest action — no day | `2026-06`<br>`2026-06` | Enacted June 2026 · effective 1 Jan 2027 | [source](https://www.cga.ct.gov/) |
| **Illinois SB 3262**<br><span>Companion AI Protection Act</span> | First action — no day | `2026-02` | Introduced Feb 2026 (Sen. Edly-Allen) · last action 22 May 2026 · would take effect 1 Jan 2027 | [source](https://ilga.gov/Legislation/BillStatus?DocNum=3262&GAID=18&DocTypeID=SB&SessionID=114) |
| **Illinois SB 3384**<br><span>Companion chatbot provisions</span> | First action — no day<br>Latest action — no day | `2026-02`<br>`2026-02` | Introduced Feb 2026 | [source](https://ilga.gov/) |
| **New York GBL Art. 47 (S3008)**<br><span>AI Companion Models</span> | First action — no day<br>Latest action — no day | `2025-05`<br>`2025-05` | Enacted May 2025 · effective 5 Nov 2025 | [source](https://www.nysenate.gov/legislation/bills/2025/S3008) |
| **New York A6767**<br><span>AI companion models — Assembly version</span> | First action — no day<br>Latest action — no day | `2026-01`<br>`2026-01` | Introduced Jan 2026 | [source](https://www.nysenate.gov/) |
| **New York S7263**<br><span>Chatbot conduct rules</span> | First action — no day<br>Latest action — no day | `2025-04`<br>`2025-04` | Introduced Apr 2025 | [source](https://www.nysenate.gov/) |
| **Oregon SB 1546**<br><span>Relating to artificial intelligence companions</span> | First action — no day<br>Latest action — no day | `2026-03`<br>`2026-03` | Passed Mar 2026 · effective 1 Jan 2027 | [source](https://olis.oregonlegislature.gov/) |
| **Pennsylvania HB 2006**<br><span>Chatbot crisis and disclosure</span> | First action — no day<br>Latest action — no day | `2025-11`<br>`2025-11` | Introduced Nov 2025 | [source](https://www.legis.state.pa.us/) |
| **US Congress S. 3062 / H.R. 8623**<br><span>GUARD Act</span> | First action — no day | `2025-10` | Introduced Oct 2025 · advanced Senate Judiciary 30 Apr 2026 · House companion pending | [source](https://www.congress.gov/bill/119th-congress/senate-bill/3062/text) |
| **US Congress Discussion draft**<br><span>TRUMP AMERICA AI Act</span> | First action — no day<br>Latest action — no day | `2026-03`<br>`2026-03` | Discussion draft Mar 2026 · incorporates the GUARD Act | [source](https://www.congress.gov/) |
| **US House People-First Chatbot Act**<br><span>People-First Chatbot Act</span> | First action — no day<br>Latest action — no day | `2026-07`<br>`2026-07` | Introduced July 2026 (Foushee, Casar) · from EPIC / Consumer Federation / Fairplay model bill (Jan 2026) | [source](https://epic.org/) |
| **US Senate S. 2714**<br><span>CHAT Act</span> | First action — no day<br>Latest action — no day | `2025-09`<br>`2025-09` | Introduced Sept 2025 | [source](https://www.congress.gov/) |
| **Virginia HB 635**<br><span>Artificial Intelligence Chatbots Act</span> | First action — no day | `2026-01` | Introduced Jan 2026 · continued in Communications, Technology and Innovation 9 Feb 2026 | [source](https://legiscan.com/VA/research/HB635/2026) |
