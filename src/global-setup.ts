import { chromium, type Page } from '@playwright/test';
import fs from 'node:fs';
import { config } from './config';

export const STORAGE_STATE = '.ai-cache/storage-state.json';

/**
 * Runs once before all tests. If the store is password protected,
 * enter the storefront password and save the session for every test.
 */
export default async function globalSetup() {
  fs.mkdirSync('.ai-cache', { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: config.storeUrl });
  const page = await context.newPage();

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/password')) {
    if (!config.storePassword) {
      await browser.close();
      throw new Error(`${config.storeUrl} is password protected. Set STORE_PASSWORD in .env`);
    }
    // Shopify's bot check ("Verifying your connection") can interrupt the first
    // submit and drop us back on /password, so try a few times.
    const input = page.locator('input[name="password"]');
    let loggedIn = false;
    for (let attempt = 1; attempt <= 4 && !loggedIn; attempt++) {
      await input.waitFor({ timeout: 90_000 }); // allows time for a bot check to clear
      await input.fill(config.storePassword);
      await page.locator('form[action*="password"] button, form[action*="password"] [type="submit"]').first().click();

      // Wait for: the store (success), the form again (bot check ate the submit), or a wrong-password message.
      for (let waited = 0; waited < 90_000; waited += 1000) {
        await page.waitForTimeout(1000);
        const onPassword = new URL(page.url()).pathname.startsWith('/password');
        const challenge = /just a moment|verifying/i.test(await page.title().catch(() => ''));
        if (!onPassword && !challenge) {
          loggedIn = true;
          break;
        }
        if (await page.getByText(/password.*(incorrect|wrong|invalid)/i).isVisible().catch(() => false)) {
          await browser.close();
          throw new Error('Storefront password was rejected. Check STORE_PASSWORD in .env');
        }
        if (!challenge && (await input.isVisible().catch(() => false))) break; // retry the submit
      }
    }
    if (!loggedIn) {
      await page.screenshot({ path: '.ai-cache/login-failure.png' }).catch(() => {});
      await browser.close();
      throw new Error(
        'Could not get past the storefront password page: Shopify bot protection is rate-limiting this IP. ' +
          'Wait 15-30 minutes and retry. Screenshot: .ai-cache/login-failure.png',
      );
    }
  }

  await context.storageState({ path: STORAGE_STATE });
  try {
    const products = await loadCatalog(page);
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(products, null, 2));
    console.log(`Catalogue: ${products.length} products cached in ${CATALOG_FILE}`);
  } catch (err) {
    // If the store is rate-limiting us, fall back to a catalogue cached in the last 24 hours.
    const ageH = fs.existsSync(CATALOG_FILE) ? (Date.now() - fs.statSync(CATALOG_FILE).mtimeMs) / 3.6e6 : Infinity;
    if (ageH > 24) throw err;
    console.warn(`Could not refresh the catalogue (${(err as Error).message}); using the cached copy from ${ageH.toFixed(1)}h ago.`);
  } finally {
    await browser.close();
  }
}

export const CATALOG_FILE = '.ai-cache/catalog.json';

/**
 * Read the product catalogue once per run, from inside the logged-in browser.
 * Shopify rate-limits /products.json hard, so retry with backoff, then fall back
 * to reading product links from /collections/all and fetching each /products/<handle>.js.
 */
async function loadCatalog(page: Page) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await page.evaluate(async () => {
      const r = await fetch('/products.json?limit=250', { headers: { Accept: 'application/json' } });
      return { status: r.status, text: await r.text() };
    });
    if (res.status === 200) {
      try {
        return JSON.parse(res.text).products;
      } catch {}
    }
    await page.waitForTimeout(3000 * attempt);
  }

  console.warn('/products.json is rate-limited; reading the catalogue from /collections/all instead');
  await page.goto('/collections/all', { waitUntil: 'domcontentloaded' });
  const handles = await page.$$eval('main a[href*="/products/"]', (links) => [
    ...new Set(links.map((a) => new URL((a as HTMLAnchorElement).href).pathname.split('/products/')[1]?.split(/[/?#]/)[0]).filter(Boolean)),
  ]);
  if (handles.length === 0) throw new Error('Could not read the catalogue: no products on /collections/all');

  const products = [];
  for (const handle of handles.slice(0, 30)) {
    const p = await page.evaluate(async (h) => {
      const r = await fetch(`/products/${h}.js`);
      return r.ok ? r.json() : null;
    }, handle);
    if (!p) continue;
    // /products/<handle>.js uses prices in cents and plain image URLs; match /products.json's shape.
    products.push({
      id: p.id,
      title: p.title,
      handle: p.handle,
      body_html: p.description ?? '',
      vendor: p.vendor,
      product_type: p.type,
      variants: p.variants.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: (v.price / 100).toFixed(2),
        available: v.available,
        compare_at_price: v.compare_at_price ? (v.compare_at_price / 100).toFixed(2) : null,
      })),
      images: (p.images ?? []).map((src: string) => ({ src })),
    });
    await page.waitForTimeout(300);
  }
  return products;
}
