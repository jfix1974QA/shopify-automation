import { test, expect } from '../../src/fixtures';
import {
  addToCart,
  findAvailableProduct,
  findSaleProduct,
  findTwoAvailableProducts,
  getCart,
} from '../../src/utils/storefront';

/** Functional pack: edge and negative cases around quantity, cart, search and URLs. */

test.describe('Functional edge cases: quantity', () => {
  test('FN-15: product quantity input does not allow 0 or negative values', {
    tag: ['@functional', '@edge', '@P2'],
    annotation: { type: 'description', description: 'Set the product page quantity to 0, then -1, and try to add to cart. The input must be invalid (min 1) or nothing must be added.' },
  }, async ({ page, productPage }) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    test.skip(!(await productPage.hasQuantityInput()), 'Theme has no quantity selector on the product page (theme setting); covered at API level by API-10, API-12 and API-13');
    const qty = await productPage.quantityInput();
    await expect(qty).toHaveAttribute('min', /^[1-9]/);
    for (const value of ['0', '-1']) {
      await qty.fill(value);
      const valid = await qty.evaluate((el) => (el as HTMLInputElement).checkValidity());
      expect.soft(valid, `quantity "${value}" should be invalid`).toBe(false);
      await (await productPage.addToCartButton()).click();
      await page.waitForTimeout(1500);
      expect.soft((await getCart(page)).item_count, `cart after quantity "${value}"`).toBe(0);
    }
  });

  test('FN-16: non-numeric quantity is never added as a broken line', {
    tag: ['@functional', '@edge', '@P3'],
    annotation: { type: 'description', description: 'Force the quantity field to "abc" and add to cart. The cart must contain 0 or 1 items (never NaN or an error), with no server error.' },
  }, async ({ page, productPage }) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    test.skip(!(await productPage.hasQuantityInput()), 'Theme has no quantity selector on the product page (theme setting); covered at API level by API-10, API-12 and API-13');
    const qty = await productPage.quantityInput();
    await qty.evaluate((el) => ((el as HTMLInputElement).value = 'abc'));
    const responses: number[] = [];
    page.on('response', (r) => r.url().includes('/cart/add') && responses.push(r.status()));
    await (await productPage.addToCartButton()).click();
    await page.waitForTimeout(2000);
    const cart = await getCart(page);
    expect([0, 1]).toContain(cart.item_count);
    expect(responses.every((s) => s < 500), `server errors: ${responses.join(', ')}`).toBe(true);
  });

  test('FN-17: requesting far more than is in stock is limited or rejected with a message', {
    tag: ['@functional', '@edge', '@P2'],
    annotation: { type: 'description', description: 'Set quantity to 99999 and add to cart. Either an inventory error is shown, or the cart is capped. No server error, and the store must not silently accept 99999 of a stock-tracked item.' },
  }, async ({ page, productPage }, testInfo) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    test.skip(!(await productPage.hasQuantityInput()), 'Theme has no quantity selector on the product page (theme setting); covered at API level by API-10, API-12 and API-13');
    await (await productPage.quantityInput()).fill('99999');
    const add = page.waitForResponse((r) => r.url().includes('/cart/add') && r.request().method() === 'POST');
    await (await productPage.addToCartButton()).click();
    const res = await add;
    expect(res.status()).toBeLessThan(500);
    const cart = await getCart(page);
    if (res.status() === 422) {
      await expect(page.getByText(/available|stock|only|can't add|cannot add/i).first()).toBeVisible();
    } else if (cart.item_count === 99999) {
      // Accepted in full: only valid if inventory isn't tracked or overselling is allowed for this product.
      testInfo.annotations.push({ type: 'warning', description: `${product.handle} accepted 99999 units: inventory not tracked or overselling allowed. Confirm this is intended.` });
    } else {
      expect(cart.item_count).toBeLessThan(99999);
    }
  });
});

