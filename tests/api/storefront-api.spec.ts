import { test, expect } from '../../src/fixtures';
import { clearCart, findAvailableProduct, findSoldOutProduct, getProducts, storeFetch, type ShopifyCart } from '../../src/utils/storefront';

/**
 * API pack: Shopify storefront Ajax API.
 * Calls run inside the logged-in browser (storeFetch) so they pass Shopify's bot check.
 */
const API_BUDGET_MS = 2000;

test.describe('API: products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('API-01: GET /products/{handle}.js returns a valid product', {
    tag: ['@api', '@P1', '@regression'],
    annotation: { type: 'description', description: 'Fetch an in-stock product. Expect 200, JSON with id/title/handle/variants, prices in cents, and a fast response.' },
  }, async ({ page }) => {
    const { product } = await findAvailableProduct();
    const res = await storeFetch<any>(page, `/products/${product.handle}.js`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.data).toMatchObject({ id: product.id, handle: product.handle, title: product.title });
    expect(Array.isArray(res.data.variants) && res.data.variants.length).toBeTruthy();
    for (const v of res.data.variants) {
      expect.soft(Number.isInteger(v.price), `variant ${v.id} price should be integer cents`).toBe(true);
      expect.soft(typeof v.available, `variant ${v.id} available flag`).toBe('boolean');
    }
    expect.soft(res.ms, `response time ${res.ms}ms`).toBeLessThan(API_BUDGET_MS);
  });

  test('API-02: catalogue data is complete (titles, prices, images, variants)', {
    tag: ['@api', '@P2'],
    annotation: { type: 'description', description: 'Every product in the catalogue must have a title, at least one variant, at least one image, and prices above zero.' },
  }, async () => {
    const products = await getProducts();
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect.soft(p.title.trim(), `product ${p.id} title`).not.toBe('');
      expect.soft(p.variants.length, `${p.handle} variants`).toBeGreaterThan(0);
      expect.soft(p.images.length, `${p.handle} has no images`).toBeGreaterThan(0);
      for (const v of p.variants) expect.soft(Number(v.price), `${p.handle} / ${v.title} price`).toBeGreaterThan(0);
    }
  });

  test('API-03: GET unknown product returns 404', {
    tag: ['@api', '@edge', '@P2'],
    annotation: { type: 'description', description: 'Fetch /products/<nonexistent>.js. Expect HTTP 404.' },
  }, async ({ page }) => {
    const res = await storeFetch(page, '/products/this-product-should-not-exist-12345.js');
    expect(res.status).toBe(404);
  });

  test('API-04: predictive search API returns matching products', {
    tag: ['@api', '@P2'],
    annotation: { type: 'description', description: 'GET /search/suggest.json?q=<product word>. Expect 200 and the product among suggested results.' },
  }, async ({ page }) => {
    const { product } = await findAvailableProduct();
    const q = encodeURIComponent(product.title);
    const res = await storeFetch<any>(page, `/search/suggest.json?q=${q}&resources[type]=product&resources[limit]=10`);
    expect(res.status).toBe(200);
    const handles = (res.data?.resources?.results?.products ?? []).map((p: any) => p.handle);
    expect(handles).toContain(product.handle);
  });
});

