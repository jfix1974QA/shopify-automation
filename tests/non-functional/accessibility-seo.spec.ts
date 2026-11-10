import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures';
import { findAvailableProduct } from '../../src/utils/storefront';

async function keyPages() {
  const { product } = await findAvailableProduct();
  return ['/', '/collections/all', `/products/${product.handle}`, '/cart'];
}

test.describe('Non-functional: accessibility', () => {
  test('NF-05: no critical or serious WCAG 2.1 AA violations on key pages', {
    tag: ['@non-functional', '@a11y', '@P2'],
    annotation: { type: 'description', description: 'Run axe-core (WCAG 2.0/2.1 A + AA rules) on home, collection, product and cart pages. No critical or serious violations allowed.' },
  }, async ({ page }, testInfo) => {
    const all: Record<string, unknown[]> = {};
    for (const path of await keyPages()) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      all[path] = results.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target }));
      // Include the offending elements and axe's explanation so the report shows exactly what to fix.
      expect.soft(
        bad.map((v) =>
          `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'})` +
          v.nodes.slice(0, 3).map((n) => `\n    -> ${n.target.join(' ')} | ${n.html.slice(0, 140)} | ${(n.any[0]?.message ?? n.failureSummary ?? '').replace(/\s+/g, ' ').slice(0, 220)}`).join(''),
        ),
        path,
      ).toEqual([]);
    }
    await testInfo.attach('axe-violations', { body: JSON.stringify(all, null, 2), contentType: 'application/json' });
  });

  test('NF-06: all images have alt text', {
    tag: ['@non-functional', '@a11y', '@P3'],
    annotation: { type: 'description', description: 'Every <img> on key pages must have an alt attribute (empty alt allowed for decorative images).' },
  }, async ({ page }) => {
    for (const path of await keyPages()) {
      await page.goto(path);
      const missing = await page.locator('img:not([alt])').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src));
      expect.soft(missing, `${path}: images without alt`).toEqual([]);
    }
  });
});

test.describe('Non-functional: SEO', () => {
  test('NF-07: key pages have title, meta description, canonical and social image', {
    tag: ['@non-functional', '@seo', '@P3'],
    annotation: { type: 'description', description: 'Home, collection and product pages need a <title>, meta description (20+ chars), canonical URL and og:image.' },
  }, async ({ page }) => {
    for (const path of (await keyPages()).slice(0, 3)) {
      await page.goto(path);
      await expect.soft(page, `${path}: title`).toHaveTitle(/.{5,}/);
      await expect.soft(page.locator('meta[name="description"]'), `${path}: meta description`).toHaveAttribute('content', /.{20,}/);
      await expect.soft(page.locator('link[rel="canonical"]'), `${path}: canonical`).toHaveAttribute('href', /^https?:\/\//);
      await expect.soft(page.locator('meta[property="og:image"]').first(), `${path}: og:image`).toHaveAttribute('content', /.+/);
    }
  });

  test('NF-08: product page has Product structured data with price', {
    tag: ['@non-functional', '@seo', '@P3'],
    annotation: { type: 'description', description: 'Product page must include JSON-LD of @type Product with offers and a price, for Google rich results.' },
  }, async ({ page }) => {
    const { product } = await findAvailableProduct();
    await page.goto(`/products/${product.handle}`);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const productLd = blocks.map((b) => { try { return JSON.parse(b); } catch { return null; } }).find((j) => j?.['@type'] === 'Product');
    expect(productLd, 'No Product JSON-LD').toBeTruthy();
    expect(JSON.stringify(productLd.offers ?? '')).toMatch(/"price"/);
  });
});

test.describe('Non-functional: security', () => {
  test('NF-09: HTTP redirects to HTTPS', {
    tag: ['@non-functional', '@edge', '@security', '@P1'],
    annotation: { type: 'description', description: 'Requesting the store over http:// must end on an https:// URL.' },
  }, async ({ page, baseURL }) => {
    await page.goto(baseURL!.replace('https://', 'http://') + '/');
    expect(page.url()).toMatch(/^https:\/\//);
  });

  test('NF-10: security headers are present', {
    tag: ['@non-functional', '@security', '@P2'],
    annotation: { type: 'description', description: 'Home page response must send HSTS, X-Content-Type-Options: nosniff, and clickjacking protection (CSP frame-ancestors or X-Frame-Options).' },
  }, async ({ page }, testInfo) => {
    const res = await page.goto('/');
    const h = res!.headers();
    await testInfo.attach('response-headers', { body: JSON.stringify(h, null, 2), contentType: 'application/json' });
    expect.soft(h['strict-transport-security'], 'Strict-Transport-Security').toBeTruthy();
    expect.soft(h['x-content-type-options'], 'X-Content-Type-Options').toBe('nosniff');
    const clickjack = (h['content-security-policy'] ?? '').includes('frame-ancestors') || !!h['x-frame-options'];
    expect.soft(clickjack, 'CSP frame-ancestors or X-Frame-Options').toBe(true);
  });

  test('NF-11: session and cart cookies are Secure and HttpOnly where applicable', {
    tag: ['@non-functional', '@security', '@P2'],
    annotation: { type: 'description', description: 'After adding to cart, cookies that identify the session or cart (cart, _shopify_essential, _shopify_s, _secure_session_id, storefront_digest) must have the Secure flag. Preference cookies (e.g. localization, cart_currency) are reported but not failed.' },
  }, async ({ page, context }, testInfo) => {
    await page.goto('/');
    await page.evaluate(async () => {
      const p = await (await fetch('/products.json?limit=5')).json().catch(() => null);
      const v = p?.products?.flatMap((x: any) => x.variants).find((x: any) => x.available);
      if (v) await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: v.id, quantity: 1 }] }) });
    });
    const all = await context.cookies();
    await testInfo.attach('cookies', { body: JSON.stringify(all.map(({ name, secure, httpOnly, sameSite, domain }) => ({ name, secure, httpOnly, sameSite, domain })), null, 2), contentType: 'application/json' });
    const sensitive = all.filter((c) => /^(cart$|cart_sig|_shopify_essential|_shopify_s$|_secure_session_id|storefront_digest|secure_customer_sig)/.test(c.name));
    expect(sensitive.length, 'expected at least one session/cart cookie').toBeGreaterThan(0);
    const insecure = sensitive.filter((c) => !c.secure).map((c) => c.name);
    expect(insecure, `Session/cart cookies without Secure flag: ${insecure.join(', ')}`).toEqual([]);
    const prefsInsecure = all.filter((c) => !sensitive.includes(c) && !c.secure).map((c) => c.name);
    if (prefsInsecure.length) testInfo.annotations.push({ type: 'observation', description: `Non-session cookies without Secure flag: ${prefsInsecure.join(', ')}` });
  });

  test('NF-12: unknown URLs return a proper 404 page', {
    tag: ['@non-functional', '@edge', '@P3'],
    annotation: { type: 'description', description: 'A non-existent product URL must return HTTP 404 with a friendly page, not a server error.' },
  }, async ({ page }) => {
    const res = await page.goto('/products/this-product-should-not-exist-12345');
    expect(res?.status()).toBe(404);
    await expect(page.locator('main').getByText(/not found|404/i).first()).toBeVisible();
  });
});
