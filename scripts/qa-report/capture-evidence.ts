/**
 * Captures focused evidence for the defects in qa/defects.json into qa/evidence/.
 * Run after a test run (it reuses the logged-in session from global setup):
 *
 *   npx tsx scripts/qa-report/capture-evidence.ts
 *
 * Cookie values are never written, only names and attributes.
 */
import fs from 'node:fs';
import { chromium, type Page } from '@playwright/test';
import { config } from '../../src/config';

const OUT = 'qa/evidence';
fs.mkdirSync(OUT, { recursive: true });

async function settle(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !/just a moment|verifying your connection/i.test(document.title), null, { timeout: 60_000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.addStyleTag({ content: '#shopify-pc__banner, .shopify-pc__banner__dialog{display:none!important}' }).catch(() => {});
}

const browser = await chromium.launch();
const context = await browser.newContext({
  baseURL: config.storeUrl,
  storageState: '.ai-cache/storage-state.json',
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
const catalog = JSON.parse(fs.readFileSync('.ai-cache/catalog.json', 'utf8'));

// DEF-001: Sale badge close-up
await settle(page, '/collections/all');
const badge = page.locator('main .badge.color-accent-2').filter({ visible: true }).first();
if (await badge.count()) {
  const card = badge.locator('xpath=ancestor::*[contains(@class,"card-wrapper") or contains(@class,"grid__item")][1]');
  await (await card.count() ? card : badge).screenshot({ path: `${OUT}/def-001-sale-badge.png` });
  console.log('def-001-sale-badge.png');
}

// DEF-002: product with no description
await settle(page, '/products/the-collection-snowboard-liquid');
await page.screenshot({ path: `${OUT}/def-002-empty-description.png`, fullPage: false });
console.log('def-002-empty-description.png');

// DEF-003: hero and footer
await settle(page, '/');
await page.screenshot({ path: `${OUT}/def-003-hero.png` });
const footer = page.locator('footer').first();
await footer.scrollIntoViewIfNeeded();
await footer.screenshot({ path: `${OUT}/def-003-footer.png` });
console.log('def-003-hero.png, def-003-footer.png');

// DEF-004 / DEF-005: <head> tags
const product = catalog.find((p: any) => p.handle === 'the-collection-snowboard-liquid') ?? catalog[0];
const lines = [`Checked ${new Date().toISOString()} on ${config.storeUrl}`, ''];
for (const path of ['/', '/collections/all', `/products/${product.handle}`]) {
  await settle(page, path);
  const head = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null,
    ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
  }));
  lines.push(`${path}`);
  lines.push(`  <title>                     ${head.title}`);
  lines.push(`  meta[name=description]      ${head.description === null ? 'MISSING' : JSON.stringify(head.description)}`);
  lines.push(`  meta[property=og:image]     ${head.ogImage === null ? 'MISSING' : head.ogImage}`);
  lines.push(`  meta[property=og:description] ${head.ogDescription === null ? 'MISSING' : JSON.stringify(head.ogDescription)}`);
  lines.push(`  link[rel=canonical]         ${head.canonical ?? 'MISSING'}`);
  lines.push('');
}
fs.writeFileSync(`${OUT}/def-004-head.txt`, lines.join('\n'));
console.log('def-004-head.txt');

// DEF-006: cookie attributes after add to cart (values redacted)
const fresh = await browser.newContext({ baseURL: config.storeUrl, storageState: '.ai-cache/storage-state.json' });
const p2 = await fresh.newPage();
await settle(p2, '/');
const variant = catalog.flatMap((p: any) => p.variants).find((v: any) => v.available);
await p2.evaluate(async (id) => {
  await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id, quantity: 1 }] }) });
}, variant.id);
const cookies = await fresh.cookies();
const rows = cookies
  .map((c) => `${c.name.padEnd(28)} secure=${String(c.secure).padEnd(5)} httpOnly=${String(c.httpOnly).padEnd(5)} sameSite=${c.sameSite.padEnd(6)} domain=${c.domain}`)
  .sort();
fs.writeFileSync(`${OUT}/def-006-cookies.txt`, [`Cookies after adding to cart, ${new Date().toISOString()} (values redacted)`, '', ...rows, ''].join('\n'));
await p2.evaluate(() => fetch('/cart/clear.js', { method: 'POST' }));
console.log('def-006-cookies.txt');

await browser.close();
