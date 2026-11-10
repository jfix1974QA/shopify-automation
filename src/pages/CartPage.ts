import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  open() {
    return this.goto('/cart');
  }

  /** Line items in the main cart (not the hidden copy in the slide-out cart drawer). */
  lineItems() {
    return this.page.locator('main .cart-item, main tr.cart__row').filter({ visible: true });
  }

  /** The empty-cart message in the main cart (the slide-out drawer has a hidden copy). */
  emptyMessage() {
    return this.page.locator('main .cart__empty-text, main :text-matches("your cart is empty", "i")').filter({ visible: true }).first();
  }

  checkoutButton() {
    return this.find('Checkout button', ['button[name="checkout"]', '#checkout', '[name="checkout"]', 'a[href*="/checkout"]']);
  }

  quantityInput(row = 0) {
    return this.lineItems().nth(row).getByRole('spinbutton').first();
  }

  removeButton(row = 0) {
    return this.lineItems()
      .nth(row)
      .locator('cart-remove-button a, a[href*="/cart/change"], button[aria-label*="Remove" i]')
      .first();
  }

  /**
   * The cart total amount (Dawn labels it "Estimated total" or "Subtotal").
   * Matched by money format, so an empty wrapper element can never be picked.
   */
  async subtotal() {
    const candidates = this.page
      .locator('main .totals__total-value, main .totals__subtotal-value, main .cart__footer [class*="total"], main [class*="subtotal"]')
      .filter({ visible: true })
      .filter({ hasText: /\d[\d,]*\.\d{2}/ });
    const found = await candidates.first().waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    if (found) return candidates.last();
    return this.find('cart total amount (money value next to "Estimated total" or "Subtotal")', ['.totals__total-value', '.totals__subtotal-value']);
  }
}
