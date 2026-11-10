import { z } from 'zod';
import { test, expect, requireAi } from '../../src/fixtures';
import { askStructured } from '../../src/ai/client';
import { addToCart, findAvailableProduct, getProducts } from '../../src/utils/storefront';

/**
 * Claude-powered UI review: checks that are hard to write as selectors.
 * Skipped automatically when ANTHROPIC_API_KEY is not set.
 */
test.describe('UI: AI visual review', () => {
  test.beforeEach(() => requireAi());

  test('UI-AI-01: home page looks like a working, professional store', {
    tag: ['@ui', '@ai', '@P2'],
    annotation: { type: 'description', description: 'Claude reviews a screenshot for layout bugs, broken images, overlapping text and placeholder copy.' },
  }, async ({ home, ai }) => {
    await home.open();
    await ai.expect(
      'The page looks like a professional online store: a header with logo and navigation, ' +
        'a clear hero or featured section, no broken images, no overlapping or cut-off text, ' +
        'and no leftover placeholder or template copy.',
    );
  });

  test('UI-AI-02: product page shows everything a shopper needs', {
    tag: ['@ui', '@ai', '@P2'],
    annotation: { type: 'description', description: 'Claude checks the product name, price, a matching photo and a visible Add to cart button.' },
  }, async ({ productPage, ai }) => {
    const { product, variant } = await findAvailableProduct();
    await productPage.open(product.handle, variant.id);
    await ai.expect(
      `This is the product page for "${product.title}". It shows that product name, a price, ` +
        'a product photo that matches the product, and a clearly visible Add to cart button. Nothing overlaps or looks broken.',
    );
  });

  test('UI-AI-03: cart page clearly shows the item and how to check out', {
    tag: ['@ui', '@ai', '@P2'],
    annotation: { type: 'description', description: 'Claude checks the cart shows the line item, price, quantity control, subtotal and checkout button.' },
  }, async ({ page, cartPage, ai }) => {
    await page.goto('/');
    const { product, variant } = await findAvailableProduct();
    await addToCart(page, variant.id, 1);
    await cartPage.open();
    await ai.expect(
      `The cart shows one line item for "${product.title}" with a price, a quantity control, a subtotal, and a visible checkout button.`,
    );
  });

  test('UI-AI-04: product descriptions have no typos or placeholder text', {
    tag: ['@ui', '@ai', '@P3'],
    annotation: { type: 'description', description: 'Claude reviews up to 10 product descriptions for spelling mistakes, placeholder text and title mismatches.' },
  }, async ({}, testInfo) => {
    test.skip(testInfo.project.name === 'ui-mobile', 'Content check runs once, on desktop');
    const products = (await getProducts()).slice(0, 10).map((p) => ({
      handle: p.handle,
      title: p.title,
      description: (p.body_html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500),
    }));
    const review = await askStructured({
      system:
        'You are an e-commerce copy editor. Flag only real problems a customer would notice: spelling mistakes, ' +
        'placeholder or lorem ipsum text, empty or one-word descriptions, broken sentences, or a description that ' +
        'clearly does not match the title. Ignore style preferences.',
      schema: z.object({
        problems: z.array(z.object({ handle: z.string(), problem: z.string(), severity: z.enum(['high', 'low']) })),
      }),
      prompt: JSON.stringify(products, null, 2),
    });
    await testInfo.attach('copy-review', { body: JSON.stringify(review, null, 2), contentType: 'application/json' });
    const high = review.problems.filter((p) => p.severity === 'high');
    expect(high, high.map((p) => `${p.handle}: ${p.problem}`).join('\n')).toEqual([]);
  });
});
