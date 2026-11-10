/**
 * Files a GitHub issue for each bug draft in reports/bugs/bugs.json.
 * Skips a bug if an open issue with the same title already exists, so reruns don't duplicate.
 * Runs in CI (needs the `gh` CLI and GH_TOKEN with issues: write).
 *
 *   node scripts/file-github-issues.mjs [path/to/bugs.json]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const file = process.argv[2] ?? 'reports/bugs/bugs.json';
if (!fs.existsSync(file)) {
  console.log(`No bug file at ${file}; nothing to file.`);
  process.exit(0);
}
const bugs = JSON.parse(fs.readFileSync(file, 'utf8'));
if (bugs.length === 0) {
  console.log('No failed tests; no issues to file.');
  process.exit(0);
}

const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8' }).trim();
const runUrl = process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : '';

// Make sure the labels exist (ignore "already exists" errors).
for (const [name, color] of [['bug', 'd73a4a'], ['automated-test', '5319e7'], ['severity: High', 'b60205'], ['severity: Medium', 'fbca04'], ['severity: Low', 'c2e0c6']]) {
  try { gh('label', 'create', name, '--color', color); } catch {}
}

const open = JSON.parse(gh('issue', 'list', '--state', 'open', '--label', 'automated-test', '--limit', '500', '--json', 'title'));
const openTitles = new Set(open.map((i) => i.title));

let created = 0;
for (const bug of bugs) {
  const title = `[Automated] ${bug.title}`;
  if (openTitles.has(title)) {
    console.log(`Already open: ${title}`);
    continue;
  }
  const body = `${bug.body}\n\n---\n${runUrl ? `Found in CI run: ${runUrl}\n\nScreenshots, traces and videos are in the run's **test-report** artifact (\`${bug.file}\`).` : ''}`;
  const url = gh('issue', 'create', '--title', title, '--body', body.slice(0, 60000), '--label', 'bug', '--label', 'automated-test', '--label', `severity: ${bug.severity}`);
  console.log(`Filed: ${url}`);
  created++;
}
console.log(`Done: ${created} new issue(s), ${bugs.length - created} already open.`);
