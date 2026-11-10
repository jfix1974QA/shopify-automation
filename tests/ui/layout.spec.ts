import { test, expect } from '../../src/fixtures';
import { findAvailableProduct, getCart } from '../../src/utils/storefront';

/**
 * UI pack: does each page render the right elements, readably, on desktop and mobile?
 * Runs in two projects: `ui` (desktop Chrome) and `ui-mobile` (iPhone 14 / WebKit).
 */
test.describe('UI: layout and rendering', () => {
  test('UI-01: home page header, hero and footer render', {
    tag: ['@ui', '@P1', '@regression'],
    annotation: { type: 'description', description: 'Open home page. Expect store name/logo, navigation (or mobile menu), cart icon, a hero section and footer to be visible.' },
  }, async ({ page, home }, testInfo) => {
    await home.open();
    await expect(await home.logo()).toBeVisible();
    if (testInfo.project.name === 'ui-mobile') {
      await expect(page.getByRole('button', { name: /menu/i }).or(page.locator('summary[aria-label="Menu"]')).first()).toBeVisible();
    } else {
      await expect(home.navLinks().filter({ visible: true }).first()).toBeVisible();
    }
    await expect(await home.cartLink()).toBeVisible();
    await expect(page.locator('main section, main .shopify-section').first()).toBeVisible();
    await expect(home.footer()).toBeVisible();
  });

  test('UI-02: product page shows title, price, image, add to cart', {
    tag: ['@ui', '@P1', '@regression'],
    annotation: { type: 'description', description: 'Open an in-stock product. Expect title, price, main image and an enabled Add to cart button.' },
  }, async ({ productPage }) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    await expect(await productPage.title()).toBeVisible();
    await expect(await productPage.price()).toBeVisible();
    await expect(await productPage.mainImage()).toBeVisible();
    await expect(await productPage.addToCartButton()).toBeEnabled();
  });

  test('UI-03: collection page shows a grid of product cards', {
    tag: ['@ui', '@P2'],
    annotation: { type: 'description', description: 'Open /collections/all. Expect product cards, each with a name, image and price.' },
  }, async ({ page }) => {
    await page.goto('/collections/all');
    const cards = page.locator('main .card-wrapper, main .product-card, main li.grid__item').filter({ visible: true });
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 6); i++) {
      const card = cards.nth(i);
      await expect.soft(card.locator('a[href*="/products/"]').filter({ visible: true }).first(), `card ${i} link`).toBeVisible();
      await expect.soft(card.getByText(/\$\s?[\d,]+\.\d{2}/).first(), `card ${i} price`).toBeVisible();
    }
  });

  test('UI-04: empty cart shows an empty-state message and a way back to shopping', {
    tag: ['@ui', '@edge', '@P2'],
    annotation: { type: 'description', description: 'Open /cart with no items. Expect an "empty" message and a Continue shopping link.' },
  }, async ({ page, cartPage }) => {
    await cartPage.open();
    await expect(cartPage.emptyMessage()).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: /continue shopping/i }).first()).toBeVisible();
  });

  test('UI-05: no images on the home page are broken', {
    tag: ['@ui', '@P2'],
    annotation: { type: 'description', description: 'Scroll the home page so lazy images load. Expect every loaded image to have real pixel data.' },
  }, async ({ page, home }) => {
    await home.open();
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => window.scrollBy(0, 1500)); // mouse.wheel is not supported in mobile WebKit
      await page.waitForTimeout(300);
    }
    await page.waitForLoadState('networkidle').catch(() => {});
    const broken = await page.locator('img').evaluateAll((imgs) =>
      (imgs as HTMLImageElement[]).filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
    );
    expect(broken, `Broken images:\n${broken.join('\n')}`).toEqual([]);
  });

  test('UI-06: page does not scroll horizontally (no layout overflow)', {
    tag: ['@ui', '@edge', '@P2'],
    annotation: { type: 'description', description: 'On home, collection and product pages, the document must not be wider than the viewport.' },
  }, async ({ page }) => {
    const { product } = await findAvailableProduct();
    for (const path of ['/', '/collections/all', `/products/${product.handle}`]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect.soft(overflow, `${path} overflows horizontally by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });

  test('UI-08: keyboard-only shopper can add to cart and reach the cart', {
    tag: ['@ui', '@edge', '@a11y', '@P2'],
    annotation: { type: 'description', description: 'Desktop only. Using only Tab and Enter: move focus to Add to cart, press Enter (item added), then Tab to the cart icon and press Enter (cart opens). Focus must always be visible.' },
  }, async ({ page, productPage }, testInfo) => {
    test.skip(testInfo.project.name === 'ui-mobile', 'Keyboard navigation is a desktop check');
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);

    const tabTo = async (matches: (el: Element) => boolean, label: string) => {
      for (let i = 0; i < 80; i++) {
        await page.keyboard.press('Tab');
        const hit = await page.evaluate(`(${matches.toString()})(document.activeElement)`);
        if (hit) {
          const outline = await page.evaluate(() => {
            const s = getComputedStyle(document.activeElement!);
            return s.outlineStyle !== 'none' || s.boxShadow !== 'none';
          });
          expect.soft(outline, `${label} should show a visible focus indicator`).toBe(true);
          return;
        }
      }
      throw new Error(`Could not reach ${label} with the Tab key`);
    };

    await tabTo((el) => el.matches('button[name="add"], form[action*="/cart/add"] [type="submit"]'), 'Add to cart');
    const added = page.waitForResponse((r) => r.url().includes('/cart/add'));
    await page.keyboard.press('Enter');
    await added;
    await expect.poll(async () => (await getCart(page)).item_count).toBe(1);

    // Dawn opens a cart notification/drawer; close it with Escape, then reach the header cart icon.
    await page.keyboard.press('Escape');
    await page.goto(page.url());
    await tabTo((el) => el.matches('#cart-icon-bubble, header a[href$="/cart"], header [aria-label^="Cart"]'), 'cart icon');
    await page.keyboard.press('Enter');
    // Depending on theme settings the cart icon either opens the cart page or a slide-out cart drawer.
    const drawer = page.locator('cart-drawer, #CartDrawer, [id*="cart-drawer"]').filter({ visible: true }).first();
    await expect(async () => {
      const onCartPage = /\/cart(\?|$)/.test(page.url());
      expect(onCartPage || (await drawer.isVisible()), 'cart page or cart drawer should open').toBe(true);
    }).toPass({ timeout: 10_000 });
    await expect(page.locator('main .cart-item, cart-drawer .cart-item').filter({ visible: true }).first()).toBeVisible();
  });

  test('UI-07: mobile menu opens and lists the main navigation', {
    tag: ['@ui', '@P2'],
    annotation: { type: 'description', description: 'Mobile only. Tap the menu icon. Expect the drawer to show Home and Catalog links.' },
  }, async ({ page, home }, testInfo) => {
    test.skip(testInfo.project.name !== 'ui-mobile', 'Mobile-only check');
    await home.open();
    await page.locator('summary[aria-label="Menu"], button[aria-label*="menu" i]').first().click();
    const drawer = page.locator('#menu-drawer, [id*="menu-drawer"]').first();
    await expect(drawer.getByRole('link', { name: 'Catalog' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Home' })).toBeVisible();
  });
});
