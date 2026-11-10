import { test, expect } from '../../src/fixtures';
import { findAvailableProduct } from '../../src/utils/storefront';

/**
 * Non-functional pack: performance budgets.
 * Budgets are deliberately generous for a dev store; tighten them in BUDGET once you have a baseline.
 */
const BUDGET = { ttfbMs: 1500, domContentLoadedMs: 4000, loadMs: 8000, lcpMs: 4000, pageWeightKb: 4000 };

async function measure(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'load' });
  return page.evaluate(async () => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const lcp = await new Promise<number>((resolve) => {
      let value = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) value = e.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => resolve(value), 1500);
    });
    const bytes = performance
      .getEntriesByType('resource')
      .reduce((sum, r) => sum + ((r as PerformanceResourceTiming).transferSize || 0), nav.transferSize || 0);
    return {
      ttfbMs: Math.round(nav.responseStart - nav.requestStart),
      domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
      loadMs: Math.round(nav.loadEventEnd),
      lcpMs: Math.round(lcp),
      pageWeightKb: Math.round(bytes / 1024),
    };
  });
}

test.describe('Non-functional: performance', () => {
  const pages: [string, string, () => Promise<string>][] = [
    ['NF-01', 'home page', async () => '/'],
    ['NF-02', 'collection page', async () => '/collections/all'],
    ['NF-03', 'product page', async () => `/products/${(await findAvailableProduct()).product.handle}`],
  ];

  for (const [id, name, path] of pages) {
    test(`${id}: ${name} loads within performance budget`, {
      tag: ['@non-functional', '@performance', '@P2'],
      annotation: {
        type: 'description',
        description: `Measure TTFB (<${BUDGET.ttfbMs}ms), DOMContentLoaded (<${BUDGET.domContentLoadedMs}ms), load (<${BUDGET.loadMs}ms), LCP (<${BUDGET.lcpMs}ms) and transfer size (<${BUDGET.pageWeightKb}KB).`,
      },
    }, async ({ page }, testInfo) => {
      const m = await measure(page, await path());
      await testInfo.attach('metrics', { body: JSON.stringify({ budget: BUDGET, measured: m }, null, 2), contentType: 'application/json' });
      testInfo.annotations.push({ type: 'metrics', description: Object.entries(m).map(([k, v]) => `${k}=${v}`).join(', ') });
      for (const key of Object.keys(BUDGET) as (keyof typeof BUDGET)[]) {
        expect.soft(m[key], `${key} ${m[key]} exceeds budget ${BUDGET[key]}`).toBeLessThanOrEqual(BUDGET[key]);
      }
    });
  }

  test('NF-04: no JavaScript errors on key pages', {
    tag: ['@non-functional', '@P2', '@regression'],
    annotation: { type: 'description', description: 'Visit home, collection, product and cart pages. No uncaught JavaScript errors may occur.' },
  }, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));
    const { product } = await findAvailableProduct();
    for (const path of ['/', '/collections/all', `/products/${product.handle}`, '/cart']) {
      await page.goto(path, { waitUntil: 'load' });
    }
    expect(errors).toEqual([]);
  });
});