test.describe('API: cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearCart(page);
  });

  test('API-05: POST /cart/add.js adds an item and totals are correct', {
    tag: ['@api', '@P1', '@regression'],
    annotation: { type: 'description', description: 'Add 2 of an in-stock variant. Expect 200, cart item_count 2, and total_price = 2 x variant price (in cents).' },
  }, async ({ page }) => {
    const { variant } = await findAvailableProduct();
    const add = await storeFetch(page, '/cart/add.js', { items: [{ id: variant.id, quantity: 2 }] });
    expect(add.status).toBe(200);
    const cart = (await storeFetch<ShopifyCart>(page, '/cart.js')).data;
    expect(cart.item_count).toBe(2);
    expect(cart.items[0].variant_id).toBe(variant.id);
    expect(cart.total_price).toBe(Math.round(Number(variant.price) * 100) * 2);
  });

  test('API-06: POST /cart/change.js updates quantity; 0 removes the line', {
    tag: ['@api', '@edge', '@P1'],
    annotation: { type: 'description', description: 'Add 1 item, change it to 3 (expect item_count 3), then to 0 (expect empty cart).' },
  }, async ({ page }) => {
    const { variant } = await findAvailableProduct();
    await storeFetch(page, '/cart/add.js', { items: [{ id: variant.id, quantity: 1 }] });
    const up = await storeFetch<ShopifyCart>(page, '/cart/change.js', { id: String(variant.id), quantity: 3 });
    expect(up.status).toBe(200);
    expect(up.data.item_count).toBe(3);
    const gone = await storeFetch<ShopifyCart>(page, '/cart/change.js', { id: String(variant.id), quantity: 0 });
    expect(gone.data.item_count).toBe(0);
  });

  test('API-07: POST /cart/clear.js empties the cart', {
    tag: ['@api', '@P2'],
    annotation: { type: 'description', description: 'Add an item, call /cart/clear.js. Expect item_count 0.' },
  }, async ({ page }) => {
    const { variant } = await findAvailableProduct();
    await storeFetch(page, '/cart/add.js', { items: [{ id: variant.id, quantity: 1 }] });
    const res = await storeFetch<ShopifyCart>(page, '/cart/clear.js', {});
    expect(res.status).toBe(200);
    expect(res.data.item_count).toBe(0);
  });

  test('API-08: adding an invalid variant is rejected with an error', {
    tag: ['@api', '@edge', '@P2'],
    annotation: { type: 'description', description: 'POST /cart/add.js with variant id 1. Expect a 4xx status with an error description, and the cart unchanged.' },
  }, async ({ page }) => {
    const res = await storeFetch<any>(page, '/cart/add.js', { items: [{ id: 1, quantity: 1 }] });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(JSON.stringify(res.data)).toMatch(/description|message/);
    expect((await storeFetch<ShopifyCart>(page, '/cart.js')).data.item_count).toBe(0);
  });

  test('API-09: adding a sold-out variant is rejected', {
    tag: ['@api', '@edge', '@P1'],
    annotation: { type: 'description', description: 'POST /cart/add.js with a sold-out variant. Expect 422 and the cart unchanged.' },
  }, async ({ page }) => {
    const product = await findSoldOutProduct();
    test.skip(!product, 'Store has no sold-out products');
    const res = await storeFetch<any>(page, '/cart/add.js', { items: [{ id: product!.variants[0].id, quantity: 1 }] });
    expect(res.status).toBe(422);
    expect((await storeFetch<ShopifyCart>(page, '/cart.js')).data.item_count).toBe(0);
  });

  test('API-10: negative quantity is rejected', {
    tag: ['@api', '@edge', '@P3'],
    annotation: { type: 'description', description: 'POST /cart/add.js with quantity -1. Expect a 4xx status and the cart unchanged.' },
  }, async ({ page }) => {
    const { variant } = await findAvailableProduct();
    const res = await storeFetch(page, '/cart/add.js', { items: [{ id: variant.id, quantity: -1 }] });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect((await storeFetch<ShopifyCart>(page, '/cart.js')).data.item_count).toBe(0);
  });

  test('API-11: GET /cart.js returns the documented shape', {
    tag: ['@api', '@P3'],
    annotation: { type: 'description', description: 'GET /cart.js. Expect token, item_count, total_price, currency and items[] fields.' },
  }, async ({ page }) => {
    const res = await storeFetch<any>(page, '/cart.js');
    expect(res.status).toBe(200);
    expect(res.data).toEqual(expect.objectContaining({
      item_count: expect.any(Number),
      total_price: expect.any(Number),
      currency: expect.stringMatching(/^[A-Z]{3}$/),
      items: expect.any(Array),
    }));
  });
});
