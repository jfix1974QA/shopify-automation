# 1. Automation Execution Report

[Index](README.md) · [1. Execution report](1-automation-execution-report.md) · [2. Test scripts & scenarios](2-test-scripts-and-scenarios.md) · [3. Defect & QA summary](3-defect-and-qa-summary.md)

**Store:** https://james-qa-shop.myshopify.com · **Run:** 2026-11-10 13:56 UTC · **Environment:** [CI run](https://github.com/jfix1974QA/shopify-automation/actions/runs/42827257169) · Playwright 1.65.0 · Node v22.23.4 · Linux 7.0.0-1019-azure

## Summary

| Test cases | Executions | Passed | Failed | Blocked | Flaky | Skipped | Pass rate | Requirements covered | Time |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 77 | 89 | 51 | 5 | 24 | 2 | 7 | **91.4%** | 23/23 | 3.6s |

![status-overview](charts/status-overview.svg)

Pass rate is calculated over verified tests: skipped and blocked tests are excluded. UI tests run twice, on desktop Chrome and on an iPhone 14 (WebKit), so executions exceed test cases.

> **24 executions are Blocked, not failed.** Shopify's bot protection stopped them before they could check anything (or the test was corrected after the run and is awaiting re-test). They say nothing about store quality and are not raised as defects. See "Blocked tests" below.


## Results by test pack

![results-by-pack](charts/results-by-pack.svg)

| Pack | Tests | Passed | Failed | Blocked | Flaky | Skipped | Pass rate | Time |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| UI (desktop) | 12 | 9 | 1 | 0 | 1 | 1 | 90.9% | 45.4s |
| UI (mobile) | 12 | 9 | 0 | 0 | 1 | 2 | 100% | 40.4s |
| Functional | 28 | 15 | 1 | 8 | 0 | 4 | 93.8% | 2m 21s |
| Non-functional | 15 | 12 | 3 | 0 | 0 | 0 | 80% | 1m 32s |
| API | 17 | 1 | 0 | 16 | 0 | 0 | 100% | 2m 48s |
| Regression | 5 | 5 | 0 | 0 | 0 | 0 | 100% | 25.3s |
| **Total** | **89** | **51** | **5** | **24** | **2** | **7** | **91.4%** | **8m 32s** |

![duration-by-pack](charts/duration-by-pack.svg)

## Results by priority

![results-by-priority](charts/results-by-priority.svg)

| Priority | Passed | Failed | Blocked | Flaky | Skipped |
|---|---:|---:|---:|---:|---:|
| P1 (high) | 14 | 1 | 9 | 0 | 0 |
| P2 (medium) | 28 | 2 | 9 | 2 | 5 |
| P3 (low) | 9 | 2 | 6 | 0 | 2 |

## Test coverage

**23 of 23** store requirements have automated tests; **21** were executed in this run and **8** pass completely.
Coverage includes **37** edge/negative test cases, **4** Claude-powered checks and **16** regression-tagged tests.

![coverage-by-requirement](charts/coverage-by-requirement.svg)

![coverage-heatmap](charts/coverage-heatmap.svg)

