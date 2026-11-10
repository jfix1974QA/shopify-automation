import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

/**
 * Custom reporter. Alongside Playwright's own HTML report (reports/html) it writes:
 *   reports/summary.html   one-page summary by test pack: pass/fail, timings, screenshots, traces
 *   reports/summary.json   the same data, machine readable (used by CI)
 *   reports/bugs/*.md      a bug report draft for every failed test, with steps, expected/actual and evidence
 *   reports/bugs/bugs.json bug drafts for CI to file as GitHub issues
 */

type Row = {
  id: string;
  title: string;
  pack: string;
  file: string;
  tags: string[];
  priority: string;
  description: string;
  status: TestResult['status'] | 'flaky';
  durationMs: number;
  retries: number;
  error?: string;
  steps: string[];
  /** What the test actually did: browser actions and assertions, in order, with outcome. */
  actions: { kind: 'step' | 'action' | 'assert'; title: string; ms: number; ok: boolean }[];
  screenshots: string[];
  trace?: string;
  video?: string;
  metrics?: string;
  /** Warnings and observations the test recorded (not failures). */
  notes: string[];
};

const SEVERITY: Record<string, string> = { P1: 'High', P2: 'Medium', P3: 'Low' };

export default class SummaryReporter implements Reporter {
  private rows = new Map<string, Row>();
  private outDir: string;
  private started = Date.now();
  private config!: FullConfig;

  constructor(options: { outputDir?: string } = {}) {
    this.outDir = path.resolve(options.outputDir ?? 'reports');
  }

  onBegin(config: FullConfig, _suite: Suite) {
    this.config = config;
    // SUMMARY_MERGE=1 re-runs some packs and merges them into the existing summary (keeps other packs' results and evidence).
    // Otherwise start each run with a clean summary folder.
    if (!this.merge) for (const sub of ['assets', 'bugs']) fs.rmSync(path.join(this.outDir, sub), { recursive: true, force: true });
    else fs.rmSync(path.join(this.outDir, 'bugs'), { recursive: true, force: true });
  }

  private merge = process.env.SUMMARY_MERGE === '1';
  private runTag = Date.now().toString(36);

  onTestEnd(test: TestCase, result: TestResult) {
    const pack = test.parent.project()?.name ?? 'default';
    const key = `${pack}::${test.id}`;
    const idMatch = test.title.match(/^([A-Z]+(?:-[A-Z]+)?-\d+):\s*(.*)$/);
    const outcome = test.outcome();
    const failed = result.status === 'failed' || result.status === 'timedOut';
    // Copy evidence into reports/assets so the summary works wherever the folder is moved
    // (CI artifacts, merged shard reports). Traces and videos are copied for failures only to keep it small;
    // every test's trace is still in the full HTML report.
    const att = (name: string, copy = true) =>
      result.attachments
        .filter((a) => a.name === name && a.path && fs.existsSync(a.path))
        .map((a) => (copy ? this.copyAsset(a.path!, `${slug(test.title)}-${pack}-${result.retry}-${name}`) : this.rel(a.path!)));

    this.rows.set(key, {
      id: idMatch?.[1] ?? '',
      title: idMatch?.[2] ?? test.title,
      pack,
      file: `${path.relative(process.cwd(), test.location.file)}:${test.location.line}`,
      tags: test.tags,
      priority: test.tags.find((t) => /^@P\d$/.test(t))?.slice(1) ?? 'P3',
      description: test.annotations.find((a) => a.type === 'description')?.description ?? '',
      status: outcome === 'flaky' ? 'flaky' : result.status,
      durationMs: result.duration,
      retries: result.retry,
      error:
        result.errors.map((e) => stripAnsi(e.message ?? String(e.value ?? ''))).join('\n\n') ||
        (result.status === 'skipped' ? [...test.annotations, ...result.annotations].find((a) => a.type === 'skip')?.description : undefined) ||
        undefined,
      notes: [...test.annotations, ...result.annotations].filter((a) => a.type === 'warning' || a.type === 'observation').map((a) => a.description ?? ''),
      steps: result.steps.filter((s) => s.category === 'test.step').map((s) => s.title),
      actions: collectActions(result.steps),
      screenshots: att('screenshot').concat(att('ai-screenshot')),
      trace: failed ? att('trace')[0] : undefined,
      video: failed ? att('video')[0] : undefined,
      metrics: [...test.annotations, ...result.annotations].find((a) => a.type === 'metrics')?.description,
    });
  }

