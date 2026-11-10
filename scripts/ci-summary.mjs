/**
 * CI helper.
 *   node scripts/ci-summary.mjs summary   append a results table to the GitHub job summary
 *   node scripts/ci-summary.mjs check     exit 1 if any test really failed (bot-protection blocks are warnings)
 */
import fs from 'node:fs';

const s = JSON.parse(fs.readFileSync('reports/summary.json', 'utf8'));
const BLOCKED = /bot protection|verifying your connection|just a moment|verify you are human|connection needs to be verified|Target page, context or browser has been closed/i;
const isFail = (x) => x.status === 'failed' || x.status === 'timedOut';
const blocked = s.tests.filter((x) => isFail(x) && BLOCKED.test(x.error ?? ''));
const failed = s.tests.filter((x) => isFail(x) && !blocked.includes(x));
const count = (tests, pred) => tests.filter(pred).length;

if (process.argv[2] === 'summary') {
  const passed = count(s.tests, (x) => x.status === 'passed' || x.status === 'flaky');
  const skipped = count(s.tests, (x) => x.status === 'skipped');
  const lines = [
    '## Storefront test results',
    '',
    `**${passed} passed, ${failed.length} failed, ${blocked.length} blocked by bot protection, ${skipped} skipped** of ${s.tests.length}`,
    '',
    '| Pack | Passed | Failed | Blocked | Skipped |',
    '|---|---:|---:|---:|---:|',
    ...Object.keys(s.packs).map((p) => {
      const t = s.tests.filter((x) => x.pack === p);
      return `| ${p} | ${count(t, (x) => x.status === 'passed' || x.status === 'flaky')} | ${count(t, (x) => failed.includes(x))} | ${count(t, (x) => blocked.includes(x))} | ${count(t, (x) => x.status === 'skipped')} |`;
    }),
  ];
  if (failed.length) lines.push('', '### Failed', ...failed.map((x) => `- **${x.pack}** ${x.id} ${x.title}`));
  lines.push('', 'QA reports are committed to `qa-reports/`. Screenshots and traces: the **test-report** artifact.', '');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n'));
  else console.log(lines.join('\n'));
} else if (process.argv[2] === 'check') {
  if (blocked.length) console.log(`::warning::${blocked.length} test(s) were blocked by Shopify bot protection and not verified`);
  if (failed.length) {
    console.error(`${failed.length} test(s) failed:\n${failed.map((x) => `  ${x.pack} ${x.id} ${x.title}`).join('\n')}`);
    process.exit(1);
  }
  console.log('No real failures.');
} else {
  console.error('usage: node scripts/ci-summary.mjs summary|check');
  process.exit(2);
}
