import { test, expect, config } from '../../src/fixtures';
import { findAvailableProduct, getCart } from '../../src/utils/storefront';

/** Non-functional pack: edge cases for access control and poor network conditions. */

test.describe('Non-functional edge cases: access', () => {
  // A fresh browser session that has NOT entered the storefront password.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('NF-13: without the storefront password, pages redirect to the password page', {
    tag: ['@non-functional', '@edge', '@security', '@P1'],
    annotation: { type: 'description', description: 'In a new session with no password cookie, open home, a product and the cart. Each must redirect to /password and show the password form, not store content.' },
  }, async ({ page }) => {
    test.skip(!config.storePassword, 'Store is not password protected');
    const { product } = await findAvailableProduct();
    for (const path of ['/', `/products/${product.handle}`, '/cart']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect.soft(page, `${path} should redirect to /password`).toHaveURL(/\/password/);
      await expect.soft(page.locator('input[name="password"]'), `${path} password form`).toBeVisible({ timeout: 30_000 });
    }
  });
});

test.describe('Non-functional edge cases: network', () => {
  test('NF-14: product page is usable on a slow 3G connection', {
    tag: ['@non-functional', '@edge', '@performance', '@P2'],
    annotation: { type: 'description', description: 'Throttle to slow 3G (400 ms latency, ~400 kbps). The product page must show its title and an enabled Add to cart within 30 seconds.' },
  }, async ({ page, productPage, browserName }) => {
    test.skip(browserName !== 'chromium', 'Network throttling uses Chrome DevTools Protocol');
    test.setTimeout(90_000);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 400,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
    });
    const { product, variant } = await findAvailableProduct();
    const started = Date.now();
    await page.goto(`/products/${product.handle}?variant=${variant.id}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await expect(page.locator('main h1, .product__title').first()).toBeVisible({ timeout: 30_000 });
    await expect(await productPage.addToCartButton()).toBeEnabled({ timeout: 30_000 });
    test.info().annotations.push({ type: 'metrics', description: `usable after ${Date.now() - started}ms on slow 3G` });
  });

  test('NF-15: going offline during Add to cart fails cleanly and recovers', {
    tag: ['@non-functional', '@edge', '@P3'],
    annotation: { type: 'description', description: 'Load a product, go offline, click Add to cart. Nothing may be added and the page must not break. Back online, Add to cart must work and give exactly 1 item.' },
  }, async ({ page, context, productPage }) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    const button = await productPage.addToCartButton();

    await context.setOffline(true);
    await button.click();
    await page.waitForTimeout(2000);
    await context.setOffline(false);

    expect((await getCart(page)).item_count, 'offline click must not add anything').toBe(0);
    await expect(button).toBeVisible();
    await productPage.addToCart();
    expect((await getCart(page)).item_count).toBe(1);
  });
});
