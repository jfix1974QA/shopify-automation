// Drafted by Claude from /collections/all. Review before committing.
import { test, expect } from '../../src/fixtures';
import { getProducts } from '../../src/utils/storefront';
import type { Page, Locator } from '@playwright/test';

type PriceRange = { min: number; max: number };

const COLLECTION = '/collections/all';

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  return parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''));
}

function priceRange(product: any): PriceRange | undefined {
  const variants: any[] = Array.isArray(product?.variants) ? product.variants : [];
  let prices = variants.map((v) => toNumber(v?.price)).filter((n) => Number.isFinite(n));
  if (!prices.length) {
    prices = [toNumber(product?.price_min ?? product?.price), toNumber(product?.price_max ?? product?.price)].filter(
      (n) => Number.isFinite(n),
    );
  }
  if (!prices.length) return undefined;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

async function loadCatalogue(request: any): Promise<{ count: number; prices: Map<string, PriceRange> }> {
  // Reviewer fix: getProducts() reads the cached catalogue and takes no arguments.
  void request;
  const res: any = await getProducts();
  const list: any[] = Array.isArray(res) ? res : res?.products ?? [];
  const prices = new Map<string, PriceRange>();
  for (const product of list) {
    const range = priceRange(product);
    if (product?.handle && range) prices.set(product.handle, range);
  }
  return { count: list.length, prices };
}

function sortSelect(page: Page): Locator {
  // The desktop sort control; the mobile duplicate (#SortBy-mobile) is hidden at this viewport.
  return page.locator('select#SortBy');
}

function productCountHeading(page: Page): Locator {
  return page.getByRole('heading', { name: /^\s*\d+\s+products?\s*$/i });
}

async function readProductCount(page: Page): Promise<number> {
  const heading = productCountHeading(page);
  await expect(heading).toBeVisible();
  const text = (await heading.textContent()) ?? '';
  const match = text.match(/(\d+)/);
  expect(match, `product count text "${text}" should contain a number`).not.toBeNull();
  return Number(match![1]);
}

/** Product handles in visible grid order (role locators skip the hidden duplicate links). */
async function gridHandles(page: Page): Promise<string[]> {
  const hrefs = await page
    .getByRole('main')
    .getByRole('link')
    .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
  const handles: string[] = [];
  for (const href of hrefs) {
    const match = href.match(/\/products\/([^/?#]+)/);
    if (match && !handles.includes(match[1])) handles.push(match[1]);
  }
  return handles;
}

function isSorted(values: number[], direction: 'asc' | 'desc'): boolean {
  for (let i = 1; i < values.length; i++) {
    if (direction === 'asc' && values[i] < values[i - 1]) return false;
    if (direction === 'desc' && values[i] > values[i - 1]) return false;
  }
  return true;
}

/**
 * Checks price ordering without depending on how Shopify ranks multi-variant products:
 * products with a single price must be strictly monotonic relative to each other, and the
 * first card must be the cheapest (asc) / at least as expensive as every single-price product (desc).
 */
function orderingProblem(handles: string[], prices: Map<string, PriceRange>, direction: 'asc' | 'desc'): string | null {
  const ranges = handles.map((h) => prices.get(h)).filter((r): r is PriceRange => !!r);
  if (ranges.length < 2) return `only ${ranges.length} priced products found in the grid`;
  const singlePrices = ranges.filter((r) => r.min === r.max).map((r) => r.min);
  if (!isSorted(singlePrices, direction)) return `single-price products not ${direction}: ${singlePrices.join(', ')}`;
  const first = ranges[0];
  if (direction === 'asc') {
    const cheapest = Math.min(...ranges.map((r) => r.min));
    if (first.min !== cheapest) return `first product min ${first.min} is not the cheapest (${cheapest})`;
  } else {
    const highestSingle = singlePrices.length ? Math.max(...singlePrices) : -Infinity;
    if (first.max < highestSingle) return `first product max ${first.max} is below ${highestSingle}`;
  }
  return null;
}

test.describe('Catalog: sorting by price and product count', () => {
  test('product count matches the catalogue and the rendered product cards', async ({ page, request }) => {
    const catalogue = await loadCatalogue(request);
    await page.goto(COLLECTION);

    const count = await readProductCount(page);
    expect(count).toBe(catalogue.count);

    const handles = await gridHandles(page);
    expect(handles.length).toBeGreaterThan(0);

    const pagination = page.getByRole('navigation', { name: /pagination/i });
    if (await pagination.isVisible()) {
      expect(handles.length).toBeLessThanOrEqual(count);
    } else {
      expect(handles.length).toBe(count);
    }

    for (const handle of handles) {
      expect(catalogue.prices.has(handle), `grid product "${handle}" should exist in the catalogue`).toBe(true);
    }
  });

  test('choosing "Price, low to high" reorders the grid cheapest first', async ({ page, request }) => {
    const { prices } = await loadCatalogue(request);
    await page.goto(COLLECTION);
    const countBefore = await readProductCount(page);

    await sortSelect(page).selectOption('price-ascending');

    await expect(page).toHaveURL(/[?&]sort_by=price-ascending/);
    await expect(sortSelect(page)).toHaveValue('price-ascending');
    await expect
      .poll(async () => orderingProblem(await gridHandles(page), prices, 'asc'), {
        message: 'grid should be ordered by ascending price',
        timeout: 15_000,
      })
      .toBeNull();

    expect(await readProductCount(page)).toBe(countBefore);
  });

  test('choosing "Price, high to low" reorders the grid most expensive first', async ({ page, request }) => {
    const { prices } = await loadCatalogue(request);
    await page.goto(COLLECTION);

    await sortSelect(page).selectOption('price-descending');

    await expect(page).toHaveURL(/[?&]sort_by=price-descending/);
    await expect
      .poll(async () => orderingProblem(await gridHandles(page), prices, 'desc'), {
        message: 'grid should be ordered by descending price',
        timeout: 15_000,
      })
      .toBeNull();
  });

  test('ascending and descending sorts show the same products and count in different order', async ({ page }) => {
    await page.goto(`${COLLECTION}?sort_by=price-ascending`);
    const ascCount = await readProductCount(page);
    const ascHandles = await gridHandles(page);

    await page.goto(`${COLLECTION}?sort_by=price-descending`);
    const descCount = await readProductCount(page);
    const descHandles = await gridHandles(page);

    expect(descCount).toBe(ascCount);
    expect([...descHandles].sort()).toEqual([...ascHandles].sort());
    expect(descHandles).not.toEqual(ascHandles);
    expect(descHandles[0]).not.toBe(ascHandles[0]);
  });

  test('selected price sort persists across a page reload', async ({ page, request }) => {
    const { prices } = await loadCatalogue(request);
    await page.goto(COLLECTION);

    await sortSelect(page).selectOption('price-descending');
    await expect(page).toHaveURL(/[?&]sort_by=price-descending/);

    await page.reload();

    await expect(sortSelect(page)).toHaveValue('price-descending');
    expect(orderingProblem(await gridHandles(page), prices, 'desc')).toBeNull();
  });

  test('an invalid sort_by value falls back gracefully without losing products', async ({ page }) => {
    await page.goto(COLLECTION);
    const baselineCount = await readProductCount(page);
    const baselineHandles = await gridHandles(page);

    const response = await page.goto(`${COLLECTION}?sort_by=not-a-real-sort`);
    expect(response?.ok()).toBe(true);

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/products/i);
    expect(await readProductCount(page)).toBe(baselineCount);
    expect([...(await gridHandles(page))].sort()).toEqual([...baselineHandles].sort());
  });

  test('a price filter above every product shows zero products and an empty state', async ({ page, request }) => {
    const { prices } = await loadCatalogue(request);
    const highest = Math.max(...[...prices.values()].map((r) => r.max));
    const unreachable = Math.ceil(highest * 10 + 1000);

    await page.goto(`${COLLECTION}?filter.v.price.gte=${unreachable}&sort_by=price-ascending`);

    await expect(page.getByText(/no products found/i).first()).toBeVisible();
    expect(await gridHandles(page)).toHaveLength(0);
  });
});
