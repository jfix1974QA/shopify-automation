# Shopify Storefront Automation (AI-assisted)

Automated test packs for **james-qa-shop.myshopify.com**, built on Playwright + TypeScript,
with Claude features on top, HTML reporting, automatic bug drafts and a GitHub Actions pipeline.

## Test packs

| Pack | Project(s) | Tests | What it covers |
|---|---|---|---|
| **UI** | `ui`, `ui-mobile` | 12 × 2 browsers | Header/hero/footer, product page elements, collection grid, empty cart, broken images, horizontal overflow, mobile menu, keyboard-only shopping; Claude visual review of home/product/cart and product copy |
| **Functional** | `functional` | 28 | Catalogue data on product page, add to cart, quantity, sold-out blocking, variants, cart quantity/remove/subtotal, checkout hand-off, search, price sorting, collection completeness, contact form validation, plus edge cases (below) |
| **Non-functional** | `non-functional` | 15 | Performance budgets (TTFB, DOMContentLoaded, load, LCP, page weight), JS errors, WCAG 2.1 AA (axe), image alt text, SEO tags, Product JSON-LD, HTTPS redirect, security headers, Secure cookies, 404 handling, password protection, slow 3G, offline |
| **API** | `api` | 17 | `/products/{handle}.js`, catalogue completeness, 404s, predictive search, cart add/change/update/clear, `/cart.js` contract, response times, plus edge cases (below) |
| **Regression** | `regression` (+ every `@regression` test) | 5 (+15 tagged) | End-to-end journeys (browse → checkout, search → cart) and visual baselines for home, product and empty cart |

Every test has an ID (`UI-01`, `FN-07`, `API-05`, …), a priority tag (`@P1` high to `@P3` low)
and a description of its steps and expected result. All of these show in the reports.

### Edge cases (`@edge`, 37 tests, run with `npm run test:edge`)

| Area | Tests |
|---|---|
| Quantity | 0 / negative / non-numeric input (FN-15, FN-16, API-10, API-12), more than in stock (FN-17, API-13) |
| Cart | same product twice merges (FN-18), two products and subtotal (FN-19), survives reload and new tab (FN-20), double-click Add to cart (FN-21), remove last item (FN-08), change to 0 (API-06), bulk update (API-16), empty cart (UI-04) |
| Invalid input | bad / string / decimal / missing variant ids (API-08, API-17), sold-out item (FN-04, API-09), malformed JSON (API-14), changing a line not in the cart (API-15), empty contact form (FN-14) |
| Pricing | sale price and struck-through original (FN-23), invalid discount link (FN-22) |
| Search | no results (FN-11), HTML/script injection is escaped (FN-24), 1,000-character query (FN-25), case and spaces ignored (FN-26) |
| URLs | invalid `?variant=` (FN-27), unknown collection (FN-28), unknown product (API-03, NF-12), http to https (NF-09) |
| Access and network | no storefront password redirects to /password (NF-13), slow 3G (NF-14), offline during Add to cart (NF-15) |
| Layout and keyboard | no horizontal overflow (UI-06), keyboard-only add to cart (UI-08) |

Some edge cases depend on store data and skip when it isn't there: FN-23 needs a product with a
compare-at price, FN-19 and API-16 need two in-stock products. FN-17 and API-13 add a warning instead of
failing when a product has unlimited stock.

## Claude features

| Feature | What it does | Where |
|---|---|---|
| **AI visual checks** | `ai.expect('plain English')` screenshots the page and Claude judges it | `src/ai/aiAssert.ts` |
| **Self-healing locators** | When a selector stops matching, Claude finds the element, the test continues, and the fix is logged | `src/ai/selfHeal.ts` |
| **Test generator** | `npm run generate -- /products/x` drafts a new spec using this framework | `src/ai/generateTests.ts` |
| **Copy review** | Claude checks product descriptions for typos and placeholder text | `tests/ui/ai-visual.spec.ts` |

Without `ANTHROPIC_API_KEY`, `@ai` tests are skipped and self-healing is off. Everything else runs.

## Setup

```bash
npm install
npx playwright install chromium webkit
```

Copy `.env.example` to `.env` (git-ignored) and fill in:

```
STORE_URL=https://james-qa-shop.myshopify.com
STORE_PASSWORD=<storefront password>
ANTHROPIC_API_KEY=<key from platform.claude.com/settings/keys>
```

## Running

| Command | Runs |
|---|---|
| `npm test` | All packs |
| `npm run test:ui` / `test:functional` / `test:non-functional` / `test:api` | One pack |
| `npm run test:regression` | Regression pack plus every `@regression` test in other packs |
| `npm run test:smoke` | High-priority (`@P1`) tests only |
| `npm run test:edge` | Edge and negative cases across all packs |
| `npm run test:no-ai` | Everything except Claude tests |
| `npm run report` | Open the interactive HTML report |
| `npm run update-baselines` | Re-record visual baselines after an intended design change |