  async onEnd(result: FullResult) {
    fs.mkdirSync(path.join(this.outDir, 'bugs'), { recursive: true });
    let all = [...this.rows.values()];
    let startedAt = this.started;
    const prevFile = path.join(this.outDir, 'summary.json');
    if (this.merge && fs.existsSync(prevFile)) {
      const prev = JSON.parse(fs.readFileSync(prevFile, 'utf8'));
      const key = (r: Row) => `${r.pack}::${r.id || r.title}`;
      const rerun = new Set(all.map(key));
      const kept = prev.tests.filter((r: Row) => !rerun.has(key(r)));
      all = [...kept, ...all];
      startedAt = Date.parse(prev.env.date) - prev.env.durationMs || startedAt;
      console.log(`Merged with previous summary: kept ${kept.length} earlier results, replaced/added ${rerun.size}`);
    }
    const mergedDuration = this.merge ? all.reduce((s, r) => s + r.durationMs, 0) : Date.now() - startedAt;
    const rows = all.sort((a, b) => a.pack.localeCompare(b.pack) || a.id.localeCompare(b.id, undefined, { numeric: true }));
    const env = {
      store: String(this.config.projects[0]?.use?.baseURL ?? process.env.STORE_URL ?? ''),
      date: new Date().toISOString(),
      durationMs: mergedDuration,
      os: `${os.type()} ${os.release()}`,
      node: process.version,
      playwright: this.config.version,
      ci: process.env.GITHUB_ACTIONS
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : 'local',
      commit: process.env.GITHUB_SHA?.slice(0, 7) ?? '',
      status: result.status,
    };

    const bugs = rows.filter((r) => r.status === 'failed' || r.status === 'timedOut').map((r, i) => this.writeBugDraft(r, i + 1, env));
    fs.writeFileSync(path.join(this.outDir, 'bugs', 'bugs.json'), JSON.stringify(bugs, null, 2));
    fs.writeFileSync(path.join(this.outDir, 'summary.json'), JSON.stringify({ env, totals: totals(rows), packs: byPack(rows), tests: rows }, null, 2));
    fs.writeFileSync(path.join(this.outDir, 'summary.html'), renderHtml(rows, env, bugs));
    console.log(`\nSummary report: ${path.relative(process.cwd(), path.join(this.outDir, 'summary.html'))}` +
      `  |  Full report: npx playwright show-report reports/html  |  Bug drafts: ${bugs.length}`);
  }

  private rel(p: string) {
    return path.relative(this.outDir, p).split(path.sep).join('/');
  }

  private assetCount = 0;
  private copyAsset(src: string, base: string) {
    const dir = path.join(this.outDir, 'assets');
    fs.mkdirSync(dir, { recursive: true });
    const name = `${this.runTag}-${String(++this.assetCount).padStart(4, '0')}-${base.slice(0, 80)}${path.extname(src)}`;
    fs.copyFileSync(src, path.join(dir, name));
    return `assets/${name}`;
  }

  private writeBugDraft(r: Row, n: number, env: Record<string, string | number>) {
    const id = `AUTO-${String(n).padStart(3, '0')}`;
    const title = `[${r.pack}] ${r.id ? r.id + ': ' : ''}${r.title}`;
    const body = `# ${id}: ${title}

> Draft raised automatically from a failed test. Triage it: confirm it is a product defect, not a test or environment issue.

| Field | Value |
|---|---|
| Severity | ${SEVERITY[r.priority] ?? 'Low'} (${r.priority}) |
| Test pack | ${r.pack} |
| Test case | ${r.id || '-'} ${r.title} |
| Spec | \`${r.file}\` |
| Store | ${env.store} |
| Browser / project | ${r.pack} |
| Run | ${env.date} (${env.ci}${env.commit ? `, commit ${env.commit}` : ''}) |

## What the test checks
${r.description || r.title}
${r.steps.length ? `\n## Steps\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n` : ''}
## Expected vs actual
\`\`\`
${(r.error ?? 'No error message').slice(0, 4000)}
\`\`\`

## Evidence
${r.screenshots.map((s) => `- Screenshot: \`reports/${s}\``).join('\n') || '- No screenshot'}
${r.trace ? `- Trace: \`reports/${r.trace}\` (open with \`npx playwright show-trace reports/${r.trace}\`)` : ''}
${r.video ? `- Video: \`reports/${r.video}\`` : ''}

## Reproduce
\`\`\`bash
npx playwright test ${r.file.split(':')[0].replace(/\\/g, '/')} --project=${r.pack} -g "${(r.id || r.title).replace(/"/g, '\\"')}"
\`\`\`
`;
    const file = `${id}-${slug(r.id || r.title)}.md`;
    fs.writeFileSync(path.join(this.outDir, 'bugs', file), body);
    return { id, title, severity: SEVERITY[r.priority] ?? 'Low', pack: r.pack, testId: r.id, file: `reports/bugs/${file}`, body };
  }
}

