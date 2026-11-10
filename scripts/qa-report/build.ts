/**
 * Builds the QA deliverables into qa-reports/ from the latest test run:
 *
 *   1-automation-execution-report   execution, pass/fail statistics, coverage
 *   2-test-scripts-and-scenarios    steps, expected results, actual results per test case
 *   3-defect-and-qa-summary         defects, severity, evidence, recommendations, quality gates
 *
 * Each is written as Markdown (renders on GitHub, charts as SVG files) and HTML (richer, same charts).
 *
 *   npm test            # produce reports/summary.json
 *   npm run qa-reports  # build qa-reports/
 *
 * Inputs: reports/summary.json (test run), qa/requirements.json (coverage map), qa/defects.json (triaged defects).
 */
import fs from 'node:fs';
import path from 'node:path';
import { bars, donut, heatmap, PALETTE_CSS, PALETTE_DARK_CSS, SEVERITY_KEYS, stackedBars, standalone, STATUS_KEYS } from './charts';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'qa-reports');
const SUMMARY = path.join(ROOT, 'reports', 'summary.json');

// ---------- types ----------
type Action = { kind: 'step' | 'action' | 'assert'; title: string; ms: number; ok: boolean };
type Run = {
  id: string; title: string; pack: string; file: string; tags: string[]; priority: string; description: string;
  status: string; durationMs: number; retries: number; error?: string; steps: string[]; actions?: Action[];
  screenshots: string[]; trace?: string; video?: string; metrics?: string; notes?: string[];
};
type Summary = { env: Record<string, string | number>; totals: Totals; packs: Record<string, Totals>; tests: Run[] };
type Totals = { total: number; passed: number; failed: number; skipped: number; flaky: number; durationMs: number };
type Requirement = { id: string; area: string; name: string; tests: string[]; projects?: string[] };
type Defect = {
  id: string; title: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; priority: string; status: string;
  area: string; type: string; foundBy: string[]; environment: string; preconditions?: string; steps: string[];
  expected: string; actual: string; evidence: { caption: string; file?: string; fromTest?: string; text?: string }[];
  impact: string; rootCause: string; recommendation: string; acceptanceCriteria: string[]; references?: string[];
};
type QaNotes = {
  observations?: { title: string; detail: string }[];
  recommendations?: string[];
  scope?: { in: string[]; out: string[] };
  /** Results that could not be trusted (e.g. environment blocked the test, or the test was fixed after the run). */
  reclassify?: { tests: string[]; reason: string }[];
};

// ---------- load ----------
if (!fs.existsSync(SUMMARY)) {
  console.error('reports/summary.json not found. Run the tests first: npm test');
  process.exit(1);
}
const summary: Summary = JSON.parse(fs.readFileSync(SUMMARY, 'utf8'));
const requirements: Requirement[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'qa', 'requirements.json'), 'utf8')).requirements;
const defectsFile = path.join(ROOT, 'qa', 'defects.json');
const defectsDoc = fs.existsSync(defectsFile) ? JSON.parse(fs.readFileSync(defectsFile, 'utf8')) : { defects: [] };
const defects: Defect[] = defectsDoc.defects ?? [];
const notes: QaNotes = defectsDoc.notes ?? {};

fs.rmSync(OUT, { recursive: true, force: true });
for (const d of ['charts', 'evidence']) fs.mkdirSync(path.join(OUT, d), { recursive: true });

// ---------- blocked results ----------
// A test the environment stopped from running (Shopify bot protection) says nothing about the store,
// so it is reported as "Blocked", kept out of the pass rate, and never raised as a defect.
const BOT_BLOCK = /bot protection|verifying your connection|just a moment/i;
const reclassified = new Map<string, string>();
for (const rule of notes.reclassify ?? []) for (const key of rule.tests) reclassified.set(key, rule.reason);
for (const r of summary.tests) {
  const reason = reclassified.get(`${r.id}@${r.pack}`) ?? reclassified.get(r.id);
  if (reason) {
    r.status = 'blocked';
    r.error = `${reason}${r.error ? `\n\nOriginal error: ${r.error}` : ''}`;
  } else if ((r.status === 'failed' || r.status === 'timedOut') && BOT_BLOCK.test(r.error ?? '')) {
    r.status = 'blocked';
    r.error = `Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.`;
  }
}

// ---------- helpers ----------
const runs = summary.tests;
const env = summary.env;
const PACK_ORDER = ['ui', 'ui-mobile', 'functional', 'non-functional', 'api', 'regression'];
const PACK_LABEL: Record<string, string> = { ui: 'UI (desktop)', 'ui-mobile': 'UI (mobile)', functional: 'Functional', 'non-functional': 'Non-functional', api: 'API', regression: 'Regression' };
const packs = Object.keys(summary.packs).sort((a, b) => PACK_ORDER.indexOf(a) - PACK_ORDER.indexOf(b));
const esc = (s: string) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const mdEsc = (s: string) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ');
const secs = (ms: number) => (ms >= 60000 ? `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s` : `${(ms / 1000).toFixed(1)}s`);
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const isFail = (s: string) => s === 'failed' || s === 'timedOut' || s === 'interrupted';
const norm = (s: string) =>
  isFail(s) ? 'failed' : s === 'blocked' ? 'blocked' : s === 'flaky' ? 'flaky' : s === 'skipped' ? 'skipped' : 'passed';
const STATUS_LABEL: Record<string, string> = { passed: 'Passed', failed: 'Failed', blocked: 'Blocked', flaky: 'Flaky', skipped: 'Skipped' };
const STATUS_ICON: Record<string, string> = { passed: '✅', failed: '❌', blocked: '🚧', flaky: '⚠️', skipped: '⏭️' };
const runDate = String(env.date).replace('T', ' ').slice(0, 16) + ' UTC';
type Counts = { total: number; passed: number; failed: number; blocked: number; flaky: number; skipped: number; durationMs: number };
const totalsOf = (rs: Run[]): Counts => {
  const c: Counts = { total: rs.length, passed: 0, failed: 0, blocked: 0, flaky: 0, skipped: 0, durationMs: 0 };
  for (const r of rs) { c[norm(r.status) as 'passed']++; c.durationMs += r.durationMs; }
  return c;
};
const t = totalsOf(summary.tests);
const packTotals: Record<string, Counts> = {};
for (const p of Object.keys(summary.packs)) packTotals[p] = totalsOf(summary.tests.filter((r) => r.pack === p));
const verified = (s: Counts) => s.total - s.skipped - s.blocked;
const executed = verified(t);
const passRate = pct(t.passed + t.flaky, executed);