## Reports

Every run writes to `reports/`:

| File | What's in it |
|---|---|
| `reports/summary.html` | One-page report: totals, pass rate, results **by pack**, execution time per test, screenshot for every test, trace + video for failures, links to bug drafts |
| `reports/html/` | Playwright's interactive report: filter by pack/status/tag, step timings, screenshots, and a **trace for every test** (time-travel DOM, network, console) |
| `reports/bugs/AUTO-*.md` | A bug report draft for each failed test: severity, pack, test case, environment, steps, expected vs actual, evidence paths, reproduce command |
| `reports/junit.xml`, `results.json`, `summary.json` | Machine-readable results for CI and dashboards |

Bug drafts are raised automatically from failures, so triage them: a failure can be a product defect,
a test that needs updating, or an environment problem (e.g. rate limiting).

## QA deliverables (`qa-reports/`)

`npm run qa-reports` turns the latest run into three reports, each as Markdown (renders on GitHub with charts)
and HTML (richer, light/dark):

| Report | Contents |
|---|---|
| [1. Automation execution report](qa-reports/1-automation-execution-report.md) | Execution, pass/fail statistics by pack and priority, requirement coverage and traceability |
| [2. Test scripts and scenarios](qa-reports/2-test-scripts-and-scenarios.md) | Every test case: steps, expected result, steps actually executed, actual result, screenshot |
| [3. Defect and QA summary](qa-reports/3-defect-and-qa-summary.md) | Defects with severity, evidence, root cause, recommendation and closure criteria; quality gates and verdict |

Inputs: `reports/summary.json` (the run), `qa/requirements.json` (feature to test mapping), `qa/defects.json`
(triaged defects, observations, recommendations). Tests stopped by Shopify's bot protection are reported as
**Blocked**, not Failed, and are never raised as defects. `scripts/qa-report/capture-evidence.ts` captures
focused defect screenshots when the store is reachable.

## CI/CD (GitHub Actions)

`.github/workflows/storefront-tests.yml` runs on push to `main`, on pull requests, daily at 06:00 UTC,
and on demand (Actions → Storefront tests → Run workflow, where you can choose packs).

1. **test**: each pack runs on its own runner in parallel.
2. **report**: merges results into one HTML report + summary, uploads the **test-report** artifact,
   writes a results table to the run summary, and **files a GitHub issue for each failed test**
   (labels `bug`, `automated-test`, `severity: …`; skips duplicates; not on pull requests).
3. The workflow fails if any test failed.

**Setup in GitHub** (Settings → Secrets and variables → Actions):

| Name | Type | Value |
|---|---|---|
| `STORE_PASSWORD` | Secret | storefront password |
| `ANTHROPIC_API_KEY` | Secret | Claude API key (optional, enables `@ai` tests) |
| `STORE_URL` | Variable | optional, defaults to james-qa-shop |

**Visual baselines** are stored per OS (`tests/regression/__screenshots__/<platform>/`). The first CI run
records Linux baselines and uploads them as the `visual-baselines-linux` artifact. Commit that folder so
later runs compare against it.

## Things to know

- **Shopify bot protection.** Shopify rate-limits storefronts per IP and shows a "Just a moment..." page
  (HTTP 429) under heavy automated traffic. To stay under it, the framework logs in and reads the
  catalogue **once per run** (global setup), sends all store requests from **inside the browser**, and
  uses 2 workers. Back-to-back local runs can still trip it; if setup reports rate limiting, wait 15–30 minutes.
  CI spreads packs across runners (separate IPs).
- **Checkout** tests stop at Shopify checkout and never enter payment details.
- **Performance budgets** live at the top of `tests/non-functional/performance.spec.ts`. Tighten them once you have a baseline.
- **Claude cost.** About 4 Claude calls per UI project per run; self-healing only calls Claude when a selector breaks.
  The default model is `claude-opus-5-5` (override with `AI_MODEL`).

## Layout

```
.github/workflows/storefront-tests.yml   CI/CD pipeline
scripts/file-github-issues.mjs           files issues from bug drafts
src/
  global-setup.ts        store login + catalogue cache (once per run)
  fixtures.ts            page objects + ai.expect fixtures
  pages/                 Home, Product, Cart page objects (Dawn theme selectors + fallbacks)
  utils/storefront.ts    catalogue, in-browser fetch, cart helpers
  ai/                    Claude client, visual checks, self-healing, test generator
  reporting/             summary report + bug draft reporter
tests/
  ui/  functional/  non-functional/  api/  regression/
merge.config.ts          merges per-pack CI results into one report
```