/** Flatten the step tree into the user-visible actions and assertions (skips hooks and fixtures). */
function collectActions(steps: TestResult['steps'], out: Row['actions'] = []): Row['actions'] {
  for (const s of steps) {
    if (out.length >= 60) break;
    const kind = s.category === 'test.step' ? 'step' : s.category === 'expect' ? 'assert' : s.category === 'pw:api' ? 'action' : null;
    if (kind) {
      // Skip noisy internals: waits for locators inside page objects, screenshots, evaluate calls.
      const noisy = kind === 'action' && /^(Wait for|Screenshot|Evaluate|Get attribute|Query count|Is visible|Expose)/i.test(s.title);
      const where = s.location ? ` (${path.basename(s.location.file)}:${s.location.line})` : '';
      if (!noisy) out.push({ kind, title: s.title.replace(/\s+/g, ' ').slice(0, 160) + where, ms: s.duration, ok: !s.error });
    }
    // Recurse into test.step children; pw:api/expect children are internal.
    if (s.category === 'test.step') collectActions(s.steps, out);
  }
  return out;
}

function totals(rows: Row[]) {
  const t = { total: rows.length, passed: 0, failed: 0, skipped: 0, flaky: 0, durationMs: 0 };
  for (const r of rows) {
    t.durationMs += r.durationMs;
    if (r.status === 'passed') t.passed++;
    else if (r.status === 'skipped') t.skipped++;
    else if (r.status === 'flaky') t.flaky++;
    else t.failed++;
  }
  return t;
}

function byPack(rows: Row[]) {
  const packs: Record<string, ReturnType<typeof totals>> = {};
  for (const name of [...new Set(rows.map((r) => r.pack))]) packs[name] = totals(rows.filter((r) => r.pack === name));
  return packs;
}

const stripAnsi = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, '');
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const secs = (ms: number) => (ms >= 60000 ? `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s` : `${(ms / 1000).toFixed(1)}s`);

