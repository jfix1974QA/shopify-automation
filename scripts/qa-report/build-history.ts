/**
 * Records each CI build's results and publishes them for the portfolio.
 *
 * After every build (run in CI after the tests and `npm run qa-reports`):
 *   - upserts the build into qa/build-history.json
 *   - writes qa-reports/build-history.md and .html (table + trend chart for every build)
 *   - writes qa-reports/badges/*.json (shields.io endpoint badges used in the README)
 *   - refreshes the README sections between <!-- METRICS:START/END --> and <!-- BUILDS:START/END -->
 *
 *   npx tsx scripts/qa-report/build-history.ts
 *   npx tsx scripts/qa-report/build-history.ts --summary path/summary.json --number 3 --id 123 --sha abc1234 --event push
 *
 * In GitHub Actions the build number, id, commit and event come from the GITHUB_* variables.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PALETTE_CSS, PALETTE_DARK_CSS, STATUS_KEYS, bars, stackedBars, standalone } from './charts';

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const ROOT = process.cwd();
const REPO = process.env.GITHUB_REPOSITORY ?? 'jfix1974QA/shopify-automation';
const SUMMARY = arg('summary') ?? 'reports/summary.json';
const HISTORY = 'qa/build-history.json';
const OUT = 'qa-reports';

type Build = {
  number: number;
  id: string;
  url: string;
  commit: string;
  event: string;
  date: string;
  durationMs: number;
  testCases: number;
  executions: number;
  passed: number;
  failed: number;
  blocked: number;
  flaky: number;
  skipped: number;
  passRate: number | null;
  requirementsCovered: number;
  requirementsTotal: number;
  openDefects: { Critical: number; High: number; Medium: number; Low: number };
  packs: Record<string, { passed: number; failed: number; blocked: number; skipped: number }>;
};

const BLOCKED = /bot protection|verifying your connection|just a moment|verify you are human|connection needs to be verified|Target page, context or browser has been closed/i;

// ---------- this build ----------
const summary = JSON.parse(fs.readFileSync(SUMMARY, 'utf8'));
const requirements: { tests: string[] }[] = JSON.parse(fs.readFileSync('qa/requirements.json', 'utf8')).requirements;
const defects: { severity: keyof Build['openDefects']; status: string }[] = fs.existsSync('qa/defects.json')
  ? JSON.parse(fs.readFileSync('qa/defects.json', 'utf8')).defects
  : [];

const classify = (t: { status: string; error?: string }) => {
  if (t.status === 'failed' || t.status === 'timedOut' || t.status === 'interrupted') return BLOCKED.test(t.error ?? '') ? 'blocked' : 'failed';
  if (t.status === 'flaky') return 'flaky';
  if (t.status === 'skipped') return 'skipped';
  return 'passed';
};
const tests: { id: string; pack: string; status: string; error?: string }[] = summary.tests;
const count = (s: string, list = tests) => list.filter((t) => classify(t) === s).length;
const packs: Build['packs'] = {};
for (const p of [...new Set(tests.map((t) => t.pack))]) {
  const list = tests.filter((t) => t.pack === p);
  packs[p] = { passed: count('passed', list) + count('flaky', list), failed: count('failed', list), blocked: count('blocked', list), skipped: count('skipped', list) };
}
const passed = count('passed'), failed = count('failed'), blocked = count('blocked'), flaky = count('flaky'), skipped = count('skipped');
const verified = tests.length - skipped - blocked;
const ids = new Set(tests.map((t) => t.id));
const openDefects = { Critical: 0, High: 0, Medium: 0, Low: 0 };
for (const d of defects) if (d.status !== 'Closed') openDefects[d.severity]++;

const runId = arg('id') ?? process.env.GITHUB_RUN_ID ?? 'local';
// Build time = the CI workflow's own wall-clock time (start of the run until now, or until --ended when seeding).
// Falls back to the tests' own span for local runs.
const started = arg('started') ?? process.env.RUN_STARTED_AT;
const ended = arg('ended');
const buildDate = started ?? summary.env.date;
const buildMs = started ? (ended ? Date.parse(ended) : Date.now()) - Date.parse(started) : summary.env.durationMs;
const build: Build = {
  number: Number(arg('number') ?? process.env.GITHUB_RUN_NUMBER ?? 0),
  id: runId,
  url: runId === 'local' ? '' : `https://github.com/${REPO}/actions/runs/${runId}`,
  commit: (arg('sha') ?? process.env.GITHUB_SHA ?? String(summary.env.commit ?? '')).slice(0, 7),
  event: arg('event') ?? process.env.GITHUB_EVENT_NAME ?? 'local',
  date: buildDate,
  durationMs: buildMs,
  testCases: ids.size,
  executions: tests.length,
  passed: passed + flaky,
  failed,
  blocked,
  flaky,
  skipped,
  passRate: verified ? Math.round(((passed + flaky) / verified) * 1000) / 10 : null,
  requirementsCovered: requirements.filter((r) => r.tests.some((id) => ids.has(id))).length,
  requirementsTotal: requirements.length,
  openDefects,
  packs,
};

// ---------- history ----------
const history: Build[] = fs.existsSync(HISTORY) ? JSON.parse(fs.readFileSync(HISTORY, 'utf8')) : [];
const at = history.findIndex((b) => b.id === build.id);
if (at > -1) history[at] = build;
else history.push(build);
history.sort((a, b) => a.number - b.number || a.date.localeCompare(b.date));
fs.mkdirSync('qa', { recursive: true });
fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2) + '\n');

// ---------- outputs ----------
const latest = history[history.length - 1];
const secs = (ms: number) => (ms >= 60000 ? `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s` : `${(ms / 1000).toFixed(1)}s`);
const day = (iso: string) => iso.replace('T', ' ').slice(0, 16) + ' UTC';
const defectTotal = (b: Build) => Object.values(b.openDefects).reduce((a, n) => a + n, 0);
const buildLabel = (b: Build) => `#${b.number}${b.commit ? ` (${b.commit})` : ''}`;
const link = (b: Build) => (b.url ? `[#${b.number}](${b.url})` : `#${b.number}`);
const statusOf = (b: Build) => (b.failed ? '❌ Failing' : b.blocked ? '🚧 Partly verified' : '✅ Passing');

fs.mkdirSync(path.join(OUT, 'charts'), { recursive: true });
const recent = history.slice(-20);
const resultsChart = stackedBars('Results per build', recent.map((b) => ({ label: buildLabel(b), values: { passed: b.passed, failed: b.failed, blocked: b.blocked, flaky: 0, skipped: b.skipped } })), STATUS_KEYS, { labelWidth: 140 });
const rateChart = bars('Pass rate per build (verified tests)', recent.map((b) => ({ label: buildLabel(b), value: b.passRate ?? 0, display: b.passRate === null ? 'n/a' : `${b.passRate}%` })), { labelWidth: 140, color: 'var(--good)' });
fs.writeFileSync(path.join(OUT, 'charts', 'build-results.svg'), standalone(resultsChart));
fs.writeFileSync(path.join(OUT, 'charts', 'build-pass-rate.svg'), standalone(rateChart));

const buildsTable = (list: Build[]) =>
  `| Build | Date | Commit | Trigger | Executions | ✅ Passed | ❌ Failed | 🚧 Blocked | ⏭️ Skipped | Pass rate | Open defects | Time | Status |\n|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|\n` +
  [...list].reverse().map((b) =>
    `| ${link(b)} | ${day(b.date)} | ${b.commit ? `[\`${b.commit}\`](https://github.com/${REPO}/commit/${b.commit})` : '-'} | ${b.event} | ${b.executions} | ${b.passed} | ${b.failed} | ${b.blocked} | ${b.skipped} | ${b.passRate === null ? 'n/a' : `${b.passRate}%`} | ${defectTotal(b)} | ${secs(b.durationMs)} | ${statusOf(b)} |`,
  ).join('\n');

const packOrder = ['ui', 'ui-mobile', 'functional', 'non-functional', 'api', 'regression'];
const packTable = `| Pack | Passed | Failed | Blocked | Skipped |\n|---|---:|---:|---:|---:|\n` +
  Object.entries(latest.packs).sort(([a], [b]) => packOrder.indexOf(a) - packOrder.indexOf(b)).map(([p, v]) => `| ${p} | ${v.passed} | ${v.failed} | ${v.blocked} | ${v.skipped} |`).join('\n');

const md = `# Build History

Results of every CI build of [${REPO}](https://github.com/${REPO}), recorded automatically by GitHub Actions.
Blocked = stopped by Shopify bot protection before the test could check anything (not a failure, never a defect).
Pass rate is over verified tests (excludes skipped and blocked).

![Results per build](charts/build-results.svg)

![Pass rate per build](charts/build-pass-rate.svg)

## All builds

${buildsTable(history)}

## Latest build by pack (${link(latest)})

${packTable}

---
[QA reports](README.md) · [Execution report](1-automation-execution-report.md) · [Defects](3-defect-and-qa-summary.md)
`;
fs.writeFileSync(path.join(OUT, 'build-history.md'), md);

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Build History</title>
<style>:root{${PALETTE_CSS} --bg:#f4f4f2;--card:#fff;--line:#e4e3df}
@media (prefers-color-scheme:dark){:root{${PALETTE_DARK_CSS} --bg:#121211;--card:#1a1a19;--line:#2e2e2b}}
body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.55 system-ui,-apple-system,Segoe UI,sans-serif} main{max-width:1080px;margin:0 auto;padding:28px 16px 64px}
h1{font-size:26px;margin:0 0 4px} h2{font-size:18px;margin:28px 0 10px} .sub{color:var(--ink-2)} a{color:var(--s1)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;margin:12px 0}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden} th,td{padding:7px 10px;text-align:left;border-bottom:1px solid var(--line)} th{font-size:12px;color:var(--ink-2)} td.n{text-align:right;font-variant-numeric:tabular-nums}
@media(max-width:760px){table{display:block;overflow-x:auto}}</style></head><body><main>
<h1>Build History</h1><div class="sub">Every CI build of <a href="https://github.com/${REPO}">${REPO}</a>. Blocked = stopped by Shopify bot protection (not a failure). Pass rate excludes skipped and blocked tests.</div>
<p><a href="index.html">QA reports</a> · <a href="1-automation-execution-report.html">Execution report</a> · <a href="3-defect-and-qa-summary.html">Defects</a></p>
<div class="card">${resultsChart}</div><div class="card">${rateChart}</div>
<h2>All builds</h2><table><thead><tr><th>Build</th><th>Date</th><th>Commit</th><th>Trigger</th><th>Runs</th><th>Passed</th><th>Failed</th><th>Blocked</th><th>Skipped</th><th>Pass rate</th><th>Open defects</th><th>Time</th></tr></thead><tbody>
${[...history].reverse().map((b) => `<tr><td>${b.url ? `<a href="${b.url}">#${b.number}</a>` : `#${b.number}`}</td><td>${esc(day(b.date))}</td><td><code>${esc(b.commit)}</code></td><td>${esc(b.event)}</td><td class="n">${b.executions}</td><td class="n">${b.passed}</td><td class="n">${b.failed}</td><td class="n">${b.blocked}</td><td class="n">${b.skipped}</td><td class="n">${b.passRate === null ? 'n/a' : b.passRate + '%'}</td><td class="n">${defectTotal(b)}</td><td class="n">${secs(b.durationMs)}</td></tr>`).join('')}
</tbody></table></main></body></html>`;
fs.writeFileSync(path.join(OUT, 'build-history.html'), html);

// shields.io endpoint badges
fs.mkdirSync(path.join(OUT, 'badges'), { recursive: true });
const badge = (file: string, label: string, message: string, color: string) =>
  fs.writeFileSync(path.join(OUT, 'badges', file), JSON.stringify({ schemaVersion: 1, label, message, color }) + '\n');
const rate = latest.passRate;
badge('pass-rate.json', 'pass rate', rate === null ? 'n/a' : `${rate}%`, rate === null ? 'lightgrey' : rate >= 95 ? 'brightgreen' : rate >= 80 ? 'yellow' : 'red');
badge('tests.json', 'tests', `${latest.passed} passed · ${latest.failed} failed · ${latest.blocked} blocked`, latest.failed ? 'orange' : 'brightgreen');
badge('test-cases.json', 'test cases', `${latest.testCases} (${latest.executions} runs)`, 'blue');
badge('coverage.json', 'requirements covered', `${latest.requirementsCovered}/${latest.requirementsTotal}`, latest.requirementsCovered === latest.requirementsTotal ? 'brightgreen' : 'yellow');
badge('defects.json', 'open defects', String(defectTotal(latest)), latest.openDefects.Critical || latest.openDefects.High ? 'red' : defectTotal(latest) ? 'orange' : 'brightgreen');
badge('builds.json', 'builds recorded', String(history.length), 'blue');

// README sections
const README = 'README.md';
if (fs.existsSync(README)) {
  let readme = fs.readFileSync(README, 'utf8');
  const replace = (name: string, content: string) => {
    const re = new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(<!-- ${name}:END -->)`);
    if (re.test(readme)) readme = readme.replace(re, `$1\n${content}\n$2`);
  };
  replace('METRICS', `_Latest build ${link(latest)} · ${day(latest.date)} · commit \`${latest.commit}\` · updated automatically by CI_

| Metric | Value |
|---|---|
| Test cases | **${latest.testCases}** (${latest.executions} executions across desktop and mobile) |
| Passed / Failed / Blocked / Skipped | **${latest.passed}** / **${latest.failed}** / **${latest.blocked}** / **${latest.skipped}** |
| Pass rate (verified tests) | **${rate === null ? 'n/a' : `${rate}%`}** |
| Requirements covered | **${latest.requirementsCovered}/${latest.requirementsTotal}** |
| Open defects | **${defectTotal(latest)}** (Critical ${latest.openDefects.Critical} · High ${latest.openDefects.High} · Medium ${latest.openDefects.Medium} · Low ${latest.openDefects.Low}) |
| CI build time | **${secs(latest.durationMs)}** (whole pipeline; packs run in parallel) |

${packTable}`);
  replace('BUILDS', `![Results per build](qa-reports/charts/build-results.svg)

${buildsTable(history.slice(-10))}

[Full build history →](qa-reports/build-history.md)`);
  fs.writeFileSync(README, readme);
}

console.log(`Recorded build #${build.number} (${build.id}): ${build.passed} passed, ${build.failed} failed, ${build.blocked} blocked, pass rate ${build.passRate ?? 'n/a'}%. History: ${history.length} builds.`);
