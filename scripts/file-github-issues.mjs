/**
 * Raises GitHub issues from a test run, to QA standards:
 *
 *  1. Confirmed defects (qa/defects.json) -> one "bug" issue each, with severity, steps to reproduce,
 *     expected vs actual, evidence, impact, root cause, recommendation and closure criteria.
 *  2. New failures that are not linked to a confirmed defect -> one "needs-triage" issue each, so a person
 *     confirms whether it is a product defect, a test problem or an environment problem before it is a bug.
 *  3. Tests blocked by the environment (Shopify bot protection) are never filed.
 *
 * Skips anything that already has an open issue with the same title, so reruns do not duplicate.
 * Runs in CI with the `gh` CLI and GH_TOKEN (issues: write).
 *
 *   node scripts/file-github-issues.mjs [reports/summary.json] [qa/defects.json]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const summaryFile = process.argv[2] ?? 'reports/summary.json';
const defectsFile = process.argv[3] ?? 'qa/defects.json';
const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8' }).trim();
const repo = process.env.GITHUB_REPOSITORY ?? '';
const runUrl = process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}` : '';
// Link to the default branch: CI commits the refreshed qa-reports there before filing issues.
const ref = process.env.REPORTS_REF ?? 'main';
const blob = (p) => (repo ? `${process.env.GITHUB_SERVER_URL}/${repo}/blob/${ref}/${p}` : p);
const raw = (p) => (repo ? `https://raw.githubusercontent.com/${repo}/${ref}/${p}` : p);

const BLOCKED = /bot protection|verifying your connection|just a moment|verify you are human|connection needs to be verified|Target page, context or browser has been closed/i;

const defects = fs.existsSync(defectsFile) ? JSON.parse(fs.readFileSync(defectsFile, 'utf8')).defects ?? [] : [];
const summary = fs.existsSync(summaryFile) ? JSON.parse(fs.readFileSync(summaryFile, 'utf8')) : { tests: [] };

for (const [name, color] of [
  ['bug', 'd73a4a'], ['automated-test', '5319e7'], ['needs-triage', 'fbca04'],
  ['severity: Critical', 'b60205'], ['severity: High', 'd93f0b'], ['severity: Medium', 'fbca04'], ['severity: Low', 'c2e0c6'],
]) {
  try { gh('label', 'create', name, '--color', color); } catch {}
}
const openTitles = new Set(JSON.parse(gh('issue', 'list', '--state', 'open', '--limit', '500', '--json', 'title')).map((i) => i.title));

function file(title, body, labels) {
  if (openTitles.has(title)) return console.log(`Already open: ${title}`), false;
  const args = ['issue', 'create', '--title', title, '--body', body.slice(0, 60000)];
  for (const l of labels) args.push('--label', l);
  console.log(`Filed: ${gh(...args)}`);
  openTitles.add(title);
  return true;
}

// 1. Confirmed defects
let created = 0;
const linkedTests = new Set();
for (const d of defects) {
  d.foundBy.forEach((t) => linkedTests.add(t));
  if (d.status === 'Closed') continue;
  const evidence = (d.evidence ?? [])
    .map((e) => (e.file ? `**${e.caption}**\n\n![${e.caption}](${raw(`qa-reports/evidence/${e.file.split('/').pop()}`)})` : e.text ? `**${e.caption}**\n\n\`\`\`\n${e.text}\n\`\`\`` : e.fromTest ? `- ${e.caption} (screenshot in the QA report)` : `- ${e.caption}`))
    .join('\n\n');
  const body = `| Field | Value |
|---|---|
| Defect ID | ${d.id} |
| Severity | **${d.severity}** |
| Priority | ${d.priority} |
| Type | ${d.type} |
| Area | ${d.area} |
| Found by | ${d.foundBy.map((t) => `\`${t}\``).join(', ')} |
| Environment | ${d.environment} |
${d.preconditions ? `\n**Preconditions:** ${d.preconditions}\n` : ''}
### Steps to reproduce
${d.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### Expected result
${d.expected}

### Actual result
${d.actual}

### Evidence
${evidence}

### Impact
${d.impact}

### Root cause analysis
${d.rootCause}

### Recommendation
${d.recommendation}

### Acceptance criteria for closure
${d.acceptanceCriteria.map((a) => `- [ ] ${a}`).join('\n')}
${d.references?.length ? `\n### References\n${d.references.map((r) => `- ${r}`).join('\n')}\n` : ''}
---
Full defect report: [3. Defect and QA summary](${blob('qa-reports/3-defect-and-qa-summary.md')}#${d.id.toLowerCase()})${runUrl ? ` · Latest run: ${runUrl}` : ''}`;
  if (file(`${d.id}: ${d.title}`, body, ['bug', 'automated-test', `severity: ${d.severity}`])) created++;
}

// 2. New, unlinked failures -> needs triage
let triage = 0, blocked = 0;
for (const r of summary.tests.filter((t) => t.status === 'failed' || t.status === 'timedOut')) {
  if (BLOCKED.test(r.error ?? '')) { blocked++; continue; }
  if (linkedTests.has(r.id)) continue;
  const body = `A test failed that is not yet linked to a confirmed defect. **Triage within one working day:** confirm it is a product defect (then add it to \`qa/defects.json\` with full details), fix the test, or record it as an environment issue.

| Field | Value |
|---|---|
| Test case | ${r.id} ${r.title} |
| Pack | ${r.pack} |
| Priority | ${r.priority} |
| Script | \`${r.file}\` |

**What the test checks:** ${r.description || r.title}

**Failure:**
\`\`\`
${(r.error ?? '').slice(0, 3000)}
\`\`\`

${runUrl ? `Screenshots, trace and video: the **test-report** artifact of ${runUrl}` : ''}`;
  if (file(`[Needs triage] ${r.id}: ${r.title} (${r.pack})`, body, ['needs-triage', 'automated-test'])) triage++;
}

console.log(`Done: ${created} defect issue(s) and ${triage} triage issue(s) filed; ${blocked} environment-blocked failure(s) not filed.`);
