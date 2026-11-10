/**
 * Used by CI to merge the per-pack blob reports into one set of reports:
 *   npx playwright merge-reports --config merge.config.ts all-blobs
 */
export default {
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['./src/reporting/summary-reporter.ts', { outputDir: 'reports' }],
  ],
};