| ID | Area | Requirement | Test cases | Executions | Passed | Failed | Blocked | Skipped | Status |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| R01 | Storefront | Home page renders correctly | UI-01, UI-05, UI-AI-01, REG-03 | 7 | 7 | 0 | 0 | 0 | ✅ Passing |
| R02 | Storefront | Navigation and menus | UI-01, UI-07, REG-01 | 5 | 4 | 0 | 0 | 1 | ✅ Passing |
| R03 | Product | Product page content | UI-02, FN-01, UI-AI-02, REG-04, NF-08 | 7 | 7 | 0 | 0 | 0 | ✅ Passing |
| R04 | Product | Product variants | FN-05, FN-27 | 2 | 1 | 0 | 1 | 0 | ⚠️ Partly verified |
| R05 | Cart | Add to cart | FN-02, FN-03, FN-18, FN-21, REG-01, REG-02, UI-08 | 8 | 5 | 0 | 1 | 2 | ⚠️ Partly verified |
| R06 | Cart | Quantity validation | FN-15, FN-16, FN-17, API-10, API-12, API-13 | 6 | 0 | 0 | 3 | 3 | 🚧 Blocked |
| R07 | Product | Inventory and sold-out handling | FN-04, API-09, FN-17 | 3 | 1 | 0 | 1 | 1 | ⚠️ Partly verified |
| R08 | Cart | Cart management | FN-06, FN-07, FN-08, FN-19, FN-20, UI-04, UI-AI-03, REG-05 | 10 | 7 | 0 | 3 | 0 | ⚠️ Partly verified |
| R09 | Cart | Pricing and discounts | FN-01, FN-19, FN-22, FN-23, API-05 | 5 | 2 | 0 | 3 | 0 | ⚠️ Partly verified |
| R10 | Checkout | Checkout hand-off | FN-09, REG-01 | 2 | 1 | 0 | 1 | 0 | ⚠️ Partly verified |
| R11 | Discovery | Search | FN-10, FN-11, FN-24, FN-25, FN-26, API-04, REG-02 | 7 | 5 | 1 | 1 | 0 | ❌ Failing |
| R12 | Discovery | Collections and sorting | UI-03, FN-12, FN-13, FN-28 | 5 | 5 | 0 | 0 | 0 | ✅ Passing |
| R13 | Storefront | Contact form | FN-14 | 1 | 1 | 0 | 0 | 0 | ✅ Passing |
| R14 | Storefront | Responsive and mobile layout | UI-06, UI-07 | 2 | 2 | 0 | 0 | 0 | ✅ Passing |
| R15 | Quality | Accessibility (WCAG 2.1 AA) | NF-05, NF-06, UI-08 | 4 | 2 | 1 | 0 | 1 | ❌ Failing |
| R16 | Quality | Performance | NF-01, NF-02, NF-03, NF-14 | 4 | 4 | 0 | 0 | 0 | ✅ Passing |
| R17 | Quality | Reliability and error handling | NF-04, NF-12, NF-15, API-03, API-14 | 5 | 3 | 0 | 2 | 0 | ⚠️ Partly verified |
| R18 | Quality | Security | NF-09, NF-10, NF-11, NF-13, FN-24 | 5 | 4 | 1 | 0 | 0 | ❌ Failing |
| R19 | Quality | SEO | NF-07, NF-08 | 2 | 1 | 1 | 0 | 0 | ❌ Failing |
| R20 | API | Products API | API-01, API-02, API-03, API-04 | 4 | 1 | 0 | 3 | 0 | ⚠️ Partly verified |
| R21 | API | Cart API | API-05, API-06, API-07, API-08, API-11, API-15, API-16, API-17 | 8 | 0 | 0 | 8 | 0 | 🚧 Blocked |
| R22 | Quality | Content quality | UI-AI-04 | 2 | 0 | 1 | 0 | 1 | ❌ Failing |
| R23 | Quality | Visual regression | REG-03, REG-04, REG-05 | 3 | 3 | 0 | 0 | 0 | ✅ Passing |

## Slowest tests

![slowest-tests](charts/slowest-tests.svg)

## Failed tests

| Test | Pack | Priority | Failure |
|---|---|---|---|
| FN-10 search by product name returns that product | functional | P1 | Error: expect(locator).toBeVisible() failed |
| NF-05 no critical or serious WCAG 2.1 AA violations on key pages | non-functional | P2 | Error: / |
| NF-07 key pages have title, meta description, canonical and social image | non-functional | P3 | Error: /: meta description |
| NF-11 session and cart cookies are Secure and HttpOnly where applicable | non-functional | P2 | Error: Session/cart cookies without Secure flag: cart |
| UI-AI-04 product descriptions have no typos or placeholder text | ui | P3 | Error: the-collection-snowboard-liquid: Description is empty. |

See [3. Defect & QA summary](3-defect-and-qa-summary.md) for triage and defects raised.

## Blocked tests

These did not produce a result about the store and must be re-run (CI runs each pack on its own runner, which avoids the single-IP blocking).

| Test | Pack | Reason |
|---|---|---|
| API-01 GET /products/{handle}.js returns a valid product | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-03 GET unknown product returns 404 | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-04 predictive search API returns matching products | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-05 POST /cart/add.js adds an item and totals are correct | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-06 POST /cart/change.js updates quantity; 0 removes the line | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-07 POST /cart/clear.js empties the cart | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-08 adding an invalid variant is rejected with an error | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-09 adding a sold-out variant is rejected | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-10 negative quantity is rejected | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-11 GET /cart.js returns the documented shape | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-12 quantity 0 on add is rejected or ignored | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-13 very large quantity is limited by stock or rejected | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-14 malformed JSON body returns a 4xx, not a server error | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-15 changing a line that is not in the cart returns a 4xx | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-16 /cart/update.js sets several line quantities at once | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| API-17 string, decimal and missing ids are rejected cleanly | api | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| FN-02 Add to cart adds the selected variant | functional | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| FN-06 cart page lists the item with subtotal and checkout | functional | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| FN-07 changing quantity in the cart updates the total | functional | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| FN-08 removing the only item empties the cart | functional | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| FN-09 Checkout button opens Shopify checkout | functional | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| FN-22 invalid discount link does not change the cart total | functional | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| FN-23 sale product shows original and sale price everywhere | functional | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |
| FN-27 product link with an invalid variant id falls back to a buyable variant | functional | Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down. |

## How this was run

```bash
npx playwright test          # all packs
npm run qa-reports           # build these reports
```

Full interactive report with a trace for every test: `npx playwright show-report reports/html`.
