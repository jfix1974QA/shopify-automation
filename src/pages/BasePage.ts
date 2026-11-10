import type { Locator, Page } from '@playwright/test';
import { smartLocator } from '../ai/selfHeal';

/**
 * Shared behaviour for all page objects. Selector lists cover Shopify's
 * Dawn theme and other common Online Store 2.0 themes. If your theme
 * differs, add your selectors to the front of each list.
 */
export class BasePage {
  constructor(readonly page: Page) {}

  /** Find an element by known selectors, falling back to AI self-healing. */
  protected find(description: string, selectors: string[]): Promise<Locator> {
    return smartLocator(this.page, description, selectors);
  }

  async goto(path: string) {
    const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissPopups();
    return response;
  }

  /** Close cookie banners and newsletter popups that block clicks. */
  async dismissPopups() {
    const closers = [
      '#shopify-pc__banner__btn-decline',
      '[aria-label="Close dialog"]',
      '.klaviyo-close-form',
      '[class*="popup"] [aria-label*="Close" i]',
    ];
    for (const selector of closers) {
      const el = this.page.locator(selector).first();
      if (await el.isVisible().catch(() => false)) await el.click().catch(() => {});
    }
  }

  cartCountBubble() {
    return this.page.locator('#cart-icon-bubble .cart-count-bubble, .cart-count-bubble, [data-cart-count]').first();
  }

  cartLink() {
    return this.find('cart icon link in the header', ['#cart-icon-bubble', 'header a[href$="/cart"]', 'a[href="/cart"]']);
  }

  async openSearch() {
    const trigger = await this.find('search button or icon in the header', [
      'details-modal.header__search summary',
      'header summary[aria-label="Search"]',
      'header a[href*="/search"]',
      'button[aria-label*="Search" i]',
    ]);
    await trigger.click();
    return this.find('search text input', ['input[type="search"]:visible', 'input[name="q"]:visible', '#Search-In-Modal']);
  }
}
