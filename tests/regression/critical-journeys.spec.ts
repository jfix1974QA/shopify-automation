import { test, expect } from '../../src/fixtures';
import { findAvailableProduct, getCart } from '../../src/utils/storefront';

/**
 * Regression pack: the end-to-end journeys that must never break, plus visual
 * baselines that catch unintended layout changes after theme or app updates.
 *
 * For a full regression run across every pack, use: npm run test:regression
 * (runs this pack plus every test tagged @regression in the other packs).
 */
test.describe('Regression: critical journeys', () => {
  test('REG-01: browse → product → add to cart → checkout', {
    tag: ['@regression', '@P1'],
    annotation: { type: 'description', description: 'Shopper journey: home → Catalog → open product → Add to cart → cart page → Checkout. Stops at Shopify checkout; no payment entered.' },
  }, async ({ page, home, productPage, cartPage }) => {
    const { product, variant } = await findAvailableProduct();

    await test.step('Open home and go to the catalogue', async () => {
      await home.open();
      await page.getByRole('link', { name: 'Catalog' }).filter({ visible: true }).first().click();
      await expect(page).toHaveURL(/\/collections\/all/);
    });

    await test.step('Open the product from the catalogue', async () => {
      await page.locator(`main a[href*="/products/${product.handle}"]`).filter({ visible: true }).first().click();
      await expect(page).toHaveURL(new RegExp(`/products/${product.handle}`));
      if (product.variants.length > 1) await productPage.open(product.handle, variant.id);
    });

    await test.step('Add to cart', async () => {
      await productPage.addToCart();
      expect((await getCart(page)).item_count).toBe(1);
    });

    await test.step('Review cart', async () => {
      await cartPage.open();
      await expect(cartPage.lineItems()).toHaveCount(1);
      await expect(cartPage.lineItems().first()).toContainText(product.title);
    });

    await test.step('Proceed to checkout', async () => {
      await (await cartPage.checkoutButton()).click();
      await expect(page).toHaveURL(/\/checkouts?\//, { timeout: 30_000 });
    });
  });

  test('REG-02: search → product → add to cart', {
    tag: ['@regression', '@P1'],
    annotation: { type: 'description', description: 'Shopper journey via search: search for a product, open it from results, add to cart.' },
  }, async ({ page, home, productPage }) => {
    const { product } = await findAvailableProduct();
    await home.open();
    const input = await home.openSearch();
    await input.fill(product.title);
    await input.press('Enter');
    await page.locator(`main a[href*="/products/${product.handle}"]`).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`/products/${product.handle}`));
    await productPage.addToCart();
    expect((await getCart(page)).item_count).toBe(1);
  });
});

test.describe('Regression: visual baselines', () => {
  // First run records baselines in tests/regression/__screenshots__/. Later runs fail if a page
  // changes by more than 2% of pixels. After an intended design change, refresh with:
  //   npx playwright test --project=regression --update-snapshots
  test('REG-03: home page above the fold matches baseline', {
    tag: ['@regression', '@visual', '@P2'],
    annotation: { type: 'description', description: 'Screenshot the top of the home page and compare it with the approved baseline.' },
  }, async ({ page, home }) => {
    await home.open();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveScreenshot('home.png');
  });

  test('REG-04: product page matches baseline', {
    tag: ['@regression', '@visual', '@P2'],
    annotation: { type: 'description', description: 'Screenshot the product page top section and compare it with the approved baseline.' },
  }, async ({ page, productPage }) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveScreenshot('product.png');
  });

  test('REG-05: empty cart page matches baseline', {
    tag: ['@regression', '@visual', '@P3'],
    annotation: { type: 'description', description: 'Screenshot the empty cart page and compare it with the approved baseline.' },
  }, async ({ page, cartPage }) => {
    await cartPage.open();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveScreenshot('cart-empty.png');
  });
});
