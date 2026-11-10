import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  open(handle: string, variantId?: number) {
    return this.goto(`/products/${handle}${variantId ? `?variant=${variantId}` : ''}`);
  }

  title() {
    return this.find('product title heading', ['.product__title h1', 'h1.product__title', 'main h1', 'h1']);
  }

  price() {
    return this.find('current product price', [
      '.product__info-container .price-item--sale:visible',
      '.product__info-container .price-item--regular:visible',
      '[id^="price-"] .price-item:visible',
      '.product .price:visible',
      '[class*="product"] [class*="price"]:visible',
    ]);
  }

  addToCartButton() {
    return this.find('Add to cart button', [
      'form[action*="/cart/add"] button[name="add"]',
      'button[name="add"]',
      'form[action*="/cart/add"] [type="submit"]',
    ]);
  }

  /** Whether the theme shows a quantity selector on the product page (it is a theme setting). No AI fallback. */
  async hasQuantityInput() {
    return (await this.page.locator('input[name="quantity"], input.quantity__input').filter({ visible: true }).count()) > 0;
  }

  quantityInput() {
    return this.find('quantity input on product page', ['input[name="quantity"]', 'input.quantity__input']);
  }

  mainImage() {
    return this.find('main product image', [
      '.product__media img',
      '.product__media-item img',
      '[class*="product"] [class*="media"] img',
    ]);
  }

  /** Variant pickers (radio buttons or selects); empty for single-variant products. */
  variantOptions() {
    return this.page.locator(
      'variant-radios input[type="radio"], variant-selects input[type="radio"], variant-selects select, select[name^="options"]',
    );
  }

  async addToCart() {
    const button = await this.addToCartButton();
    const added = this.page.waitForResponse((r) => r.url().includes('/cart/add') && r.request().method() === 'POST');
    await button.click();
    await added;
  }
}
