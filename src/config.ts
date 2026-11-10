import 'dotenv/config';

function trimSlash(url: string) {
  return url.replace(/\/+$/, '');
}

export const config = {
  storeUrl: trimSlash(process.env.STORE_URL ?? 'https://james-qa-shop.myshopify.com'),
  storePassword: process.env.STORE_PASSWORD ?? '',
  ai: {
    enabled: Boolean(process.env.ANTHROPIC_API_KEY),
    model: process.env.AI_MODEL ?? 'claude-opus-5-5',
    selfHeal: (process.env.AI_SELF_HEAL ?? 'true') !== 'false',
  },
};
