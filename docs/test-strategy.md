# Test Strategy

**Project:** AI-Assisted Shopify Test Automation Framework
**System under test:** Shopify storefront `james-qa-shop.myshopify.com` (Dawn theme, development store, password protected)
**Owner:** James · **Status:** Active, executed on every push and nightly in GitHub Actions

---

## 1. Objectives

1. Give fast, trustworthy evidence that a shopper can **find, choose and buy** products (up to the Shopify checkout).
2. Check that the store meets **accessibility (WCAG 2.1 AA), performance, SEO and security** expectations.
3. Catch **content and visual problems** that selector-based tests miss, using Claude as a reviewer.
4. Report every defect to a standard a developer can act on **without follow-up questions**.
5. Keep results **visible per build** (reports, badges, build history) so quality trends are obvious.

## 2. Scope

### In scope

| Area | Coverage |
|---|---|
| Storefront UI | Home, collection, product, cart, search, contact pages; desktop Chrome and iPhone 14 (WebKit) |
| Shopper journeys | Browse → product → add to cart → cart → checkout hand-off; search → product → cart |
| Storefront API | Shopify Ajax API: `/products/{handle}.js`, `/cart.js`, `/cart/add.js`, `/cart/change.js`, `/cart/update.js`, `/cart/clear.js`, `/search/suggest.json` |
| Non-functional | Performance budgets (TTFB, DOMContentLoaded, load, LCP, page weight), WCAG 2.1 AA via axe-core, image alt text, SEO meta tags and Product JSON-LD, HTTPS redirect, security headers, cookie flags, 404 handling, password protection, slow 3G and offline behaviour |
| Content quality | Claude visual review of key pages and copy review of product descriptions |
| Visual regression | Screenshot baselines for home, product and empty cart |
| Edge and negative cases | Quantity limits (0, negative, non-numeric, above stock), invalid and malformed API input, sold-out items, duplicate adds, cart persistence, XSS-style and very long search input, URL tampering, invalid discount links |

### Out of scope

| Area | Reason |
|---|---|
| Payment and order placement | Shopify checkout is a hosted, PCI-scoped platform service; tests stop at the checkout page and never enter payment details |
| Shopify admin and back office | Not part of the shopper-facing storefront |
| Customer accounts | Hosted by Shopify (new customer accounts) |
| Load and stress testing | Needs a dedicated environment; would trip bot protection and affect a shared platform |
| Manual exploratory and usability testing | Outside this automation project; recommended before launch |
| Firefox and other browsers | Chromium and WebKit cover the main engines for this audience; can be added as Playwright projects |

## 3. Test levels and types

| Pack | Level / type | Tests | Tagging |
|---|---|---:|---|
| UI | System, UI and visual | 12 (desktop + mobile = 24 runs) | `@ui`, `@ai` |
| Functional | System, functional | 28 | `@functional` |
| Non-functional | Performance, accessibility, SEO, security | 15 | `@non-functional`, `@performance`, `@a11y`, `@seo`, `@security` |
| API | Integration, API contract and negative | 17 | `@api` |
| Regression | End-to-end journeys and visual baselines | 5 (+15 tagged in other packs) | `@regression`, `@visual` |

Cross-cutting tags: `@P1`/`@P2`/`@P3` (priority), `@edge` (37 edge and negative cases), `@ai` (Claude-powered).

## 4. Approach

- **Risk-based prioritisation.** P1 covers revenue-critical paths (add to cart, cart, checkout hand-off, search, sold-out handling, security). P2 covers important but non-blocking behaviour. P3 covers polish (SEO, content, minor validation).
- **Real data, no hard-coding.** Tests read products from the catalogue (cached once per run) so they keep working as products, prices and stock change.
- **Page objects with self-healing.** Selectors live in page objects with fallbacks; Claude is the last resort when a theme change breaks them, and must report "not found" rather than guess.
- **AI where selectors can't judge.** Visual quality, copy quality and test drafting use Claude with schema-validated output, a confidence threshold and attached evidence. AI results go through human triage.
- **Traceability.** Every test has an ID and a description of steps and expected result; `qa/requirements.json` maps 23 store features to tests.
- **Stable execution.** One login and catalogue read per run, in-browser API calls, pacing, and a bot-challenge guard. Tests blocked by bot protection are reported as *Blocked*, not *Failed*.

## 5. Environments and data

| Item | Detail |
|---|---|
| Store | Shopify development store, Dawn theme, storefront password, 13 products (Shopify sample data) |
| Browsers | Chromium (Desktop Chrome profile), WebKit (iPhone 14 profile) |
| Execution | Local (Windows) and GitHub Actions (Ubuntu runners, one per pack) |
| Secrets | `STORE_PASSWORD`, `ANTHROPIC_API_KEY` in `.env` locally and GitHub repository secrets in CI |
| Test data | Live catalogue; carts created per test and cleared; no customer or payment data |

## 6. Entry and exit criteria

**Entry:** store reachable and password valid; catalogue has at least one in-stock product with an image; build type-checks.

**Exit (quality gates, evaluated in the Defect & QA summary):**

| Gate | Threshold |
|---|---|
| Overall pass rate (verified tests) | ≥ 95% |
| P1 tests | 100% passing |
| Open Critical or High defects | 0 |
| Accessibility | No serious or critical axe violations |
| Performance | All page budgets met |
| Security checks | All passing |
| Flaky tests | 0 |
| Blocked tests | 0 (all planned tests executed) |

## 7. Defect management

**Lifecycle:** failed test → automatic bug draft (`reports/bugs/`) → triage within one working day → confirmed defect in
`qa/defects.json` → GitHub issue raised by CI → fix → retest → closed when its acceptance criteria are met.
Failures not linked to a defect are raised as `needs-triage`. Tests blocked by the environment are never raised.

**Every defect includes:** ID, title, severity, priority, type, area, tests that found it, environment, preconditions,
steps to reproduce, expected vs actual result, evidence (screenshots, tool output), impact, root cause analysis,
recommendation and acceptance criteria for closure.

| Severity | Definition |
|---|---|
| Critical | Blocks purchasing or exposes customer data |
| High | Breaks a key journey or affects many users |
| Medium | Degrades a feature; a workaround exists |
| Low | Cosmetic, SEO or minor hardening |

## 8. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Shopify bot protection (Cloudflare) challenges automated traffic, especially from shared CI IPs | Tests cannot run | Pacing, single login, in-browser requests, fail-fast challenge guard, *Blocked* status; recommended: Storefront API token for the API pack or a self-hosted runner |
| Theme updates change markup | Locator failures | Page objects with fallbacks and Claude self-healing |
| Development-store sample data | Content defects that would not exist in production | Reported as defects so they are tracked to launch |
| AI false positives or negatives | Wrong verdicts | Structured output, confidence threshold, evidence attached, human triage |
| Visual baselines differ by OS | False visual failures | Baselines stored per platform; CI records Linux baselines |

## 9. Deliverables

| Deliverable | Location |
|---|---|
| Automation execution report (statistics, coverage) | `qa-reports/1-automation-execution-report.*` |
| Test scripts and scenarios (steps, expected, actual) | `qa-reports/2-test-scripts-and-scenarios.*` |
| Defect and QA summary (severity, evidence, recommendations, gates) | `qa-reports/3-defect-and-qa-summary.*` |
| Build history (every CI build) | `qa-reports/build-history.*`, `qa/build-history.json` |
| Defects | GitHub Issues labelled `bug` |
| Interactive report with traces | `test-report` artifact on each CI run |

All reports are published at **https://jfix1974qa.github.io/shopify-automation/**.