function renderHtml(rows: Row[], env: Record<string, string | number>, bugs: { id: string; title: string; severity: string; file: string }[]) {
  const t = totals(rows);
  const packs = byPack(rows);
  const passRate = t.total - t.skipped ? Math.round(((t.passed + t.flaky) / (t.total - t.skipped)) * 100) : 0;
  const statusClass = (s: string) => (s === 'passed' ? 'pass' : s === 'skipped' ? 'skip' : s === 'flaky' ? 'flaky' : 'fail');

  const packRows = Object.entries(packs)
    .map(([name, p]) => {
      const run = p.total - p.skipped;
      const pct = run ? Math.round(((p.passed + p.flaky) / run) * 100) : 0;
      return `<tr><td><a href="#pack-${name}">${name}</a></td><td>${p.total}</td><td class="pass">${p.passed}</td><td class="fail">${p.failed}</td><td class="flaky">${p.flaky}</td><td class="skip">${p.skipped}</td><td>${secs(p.durationMs)}</td>
      <td><div class="bar"><span style="width:${pct}%"></span></div> ${run ? pct + '%' : '–'}</td></tr>`;
    })
    .join('');

  const testSections = Object.keys(packs)
    .map((pack) => {
      const items = rows
        .filter((r) => r.pack === pack)
        .map((r) => {
          const shots = r.screenshots
            .map((s) => `<a href="${esc(s)}" target="_blank"><img loading="lazy" src="${esc(s)}" alt="screenshot"></a>`)
            .join('');
          const links = [
            r.trace ? `<a href="${esc(r.trace)}">trace.zip</a> <code>npx playwright show-trace reports/${esc(r.trace)}</code>` : '',
            r.video ? `<a href="${esc(r.video)}" target="_blank">video</a>` : '',
          ].filter(Boolean).join(' · ');
          return `<details class="t ${statusClass(r.status)}" ${r.status === 'failed' || r.status === 'timedOut' ? 'open' : ''}>
  <summary><span class="dot"></span><b>${esc(r.id)}</b> ${esc(r.title)} <span class="meta">${r.priority} · ${secs(r.durationMs)}${r.retries ? ` · retry ${r.retries}` : ''}</span><span class="badge ${statusClass(r.status)}">${r.status}</span></summary>
  <div class="body">
    ${r.description ? `<p>${esc(r.description)}</p>` : ''}
    ${r.metrics ? `<p class="metrics">Measured: ${esc(r.metrics)}</p>` : ''}
    ${r.steps.length ? `<ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
    ${r.error ? `<pre>${esc(r.error.slice(0, 3000))}</pre>` : ''}
    ${shots ? `<div class="shots">${shots}</div>` : ''}
    ${links ? `<p class="links">${links}</p>` : ''}
    <p class="file">${esc(r.file)} · ${r.tags.map(esc).join(' ')}</p>
  </div>
</details>`;
        })
        .join('');
      return `<h3 id="pack-${pack}">${pack}</h3>${items}`;
    })
    .join('');

  const bugList = bugs.length
    ? `<ul>${bugs.map((b) => `<li><span class="sev ${b.severity}">${b.severity}</span> <a href="${esc(b.file.replace(/^reports\//, ''))}">${b.id}</a> ${esc(b.title)}</li>`).join('')}</ul>`
    : '<p>No failures, no bug drafts.</p>';

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Storefront Test Report</title>
<style>
:root{--bg:#f7f7f8;--card:#fff;--ink:#1b1b1f;--muted:#6b6b76;--line:#e4e4e9;--pass:#1a7f4b;--fail:#c62828;--skip:#8a8a94;--flaky:#b26a00}
@media (prefers-color-scheme:dark){:root{--bg:#141417;--card:#1e1e23;--ink:#ececf1;--muted:#a0a0ab;--line:#2e2e35;--pass:#4cc38a;--fail:#ff6b6b;--skip:#8a8a94;--flaky:#f0a640}}
*{box-sizing:border-box}body{margin:0;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bg);color:var(--ink)}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}h1{margin:0 0 4px;font-size:24px}h2{margin:32px 0 12px;font-size:18px}h3{margin:24px 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.sub{color:var(--muted)}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin:20px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}.kpi b{display:block;font-size:26px}.kpi span{color:var(--muted);font-size:12px}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}th,td{padding:8px 10px;text-align:left;border-bottom:1px solid var(--line)}th{font-size:12px;color:var(--muted);font-weight:600}
.pass{color:var(--pass)}.fail{color:var(--fail)}.skip{color:var(--skip)}.flaky{color:var(--flaky)}
.bar{display:inline-block;width:90px;height:8px;background:var(--line);border-radius:4px;vertical-align:middle;overflow:hidden}.bar span{display:block;height:100%;background:var(--pass)}
details.t{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--skip);border-radius:8px;margin:6px 0}details.t.pass{border-left-color:var(--pass)}details.t.fail{border-left-color:var(--fail)}details.t.flaky{border-left-color:var(--flaky)}
summary{cursor:pointer;padding:10px 12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.meta{color:var(--muted);font-size:12px}.badge{margin-left:auto;font-size:11px;font-weight:600;text-transform:uppercase;padding:2px 8px;border-radius:10px;border:1px solid currentColor}
.body{padding:0 14px 12px}pre{white-space:pre-wrap;word-break:break-word;background:var(--bg);border:1px solid var(--line);padding:10px;border-radius:6px;font-size:12px;max-height:320px;overflow:auto}
.shots{display:flex;gap:8px;flex-wrap:wrap}.shots img{width:220px;max-width:100%;border:1px solid var(--line);border-radius:6px}
.file,.links,.metrics{color:var(--muted);font-size:12px;word-break:break-all}code{font-size:11px}
.sev{font-size:11px;font-weight:600;padding:1px 6px;border-radius:4px;border:1px solid}.sev.High{color:var(--fail)}.sev.Medium{color:var(--flaky)}.sev.Low{color:var(--skip)}
.env{font-size:12px;color:var(--muted)}a{color:inherit}
</style></head><body><main>
<h1>Storefront Test Report</h1>
<div class="sub">${esc(String(env.store))} · ${esc(String(env.date).replace('T', ' ').slice(0, 19))} UTC · run time ${secs(Number(env.durationMs))}</div>
<div class="kpis">
  <div class="kpi"><b>${t.total}</b><span>Tests</span></div>
  <div class="kpi"><b class="pass">${t.passed}</b><span>Passed</span></div>
  <div class="kpi"><b class="fail">${t.failed}</b><span>Failed</span></div>
  <div class="kpi"><b class="flaky">${t.flaky}</b><span>Flaky</span></div>
  <div class="kpi"><b class="skip">${t.skipped}</b><span>Skipped</span></div>
  <div class="kpi"><b>${passRate}%</b><span>Pass rate (excl. skipped)</span></div>
</div>
<h2>Results by test pack</h2>
<table><thead><tr><th>Pack</th><th>Total</th><th>Passed</th><th>Failed</th><th>Flaky</th><th>Skipped</th><th>Time</th><th>Pass rate</th></tr></thead><tbody>${packRows}</tbody></table>
<h2>Bug drafts (${bugs.length})</h2>${bugList}
<h2>Test cases</h2>
<p class="sub">Every test has a screenshot and a Playwright trace. For the interactive report: <code>npx playwright show-report reports/html</code></p>
${testSections}
<h2>Environment</h2>
<p class="env">OS ${esc(String(env.os))} · Node ${esc(String(env.node))} · Playwright ${esc(String(env.playwright))} · Run: ${esc(String(env.ci))}${env.commit ? ' · commit ' + esc(String(env.commit)) : ''}</p>
</main></body></html>`;
}
