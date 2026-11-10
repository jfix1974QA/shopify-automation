import { expect, type Page, type TestInfo } from '@playwright/test';
import { z } from 'zod';
import { askStructured } from './client';
import { interactiveSnapshot } from '../utils/pageSnapshot';

const Verdict = z.object({
  pass: z.boolean().describe('true only if every part of the expectation is clearly met'),
  confidence: z.number().describe('0 to 1'),
  reasoning: z.string().describe('one or two sentences explaining the verdict'),
  issues: z.array(z.string()).describe('concrete problems seen, empty if none'),
});
export type AiVerdict = z.infer<typeof Verdict>;

const SYSTEM = `You are a meticulous QA engineer reviewing a Shopify storefront.
You get a screenshot, a list of the page's interactive elements, and an expectation in plain English.
Judge strictly from what is visible. If something is ambiguous or not visible, it fails.
Watch for broken images, overlapping or cut-off text, placeholder copy (lorem ipsum, "Example product"),
wrong prices or currency, and layout bugs.`;

/**
 * Check a page against a plain-English expectation, for example:
 *   await aiExpect(page, 'Shows a price, an Add to cart button and a product image');
 * The screenshot and verdict are attached to the Playwright report.
 */
export async function aiExpect(
  page: Page,
  expectation: string,
  opts: { testInfo?: TestInfo; fullPage?: boolean; minConfidence?: number } = {},
): Promise<AiVerdict> {
  const shot = await page.screenshot({ fullPage: opts.fullPage ?? false });
  const snapshot = await interactiveSnapshot(page, 150);

  const verdict = await askStructured({
    system: SYSTEM,
    schema: Verdict,
    images: [{ base64: shot.toString('base64') }],
    prompt: `URL: ${page.url()}\n\nInteractive elements:\n${snapshot}\n\nExpectation:\n${expectation}`,
  });

  if (opts.testInfo) {
    await opts.testInfo.attach('ai-screenshot', { body: shot, contentType: 'image/png' });
    await opts.testInfo.attach('ai-verdict', {
      body: JSON.stringify({ expectation, ...verdict }, null, 2),
      contentType: 'application/json',
    });
  }

  const minConfidence = opts.minConfidence ?? 0.6;
  expect(
    verdict.pass && verdict.confidence >= minConfidence,
    `AI check failed: "${expectation}"\n${verdict.reasoning}\nIssues: ${verdict.issues.join('; ') || 'none'}`,
  ).toBe(true);
  return verdict;
}
