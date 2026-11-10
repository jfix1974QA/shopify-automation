import { test as base, expect, type Page } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { aiExpect } from './ai/aiAssert';
import { config } from './config';

type Fixtures = {
  home: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  /** Plain-English visual check powered by Claude. */
  ai: { expect: (expectation: string, opts?: { fullPage?: boolean }) => ReturnType<typeof aiExpect> };
  /** Pause after each test to keep the request rate under Shopify's per-IP limit. */
  throttle: void;
};

/** True while Shopify's bot protection ("Just a moment..." / "Verifying your connection") is showing. */
export async function onBotChallenge(page: Page) {
  const title = await page.title().catch(() => '');
  return /just a moment|verifying your connection/i.test(title);
}

/** If a bot challenge is showing, wait for it to clear (it usually does within ~15s in a real browser). */
export async function waitOutBotChallenge(page: Page, timeoutMs = 45_000) {
  if (!(await onBotChallenge(page))) return;
  await page
    .waitForFunction(() => !/just a moment|verifying your connection/i.test(document.title), null, { timeout: timeoutMs })
    .catch(() => {
      throw new Error(`Blocked by Shopify bot protection on ${page.url()} for ${timeoutMs / 1000}s (environment issue, not a store defect). Wait 15-30 minutes and re-run.`);
    });
  await page.waitForLoadState('domcontentloaded');
}

export const test = base.extend<Fixtures>({
  // Every navigation waits out a bot challenge before the test continues.
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = (async (url: string, options?: Parameters<Page['goto']>[1]) => {
      let response = await goto(url, options);
      if (await onBotChallenge(page)) {
        await waitOutBotChallenge(page);
        // The challenge page answered the first request; reload to get the real response and status.
        response = await goto(url, options);
        await waitOutBotChallenge(page);
      }
      return response;
    }) as Page['goto'];
    await use(page);
  },
  home: async ({ page }, use) => use(new HomePage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  ai: async ({ page }, use, testInfo) => {
    await use({ expect: (expectation, opts) => aiExpect(page, expectation, { ...opts, testInfo }) });
  },
  throttle: [
    async ({}, use) => {
      await use();
      const ms = Number(process.env.THROTTLE_MS ?? (process.env.CI ? 0 : 1500));
      if (ms > 0) await new Promise((r) => setTimeout(r, ms));
    },
    { auto: true },
  ],
});

/** Skip the current test when no Claude API key is set. */
export function requireAi() {
  test.skip(!config.ai.enabled, 'Set ANTHROPIC_API_KEY to run AI tests');
}

export { expect, config };
