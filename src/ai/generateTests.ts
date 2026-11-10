/**
 * AI test generator.
 *
 *   npm run generate -- /products/my-product
 *   npm run generate -- /collections/all "filter by price and sort by newest"
 *
 * Opens the page, captures a screenshot and its interactive elements, and asks
 * Claude to draft a Playwright spec that uses this framework's fixtures.
 * Drafts are written to tests/generated/. Review them before committing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { config } from '../config';
import { askText } from './client';
import { interactiveSnapshot } from '../utils/pageSnapshot';
import globalSetup, { STORAGE_STATE } from '../global-setup';

const FRAMEWORK_GUIDE = `
Write tests with this framework (TypeScript, @playwright/test):

import { test, expect, requireAi } from '../../src/fixtures';
import { findAvailableProduct, addToCart, clearCart, getCart, getProducts } from '../../src/utils/storefront';

Fixtures: page, request, home (HomePage), productPage (ProductPage), cartPage (CartPage), ai.
- baseURL is the store, so use relative paths: page.goto('/collections/all').
- home.open(), home.logo(), home.navLinks(), home.openSearch() (returns the search input locator)
- productPage.open(handle, variantId?), .title(), .price(), .addToCartButton(), .addToCart(), .quantityInput(), .mainImage()
- cartPage.open(), .lineItems(), .checkoutButton(), .quantityInput(row), .removeButton(row), .subtotal()
- Methods that return Promise<Locator> must be awaited: const title = await productPage.title();
- getProducts() / findAvailableProduct() read the catalogue.
- Cart helpers take the page and run inside the browser: await page.goto('/') first, then addToCart(page, variantId, qty),
  getCart(page), clearCart(page).
- ai.expect('plain English expectation') takes a screenshot and has Claude judge it. Only use it for
  visual or content checks that are hard to express as selectors, and call requireAi() first in those tests.
- Never complete a real checkout or submit payment details. Stopping at the checkout page is fine.
- Prefer role and text locators (getByRole, getByText) over CSS classes. Don't hardcode product names or
  prices; read them from the storefront helpers so tests work as the catalogue changes.
`;

async function main() {
  const [target = '/', focus = ''] = process.argv.slice(2);
  if (!config.ai.enabled) {
    console.error('Set ANTHROPIC_API_KEY in .env to use the generator.');
    process.exit(1);
  }

  if (!fs.existsSync(STORAGE_STATE)) await globalSetup();
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: config.storeUrl, storageState: STORAGE_STATE });
  const page = await context.newPage();
  await page.goto(target, { waitUntil: 'networkidle' }).catch(() => page.goto(target));

  const screenshot = (await page.screenshot({ fullPage: false })).toString('base64');
  const snapshot = await interactiveSnapshot(page);
  const pageTitle = await page.title();
  await browser.close();

  console.log(`Asking Claude to draft tests for ${config.storeUrl}${target} ...`);
  const output = await askText({
    system:
      'You are a senior SDET writing Playwright end-to-end tests for a Shopify storefront. ' +
      'Return only the contents of one TypeScript spec file, with no markdown fences or commentary. ' +
      'Write 4 to 8 focused, independent tests that cover the most valuable user journeys on this page, ' +
      'including at least one negative or edge case.',
    images: [{ base64: screenshot }],
    prompt: `${FRAMEWORK_GUIDE}

Page: ${target}  (title: "${pageTitle}")
${focus ? `Focus on: ${focus}\n` : ''}
Interactive elements on the page:
${snapshot}`,
  });

  const code = output.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/, '').trim() + '\n';
  const slug = target.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home';
  const outFile = path.join('tests', 'generated', `${slug}.spec.ts`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `// Drafted by Claude from ${target}. Review before committing.\n${code}`);
  console.log(`Wrote ${outFile}\nRun it with: npx playwright test ${outFile.replace(/\\/g, '/')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
