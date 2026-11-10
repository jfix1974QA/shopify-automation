import fs from 'node:fs';
import type { Page } from '@playwright/test';
import { CATALOG_FILE } from '../global-setup';

/**
 * Helpers for Shopify's public storefront JSON endpoints
 * (/products.json, /cart.js, /cart/add.js).
 * Tests use them to find real data so they work as the catalogue changes,
 * and to set up carts quickly without clicking through the UI.
 */

export type ShopifyVariant = {
  id: number;
  title: string;
  price: string;
  available: boolean;
  /** Original price when the variant is on sale; null or empty otherwise. */
  compare_at_price?: string | null;
};

export type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  variants: ShopifyVariant[];
  images: { src: string }[];
};

export type ShopifyCart = {
  item_count: number;
  total_price: number;
  currency: string;
  items: { id: number; variant_id: number; quantity: number; product_title: string; handle: string }[];
};

let catalog: ShopifyProduct[] | undefined;

/**
 * The product catalogue, read once per run by global setup (src/global-setup.ts)
 * and cached in .ai-cache/catalog.json. Shopify rate-limits /products.json,
 * so tests never call it directly.
 */
export async function getProducts(): Promise<ShopifyProduct[]> {
  catalog ??= JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8')) as ShopifyProduct[];
  return catalog;
}

/** First product that has an in-stock variant and at least one image. */
export async function findAvailableProduct() {
  const products = await getProducts();
  for (const product of products) {
    const variant = product.variants.find((v) => v.available);
    if (variant && product.images.length > 0) return { product, variant };
  }
  throw new Error('No in-stock products with images found. Add stock to at least one product to run cart tests.');
}

/** A product with no in-stock variants, if the store has one. */
export async function findSoldOutProduct() {
  return (await getProducts()).find((p) => p.variants.every((v) => !v.available));
}

/** An in-stock variant that is on sale (compare-at price above price), if any. */
export async function findSaleProduct() {
  for (const product of await getProducts()) {
    const variant = product.variants.find((v) => v.available && Number(v.compare_at_price) > Number(v.price));
    if (variant) return { product, variant };
  }
  return undefined;
}

/** Two different in-stock products (for multi-item cart tests), if the store has them. */
export async function findTwoAvailableProducts() {
  const picks = [];
  for (const product of await getProducts()) {
    const variant = product.variants.find((v) => v.available);
    if (variant) picks.push({ product, variant });
    if (picks.length === 2) return picks;
  }
  return undefined;
}

/** Lowest variant price of a product, as a number. */
export function minPrice(p: ShopifyProduct) {
  return Math.min(...p.variants.map((v) => Number(v.price)));
}

/** A product with more than one in-stock variant, if the store has one. */
export async function findMultiVariantProduct() {
  const products = await getProducts();
  return products.find((p) => p.variants.filter((v) => v.available).length > 1);
}

/*
 * Cart helpers run fetch() inside the browser page. Shopify's bot protection
 * blocks cart requests from plain HTTP clients (HTTP 429 "Verifying your
 * connection"), but lets the real browser through, the same as a shopper.
 * The page must already be on the store (e.g. after page.goto('/')).
 */
async function cartFetch<T>(page: Page, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  return storeFetch<T>(page, path, body);
}

/**
 * fetch() a storefront URL from inside the browser (shares cookies and passes
 * Shopify's bot check). GET when body is undefined, otherwise POST JSON.
 * If Shopify's bot protection answers 429, back off and retry; on the third try,
 * reload the page so the browser can clear the challenge first.
 */
export async function storeFetch<T = unknown>(
  page: Page,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: T; headers: Record<string, string>; ms: number }> {
  for (let attempt = 1; ; attempt++) {
    const res = await rawStoreFetch<T>(page, path, body);
    const challenged = res.status === 429 && typeof res.data === 'string' && /verifying your connection|just a moment/i.test(res.data);
    if (!challenged && res.status !== 429) return res;
    if (attempt >= 5) {
      throw new Error(`${path} blocked by Shopify bot protection (HTTP 429) after ${attempt} tries: environment issue, not a store defect.`);
    }
    await page.waitForTimeout(3000 * attempt);
    if (attempt >= 3) {
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await page
        .waitForFunction(() => !/just a moment|verifying your connection/i.test(document.title), null, { timeout: 45_000 })
        .catch(() => {});
    }
  }
}

async function rawStoreFetch<T>(page: Page, path: string, body?: unknown) {
  return page.evaluate(
    async ({ path, body }) => {
      const started = performance.now();
      const res = await fetch(path, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await res.text();
      const ms = Math.round(performance.now() - started);
      let data: unknown = text;
      try {
        data = JSON.parse(text);
      } catch {}
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => (headers[k] = v));
      return { status: res.status, data: data as T, headers, ms };
    },
    { path, body },
  );
}

export async function getCart(page: Page): Promise<ShopifyCart> {
  return (await cartFetch<ShopifyCart>(page, '/cart.js')).data;
}

export async function addToCart(page: Page, variantId: number, quantity = 1) {
  const { status, data } = await cartFetch(page, '/cart/add.js', { items: [{ id: variantId, quantity }] });
  if (status >= 400) throw new Error(`/cart/add.js returned ${status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

/** Raw add request, for negative tests that expect a failure status. */
export async function tryAddToCart(page: Page, variantId: number, quantity = 1) {
  return cartFetch(page, '/cart/add.js', { items: [{ id: variantId, quantity }] });
}

export async function clearCart(page: Page) {
  await cartFetch(page, '/cart/clear.js', {});
}
