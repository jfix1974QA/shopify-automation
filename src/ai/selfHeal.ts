import fs from 'node:fs';
import path from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { z } from 'zod';
import { config } from '../config';
import { askStructured } from './client';
import { interactiveSnapshot } from '../utils/pageSnapshot';

const CACHE_FILE = path.resolve('.ai-cache/healed-selectors.json');

function readCache(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeCache(key: string, selector: string) {
  const cache = readCache();
  cache[key] = selector;
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

const Healed = z.object({
  selector: z
    .string()
    .describe('one CSS selector matching exactly the described element, or empty string if it is not on the page'),
  reasoning: z.string(),
});

/**
 * Find an element from a list of known selectors. If none match (for example
 * after a theme update), ask Claude to find it from its description.
 * Fixes are cached in .ai-cache/ so Claude is asked only once per element,
 * and a warning tells you which selector to copy back into the page object.
 */
export async function smartLocator(
  page: Page,
  description: string,
  selectors: string[],
  timeoutMs = 5000,
): Promise<Locator> {
  const pageType = new URL(page.url()).pathname.split('/')[1] || 'home';
  const cacheKey = `${pageType}::${description}`;
  const cached = readCache()[cacheKey];
  const candidates = cached ? [...selectors, cached] : selectors;

  // Themes often render hidden copies (e.g. in the mobile menu drawer), so only consider visible matches.
  const combined = page.locator(candidates.join(', ')).filter({ visible: true }).first();
  try {
    await combined.waitFor({ state: 'visible', timeout: timeoutMs });
    return combined;
  } catch {
    if (!config.ai.enabled || !config.ai.selfHeal) {
      throw new Error(`Element not found: "${description}" (tried: ${candidates.join(' | ')})`);
    }
  }

  const snapshot = await interactiveSnapshot(page);
  const healed = await askStructured({
    system:
      'You repair broken UI test selectors. Given a list of page elements, return one robust CSS selector ' +
      'for the described element. Prefer id, name, aria-label, data-* and type attributes over styling classes.',
    schema: Healed,
    effort: 'low',
    prompt: `Element wanted: ${description}\nSelectors that no longer match: ${selectors.join(' | ')}\n\nPage elements:\n${snapshot}`,
  });

  if (!healed.selector) {
    throw new Error(`Element not found, and AI could not locate "${description}": ${healed.reasoning}`);
  }
  const locator = page.locator(healed.selector).filter({ visible: true }).first();
  await locator.waitFor({ state: 'visible', timeout: timeoutMs });
  console.warn(`[self-heal] "${description}" -> ${healed.selector}  (copy this into your page object)`);
  writeCache(cacheKey, healed.selector);
  return locator;
}
