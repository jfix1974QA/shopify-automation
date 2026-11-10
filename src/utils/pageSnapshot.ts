import type { Page } from '@playwright/test';

/**
 * A compact, text-only list of the page's interactive elements.
 * Much smaller than raw HTML, so it's cheap to send to Claude.
 */
export async function interactiveSnapshot(page: Page, maxItems = 300): Promise<string> {
  return page.evaluate((max) => {
    const sel =
      'a[href], button, input, select, textarea, [role="button"], [role="link"], [role="dialog"], ' +
      'h1, h2, h3, form, [data-testid], [aria-label], img[alt], summary';
    const attrNames = ['id', 'name', 'type', 'role', 'aria-label', 'href', 'data-testid', 'placeholder', 'alt', 'class'];
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if (out.length >= max) break;
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      const attrs = attrNames
        .map((a) => {
          const v = el.getAttribute(a);
          return v ? `${a}="${v.slice(0, 80)}"` : '';
        })
        .filter(Boolean)
        .join(' ');
      const text = (el.innerText || (el as HTMLInputElement).value || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      out.push(`<${el.tagName.toLowerCase()} ${attrs}${visible ? '' : ' hidden'}>${text}`);
    }
    return out.join('\n');
  }, maxItems);
}
