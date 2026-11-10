import { defineConfig, devices } from '@playwright/test';
import { config } from './src/config';

const desktop = { ...devices['Desktop Chrome'] };

/**
 * Each test pack is its own Playwright project, so reports group results by pack:
 *   npx playwright test --project=ui   (or: npm run test:ui)
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Shopify rate-limits storefronts per IP, so keep parallelism low.
  workers: Number(process.env.WORKERS ?? 2),
  // First run records visual baselines instead of failing on missing ones.
  updateSnapshots: 'missing',
  // Baselines are per OS: fonts render differently on Windows and the Linux CI runners.
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}',
  outputDir: 'reports/artifacts',
  reporter: [
    ['list'],
    // HTML_REPORT_DIR lets a partial re-run keep its own interactive report next to the main one.
    ['html', { outputFolder: process.env.HTML_REPORT_DIR ?? 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['./src/reporting/summary-reporter.ts', { outputDir: 'reports' }],
    // In CI each pack runs on its own machine; blob reports are merged into one report afterwards.
    ...(process.env.CI ? ([['blob', { outputDir: 'reports/blob' }]] as const) : []),
  ],
  globalSetup: './src/global-setup.ts',
  use: {
    baseURL: config.storeUrl,
    storageState: '.ai-cache/storage-state.json',
    // Screenshots and traces for every test, so the report shows evidence for passes too.
    screenshot: 'on',
    trace: 'on',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'ui', testDir: './tests/ui', use: desktop },
    { name: 'ui-mobile', testDir: './tests/ui', use: { ...devices['iPhone 14'] } },
    { name: 'functional', testDir: './tests/functional', use: desktop },
    { name: 'non-functional', testDir: './tests/non-functional', use: desktop },
    { name: 'api', testDir: './tests/api', use: desktop },
    { name: 'regression', testDir: './tests/regression', use: desktop },
    // Claude-drafted specs (npm run generate). Run on demand; promote into a pack after review.
    { name: 'generated', testDir: './tests/generated', use: desktop },
  ],
});