/** Copy a report asset (screenshot) into qa-reports/evidence and return its path relative to qa-reports. */
const copied = new Map<string, string>();
function evidence(rel: string | undefined, name: string) {
  if (!rel) return undefined;
  const src = path.join(ROOT, 'reports', rel);
  if (!fs.existsSync(src)) return undefined;
  if (copied.has(src)) return copied.get(src);
  const file = `evidence/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)}${path.extname(src)}`;
  fs.copyFileSync(src, path.join(OUT, file));
  copied.set(src, file);
  return file;
}

/** Save a chart as a standalone SVG for Markdown, and return the inline SVG for HTML. */
function chart(name: string, svgMarkup: string) {
  fs.writeFileSync(path.join(OUT, 'charts', `${name}.svg`), standalone(svgMarkup));
  return { md: `![${name}](charts/${name}.svg)`, html: svgMarkup };
}

/** Split a test description into planned steps and expected results. */
function splitDescription(desc: string) {
  const sentences = desc.split(/(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean);
  const expectRe = /\b(must|expect|should|never|cannot)\b/i;
  const steps = sentences.filter((s) => !expectRe.test(s));
  const expected = sentences.filter((s) => expectRe.test(s));
  return { steps: steps.length ? steps : sentences.slice(0, 1), expected: expected.length ? expected : sentences };
}

function actualResult(r: Run) {
  const status = norm(r.status);
  if (status === 'skipped') return `Not executed: ${r.error || 'precondition not met (see skip reason in the HTML report)'}`;
  if (status === 'blocked') return `Not verified: ${(r.error ?? '').split('\n')[0]}`;
  const asserts = (r.actions ?? []).filter((a) => a.kind === 'assert');
  const okCount = asserts.filter((a) => a.ok).length;
  if (status === 'failed') {
    const first = (r.error ?? '').split('\n').filter((l) => l.trim() && !/^\s+at\s/.test(l)).slice(0, 8).join('\n');
    return `Failed: ${first || 'see trace'}`;
  }
  return `As expected.${asserts.length ? ` ${okCount}/${asserts.length} assertions passed.` : ''}${r.metrics ? ` Measured: ${r.metrics}.` : ''}${status === 'flaky' ? ' Passed on retry (flaky).' : ''}${r.notes?.length ? ` Note: ${r.notes.join('; ')}` : ''}`;
}

// Unique test cases (a UI test runs in two projects)
const cases = new Map<string, Run[]>();
for (const r of runs) {
  const key = r.id || r.title;
  if (!cases.has(key)) cases.set(key, []);
  cases.get(key)!.push(r);
}
const caseIds = [...cases.keys()].sort((a, b) => {
  const pa = PACK_ORDER.indexOf(cases.get(a)![0].pack), pb = PACK_ORDER.indexOf(cases.get(b)![0].pack);
  return pa - pb || a.localeCompare(b, undefined, { numeric: true });
});
const caseStatus = (id: string) => {
  const s = cases.get(id)!.map((r) => norm(r.status));
  return s.includes('failed') ? 'failed' : s.includes('blocked') ? 'blocked' : s.includes('flaky') ? 'flaky' : s.every((x) => x === 'skipped') ? 'skipped' : 'passed';
};

// ---------- shared HTML shell ----------
function page(title: string, subtitle: string, body: string, nav: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{${PALETTE_CSS} --bg:#f4f4f2; --card:#ffffff; --line:#e4e3df}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${PALETTE_DARK_CSS} --bg:#121211; --card:#1a1a19; --line:#2e2e2b}}
:root[data-theme="dark"]{${PALETTE_DARK_CSS} --bg:#121211; --card:#1a1a19; --line:#2e2e2b}
*{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:1080px;margin:0 auto;padding:28px 16px 80px} h1{font-size:26px;margin:0 0 4px} h2{font-size:19px;margin:36px 0 12px;padding-top:8px;border-top:1px solid var(--line)} h3{font-size:15px;margin:22px 0 8px}
.sub{color:var(--ink-2)} nav{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0 0;font-size:13px} nav a{color:var(--s1)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:20px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px} .kpi b{display:block;font-size:26px;line-height:1.2} .kpi span{color:var(--ink-2);font-size:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;margin:12px 0}
.viz{display:block;margin:8px 0} table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;margin:8px 0}
th,td{padding:7px 10px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top} th{font-size:12px;color:var(--ink-2);font-weight:600} td.num{text-align:right;font-variant-numeric:tabular-nums}
.badge{display:inline-block;font-size:11px;font-weight:600;padding:1px 8px;border-radius:10px;border:1px solid currentColor;white-space:nowrap}
.passed{color:var(--good)} .failed{color:var(--critical)} .blocked{color:#c4561f} .flaky{color:#b26a00} .skipped{color:var(--ink-2)}
.sev-Critical{color:var(--critical)} .sev-High{color:#c4561f} .sev-Medium{color:#b26a00} .sev-Low{color:var(--ink-2)}
pre{white-space:pre-wrap;word-break:break-word;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:10px;font-size:12px;max-height:280px;overflow:auto}
.shots{display:flex;gap:10px;flex-wrap:wrap} .shots figure{margin:0;max-width:320px} .shots img{width:100%;border:1px solid var(--line);border-radius:6px} figcaption{font-size:12px;color:var(--ink-2)}
ol,ul{padding-left:20px;margin:6px 0} li{margin:2px 0} .muted{color:var(--ink-2);font-size:12px} .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px} @media(max-width:760px){.grid2{grid-template-columns:1fr}}
.act{font-size:12px;font-family:ui-monospace,Consolas,monospace} .act .ok{color:var(--good)} .act .ko{color:var(--critical)}
a{color:var(--s1)} details>summary{cursor:pointer}
</style></head><body><main>
<h1>${esc(title)}</h1><div class="sub">${subtitle}</div><nav>${nav}</nav>
${body}
</main></body></html>`;
}
const NAV_HTML = `<a href="index.html">Index</a><a href="1-automation-execution-report.html">1. Execution report</a><a href="2-test-scripts-and-scenarios.html">2. Test scripts &amp; scenarios</a><a href="3-defect-and-qa-summary.html">3. Defect &amp; QA summary</a>`;
const NAV_MD = `[Index](README.md) · [1. Execution report](1-automation-execution-report.md) · [2. Test scripts & scenarios](2-test-scripts-and-scenarios.md) · [3. Defect & QA summary](3-defect-and-qa-summary.md)`;
const SUBTITLE = `${esc(String(env.store))} · run ${esc(runDate)} · ${esc(String(env.ci))}${env.commit ? ' · commit ' + esc(String(env.commit)) : ''}`;

// =====================================================================
// 1. Automation execution report
// =====================================================================
{
  const statusData = STATUS_KEYS.map((k) => ({ key: k, value: (t as any)[k.key] as number }));
  const cStatus = chart('status-overview', donut('Test results', statusData, { value: `${passRate}%`, label: 'pass rate' }));
  const cPacks = chart('results-by-pack', stackedBars('Results by test pack', packs.map((p) => ({ label: PACK_LABEL[p] ?? p, values: packTotals[p] as any })), STATUS_KEYS));
  const cDur = chart('duration-by-pack', bars('Execution time by pack', packs.map((p) => ({ label: PACK_LABEL[p] ?? p, value: packTotals[p].durationMs, display: secs(packTotals[p].durationMs) }))));

  const byPriority = ['P1', 'P2', 'P3'].map((p) => {
    const v: Record<string, number> = { passed: 0, failed: 0, blocked: 0, flaky: 0, skipped: 0 };
    for (const r of runs.filter((x) => x.priority === p)) v[norm(r.status)]++;
    return { label: `${p} ${p === 'P1' ? '(high)' : p === 'P2' ? '(medium)' : '(low)'}`, values: v };
  });
  const cPri = chart('results-by-priority', stackedBars('Results by priority', byPriority, STATUS_KEYS));

  // Coverage
  const reqRows = requirements.map((req) => {
    const v: Record<string, number> = { passed: 0, failed: 0, blocked: 0, flaky: 0, skipped: 0 };
    const relevant = runs.filter((r) => req.tests.includes(r.id) && (!req.projects || req.projects.includes(r.pack)));
    for (const r of relevant) v[norm(r.status)]++;
    const missing = req.tests.filter((id) => !cases.has(id));
    return { req, v, relevant, missing, covered: relevant.length > 0, executed: relevant.some((r) => !['skipped', 'blocked'].includes(norm(r.status))) };
  });
  const covered = reqRows.filter((r) => r.covered).length;
  const executedReqs = reqRows.filter((r) => r.executed).length;
  const fullyPassing = reqRows.filter((r) => r.executed && r.v.failed === 0 && r.v.blocked === 0 && r.v.passed + r.v.flaky > 0).length;
  const cCov = chart('coverage-by-requirement', stackedBars('Test results per requirement', reqRows.map((r) => ({ label: `${r.req.id} ${r.req.name}`, values: r.v })), STATUS_KEYS, { labelWidth: 300 }));
  const areas = [...new Set(requirements.map((r) => r.area))];
  const matrix = areas.map((area) => packs.map((p) => {
    const ids = new Set(requirements.filter((r) => r.area === area).flatMap((r) => r.tests));
    return runs.filter((r) => r.pack === p && ids.has(r.id)).length;
  }));
  const cHeat = chart('coverage-heatmap', heatmap('Tests per feature area and pack', areas, packs.map((p) => PACK_LABEL[p] ?? p), matrix));
  const slow = [...runs].filter((r) => !['skipped', 'blocked'].includes(norm(r.status))).sort((a, b) => b.durationMs - a.durationMs).slice(0, 10);
  const cSlow = chart('slowest-tests', bars('Slowest 10 tests', slow.map((r) => ({ label: `${r.id} (${r.pack})`, value: r.durationMs, display: secs(r.durationMs) })), { labelWidth: 200 }));
  const failedRuns = runs.filter((r) => isFail(r.status));
  const blockedRuns = runs.filter((r) => norm(r.status) === 'blocked');
  const tagCount = (tag: string) => new Set(runs.filter((r) => r.tags.includes(tag)).map((r) => r.id)).size;

  const kpis: [string, string, string?][] = [
    [String(caseIds.length), 'Test cases'], [String(t.total), 'Test executions'], [String(t.passed), 'Passed', 'passed'], [String(t.failed), 'Failed', 'failed'],
    [String(t.blocked), 'Blocked (environment)', 'blocked'], [String(t.flaky), 'Flaky', 'flaky'], [String(t.skipped), 'Skipped', 'skipped'], [`${passRate}%`, 'Pass rate (verified)'], [secs(Number(env.durationMs)), 'Wall-clock time'],
    [`${covered}/${requirements.length}`, 'Requirements covered'], [`${fullyPassing}/${requirements.length}`, 'Requirements fully passing'],
  ];

  const packTableMd = `| Pack | Tests | Passed | Failed | Blocked | Flaky | Skipped | Pass rate | Time |\n|---|---:|---:|---:|---:|---:|---:|---:|---:|\n` +
    packs.map((p) => { const s = packTotals[p]; return `| ${PACK_LABEL[p] ?? p} | ${s.total} | ${s.passed} | ${s.failed} | ${s.blocked} | ${s.flaky} | ${s.skipped} | ${verified(s) ? pct(s.passed + s.flaky, verified(s)) + "%" : "n/a"} | ${secs(s.durationMs)} |`; }).join('\n') +
    `\n| **Total** | **${t.total}** | **${t.passed}** | **${t.failed}** | **${t.blocked}** | **${t.flaky}** | **${t.skipped}** | **${passRate}%** | **${secs(t.durationMs)}** |`;
  const reqTableMd = `| ID | Area | Requirement | Test cases | Executions | Passed | Failed | Blocked | Skipped | Status |\n|---|---|---|---|---:|---:|---:|---:|---:|---|\n` +
    reqRows.map((r) => `| ${r.req.id} | ${r.req.area} | ${r.req.name} | ${r.req.tests.join(', ')} | ${r.relevant.length} | ${r.v.passed + r.v.flaky} | ${r.v.failed} | ${r.v.blocked} | ${r.v.skipped} | ${!r.covered ? '⛔ Not covered' : !r.executed ? (r.v.blocked ? '🚧 Blocked' : '⏭️ Not executed') : r.v.failed ? '❌ Failing' : r.v.passed + r.v.flaky === 0 ? '🚧 Blocked' : r.v.blocked ? '⚠️ Partly verified' : '✅ Passing'} |`).join('\n');

  const md = `# 1. Automation Execution Report

${NAV_MD}

**Store:** ${env.store} · **Run:** ${runDate} · **Environment:** ${env.ci === 'local' ? 'local' : `[CI run](${env.ci})`} · Playwright ${env.playwright} · Node ${env.node} · ${env.os}

## Summary

| Test cases | Executions | Passed | Failed | Blocked | Flaky | Skipped | Pass rate | Requirements covered | Time |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ${caseIds.length} | ${t.total} | ${t.passed} | ${t.failed} | ${t.blocked} | ${t.flaky} | ${t.skipped} | **${passRate}%** | ${covered}/${requirements.length} | ${secs(Number(env.durationMs))} |

${cStatus.md}

Pass rate is calculated over verified tests: skipped and blocked tests are excluded. UI tests run twice, on desktop Chrome and on an iPhone 14 (WebKit), so executions exceed test cases.
${t.blocked ? `\n> **${t.blocked} executions are Blocked, not failed.** Shopify's bot protection stopped them before they could check anything (or the test was corrected after the run and is awaiting re-test). They say nothing about store quality and are not raised as defects. See "Blocked tests" below.\n` : ''}

## Results by test pack

${cPacks.md}

${packTableMd}

${cDur.md}

## Results by priority

${cPri.md}

| Priority | Passed | Failed | Blocked | Flaky | Skipped |
|---|---:|---:|---:|---:|---:|
${byPriority.map((p) => `| ${p.label} | ${p.values.passed} | ${p.values.failed} | ${p.values.blocked} | ${p.values.flaky} | ${p.values.skipped} |`).join('\n')}

## Test coverage

**${covered} of ${requirements.length}** store requirements have automated tests; **${executedReqs}** were executed in this run and **${fullyPassing}** pass completely.
Coverage includes **${tagCount('@edge')}** edge/negative test cases, **${tagCount('@ai')}** Claude-powered checks and **${tagCount('@regression')}** regression-tagged tests.

${cCov.md}

${cHeat.md}

${reqTableMd}

## Slowest tests

${cSlow.md}

## Failed tests

${failedRuns.length ? `| Test | Pack | Priority | Failure |\n|---|---|---|---|\n${failedRuns.map((r) => `| ${r.id} ${mdEsc(r.title)} | ${r.pack} | ${r.priority} | ${mdEsc((r.error ?? '').split('\n')[0].slice(0, 160))} |`).join('\n')}\n\nSee [3. Defect & QA summary](3-defect-and-qa-summary.md) for triage and defects raised.` : 'No failures.'}

## Blocked tests

${blockedRuns.length ? `These did not produce a result about the store and must be re-run (CI runs each pack on its own runner, which avoids the single-IP blocking).\n\n| Test | Pack | Reason |\n|---|---|---|\n${blockedRuns.map((r) => `| ${r.id} ${mdEsc(r.title)} | ${r.pack} | ${mdEsc((r.error ?? '').split('\n')[0].slice(0, 200))} |`).join('\n')}` : 'None.'}

## How this was run

\`\`\`bash
npx playwright test          # all packs
npm run qa-reports           # build these reports
\`\`\`

Full interactive report with a trace for every test: \`npx playwright show-report reports/html\`.
`;
  fs.writeFileSync(path.join(OUT, '1-automation-execution-report.md'), md);

  const html = page('1. Automation Execution Report', SUBTITLE, `
<div class="kpis">${kpis.map(([v, l, c]) => `<div class="kpi"><b class="${c ?? ''}">${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>
<div class="card">${cStatus.html}<p class="muted">Pass rate is over verified tests (skipped and blocked excluded). UI tests run on desktop Chrome and iPhone 14 (WebKit).</p>
${t.blocked ? `<p><b class="blocked">${t.blocked} executions are Blocked, not failed.</b> Shopify's bot protection stopped them before they could check anything (or the test was corrected after the run and awaits re-test). They are not raised as defects. See <a href="#blocked">Blocked tests</a>.</p>` : ''}</div>
<h2>Results by test pack</h2><div class="card">${cPacks.html}</div>
<table><thead><tr><th>Pack</th><th>Tests</th><th>Passed</th><th>Failed</th><th>Blocked</th><th>Flaky</th><th>Skipped</th><th>Pass rate</th><th>Time</th></tr></thead><tbody>
${packs.map((p) => { const s = packTotals[p]; return `<tr><td>${esc(PACK_LABEL[p] ?? p)}</td><td class="num">${s.total}</td><td class="num passed">${s.passed}</td><td class="num failed">${s.failed}</td><td class="num blocked">${s.blocked}</td><td class="num flaky">${s.flaky}</td><td class="num skipped">${s.skipped}</td><td class="num">${verified(s) ? pct(s.passed + s.flaky, verified(s)) + "%" : "n/a"}</td><td class="num">${secs(s.durationMs)}</td></tr>`; }).join('')}
<tr><th>Total</th><th>${t.total}</th><th>${t.passed}</th><th>${t.failed}</th><th>${t.blocked}</th><th>${t.flaky}</th><th>${t.skipped}</th><th>${passRate}%</th><th>${secs(t.durationMs)}</th></tr></tbody></table>
<div class="card">${cDur.html}</div>
<h2>Results by priority</h2><div class="card">${cPri.html}</div>
<h2>Test coverage</h2>
<div class="kpis"><div class="kpi"><b>${covered}/${requirements.length}</b><span>Requirements with tests</span></div><div class="kpi"><b>${executedReqs}</b><span>Executed this run</span></div><div class="kpi"><b class="passed">${fullyPassing}</b><span>Fully passing</span></div><div class="kpi"><b>${tagCount('@edge')}</b><span>Edge / negative cases</span></div><div class="kpi"><b>${tagCount('@ai')}</b><span>Claude-powered checks</span></div></div>
<div class="card">${cCov.html}</div><div class="card">${cHeat.html}</div>
<details class="card"><summary>Requirement traceability table</summary><table><thead><tr><th>ID</th><th>Area</th><th>Requirement</th><th>Test cases</th><th>Runs</th><th>Pass</th><th>Fail</th><th>Blocked</th><th>Skip</th><th>Status</th></tr></thead><tbody>
${reqRows.map((r) => `<tr><td>${r.req.id}</td><td>${esc(r.req.area)}</td><td>${esc(r.req.name)}</td><td class="muted">${esc(r.req.tests.join(', '))}</td><td class="num">${r.relevant.length}</td><td class="num passed">${r.v.passed + r.v.flaky}</td><td class="num failed">${r.v.failed}</td><td class="num blocked">${r.v.blocked}</td><td class="num skipped">${r.v.skipped}</td><td>${!r.covered ? '<span class="badge failed">Not covered</span>' : !r.executed ? (r.v.blocked ? '<span class="badge blocked">Blocked</span>' : '<span class="badge skipped">Not executed</span>') : r.v.failed ? '<span class="badge failed">Failing</span>' : r.v.passed + r.v.flaky === 0 ? '<span class="badge blocked">Blocked</span>' : r.v.blocked ? '<span class="badge flaky">Partly verified</span>' : '<span class="badge passed">Passing</span>'}</td></tr>`).join('')}
</tbody></table></details>
<h2>Slowest tests</h2><div class="card">${cSlow.html}</div>
<h2>Failed tests</h2>${failedRuns.length ? `<table><thead><tr><th>Test</th><th>Pack</th><th>Priority</th><th>Failure</th></tr></thead><tbody>${failedRuns.map((r) => `<tr><td><b>${esc(r.id)}</b> ${esc(r.title)}</td><td>${esc(r.pack)}</td><td>${r.priority}</td><td class="muted">${esc((r.error ?? '').split('\n')[0].slice(0, 200))}</td></tr>`).join('')}</tbody></table><p>Triage and defects: <a href="3-defect-and-qa-summary.html">3. Defect &amp; QA summary</a>.</p>` : '<p>No failures.</p>'}
<h2 id="blocked">Blocked tests</h2>${blockedRuns.length ? `<p>These did not produce a result about the store and must be re-run (CI runs each pack on its own runner, which avoids the single-IP blocking).</p><table><thead><tr><th>Test</th><th>Pack</th><th>Reason</th></tr></thead><tbody>${blockedRuns.map((r) => `<tr><td><b>${esc(r.id)}</b> ${esc(r.title)}</td><td>${esc(r.pack)}</td><td class="muted">${esc((r.error ?? '').split('\n')[0].slice(0, 220))}</td></tr>`).join('')}</tbody></table>` : '<p>None.</p>'}
<h2>Environment</h2><table><tbody><tr><th>Store</th><td>${esc(String(env.store))}</td></tr><tr><th>Run</th><td>${esc(runDate)} (${esc(String(env.ci))})</td></tr><tr><th>Tooling</th><td>Playwright ${esc(String(env.playwright))}, Node ${esc(String(env.node))}, ${esc(String(env.os))}</td></tr><tr><th>Browsers</th><td>Chromium (desktop), WebKit (iPhone 14 emulation)</td></tr></tbody></table>
`, NAV_HTML);
  fs.writeFileSync(path.join(OUT, '1-automation-execution-report.html'), html);
}

// =====================================================================
// 2. Test scripts and scenarios
// =====================================================================
{
  const packCases = packs.filter((p) => p !== 'ui-mobile').map((p) => ({ p, ids: caseIds.filter((id) => cases.get(id)![0].pack === p || (p === 'ui' && cases.get(id)![0].pack === 'ui-mobile')) }));
  const typeRows = packCases.map(({ p, ids }) => {
    const edge = ids.filter((id) => cases.get(id)![0].tags.includes('@edge')).length;
    const ai = ids.filter((id) => cases.get(id)![0].tags.includes('@ai')).length;
    return { label: p === 'ui' ? 'UI' : PACK_LABEL[p] ?? p, values: { standard: ids.length - edge - ai, edge, ai } };
  });
  const cTypes = chart('scenarios-by-type', stackedBars('Test cases by pack and type', typeRows, [
    { key: 'standard', label: 'Standard', color: 'var(--s1)' },
    { key: 'edge', label: 'Edge / negative', color: '#eb6834' },
    { key: 'ai', label: 'Claude-powered', color: '#1baf7a' },
  ]));
  const caseStatusCounts: Record<string, number> = { passed: 0, failed: 0, blocked: 0, flaky: 0, skipped: 0 };
  for (const id of caseIds) caseStatusCounts[caseStatus(id)]++;
  const cCase = chart('scenario-status', donut('Test case outcomes', STATUS_KEYS.map((k) => ({ key: k, value: caseStatusCounts[k.key] })), { value: String(caseIds.length), label: 'test cases' }));

  const detail = (id: string) => {
    const rs = cases.get(id)!;
    const r0 = rs[0];
    const { steps, expected } = splitDescription(r0.description || r0.title);
    const status = caseStatus(id);
    const shotRun = rs.find((r) => isFail(r.status)) ?? rs[0];
    const shot = evidence(shotRun.screenshots[0], `${id}-${shotRun.pack}`);
    return { r0, rs, steps, expected, status, shot, shotRun };
  };

  let md = `# 2. Test Scripts and Scenarios

${NAV_MD}

**Store:** ${env.store} · **Run:** ${runDate} · **${caseIds.length} test cases** in ${packCases.length} packs (${t.total} executions)

Each test case lists its planned steps and expected result (from the test definition), the steps the automation
actually performed in this run (browser actions and assertions, with outcome), and the actual result.
Source code for every scenario is linked by file and line.

${cCase.md}

${cTypes.md}

## Test case index

| ID | Test case | Pack | Priority | Type | Result | Time |
|---|---|---|---|---|---|---:|
${caseIds.map((id) => { const rs = cases.get(id)!; const r = rs[0]; const s = caseStatus(id); return `| [${id}](#${id.toLowerCase()}) | ${mdEsc(r.title)} | ${r.pack === 'ui-mobile' ? 'ui' : r.pack} | ${r.priority} | ${r.tags.includes('@ai') ? 'Claude' : r.tags.includes('@edge') ? 'Edge' : 'Standard'} | ${STATUS_ICON[s]} ${STATUS_LABEL[s]} | ${rs.map((x) => secs(x.durationMs)).join(' / ')} |`; }).join('\n')}
`;
  let htmlCases = '';

  for (const { p, ids } of packCases) {
    md += `\n## ${p === 'ui' ? 'UI' : PACK_LABEL[p] ?? p} pack\n`;
    htmlCases += `<h2 id="pack-${p}">${esc(p === 'ui' ? 'UI' : PACK_LABEL[p] ?? p)} pack <span class="muted">(${ids.length} test cases)</span></h2>`;
    for (const id of ids) {
      const { r0, rs, steps, expected, status, shot } = detail(id);
      const runsLine = rs.map((r) => `${PACK_LABEL[r.pack] ?? r.pack}: ${STATUS_ICON[norm(r.status)]} ${STATUS_LABEL[norm(r.status)]} (${secs(r.durationMs)})`).join(' · ');
      const actions = (rs.find((r) => isFail(r.status)) ?? r0).actions ?? [];
      md += `
### ${id}

**${r0.title}**

| Field | Value |
|---|---|
| Test case ID | ${id} |
| Pack | ${r0.pack === 'ui-mobile' ? 'ui' : r0.pack} |
| Priority | ${r0.priority} |
| Tags | ${r0.tags.map((x) => `\`${x}\``).join(' ')} |
| Script | \`${r0.file.replace(/\\/g, '/')}\` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup)${r0.pack === 'api' ? '; requests sent from inside the browser session' : ''} |
| Result | ${runsLine} |

**Test steps**
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Expected result**
${expected.map((s) => `- ${s}`).join('\n')}
${actions.length ? `\n<details><summary>Steps executed in this run (${actions.length})</summary>\n\n${actions.map((a, i) => `${i + 1}. ${a.ok ? '✓' : '✗'} ${a.kind === 'assert' ? '**Assert** ' : a.kind === 'step' ? '**Step** ' : ''}\`${a.title.replace(/`/g, "'")}\` (${a.ms}ms)`).join('\n')}\n\n</details>\n` : ''}
**Actual result:** ${STATUS_ICON[status]} ${rs.map((r) => (rs.length > 1 ? `*${PACK_LABEL[r.pack] ?? r.pack}:* ` : '') + actualResult(r).split('\n')[0]).join('<br>')}
${status === 'failed' ? `\n\`\`\`\n${actualResult(rs.find((r) => isFail(r.status))!).replace(/^Failed: /, '').slice(0, 1500)}\n\`\`\`\n` : ''}${shot ? `\n<img src="${shot}" alt="${id} screenshot" width="420">\n` : ''}
`;
      htmlCases += `<div class="card" id="${id.toLowerCase()}">
<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3 style="margin:0">${esc(id)}: ${esc(r0.title)}</h3><span class="badge ${status}">${STATUS_LABEL[status]}</span></div>
<p class="muted">${esc(r0.priority)} · ${r0.tags.map(esc).join(' ')} · <code>${esc(r0.file.replace(/\\/g, '/'))}</code></p>
<p class="muted">${esc(runsLine)}</p>
<div class="grid2"><div><b>Test steps</b><ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div><div><b>Expected result</b><ul>${expected.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div></div>
${actions.length ? `<details><summary>Steps executed in this run (${actions.length})</summary><ol class="act">${actions.map((a) => `<li><span class="${a.ok ? 'ok' : 'ko'}">${a.ok ? '✓' : '✗'}</span> ${a.kind === 'assert' ? '<b>assert</b> ' : a.kind === 'step' ? '<b>step</b> ' : ''}${esc(a.title)} <span class="muted">${a.ms}ms</span></li>`).join('')}</ol></details>` : ''}
<p><b>Actual result:</b> ${rs.map((r) => `${rs.length > 1 ? `<i>${esc(PACK_LABEL[r.pack] ?? r.pack)}:</i> ` : ''}${esc(actualResult(r).split('\n')[0])}`).join('<br>')}</p>
${status === 'failed' ? `<pre>${esc(actualResult(rs.find((r) => isFail(r.status))!).replace(/^Failed: /, ''))}</pre>` : ''}
${shot ? `<div class="shots"><figure><a href="${shot}"><img loading="lazy" src="${shot}" alt="${esc(id)} screenshot"></a><figcaption>Screenshot at end of test</figcaption></figure></div>` : ''}
</div>`;
    }
  }
  fs.writeFileSync(path.join(OUT, '2-test-scripts-and-scenarios.md'), md);
  fs.writeFileSync(path.join(OUT, '2-test-scripts-and-scenarios.html'), page('2. Test Scripts and Scenarios', SUBTITLE, `
<div class="kpis"><div class="kpi"><b>${caseIds.length}</b><span>Test cases</span></div>${STATUS_KEYS.map((k) => `<div class="kpi"><b class="${k.key}">${caseStatusCounts[k.key]}</b><span>${k.label}</span></div>`).join('')}</div>
<div class="grid2"><div class="card">${cCase.html}</div><div class="card">${cTypes.html}</div></div>
<p class="muted">Steps and expected results come from each test's definition; "Steps executed" is what the automation actually did in this run.</p>
<details class="card"><summary>Test case index</summary><table><thead><tr><th>ID</th><th>Test case</th><th>Pack</th><th>Priority</th><th>Result</th></tr></thead><tbody>
${caseIds.map((id) => { const r = cases.get(id)![0]; const s = caseStatus(id); return `<tr><td><a href="#${id.toLowerCase()}">${esc(id)}</a></td><td>${esc(r.title)}</td><td>${esc(r.pack === 'ui-mobile' ? 'ui' : r.pack)}</td><td>${r.priority}</td><td><span class="badge ${s}">${STATUS_LABEL[s]}</span></td></tr>`; }).join('')}
</tbody></table></details>
${htmlCases}`, NAV_HTML));
}

// =====================================================================
// 3. Defect and QA summary
// =====================================================================
{
  const sevCount: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const d of defects) sevCount[d.severity]++;
  const cSev = chart('defects-by-severity', donut('Defects by severity', SEVERITY_KEYS.map((k) => ({ key: k, value: sevCount[k.key] })), { value: String(defects.length), label: 'defects' }));
  const areaRows = [...new Set(defects.map((d) => d.area))].map((area) => {
    const v: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    for (const d of defects.filter((x) => x.area === area)) v[d.severity]++;
    return { label: area, values: v };
  });
  const cArea = chart('defects-by-area', stackedBars('Defects by area and severity', areaRows.length ? areaRows : [{ label: 'None', values: {} }], SEVERITY_KEYS));

  // Quality gates
  const a11yRun = runs.find((r) => r.id === 'NF-05');
  const perfRuns = runs.filter((r) => ['NF-01', 'NF-02', 'NF-03'].includes(r.id));
  const secRuns = runs.filter((r) => r.tags.includes('@security'));
  const p1Runs = runs.filter((r) => r.priority === 'P1' && norm(r.status) !== 'skipped');
  const openHigh = defects.filter((d) => (d.severity === 'Critical' || d.severity === 'High') && d.status !== 'Closed').length;
  const gates = [
    { gate: 'Overall pass rate ≥ 95%', actual: `${passRate}%`, ok: passRate >= 95 },
    { gate: 'All P1 (high-priority) tests pass', actual: `${p1Runs.filter((r) => ['passed', 'flaky'].includes(norm(r.status))).length}/${p1Runs.length} verified passing`, ok: p1Runs.every((r) => ['passed', 'flaky'].includes(norm(r.status))) },
    { gate: 'All planned tests executed (none blocked)', actual: `${t.blocked} blocked`, ok: t.blocked === 0 },
    { gate: 'No open Critical or High defects', actual: `${openHigh} open`, ok: openHigh === 0 },
    { gate: 'No serious/critical accessibility violations', actual: a11yRun ? STATUS_LABEL[norm(a11yRun.status)] : 'not run', ok: !!a11yRun && !isFail(a11yRun.status) },
    { gate: 'Performance budgets met', actual: `${perfRuns.filter((r) => !isFail(r.status)).length}/${perfRuns.length} pages`, ok: perfRuns.length > 0 && perfRuns.every((r) => !isFail(r.status)) },
    { gate: 'Security checks pass', actual: `${secRuns.filter((r) => !isFail(r.status)).length}/${secRuns.length}`, ok: secRuns.every((r) => !isFail(r.status)) },
    { gate: 'No flaky tests', actual: `${t.flaky}`, ok: t.flaky === 0 },
  ];
  const gatesPassed = gates.filter((g) => g.ok).length;
  const verdict = openHigh > 0 || p1Runs.some((r) => isFail(r.status)) ? 'Not ready for release' : t.blocked > 0 ? 'Not yet verified' : gatesPassed === gates.length ? 'Ready for release' : 'Release with known issues';
  const verdictClass = verdict.startsWith('Not ready') ? 'failed' : verdict.startsWith('Not yet') ? 'blocked' : verdict.startsWith('Ready') ? 'passed' : 'flaky';
  const cGates = chart('quality-gates', donut('Quality gates', [
    { key: { key: 'met', label: 'Met', color: 'var(--good)' }, value: gatesPassed },
    { key: { key: 'failed', label: 'Not met', color: 'var(--critical)' }, value: gates.length - gatesPassed },
  ], { value: `${gatesPassed}/${gates.length}`, label: 'gates met' }));

  const defectEvidence = (d: Defect) =>
    d.evidence.map((e) => {
      let file = e.file;
      if (!file && e.fromTest) {
        const run = runs.find((r) => `${r.id}@${r.pack}` === e.fromTest || r.id === e.fromTest);
        file = evidence(run?.screenshots[0], `${d.id}-${e.fromTest}`);
      } else if (file && fs.existsSync(path.join(ROOT, file))) {
        const dest = `evidence/${path.basename(file)}`;
        fs.copyFileSync(path.join(ROOT, file), path.join(OUT, dest));
        file = dest;
      } else if (file) {
        console.warn(`Evidence file not found for ${d.id}: ${file} (skipped)`);
        file = undefined;
      }
      return { ...e, file };
    })
    .filter((e) => e.file || e.text);

  const sevBadgeMd = (s: string) => ({ Critical: '🔴 Critical', High: '🟠 High', Medium: '🟡 Medium', Low: '⚪ Low' })[s] ?? s;

  let md = `# 3. Defect and QA Summary

${NAV_MD}

**Store:** ${env.store} · **Run:** ${runDate} · **Defects raised:** ${defects.length} · **Quality gates met:** ${gatesPassed}/${gates.length}

## QA verdict: ${verdict}

${cGates.md}

| Quality gate | Actual | Status |
|---|---|---|
${gates.map((g) => `| ${g.gate} | ${g.actual} | ${g.ok ? '✅ Met' : '❌ Not met'} |`).join('\n')}

## Defects at a glance

${cSev.md}

${cArea.md}

| ID | Title | Severity | Priority | Area | Found by | Status |
|---|---|---|---|---|---|---|
${defects.map((d) => `| [${d.id}](#${d.id.toLowerCase()}) | ${mdEsc(d.title)} | ${sevBadgeMd(d.severity)} | ${d.priority} | ${d.area} | ${d.foundBy.join(', ')} | ${d.status} |`).join('\n') || '| - | No defects raised | | | | | |'}

Severity scale: **Critical** blocks purchasing or exposes data · **High** breaks a key journey or affects many users · **Medium** degrades a feature, workaround exists · **Low** cosmetic, SEO or minor.
`;
  let htmlDefects = '';
  for (const d of defects) {
    const ev = defectEvidence(d);
    md += `
---

### ${d.id}

## ${d.title}

| Field | Value |
|---|---|
| Defect ID | ${d.id} |
| Severity | ${sevBadgeMd(d.severity)} |
| Priority | ${d.priority} |
| Status | ${d.status} |
| Type | ${d.type} |
| Area | ${d.area} |
| Found by | ${d.foundBy.map((x) => `\`${x}\``).join(', ')} |
| Environment | ${mdEsc(d.environment)} |
| Reported | ${runDate} |
${d.preconditions ? `\n**Preconditions:** ${d.preconditions}\n` : ''}
**Steps to reproduce**
${d.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Expected result:** ${d.expected}

**Actual result:** ${d.actual}

**Evidence**
${ev.map((e) => (e.file ? `\n<img src="${e.file}" alt="${esc(e.caption)}" width="480">\n\n*${e.caption}*\n` : e.text ? `\n*${e.caption}*\n\n\`\`\`\n${e.text}\n\`\`\`\n` : `- ${e.caption}`)).join('\n')}

**Impact:** ${d.impact}

**Root cause analysis:** ${d.rootCause}

**Recommendation:** ${d.recommendation}

**Acceptance criteria for closure**
${d.acceptanceCriteria.map((a) => `- [ ] ${a}`).join('\n')}
${d.references?.length ? `\n**References:** ${d.references.join(' · ')}\n` : ''}`;
    htmlDefects += `<div class="card" id="${d.id.toLowerCase()}">
<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3 style="margin:0">${esc(d.id)}: ${esc(d.title)}</h3><span class="badge sev-${d.severity}">${d.severity}</span><span class="badge skipped">${esc(d.status)}</span></div>
<table><tbody><tr><th>Priority</th><td>${esc(d.priority)}</td><th>Type</th><td>${esc(d.type)}</td></tr><tr><th>Area</th><td>${esc(d.area)}</td><th>Found by</th><td>${esc(d.foundBy.join(', '))}</td></tr><tr><th>Environment</th><td colspan="3">${esc(d.environment)}</td></tr></tbody></table>
${d.preconditions ? `<p><b>Preconditions:</b> ${esc(d.preconditions)}</p>` : ''}
<div class="grid2"><div><b>Steps to reproduce</b><ol>${d.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div><div><p><b>Expected:</b> ${esc(d.expected)}</p><p><b>Actual:</b> ${esc(d.actual)}</p></div></div>
<b>Evidence</b><div class="shots">${ev.map((e) => (e.file ? `<figure><a href="${e.file}"><img loading="lazy" src="${e.file}" alt="${esc(e.caption)}"></a><figcaption>${esc(e.caption)}</figcaption></figure>` : '')).join('')}</div>
${ev.filter((e) => !e.file && e.text).map((e) => `<p class="muted">${esc(e.caption)}</p><pre>${esc(e.text!)}</pre>`).join('')}
<p><b>Impact:</b> ${esc(d.impact)}</p><p><b>Root cause analysis:</b> ${esc(d.rootCause)}</p><p><b>Recommendation:</b> ${esc(d.recommendation)}</p>
<b>Acceptance criteria for closure</b><ul>${d.acceptanceCriteria.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
${d.references?.length ? `<p class="muted">References: ${d.references.map(esc).join(' · ')}</p>` : ''}
</div>`;
  }

  const obs = notes.observations ?? [];
  const recs = notes.recommendations ?? [];
  md += `
---

## Observations (not defects)

${obs.map((o) => `- **${o.title}.** ${o.detail}`).join('\n') || '- None.'}

## Recommendations

${recs.map((r, i) => `${i + 1}. ${r}`).join('\n') || '- None.'}
${notes.scope ? `\n## Scope\n\n**In scope:** ${notes.scope.in.join('; ')}.\n\n**Out of scope:** ${notes.scope.out.join('; ')}.\n` : ''}`;
  fs.writeFileSync(path.join(OUT, '3-defect-and-qa-summary.md'), md);

  fs.writeFileSync(path.join(OUT, '3-defect-and-qa-summary.html'), page('3. Defect and QA Summary', SUBTITLE, `
<div class="card"><h2 style="border:0;margin:0 0 6px;padding:0">QA verdict: <span class="${verdictClass}">${esc(verdict)}</span></h2>
<div class="grid2"><div>${cGates.html}</div><div><table><thead><tr><th>Quality gate</th><th>Actual</th><th>Status</th></tr></thead><tbody>${gates.map((g) => `<tr><td>${esc(g.gate)}</td><td>${esc(g.actual)}</td><td><span class="badge ${g.ok ? 'passed' : 'failed'}">${g.ok ? 'Met' : 'Not met'}</span></td></tr>`).join('')}</tbody></table></div></div></div>
<div class="kpis"><div class="kpi"><b>${defects.length}</b><span>Defects raised</span></div>${SEVERITY_KEYS.map((k) => `<div class="kpi"><b class="sev-${k.key}">${sevCount[k.key]}</b><span>${k.label}</span></div>`).join('')}</div>
<div class="grid2"><div class="card">${cSev.html}</div><div class="card"><table><thead><tr><th>Severity</th><th>Count</th><th>Meaning</th></tr></thead><tbody>
<tr><td><span class="badge sev-Critical">Critical</span></td><td class="num">${sevCount.Critical}</td><td class="muted">Blocks purchasing or exposes customer data</td></tr>
<tr><td><span class="badge sev-High">High</span></td><td class="num">${sevCount.High}</td><td class="muted">Breaks a key journey or affects many users</td></tr>
<tr><td><span class="badge sev-Medium">Medium</span></td><td class="num">${sevCount.Medium}</td><td class="muted">Degrades a feature; workaround exists</td></tr>
<tr><td><span class="badge sev-Low">Low</span></td><td class="num">${sevCount.Low}</td><td class="muted">Cosmetic, SEO or minor hardening</td></tr></tbody></table></div></div><div class="card">${cArea.html}</div>
<table><thead><tr><th>ID</th><th>Title</th><th>Severity</th><th>Priority</th><th>Area</th><th>Found by</th><th>Status</th></tr></thead><tbody>
${defects.map((d) => `<tr><td><a href="#${d.id.toLowerCase()}">${esc(d.id)}</a></td><td>${esc(d.title)}</td><td><span class="badge sev-${d.severity}">${d.severity}</span></td><td>${esc(d.priority)}</td><td>${esc(d.area)}</td><td class="muted">${esc(d.foundBy.join(', '))}</td><td>${esc(d.status)}</td></tr>`).join('') || '<tr><td colspan="7">No defects raised</td></tr>'}
</tbody></table>
<p class="muted">Severity: Critical blocks purchasing or exposes data · High breaks a key journey or affects many users · Medium degrades a feature, workaround exists · Low cosmetic, SEO or minor.</p>
<h2>Defect details</h2>${htmlDefects || '<p>No defects raised.</p>'}
<h2>Observations (not defects)</h2><ul>${obs.map((o) => `<li><b>${esc(o.title)}.</b> ${esc(o.detail)}</li>`).join('') || '<li>None.</li>'}</ul>
<h2>Recommendations</h2><ol>${recs.map((r) => `<li>${esc(r)}</li>`).join('') || '<li>None.</li>'}</ol>
${notes.scope ? `<h2>Scope</h2><p><b>In scope:</b> ${esc(notes.scope.in.join('; '))}.</p><p><b>Out of scope:</b> ${esc(notes.scope.out.join('; '))}.</p>` : ''}
`, NAV_HTML));

  // ---------- index ----------
  const indexMd = `# QA Reports: ${env.store}

Generated from the automated test run on **${runDate}**.

| Report | Contents | Markdown | HTML |
|---|---|---|---|
| 1. Automation execution report | Test execution, pass/fail statistics by pack and priority, requirement coverage | [view](1-automation-execution-report.md) | [html](1-automation-execution-report.html) |
| 2. Test scripts and scenarios | ${caseIds.length} test cases: steps, expected results, executed steps, actual results, screenshots | [view](2-test-scripts-and-scenarios.md) | [html](2-test-scripts-and-scenarios.html) |
| 3. Defect and QA summary | ${defects.length} defects with severity, evidence, root cause, recommendations; quality gates and verdict | [view](3-defect-and-qa-summary.md) | [html](3-defect-and-qa-summary.html) |

**Headline:** ${t.passed} passed, ${t.failed} failed, ${t.flaky} flaky, ${t.skipped} skipped of ${t.total} executions (${passRate}% pass rate) · ${defects.length} defects · QA verdict: **${verdict}**.

The Markdown files render on GitHub with their charts. The HTML files are richer (hover details, dark mode); open them locally or publish \`qa-reports/\` with GitHub Pages.
Rebuild after a test run with \`npm run qa-reports\`.
`;
  fs.writeFileSync(path.join(OUT, 'README.md'), indexMd);
  fs.writeFileSync(path.join(OUT, 'index.html'), page(`QA Reports`, SUBTITLE, `
<div class="kpis"><div class="kpi"><b>${t.total}</b><span>Executions</span></div><div class="kpi"><b class="passed">${t.passed}</b><span>Passed</span></div><div class="kpi"><b class="failed">${t.failed}</b><span>Failed</span></div><div class="kpi"><b>${passRate}%</b><span>Pass rate</span></div><div class="kpi"><b>${defects.length}</b><span>Defects</span></div><div class="kpi"><b class="${verdictClass}" style="font-size:16px">${esc(verdict)}</b><span>QA verdict</span></div></div>
<div class="card"><h3><a href="1-automation-execution-report.html">1. Automation execution report</a></h3><p>Execution, pass/fail statistics by pack and priority, requirement coverage.</p></div>
<div class="card"><h3><a href="2-test-scripts-and-scenarios.html">2. Test scripts and scenarios</a></h3><p>${caseIds.length} test cases with steps, expected results, executed steps, actual results and screenshots.</p></div>
<div class="card"><h3><a href="3-defect-and-qa-summary.html">3. Defect and QA summary</a></h3><p>${defects.length} defects with severity, evidence, root cause and recommendations; quality gates and release verdict.</p></div>
`, NAV_HTML));
}

console.log(`QA reports written to ${path.relative(ROOT, OUT)}/ (${copied.size} evidence screenshots, ${fs.readdirSync(path.join(OUT, 'charts')).length} charts)`);