test.describe('Functional edge cases: cart', () => {
  test('FN-18: adding the same product twice merges into one line', {
    tag: ['@functional', '@edge', '@P1', '@regression'],
    annotation: { type: 'description', description: 'Add the same variant twice from the product page. The cart must have one line with quantity 2, not two separate lines.' },
  }, async ({ page, productPage, cartPage }) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    await productPage.addToCart();
    await productPage.open(product.handle, variant.id);
    await productPage.addToCart();
    const cart = await getCart(page);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    await cartPage.open();
    await expect(cartPage.lineItems()).toHaveCount(1);
    await expect(cartPage.quantityInput(0)).toHaveValue('2');
  });

  test('FN-19: cart with two different products shows both and the correct subtotal', {
    tag: ['@functional', '@edge', '@P1'],
    annotation: { type: 'description', description: 'Add two different products. The cart page must list 2 lines and the subtotal must equal the sum of both prices.' },
  }, async ({ page, cartPage }) => {
    const picks = await findTwoAvailableProducts();
    test.skip(!picks, 'Store needs at least two in-stock products');
    await page.goto('/');
    for (const { variant } of picks!) await addToCart(page, variant.id, 1);
    await cartPage.open();
    await expect(cartPage.lineItems()).toHaveCount(2);
    const expectedCents = picks!.reduce((sum, { variant }) => sum + Math.round(Number(variant.price) * 100), 0);
    expect((await getCart(page)).total_price).toBe(expectedCents);
    const shown = (await (await cartPage.subtotal()).innerText()).replace(/[^\d.]/g, '');
    expect(shown).toContain((expectedCents / 100).toFixed(2));
  });

  test('FN-20: cart survives a page reload and opening a new tab', {
    tag: ['@functional', '@edge', '@P1'],
    annotation: { type: 'description', description: 'Add an item, reload the page, then open the cart in a new tab of the same browser session. The item must still be there both times.' },
  }, async ({ page, context }) => {
    const { variant } = await findAvailableProduct();
    await page.goto('/');
    await addToCart(page, variant.id, 1);
    await page.reload();
    expect((await getCart(page)).item_count).toBe(1);
    const tab = await context.newPage();
    await tab.goto('/cart');
    expect((await getCart(tab)).item_count).toBe(1);
    await tab.close();
  });

  test('FN-21: double-clicking Add to cart adds only one item', {
    tag: ['@functional', '@edge', '@P2'],
    annotation: { type: 'description', description: 'Double-click Add to cart quickly. The theme should block the second click while the first request is in flight, so the cart has 1 item.' },
  }, async ({ page, productPage }) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    await (await productPage.addToCartButton()).dblclick();
    await page.waitForTimeout(3000);
    expect((await getCart(page)).item_count).toBe(1);
  });

  test('FN-22: invalid discount link does not change the cart total', {
    tag: ['@functional', '@edge', '@P3'],
    annotation: { type: 'description', description: 'With an item in the cart, open /discount/NOT-A-REAL-CODE. The page must not error, and the cart total must be unchanged.' },
  }, async ({ page }) => {
    const { variant } = await findAvailableProduct();
    await page.goto('/');
    await addToCart(page, variant.id, 1);
    const before = (await getCart(page)).total_price;
    const res = await page.goto('/discount/NOT-A-REAL-CODE-98765?redirect=/cart');
    expect(res?.status()).toBeLessThan(400);
    expect((await getCart(page)).total_price).toBe(before);
  });

  test('FN-23: sale product shows original and sale price everywhere', {
    tag: ['@functional', '@edge', '@P2'],
    annotation: { type: 'description', description: 'For a variant with a compare-at price, the product page must show both the sale price and the struck-through original price, and the cart must charge the sale price.' },
  }, async ({ page, productPage }) => {
    const sale = await findSaleProduct();
    test.skip(!sale, 'No products on sale (set a compare-at price to enable this test)');
    const { product, variant } = sale!;
    await productPage.open(product.handle, variant.id);
    const info = page.locator('.product__info-container, main').first();
    const money = (n: string | null | undefined) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
    await expect(info.getByText(money(variant.price), { exact: false }).filter({ visible: true }).first()).toBeVisible();
    await expect(info.locator('s, del, .price-item--regular').filter({ hasText: money(variant.compare_at_price) }).filter({ visible: true }).first()).toBeVisible();
    await productPage.addToCart();
    expect((await getCart(page)).total_price).toBe(Math.round(Number(variant.price) * 100));
  });
});

test.describe('Functional edge cases: search input', () => {
  test('FN-24: search escapes HTML and script input (no XSS)', {
    tag: ['@functional', '@edge', '@security', '@P1'],
    annotation: { type: 'description', description: 'Search for a script/HTML payload. The page must load, show the text literally, never run the script, and never open a dialog.' },
  }, async ({ page }) => {
    const payload = `"><script>window.__xss=1</script><img src=x onerror="window.__xss=2">'&`;
    let dialog = false;
    page.on('dialog', async (d) => { dialog = true; await d.dismiss(); });
    const res = await page.goto(`/search?q=${encodeURIComponent(payload)}`);
    expect(res?.status()).toBe(200);
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
    expect(dialog).toBe(false);
    expect(await page.locator('main script:not([src])').evaluateAll((s) => s.some((x) => x.textContent?.includes('__xss')))).toBe(false);
  });

  test('FN-25: very long search query is handled without errors', {
    tag: ['@functional', '@edge', '@P3'],
    annotation: { type: 'description', description: 'Search for a 1,000-character string. Expect a normal page (status below 500) with a no-results state.' },
  }, async ({ page }) => {
    const res = await page.goto(`/search?q=${'a'.repeat(1000)}`);
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator('main')).toBeVisible();
  });

  test('FN-26: search ignores letter case and surrounding spaces', {
    tag: ['@functional', '@edge', '@P2'],
    annotation: { type: 'description', description: 'Search for a product name in UPPER CASE with leading and trailing spaces. The product must still be found.' },
  }, async ({ page }) => {
    const { product } = await findAvailableProduct();
    await page.goto(`/search?q=${encodeURIComponent(`   ${product.title.toUpperCase()}   `)}`);
    await expect(page.locator(`main a[href*="/products/${product.handle}"]`).filter({ visible: true }).first()).toBeVisible();
  });
});

test.describe('Functional edge cases: URLs', () => {
  test('FN-27: product link with an invalid variant id falls back to a buyable variant', {
    tag: ['@functional', '@edge', '@P2'],
    annotation: { type: 'description', description: 'Open /products/<handle>?variant=123 (not a real variant). The page must load (200) and Add to cart must still work.' },
  }, async ({ page, productPage }) => {
    const { product } = await findAvailableProduct();
    const res = await page.goto(`/products/${product.handle}?variant=123`);
    expect(res?.status()).toBe(200);
    await expect(await productPage.title()).toHaveText(product.title, { ignoreCase: true });
    await productPage.addToCart();
    expect((await getCart(page)).item_count).toBe(1);
  });

  test('FN-28: unknown collection returns 404', {
    tag: ['@functional', '@edge', '@P3'],
    annotation: { type: 'description', description: 'Open /collections/this-collection-does-not-exist. Expect HTTP 404.' },
  }, async ({ page }) => {
    const res = await page.goto('/collections/this-collection-does-not-exist-98765');
    expect(res?.status()).toBe(404);
  });
});
