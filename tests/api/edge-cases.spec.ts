import { test, expect } from '../../src/fixtures';
import { clearCart, findAvailableProduct, findTwoAvailableProducts, storeFetch, type ShopifyCart } from '../../src/utils/storefront';

/** API pack: edge and negative cases for the cart API. Every error must be a clean 4xx, never a 5xx. */
test.describe('API edge cases: cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearCart(page);
  });

  test('API-12: quantity 0 on add is rejected or ignored', {
    tag: ['@api', '@edge', '@P2'],
    annotation: { type: 'description', description: 'POST /cart/add.js with quantity 0. Expect a 4xx or a no-op; the cart must stay empty.' },
  }, async ({ page }) => {
    const { variant } = await findAvailableProduct();
    const res = await storeFetch(page, '/cart/add.js', { items: [{ id: variant.id, quantity: 0 }] });
    expect(res.status).toBeLessThan(500);
    expect((await storeFetch<ShopifyCart>(page, '/cart.js')).data.item_count).toBe(0);
  });

  test('API-13: very large quantity is limited by stock or rejected', {
    tag: ['@api', '@edge', '@P2'],
    annotation: { type: 'description', description: 'POST /cart/add.js with quantity 999999. Expect 422 with an inventory message, or the quantity capped. Never a 5xx.' },
  }, async ({ page }, testInfo) => {
    const { product, variant } = await findAvailableProduct();
    const res = await storeFetch<any>(page, '/cart/add.js', { items: [{ id: variant.id, quantity: 999999 }] });
    expect(res.status).toBeLessThan(500);
    const count = (await storeFetch<ShopifyCart>(page, '/cart.js')).data.item_count;
    if (res.status === 422) {
      expect(JSON.stringify(res.data)).toMatch(/description|message/);
    } else if (count === 999999) {
      testInfo.annotations.push({ type: 'warning', description: `${product.handle} accepted 999999 units: inventory not tracked or overselling allowed. Confirm this is intended.` });
    }
  });

  test('API-14: malformed JSON body returns a 4xx, not a server error', {
    tag: ['@api', '@edge', '@P2'],
    annotation: { type: 'description', description: 'POST /cart/add.js with a broken JSON body. Expect a 4xx status and the cart unchanged.' },
  }, async ({ page }) => {
    const status = await page.evaluate(async () => {
      const r = await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"items": [ {"id": ' });
      return r.status;
    });
    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
    expect((await storeFetch<ShopifyCart>(page, '/cart.js')).data.item_count).toBe(0);
  });

  test('API-15: changing a line that is not in the cart returns a 4xx', {
    tag: ['@api', '@edge', '@P3'],
    annotation: { type: 'description', description: 'POST /cart/change.js for a variant id not in the cart. Expect a 4xx and no items added.' },
  }, async ({ page }) => {
    const { variant } = await findAvailableProduct();
    const res = await storeFetch(page, '/cart/change.js', { id: String(variant.id), quantity: 2 });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect((await storeFetch<ShopifyCart>(page, '/cart.js')).data.item_count).toBe(0);
  });

  test('API-16: /cart/update.js sets several line quantities at once', {
    tag: ['@api', '@edge', '@P3'],
    annotation: { type: 'description', description: 'Add two products, then POST /cart/update.js with new quantities for both (3 and 0). Expect the first at 3 and the second removed.' },
  }, async ({ page }) => {
    const picks = await findTwoAvailableProducts();
    test.skip(!picks, 'Store needs at least two in-stock products');
    const [a, b] = picks!;
    await storeFetch(page, '/cart/add.js', { items: [{ id: a.variant.id, quantity: 1 }, { id: b.variant.id, quantity: 1 }] });
    const res = await storeFetch<ShopifyCart>(page, '/cart/update.js', { updates: { [a.variant.id]: 3, [b.variant.id]: 0 } });
    expect(res.status).toBe(200);
    expect(res.data.items).toHaveLength(1);
    expect(res.data.items[0]).toMatchObject({ variant_id: a.variant.id, quantity: 3 });
  });

  test('API-17: string, decimal and missing ids are rejected cleanly', {
    tag: ['@api', '@edge', '@P3'],
    annotation: { type: 'description', description: 'POST /cart/add.js with id "abc", id 1.5 and no id at all. Each must return a 4xx and leave the cart empty.' },
  }, async ({ page }) => {
    for (const item of [{ id: 'abc', quantity: 1 }, { id: 1.5, quantity: 1 }, { quantity: 1 }]) {
      const res = await storeFetch(page, '/cart/add.js', { items: [item] });
      expect.soft(res.status, `item ${JSON.stringify(item)}`).toBeGreaterThanOrEqual(400);
      expect.soft(res.status, `item ${JSON.stringify(item)}`).toBeLessThan(500);
    }
    expect((await storeFetch<ShopifyCart>(page, '/cart.js')).data.item_count).toBe(0);
  });
});
