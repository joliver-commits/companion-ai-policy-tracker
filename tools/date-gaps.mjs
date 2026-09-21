/* Regenerates DATE-GAPS.md — the worklist of chron dates that are not yet
   recorded to the day.  Run from the repository root:

       node tools/date-gaps.mjs            # rewrite DATE-GAPS.md
       node tools/date-gaps.mjs --check    # print the counts only

   No dependencies and no build step, like the rest of the repo. */
import fs from 'fs';

const {DATA} = new Function(fs.readFileSync('data.js','utf8')+';return {DATA}')();

const prec = v => v ? String(v).split('-').length : 0;
const FIELD = {first:'First action', latest:'Latest action', effective:'Takes effect'};
const rows = [];
let total = 0, partial = 0;

for (const d of DATA) {
  const gaps = [];
  for (const k of ['first','latest','effective']) {
    const v = d.chron && d.chron[k];
    if (!v) continue;
    total++;
    if (prec(v) < 3) { gaps.push({k, v, p: prec(v)}); partial++; }
  }
  if (gaps.length) rows.push({d, gaps, worst: Math.min(...gaps.map(g => g.p))});
}

/* the records with no month at all are worth sourcing first: a year-only date
   is placed at 30 June for sorting, which can be six months wrong either way */
const noMonth = rows.filter(r => r.worst === 1);
const noDay   = rows.filter(r => r.worst === 2);
const esc = s => String(s).replace(/\|/g,'\\|');

const table = list => [
  '| Record | Missing | Currently | `dates` as written | Source |',
  '|---|---|---|---|---|',
  ...list.sort((a,b) => a.d.body.localeCompare(b.d.body)).map(r =>
    `| **${esc(r.d.body)} ${esc(r.d.cite)}**<br><span>${esc(r.d.name)}</span> | ` +
    r.gaps.map(g => FIELD[g.k] + (g.p === 1 ? ' — no month' : ' — no day')).join('<br>') + ' | ' +
    r.gaps.map(g => '`' + g.v + '`').join('<br>') + ' | ' +
    esc(r.d.dates) + ' | [source](' + r.d.link + ') |')
].join('\n');

const out = `# Dates still to source

${partial} of ${total} dates in \`data.js\` are not yet recorded to the day, across ${rows.length} of ${DATA.length} records.

Every date is held at the precision its source actually supports — \`YYYY-MM-DD\`, \`YYYY-MM\` or \`YYYY\` — and a partial date is placed at the midpoint of its period for sorting (a year sorts as 30 June, a month as the 15th) and marked as an estimate on the site. Nothing here is wrong; it is simply less precise than it could be. See the \`chron\` section of [CONTRIBUTING.md](CONTRIBUTING.md) before filling one in, and keep the human-readable \`dates\` string in step with any change.

This file is generated. After editing \`data.js\`, run \`node tools/date-gaps.mjs\` to refresh it.

## Priority 1 — no month recorded (${noMonth.length} records)

A year-only date can be up to six months out when it is sorted and placed on the timeline, so these move the needle most.

${table(noMonth)}

## Priority 2 — month recorded, day missing (${noDay.length} records)

These sort into the right month already. A day makes the timeline exact and lets the record carry a citable date.

${table(noDay)}
`;

if (process.argv.includes('--check')) {
  console.log(`${partial}/${total} dates partial · ${noMonth.length} records with no month · ${noDay.length} with no day`);
} else {
  fs.writeFileSync('DATE-GAPS.md', out);
  console.log(`DATE-GAPS.md written — ${partial}/${total} partial dates across ${rows.length} records`);
}
