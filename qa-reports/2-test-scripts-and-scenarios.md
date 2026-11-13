# 2. Test Scripts and Scenarios

[Index](README.md) · [1. Execution report](1-automation-execution-report.md) · [2. Test scripts & scenarios](2-test-scripts-and-scenarios.md) · [3. Defect & QA summary](3-defect-and-qa-summary.md)

**Store:** https://james-qa-shop.myshopify.com · **Run:** 2026-11-13 06:54 UTC · **77 test cases** in 5 packs (89 executions)

Each test case lists its planned steps and expected result (from the test definition), the steps the automation
actually performed in this run (browser actions and assertions, with outcome), and the actual result.
Source code for every scenario is linked by file and line.

![scenario-status](charts/scenario-status.svg)

![scenarios-by-type](charts/scenarios-by-type.svg)

## Test case index

| ID | Test case | Pack | Priority | Type | Result | Time |
|---|---|---|---|---|---|---:|
| [UI-01](#ui-01) | home page header, hero and footer render | ui | P1 | Standard | ✅ Passed | 1.2s / 1.6s |
| [UI-02](#ui-02) | product page shows title, price, image, add to cart | ui | P1 | Standard | ✅ Passed | 1.2s / 1.7s |
| [UI-03](#ui-03) | collection page shows a grid of product cards | ui | P2 | Standard | ✅ Passed | 1.3s / 1.8s |
| [UI-04](#ui-04) | empty cart shows an empty-state message and a way back to shopping | ui | P2 | Edge | ✅ Passed | 0.8s / 1.5s |
| [UI-05](#ui-05) | no images on the home page are broken | ui | P2 | Standard | ✅ Passed | 4.8s / 3.8s |
| [UI-06](#ui-06) | page does not scroll horizontally (no layout overflow) | ui | P2 | Edge | ✅ Passed | 2.5s / 3.5s |
| [UI-07](#ui-07) | mobile menu opens and lists the main navigation | ui | P2 | Standard | ✅ Passed | 0.3s / 3.5s |
| [UI-08](#ui-08) | keyboard-only shopper can add to cart and reach the cart | ui | P2 | Edge | ✅ Passed | 3.8s / 0.7s |
| [UI-AI-01](#ui-ai-01) | home page looks like a working, professional store | ui | P2 | Claude | ❌ Failed | 9.5s / 9.9s |
| [UI-AI-02](#ui-ai-02) | product page shows everything a shopper needs | ui | P2 | Claude | ✅ Passed | 5.3s / 8.5s |
| [UI-AI-03](#ui-ai-03) | cart page clearly shows the item and how to check out | ui | P2 | Claude | ✅ Passed | 4.5s / 5.8s |
| [UI-AI-04](#ui-ai-04) | product descriptions have no typos or placeholder text | ui | P3 | Claude | ❌ Failed | 9.6s / 0.0s |
| [FN-01](#fn-01) | product page data matches the catalogue | functional | P1 | Standard | ✅ Passed | 0.9s |
| [FN-02](#fn-02) | Add to cart adds the selected variant | functional | P1 | Standard | 🚧 Blocked | 10.4s |
| [FN-03](#fn-03) | quantity selector adds the chosen amount | functional | P2 | Standard | ⏭️ Skipped | 1.0s |
| [FN-04](#fn-04) | sold-out product cannot be added to cart | functional | P1 | Edge | ✅ Passed | 0.8s |
| [FN-05](#fn-05) | choosing a different variant updates the URL and price | functional | P2 | Standard | ✅ Passed | 0.9s |
| [FN-06](#fn-06) | cart page lists the item with subtotal and checkout | functional | P1 | Standard | 🚧 Blocked | 10.3s |
| [FN-07](#fn-07) | changing quantity in the cart updates the total | functional | P1 | Standard | 🚧 Blocked | 10.2s |
| [FN-08](#fn-08) | removing the only item empties the cart | functional | P1 | Edge | 🚧 Blocked | 10.2s |
| [FN-09](#fn-09) | Checkout button opens Shopify checkout | functional | P1 | Standard | 🚧 Blocked | 10.1s |
| [FN-10](#fn-10) | search by product name returns that product | functional | P1 | Standard | 🚧 Blocked | 31.5s |
| [FN-11](#fn-11) | search with no matches shows a no-results message | functional | P2 | Edge | ✅ Passed | 0.8s |
| [FN-12](#fn-12) | sort by price low to high orders products correctly | functional | P2 | Standard | ✅ Passed | 0.7s |
| [FN-13](#fn-13) | every catalogue product is reachable from the collection page | functional | P3 | Standard | ✅ Passed | 0.7s |
| [FN-14](#fn-14) | contact form rejects a submission without an email | functional | P3 | Edge | ✅ Passed | 4.0s |
| [FN-15](#fn-15) | product quantity input does not allow 0 or negative values | functional | P2 | Edge | ⏭️ Skipped | 1.5s |
| [FN-16](#fn-16) | non-numeric quantity is never added as a broken line | functional | P3 | Edge | ⏭️ Skipped | 1.5s |
| [FN-17](#fn-17) | requesting far more than is in stock is limited or rejected with a message | functional | P2 | Edge | ⏭️ Skipped | 1.2s |
| [FN-18](#fn-18) | adding the same product twice merges into one line | functional | P1 | Edge | ✅ Passed | 3.8s |
| [FN-19](#fn-19) | cart with two different products shows both and the correct subtotal | functional | P1 | Edge | ✅ Passed | 2.6s |
| [FN-20](#fn-20) | cart survives a page reload and opening a new tab | functional | P1 | Edge | ✅ Passed | 2.8s |
| [FN-21](#fn-21) | double-clicking Add to cart adds only one item | functional | P2 | Edge | 🚧 Blocked | 13.7s |
| [FN-22](#fn-22) | invalid discount link does not change the cart total | functional | P3 | Edge | 🚧 Blocked | 10.7s |
| [FN-23](#fn-23) | sale product shows original and sale price everywhere | functional | P2 | Edge | 🚧 Blocked | 10.4s |
| [FN-24](#fn-24) | search escapes HTML and script input (no XSS) | functional | P1 | Edge | ✅ Passed | 1.9s |
| [FN-25](#fn-25) | very long search query is handled without errors | functional | P3 | Edge | ✅ Passed | 0.7s |
| [FN-26](#fn-26) | search ignores letter case and surrounding spaces | functional | P2 | Edge | ✅ Passed | 0.9s |
| [FN-27](#fn-27) | product link with an invalid variant id falls back to a buyable variant | functional | P2 | Edge | 🚧 Blocked | 10.3s |
| [FN-28](#fn-28) | unknown collection returns 404 | functional | P3 | Edge | ✅ Passed | 0.7s |
| [NF-01](#nf-01) | home page loads within performance budget | non-functional | P2 | Standard | ✅ Passed | 2.6s |
| [NF-02](#nf-02) | collection page loads within performance budget | non-functional | P2 | Standard | ✅ Passed | 2.6s |
| [NF-03](#nf-03) | product page loads within performance budget | non-functional | P2 | Standard | ✅ Passed | 2.7s |
| [NF-04](#nf-04) | no JavaScript errors on key pages | non-functional | P2 | Standard | ✅ Passed | 2.8s |
| [NF-05](#nf-05) | no critical or serious WCAG 2.1 AA violations on key pages | non-functional | P2 | Standard | ❌ Failed | 7.4s |
| [NF-06](#nf-06) | all images have alt text | non-functional | P3 | Standard | ✅ Passed | 3.8s |
| [NF-07](#nf-07) | key pages have title, meta description, canonical and social image | non-functional | P3 | Standard | ❌ Failed | 52.7s |
| [NF-08](#nf-08) | product page has Product structured data with price | non-functional | P3 | Standard | ✅ Passed | 1.1s |
| [NF-09](#nf-09) | HTTP redirects to HTTPS | non-functional | P1 | Edge | ✅ Passed | 0.9s |
| [NF-10](#nf-10) | security headers are present | non-functional | P2 | Standard | ✅ Passed | 0.9s |
| [NF-11](#nf-11) | session and cart cookies are Secure and HttpOnly where applicable | non-functional | P2 | Standard | ❌ Failed | 2.2s |
| [NF-12](#nf-12) | unknown URLs return a proper 404 page | non-functional | P3 | Edge | ✅ Passed | 0.9s |
| [NF-13](#nf-13) | without the storefront password, pages redirect to the password page | non-functional | P1 | Edge | ✅ Passed | 1.0s |
| [NF-14](#nf-14) | product page is usable on a slow 3G connection | non-functional | P2 | Edge | ✅ Passed | 13.0s |
| [NF-15](#nf-15) | going offline during Add to cart fails cleanly and recovers | non-functional | P3 | Edge | ✅ Passed | 3.9s |
| [API-01](#api-01) | GET /products/{handle}.js returns a valid product | api | P1 | Standard | 🚧 Blocked | 10.5s |
| [API-02](#api-02) | catalogue data is complete (titles, prices, images, variants) | api | P2 | Standard | ✅ Passed | 1.3s |
| [API-03](#api-03) | GET unknown product returns 404 | api | P2 | Edge | 🚧 Blocked | 10.9s |
| [API-04](#api-04) | predictive search API returns matching products | api | P2 | Standard | 🚧 Blocked | 10.3s |
| [API-05](#api-05) | POST /cart/add.js adds an item and totals are correct | api | P1 | Standard | 🚧 Blocked | 10.6s |
| [API-06](#api-06) | POST /cart/change.js updates quantity; 0 removes the line | api | P1 | Edge | 🚧 Blocked | 10.4s |
| [API-07](#api-07) | POST /cart/clear.js empties the cart | api | P2 | Standard | 🚧 Blocked | 10.4s |
| [API-08](#api-08) | adding an invalid variant is rejected with an error | api | P2 | Edge | 🚧 Blocked | 10.4s |
| [API-09](#api-09) | adding a sold-out variant is rejected | api | P1 | Edge | 🚧 Blocked | 10.4s |
| [API-10](#api-10) | negative quantity is rejected | api | P3 | Edge | 🚧 Blocked | 10.3s |
| [API-11](#api-11) | GET /cart.js returns the documented shape | api | P3 | Standard | 🚧 Blocked | 10.4s |
| [API-12](#api-12) | quantity 0 on add is rejected or ignored | api | P2 | Edge | 🚧 Blocked | 10.9s |
| [API-13](#api-13) | very large quantity is limited by stock or rejected | api | P2 | Edge | 🚧 Blocked | 11.1s |
| [API-14](#api-14) | malformed JSON body returns a 4xx, not a server error | api | P2 | Edge | 🚧 Blocked | 11.0s |
| [API-15](#api-15) | changing a line that is not in the cart returns a 4xx | api | P3 | Edge | 🚧 Blocked | 11.0s |
| [API-16](#api-16) | /cart/update.js sets several line quantities at once | api | P3 | Edge | 🚧 Blocked | 10.9s |
| [API-17](#api-17) | string, decimal and missing ids are rejected cleanly | api | P3 | Edge | 🚧 Blocked | 10.9s |
| [REG-01](#reg-01) | browse → product → add to cart → checkout | regression | P1 | Standard | ✅ Passed | 7.0s |
| [REG-02](#reg-02) | search → product → add to cart | regression | P1 | Standard | ✅ Passed | 5.8s |
| [REG-03](#reg-03) | home page above the fold matches baseline | regression | P2 | Standard | ✅ Passed | 5.7s |
| [REG-04](#reg-04) | product page matches baseline | regression | P2 | Standard | ✅ Passed | 5.0s |
| [REG-05](#reg-05) | empty cart page matches baseline | regression | P3 | Standard | ✅ Passed | 4.6s |

## UI pack

### UI-01

**home page header, hero and footer render**

| Field | Value |
|---|---|
| Test case ID | UI-01 |
| Pack | ui |
| Priority | P1 |
| Tags | `@ui` `@P1` `@regression` |
| Script | `tests/ui/layout.spec.ts:9` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (1.2s) · UI (mobile): ✅ Passed (1.6s) |

**Test steps**
1. Open home page.

**Expected result**
- Expect store name/logo, navigation (or mobile menu), cart icon, a hero section and footer to be visible.

<details><summary>Steps executed in this run (6)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (339ms)
2. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:14)` (12ms)
3. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:18)` (13ms)
4. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:20)` (15ms)
5. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:21)` (12ms)
6. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:22)` (9ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 5/5 assertions passed.<br>*UI (mobile):* As expected. 5/5 assertions passed.

<img src="evidence/ui-01-ui.png" alt="UI-01 screenshot" width="420">


### UI-02

**product page shows title, price, image, add to cart**

| Field | Value |
|---|---|
| Test case ID | UI-02 |
| Pack | ui |
| Priority | P1 |
| Tags | `@ui` `@P1` `@regression` |
| Script | `tests/ui/layout.spec.ts:25` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (1.2s) · UI (mobile): ✅ Passed (1.7s) |

**Test steps**
1. Open an in-stock product.

**Expected result**
- Expect title, price, main image and an enabled Add to cart button.

<details><summary>Steps executed in this run (5)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (498ms)
2. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:31)` (16ms)
3. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:32)` (18ms)
4. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:33)` (12ms)
5. ✓ **Assert** `Expect "toBeEnabled" (layout.spec.ts:34)` (12ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 4/4 assertions passed.<br>*UI (mobile):* As expected. 4/4 assertions passed.

<img src="evidence/ui-02-ui.png" alt="UI-02 screenshot" width="420">


### UI-03

**collection page shows a grid of product cards**

| Field | Value |
|---|---|
| Test case ID | UI-03 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@P2` |
| Script | `tests/ui/layout.spec.ts:37` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (1.3s) · UI (mobile): ✅ Passed (1.8s) |

**Test steps**
1. Open /collections/all.

**Expected result**
- Expect product cards, each with a name, image and price.

<details><summary>Steps executed in this run (15)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (719ms)
2. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:43)` (35ms)
3. ✓ **Assert** `Expect "toBeGreaterThan" (layout.spec.ts:45)` (1ms)
4. ✓ **Assert** `card 0 link (layout.spec.ts:48)` (16ms)
5. ✓ **Assert** `card 0 price (layout.spec.ts:49)` (15ms)
6. ✓ **Assert** `card 1 link (layout.spec.ts:48)` (11ms)
7. ✓ **Assert** `card 1 price (layout.spec.ts:49)` (16ms)
8. ✓ **Assert** `card 2 link (layout.spec.ts:48)` (12ms)
9. ✓ **Assert** `card 2 price (layout.spec.ts:49)` (13ms)
10. ✓ **Assert** `card 3 link (layout.spec.ts:48)` (13ms)
11. ✓ **Assert** `card 3 price (layout.spec.ts:49)` (15ms)
12. ✓ **Assert** `card 4 link (layout.spec.ts:48)` (34ms)
13. ✓ **Assert** `card 4 price (layout.spec.ts:49)` (14ms)
14. ✓ **Assert** `card 5 link (layout.spec.ts:48)` (18ms)
15. ✓ **Assert** `card 5 price (layout.spec.ts:49)` (12ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 14/14 assertions passed.<br>*UI (mobile):* As expected. 14/14 assertions passed.

<img src="evidence/ui-03-ui.png" alt="UI-03 screenshot" width="420">


### UI-04

**empty cart shows an empty-state message and a way back to shopping**

| Field | Value |
|---|---|
| Test case ID | UI-04 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@edge` `@P2` |
| Script | `tests/ui/layout.spec.ts:53` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (0.8s) · UI (mobile): ✅ Passed (1.5s) |

**Test steps**
1. Open /cart with no items.

**Expected result**
- Expect an "empty" message and a Continue shopping link.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (354ms)
2. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:58)` (16ms)
3. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:59)` (14ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 2/2 assertions passed.<br>*UI (mobile):* As expected. 2/2 assertions passed.

<img src="evidence/ui-04-ui.png" alt="UI-04 screenshot" width="420">


### UI-05

**no images on the home page are broken**

| Field | Value |
|---|---|
| Test case ID | UI-05 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@P2` |
| Script | `tests/ui/layout.spec.ts:62` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (4.8s) · UI (mobile): ✅ Passed (3.8s) |

**Test steps**
1. Scroll the home page so lazy images load.

**Expected result**
- Expect every loaded image to have real pixel data.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (468ms)
2. ✓ **Assert** `Broken images:  (layout.spec.ts:75)` (0ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 1/1 assertions passed.<br>*UI (mobile):* As expected. 1/1 assertions passed.

<img src="evidence/ui-05-ui.png" alt="UI-05 screenshot" width="420">


### UI-06

**page does not scroll horizontally (no layout overflow)**

| Field | Value |
|---|---|
| Test case ID | UI-06 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@edge` `@P2` |
| Script | `tests/ui/layout.spec.ts:78` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (2.5s) · UI (mobile): ✅ Passed (3.5s) |

**Test steps**
1. On home, collection and product pages, the document must not be wider than the viewport.

**Expected result**
- On home, collection and product pages, the document must not be wider than the viewport.

<details><summary>Steps executed in this run (6)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (527ms)
2. ✓ **Assert** `/ overflows horizontally by 0px (layout.spec.ts:86)` (0ms)
3. ✓ `Navigate (fixtures.ts:55)` (455ms)
4. ✓ **Assert** `/collections/all overflows horizontally by 0px (layout.spec.ts:86)` (1ms)
5. ✓ `Navigate (fixtures.ts:55)` (556ms)
6. ✓ **Assert** `/products/the-collection-snowboard-liquid overflows horizontally by 0px (layout.spec.ts:86)` (0ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 3/3 assertions passed.<br>*UI (mobile):* As expected. 3/3 assertions passed.

<img src="evidence/ui-06-ui.png" alt="UI-06 screenshot" width="420">


### UI-07

**mobile menu opens and lists the main navigation**

| Field | Value |
|---|---|
| Test case ID | UI-07 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@P2` |
| Script | `tests/ui/layout.spec.ts:134` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ⏭️ Skipped (0.3s) · UI (mobile): ✅ Passed (3.5s) |

**Test steps**
1. Mobile only.
2. Tap the menu icon.

**Expected result**
- Expect the drawer to show Home and Catalog links.

**Actual result:** ✅ *UI (desktop):* Not executed: Mobile-only check<br>*UI (mobile):* As expected. 2/2 assertions passed.

<img src="evidence/ui-07-ui.png" alt="UI-07 screenshot" width="420">


### UI-08

**keyboard-only shopper can add to cart and reach the cart**

| Field | Value |
|---|---|
| Test case ID | UI-08 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@edge` `@a11y` `@P2` |
| Script | `tests/ui/layout.spec.ts:90` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (3.8s) · UI (mobile): ⏭️ Skipped (0.7s) |

**Test steps**
1. Desktop only.
2. Using only Tab and Enter: move focus to Add to cart, press Enter (item added), then Tab to the cart icon and press Enter (cart opens).

**Expected result**
- Focus must always be visible.

<details><summary>Steps executed in this run (29)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (622ms)
2. ✓ `Press "Tab" (layout.spec.ts:100)` (16ms)
3. ✓ `Press "Tab" (layout.spec.ts:100)` (21ms)
4. ✓ `Press "Tab" (layout.spec.ts:100)` (14ms)
5. ✓ `Press "Tab" (layout.spec.ts:100)` (15ms)
6. ✓ `Press "Tab" (layout.spec.ts:100)` (9ms)
7. ✓ `Press "Tab" (layout.spec.ts:100)` (21ms)
8. ✓ `Press "Tab" (layout.spec.ts:100)` (11ms)
9. ✓ `Press "Tab" (layout.spec.ts:100)` (20ms)
10. ✓ `Press "Tab" (layout.spec.ts:100)` (67ms)
11. ✓ `Press "Tab" (layout.spec.ts:100)` (15ms)
12. ✓ `Press "Tab" (layout.spec.ts:100)` (29ms)
13. ✓ **Assert** `Add to cart should show a visible focus indicator (layout.spec.ts:107)` (3ms)
14. ✓ `Press "Enter" (layout.spec.ts:116)` (37ms)
15. ✓ **Assert** `Expect "poll toBe" (layout.spec.ts:118)` (153ms)
16. ✓ `Press "Escape" (layout.spec.ts:121)` (23ms)
17. ✓ `Navigate (fixtures.ts:55)` (464ms)
18. ✓ `Press "Tab" (layout.spec.ts:100)` (36ms)
19. ✓ `Press "Tab" (layout.spec.ts:100)` (19ms)
20. ✓ `Press "Tab" (layout.spec.ts:100)` (10ms)
21. ✓ `Press "Tab" (layout.spec.ts:100)` (13ms)
22. ✓ `Press "Tab" (layout.spec.ts:100)` (11ms)
23. ✓ `Press "Tab" (layout.spec.ts:100)` (12ms)
24. ✓ `Press "Tab" (layout.spec.ts:100)` (12ms)
25. ✓ `Press "Tab" (layout.spec.ts:100)` (15ms)
26. ✓ **Assert** `cart icon should show a visible focus indicator (layout.spec.ts:107)` (0ms)
27. ✓ `Press "Enter" (layout.spec.ts:124)` (9ms)
28. ✓ **Assert** `Expect "toPass" (layout.spec.ts:130)` (146ms)
29. ✓ **Assert** `Expect "toBeVisible" (layout.spec.ts:131)` (17ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 5/5 assertions passed.<br>*UI (mobile):* Not executed: Keyboard navigation is a desktop check

<img src="evidence/ui-08-ui.png" alt="UI-08 screenshot" width="420">


### UI-AI-01

**home page looks like a working, professional store**

| Field | Value |
|---|---|
| Test case ID | UI-AI-01 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@ai` `@P2` |
| Script | `tests/ui/ai-visual.spec.ts:13` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ❌ Failed (9.5s) · UI (mobile): ❌ Failed (9.9s) |

**Test steps**
1. Claude reviews a screenshot for layout bugs, broken images, overlapping text and placeholder copy.

**Expected result**
- Claude reviews a screenshot for layout bugs, broken images, overlapping text and placeholder copy.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (500ms)
2. ✗ **Assert** `AI check failed: "The page looks like a professional online store: a header with logo and navigation, a clear hero or featured section, no broken images, no ove (aiAssert.ts:52)` (3ms)

</details>

**Actual result:** ❌ *UI (desktop):* Failed: Error: AI check failed: "The page looks like a professional online store: a header with logo and navigation, a clear hero or featured section, no broken images, no overlapping or cut-off text, and no leftover placeholder or template copy."<br>*UI (mobile):* Failed: Error: AI check failed: "The page looks like a professional online store: a header with logo and navigation, a clear hero or featured section, no broken images, no overlapping or cut-off text, and no leftover placeholder or template copy."

```
Error: AI check failed: "The page looks like a professional online store: a header with logo and navigation, a clear hero or featured section, no broken images, no overlapping or cut-off text, and no leftover placeholder or template copy."
The visible viewport looks professional: a header with the store name and navigation, a clear hero with a heading and CTA, and no broken images or overlapping text. However, the element list shows leftover generated-store template copy, which the expectation rules out.
Issues: Footer heading reads '© 2023 / Shopify, Inc.', which is leftover dev-store template copy rather than the store's own copyright.; Footer 'Resources' section links to 'Generated test data docs' and 'GraphiQL API explorer', which are developer/test-data placeholder links unsuitable for a professional storefront.; Image-with-text section pairs the heading 'Stay hydrated' with the CTA 'Get waxy now' for a ski wax product, which looks like generated sample content.; The header name 'James QA Shop' does not match the hero heading 'James QA Test Store', and the tagline 'A Test Store to facilitate AI Assisted Test Automation' reads as test copy.; The footer is not visible in the screenshot, so these problems are inferred from the element list only.
expect(received).toBe(expected) // Object.is equality
Expected: true
Received: false
```

<img src="evidence/ui-ai-01-ui.png" alt="UI-AI-01 screenshot" width="420">


### UI-AI-02

**product page shows everything a shopper needs**

| Field | Value |
|---|---|
| Test case ID | UI-AI-02 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@ai` `@P2` |
| Script | `tests/ui/ai-visual.spec.ts:25` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (5.3s) · UI (mobile): ✅ Passed (8.5s) |

**Test steps**
1. Claude checks the product name, price, a matching photo and a visible Add to cart button.

**Expected result**
- Claude checks the product name, price, a matching photo and a visible Add to cart button.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (797ms)
2. ✓ **Assert** `AI check failed: "This is the product page for "The Collection Snowboard: Liquid". It shows that product name, a price, a product photo that matches the product (aiAssert.ts:52)` (1ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 1/1 assertions passed.<br>*UI (mobile):* As expected. 1/1 assertions passed.

<img src="evidence/ui-ai-02-ui.png" alt="UI-AI-02 screenshot" width="420">


### UI-AI-03

**cart page clearly shows the item and how to check out**

| Field | Value |
|---|---|
| Test case ID | UI-AI-03 |
| Pack | ui |
| Priority | P2 |
| Tags | `@ui` `@ai` `@P2` |
| Script | `tests/ui/ai-visual.spec.ts:37` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ✅ Passed (4.5s) · UI (mobile): ✅ Passed (5.8s) |

**Test steps**
1. Claude checks the cart shows the line item, price, quantity control, subtotal and checkout button.

**Expected result**
- Claude checks the cart shows the line item, price, quantity control, subtotal and checkout button.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (510ms)
2. ✓ `Navigate (fixtures.ts:55)` (298ms)
3. ✓ **Assert** `AI check failed: "The cart shows one line item for "The Collection Snowboard: Liquid" with a price, a quantity control, a subtotal, and a visible checkout butto (aiAssert.ts:52)` (0ms)

</details>

**Actual result:** ✅ *UI (desktop):* As expected. 1/1 assertions passed.<br>*UI (mobile):* As expected. 1/1 assertions passed.

<img src="evidence/ui-ai-03-ui.png" alt="UI-AI-03 screenshot" width="420">


### UI-AI-04

**product descriptions have no typos or placeholder text**

| Field | Value |
|---|---|
| Test case ID | UI-AI-04 |
| Pack | ui |
| Priority | P3 |
| Tags | `@ui` `@ai` `@P3` |
| Script | `tests/ui/ai-visual.spec.ts:50` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | UI (desktop): ❌ Failed (9.6s) · UI (mobile): ⏭️ Skipped (0.0s) |

**Test steps**
1. Claude reviews up to 10 product descriptions for spelling mistakes, placeholder text and title mismatches.

**Expected result**
- Claude reviews up to 10 product descriptions for spelling mistakes, placeholder text and title mismatches.

<details><summary>Steps executed in this run (1)</summary>

1. ✗ **Assert** `the-collection-snowboard-liquid: Description is empty. the-collection-snowboard-oxygen: Description is empty. the-collection-snowboard-hydrogen: Description is  (ai-visual.spec.ts:72)` (5ms)

</details>

**Actual result:** ❌ *UI (desktop):* Failed: Error: the-collection-snowboard-liquid: Description is empty.<br>*UI (mobile):* Not executed: Content check runs once, on desktop

```
Error: the-collection-snowboard-liquid: Description is empty.
the-collection-snowboard-oxygen: Description is empty.
the-collection-snowboard-hydrogen: Description is empty.
the-multi-location-snowboard: Description is empty. The title 'Multi-location' also reads like an internal test or placeholder name.
the-multi-managed-snowboard: Description is empty. The title 'Multi-managed' also reads like an internal test or placeholder name.
the-3p-fulfilled-snowboard: Description is empty. The title '3p Fulfilled' also reads like an internal test or placeholder name.
selling-plans-ski-wax: Description is empty. The title 'Selling Plans' also reads like an internal test or placeholder name.
the-videographer-snowboard: Description is empty.
```


## Functional pack

### FN-01

**product page data matches the catalogue**

| Field | Value |
|---|---|
| Test case ID | FN-01 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@P1` `@regression` |
| Script | `tests/functional/shopping.spec.ts:14` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.9s) |

**Test steps**
1. Open an in-stock product.

**Expected result**
- The title and displayed price must match the catalogue for that variant.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (408ms)
2. ✓ **Assert** `Expect "toHaveText" (shopping.spec.ts:20)` (11ms)
3. ✓ **Assert** `Expect "toContain" (shopping.spec.ts:22)` (1ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/fn-01-functional.png" alt="FN-01 screenshot" width="420">


### FN-02

**Add to cart adds the selected variant**

| Field | Value |
|---|---|
| Test case ID | FN-02 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@P1` `@regression` |
| Script | `tests/functional/shopping.spec.ts:25` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (10.4s) |

**Test steps**
1. Click Add to cart.

**Expected result**
- The cart must contain exactly 1 of that variant and the header cart count must show 1.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (421ms)
2. ✓ `Click (ProductPage.ts:57)` (74ms)

</details>

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-02-functional.png" alt="FN-02 screenshot" width="420">


### FN-03

**quantity selector adds the chosen amount**

| Field | Value |
|---|---|
| Test case ID | FN-03 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@P2` |
| Script | `tests/functional/shopping.spec.ts:38` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ⏭️ Skipped (1.0s) |

**Test steps**
1. Set quantity to 3 on the product page and add to cart.

**Expected result**
- Cart item count must be 3.

<details><summary>Steps executed in this run (1)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (360ms)

</details>

**Actual result:** ⏭️ Not executed: Theme has no quantity selector on the product page (theme setting); covered at API level by API-10, API-12 and API-13

<img src="evidence/fn-03-functional.png" alt="FN-03 screenshot" width="420">


### FN-04

**sold-out product cannot be added to cart**

| Field | Value |
|---|---|
| Test case ID | FN-04 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@edge` `@P1` |
| Script | `tests/functional/shopping.spec.ts:51` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.8s) |

**Test steps**
1. Open a product with no stock.

**Expected result**
- The Add to cart button must be disabled and labelled Sold out.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (393ms)
2. ✓ **Assert** `Expect "toBeDisabled" (shopping.spec.ts:59)` (13ms)
3. ✓ **Assert** `Expect "toContainText" (shopping.spec.ts:60)` (15ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/fn-04-functional.png" alt="FN-04 screenshot" width="420">


### FN-05

**choosing a different variant updates the URL and price**

| Field | Value |
|---|---|
| Test case ID | FN-05 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@P2` |
| Script | `tests/functional/shopping.spec.ts:63` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.9s) |

**Test steps**
1. On a multi-variant product, pick another option.

**Expected result**
- URL must carry ?variant= for the new variant.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (394ms)
2. ✓ `Click (shopping.spec.ts:77)` (62ms)
3. ✓ **Assert** `Expect "toHaveURL" (shopping.spec.ts:79)` (21ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/fn-05-functional.png" alt="FN-05 screenshot" width="420">


### FN-06

**cart page lists the item with subtotal and checkout**

| Field | Value |
|---|---|
| Test case ID | FN-06 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@P1` `@regression` |
| Script | `tests/functional/shopping.spec.ts:90` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (10.3s) |

**Test steps**
1. With 1 item in the cart, /cart must list 1 line item, a subtotal and an enabled Checkout button.

**Expected result**
- With 1 item in the cart, /cart must list 1 line item, a subtotal and an enabled Checkout button.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-06-functional.png" alt="FN-06 screenshot" width="420">


### FN-07

**changing quantity in the cart updates the total**

| Field | Value |
|---|---|
| Test case ID | FN-07 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@P1` |
| Script | `tests/functional/shopping.spec.ts:100` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (10.2s) |

**Test steps**
1. Set the line quantity to 2.

**Expected result**
- Cart item count must become 2 and the subtotal must change.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-07-functional.png" alt="FN-07 screenshot" width="420">


### FN-08

**removing the only item empties the cart**

| Field | Value |
|---|---|
| Test case ID | FN-08 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@edge` `@P1` |
| Script | `tests/functional/shopping.spec.ts:114` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (10.2s) |

**Test steps**
1. Click Remove on the line item.

**Expected result**
- Cart must be empty and show the empty-cart message.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-08-functional.png" alt="FN-08 screenshot" width="420">


### FN-09

**Checkout button opens Shopify checkout**

| Field | Value |
|---|---|
| Test case ID | FN-09 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@P1` `@regression` |
| Script | `tests/functional/shopping.spec.ts:124` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (10.1s) |

**Test steps**
1. Click Checkout.

**Expected result**
- Browser must reach the Shopify checkout page.
- The test stops there and never enters payment details.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-09-functional.png" alt="FN-09 screenshot" width="420">


### FN-10

**search by product name returns that product**

| Field | Value |
|---|---|
| Test case ID | FN-10 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@P1` `@regression` |
| Script | `tests/functional/shopping.spec.ts:135` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (31.5s) |

**Test steps**
1. Open search from the header, type a product name, press Enter.

**Expected result**
- Results must include that product.

<details><summary>Steps executed in this run (4)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (356ms)
2. ✓ `Click (BasePage.ts:52)` (69ms)
3. ✓ `Fill "The Collection Snowboard: Liquid" (shopping.spec.ts:142)` (47ms)
4. ✓ `Press "Enter" (shopping.spec.ts:143)` (141ms)

</details>

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-10-functional.png" alt="FN-10 screenshot" width="420">


### FN-11

**search with no matches shows a no-results message**

| Field | Value |
|---|---|
| Test case ID | FN-11 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@edge` `@P2` |
| Script | `tests/functional/shopping.spec.ts:150` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.8s) |

**Test steps**
1. Search for a nonsense term.

**Expected result**
- No product links and a "no results" message must be shown.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (527ms)
2. ✓ **Assert** `Expect "toHaveCount" (shopping.spec.ts:155)` (22ms)
3. ✓ **Assert** `Expect "toBeVisible" (shopping.spec.ts:156)` (10ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/fn-11-functional.png" alt="FN-11 screenshot" width="420">


### FN-12

**sort by price low to high orders products correctly**

| Field | Value |
|---|---|
| Test case ID | FN-12 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@P2` |
| Script | `tests/functional/shopping.spec.ts:159` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.7s) |

**Test steps**
1. Open /collections/all?sort_by=price-ascending.

**Expected result**
- Product prices must be in non-decreasing order.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (424ms)
2. ✓ **Assert** `Expect "toBeGreaterThan" (shopping.spec.ts:169)` (0ms)
3. ✓ **Assert** `Expect "toEqual" (shopping.spec.ts:170)` (1ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/fn-12-functional.png" alt="FN-12 screenshot" width="420">


### FN-13

**every catalogue product is reachable from the collection page**

| Field | Value |
|---|---|
| Test case ID | FN-13 |
| Pack | functional |
| Priority | P3 |
| Tags | `@functional` `@P3` |
| Script | `tests/functional/shopping.spec.ts:173` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.7s) |

**Test steps**
1. Each product in the catalogue must appear as a link on /collections/all (first page, up to 24).

**Expected result**
- Each product in the catalogue must appear as a link on /collections/all (first page, up to 24).

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (422ms)
2. ✓ **Assert** `Not listed on /collections/all:  (shopping.spec.ts:183)` (0ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/fn-13-functional.png" alt="FN-13 screenshot" width="420">


### FN-14

**contact form rejects a submission without an email**

| Field | Value |
|---|---|
| Test case ID | FN-14 |
| Pack | functional |
| Priority | P3 |
| Tags | `@functional` `@edge` `@P3` |
| Script | `tests/functional/shopping.spec.ts:186` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (4.0s) |

**Test steps**
1. Open /pages/contact and submit the form empty.
2. No message is sent because the store rejects it.

**Expected result**
- The form must not be accepted: an error about the email must be shown and no success message.

<details><summary>Steps executed in this run (6)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (419ms)
2. ✓ **Assert** `Expect "toBeVisible" (shopping.spec.ts:193)` (23ms)
3. ✓ **Assert** `Expect "toHaveAttribute" (shopping.spec.ts:194)` (7ms)
4. ✓ `Click (shopping.spec.ts:195)` (52ms)
5. ✓ **Assert** `Expect "not toHaveURL" (shopping.spec.ts:199)` (17ms)
6. ✓ **Assert** `Expect "toHaveCount" (shopping.spec.ts:200)` (13ms)

</details>

**Actual result:** ✅ As expected. 4/4 assertions passed. Note: Empty submission was not accepted, but no inline validation message was shown: the email field has aria-required but no native "required" attribute, so the browser does not block it, and the request is gated by hCaptcha.; Empty submission was not accepted, but no inline validation message was shown: the email field has aria-required but no native "required" attribute, so the browser does not block it, and the request is gated by hCaptcha.

<img src="evidence/fn-14-functional.png" alt="FN-14 screenshot" width="420">


### FN-15

**product quantity input does not allow 0 or negative values**

| Field | Value |
|---|---|
| Test case ID | FN-15 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@edge` `@P2` |
| Script | `tests/functional/edge-cases.spec.ts:13` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ⏭️ Skipped (1.5s) |

**Test steps**
1. Set the product page quantity to 0, then -1, and try to add to cart.

**Expected result**
- The input must be invalid (min 1) or nothing must be added.

<details><summary>Steps executed in this run (1)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (653ms)

</details>

**Actual result:** ⏭️ Not executed: Theme has no quantity selector on the product page (theme setting); covered at API level by API-10, API-12 and API-13

<img src="evidence/fn-15-functional.png" alt="FN-15 screenshot" width="420">


### FN-16

**non-numeric quantity is never added as a broken line**

| Field | Value |
|---|---|
| Test case ID | FN-16 |
| Pack | functional |
| Priority | P3 |
| Tags | `@functional` `@edge` `@P3` |
| Script | `tests/functional/edge-cases.spec.ts:32` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ⏭️ Skipped (1.5s) |

**Test steps**
1. Force the quantity field to "abc" and add to cart.

**Expected result**
- The cart must contain 0 or 1 items (never NaN or an error), with no server error.

<details><summary>Steps executed in this run (1)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (763ms)

</details>

**Actual result:** ⏭️ Not executed: Theme has no quantity selector on the product page (theme setting); covered at API level by API-10, API-12 and API-13

<img src="evidence/fn-16-functional.png" alt="FN-16 screenshot" width="420">


### FN-17

**requesting far more than is in stock is limited or rejected with a message**

| Field | Value |
|---|---|
| Test case ID | FN-17 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@edge` `@P2` |
| Script | `tests/functional/edge-cases.spec.ts:50` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ⏭️ Skipped (1.2s) |

**Test steps**
1. Set quantity to 99999 and add to cart.
2. Either an inventory error is shown, or the cart is capped.

**Expected result**
- No server error, and the store must not silently accept 99999 of a stock-tracked item.

<details><summary>Steps executed in this run (1)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (513ms)

</details>

**Actual result:** ⏭️ Not executed: Theme has no quantity selector on the product page (theme setting); covered at API level by API-10, API-12 and API-13

<img src="evidence/fn-17-functional.png" alt="FN-17 screenshot" width="420">


### FN-18

**adding the same product twice merges into one line**

| Field | Value |
|---|---|
| Test case ID | FN-18 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@edge` `@P1` `@regression` |
| Script | `tests/functional/edge-cases.spec.ts:75` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (3.8s) |

**Test steps**
1. Add the same variant twice from the product page.

**Expected result**
- The cart must have one line with quantity 2, not two separate lines.

<details><summary>Steps executed in this run (9)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (506ms)
2. ✓ `Click (ProductPage.ts:57)` (70ms)
3. ✓ `Navigate (fixtures.ts:55)` (432ms)
4. ✓ `Click (ProductPage.ts:57)` (59ms)
5. ✓ **Assert** `Expect "toHaveLength" (edge-cases.spec.ts:85)` (1ms)
6. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:86)` (0ms)
7. ✓ `Navigate (fixtures.ts:55)` (219ms)
8. ✓ **Assert** `Expect "toHaveCount" (edge-cases.spec.ts:88)` (24ms)
9. ✓ **Assert** `Expect "toHaveValue" (edge-cases.spec.ts:89)` (23ms)

</details>

**Actual result:** ✅ As expected. 4/4 assertions passed.

<img src="evidence/fn-18-functional.png" alt="FN-18 screenshot" width="420">


### FN-19

**cart with two different products shows both and the correct subtotal**

| Field | Value |
|---|---|
| Test case ID | FN-19 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@edge` `@P1` |
| Script | `tests/functional/edge-cases.spec.ts:92` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (2.6s) |

**Test steps**
1. Add two different products.

**Expected result**
- The cart page must list 2 lines and the subtotal must equal the sum of both prices.

<details><summary>Steps executed in this run (5)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (611ms)
2. ✓ `Navigate (fixtures.ts:55)` (368ms)
3. ✓ **Assert** `Expect "toHaveCount" (edge-cases.spec.ts:101)` (13ms)
4. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:103)` (1ms)
5. ✓ **Assert** `Expect "toContain" (edge-cases.spec.ts:105)` (1ms)

</details>

**Actual result:** ✅ As expected. 3/3 assertions passed.

<img src="evidence/fn-19-functional.png" alt="FN-19 screenshot" width="420">


### FN-20

**cart survives a page reload and opening a new tab**

| Field | Value |
|---|---|
| Test case ID | FN-20 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@edge` `@P1` |
| Script | `tests/functional/edge-cases.spec.ts:108` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (2.8s) |

**Test steps**
1. Add an item, reload the page, then open the cart in a new tab of the same browser session.

**Expected result**
- The item must still be there both times.

<details><summary>Steps executed in this run (7)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (575ms)
2. ✓ `Reload (edge-cases.spec.ts:115)` (400ms)
3. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:116)` (0ms)
4. ✓ `Create page (edge-cases.spec.ts:117)` (65ms)
5. ✓ `Navigate (edge-cases.spec.ts:118)` (664ms)
6. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:119)` (0ms)
7. ✓ `Close page (edge-cases.spec.ts:120)` (66ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/fn-20-functional.png" alt="FN-20 screenshot" width="420">


### FN-21

**double-clicking Add to cart adds only one item**

| Field | Value |
|---|---|
| Test case ID | FN-21 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@edge` `@P2` |
| Script | `tests/functional/edge-cases.spec.ts:123` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (13.7s) |

**Test steps**
1. Double-click Add to cart quickly.

**Expected result**
- The theme should block the second click while the first request is in flight, so the cart has 1 item.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (408ms)
2. ✓ `Double click (edge-cases.spec.ts:129)` (42ms)

</details>

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-21-functional.png" alt="FN-21 screenshot" width="420">


### FN-22

**invalid discount link does not change the cart total**

| Field | Value |
|---|---|
| Test case ID | FN-22 |
| Pack | functional |
| Priority | P3 |
| Tags | `@functional` `@edge` `@P3` |
| Script | `tests/functional/edge-cases.spec.ts:134` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (10.7s) |

**Test steps**
1. With an item in the cart, open /discount/NOT-A-REAL-CODE.

**Expected result**
- The page must not error, and the cart total must be unchanged.

<details><summary>Steps executed in this run (1)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (642ms)

</details>

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-22-functional.png" alt="FN-22 screenshot" width="420">


### FN-23

**sale product shows original and sale price everywhere**

| Field | Value |
|---|---|
| Test case ID | FN-23 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@edge` `@P2` |
| Script | `tests/functional/edge-cases.spec.ts:147` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (10.4s) |

**Test steps**
1. For a variant with a compare-at price, the product page must show both the sale price and the struck-through original price, and the cart must charge the sale price.

**Expected result**
- For a variant with a compare-at price, the product page must show both the sale price and the struck-through original price, and the cart must charge the sale price.

<details><summary>Steps executed in this run (4)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (379ms)
2. ✓ **Assert** `Expect "toBeVisible" (edge-cases.spec.ts:157)` (14ms)
3. ✓ **Assert** `Expect "toBeVisible" (edge-cases.spec.ts:158)` (11ms)
4. ✓ `Click (ProductPage.ts:57)` (61ms)

</details>

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-23-functional.png" alt="FN-23 screenshot" width="420">


### FN-24

**search escapes HTML and script input (no XSS)**

| Field | Value |
|---|---|
| Test case ID | FN-24 |
| Pack | functional |
| Priority | P1 |
| Tags | `@functional` `@edge` `@security` `@P1` |
| Script | `tests/functional/edge-cases.spec.ts:165` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (1.9s) |

**Test steps**
1. Search for a script/HTML payload.

**Expected result**
- The page must load, show the text literally, never run the script, and never open a dialog.

<details><summary>Steps executed in this run (5)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (561ms)
2. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:173)` (0ms)
3. ✓ **Assert** `Expect "toBeUndefined" (edge-cases.spec.ts:175)` (0ms)
4. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:176)` (0ms)
5. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:177)` (0ms)

</details>

**Actual result:** ✅ As expected. 4/4 assertions passed.

<img src="evidence/fn-24-functional.png" alt="FN-24 screenshot" width="420">


### FN-25

**very long search query is handled without errors**

| Field | Value |
|---|---|
| Test case ID | FN-25 |
| Pack | functional |
| Priority | P3 |
| Tags | `@functional` `@edge` `@P3` |
| Script | `tests/functional/edge-cases.spec.ts:180` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.7s) |

**Test steps**
1. Search for a 1,000-character string.

**Expected result**
- Expect a normal page (status below 500) with a no-results state.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (410ms)
2. ✓ **Assert** `Expect "toBeLessThan" (edge-cases.spec.ts:185)` (0ms)
3. ✓ **Assert** `Expect "toBeVisible" (edge-cases.spec.ts:186)` (22ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/fn-25-functional.png" alt="FN-25 screenshot" width="420">


### FN-26

**search ignores letter case and surrounding spaces**

| Field | Value |
|---|---|
| Test case ID | FN-26 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@edge` `@P2` |
| Script | `tests/functional/edge-cases.spec.ts:189` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.9s) |

**Test steps**
1. Search for a product name in UPPER CASE with leading and trailing spaces.

**Expected result**
- The product must still be found.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (580ms)
2. ✓ **Assert** `Expect "toBeVisible" (edge-cases.spec.ts:195)` (25ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/fn-26-functional.png" alt="FN-26 screenshot" width="420">


### FN-27

**product link with an invalid variant id falls back to a buyable variant**

| Field | Value |
|---|---|
| Test case ID | FN-27 |
| Pack | functional |
| Priority | P2 |
| Tags | `@functional` `@edge` `@P2` |
| Script | `tests/functional/edge-cases.spec.ts:200` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: 🚧 Blocked (10.3s) |

**Test steps**
1. Open /products/<handle>?variant=123 (not a real variant).

**Expected result**
- The page must load (200) and Add to cart must still work.

<details><summary>Steps executed in this run (4)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (514ms)
2. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:206)` (1ms)
3. ✓ **Assert** `Expect "toHaveText" (edge-cases.spec.ts:207)` (16ms)
4. ✓ `Click (ProductPage.ts:57)` (49ms)

</details>

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/fn-27-functional.png" alt="FN-27 screenshot" width="420">


### FN-28

**unknown collection returns 404**

| Field | Value |
|---|---|
| Test case ID | FN-28 |
| Pack | functional |
| Priority | P3 |
| Tags | `@functional` `@edge` `@P3` |
| Script | `tests/functional/edge-cases.spec.ts:212` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Functional: ✅ Passed (0.7s) |

**Test steps**
1. Open /collections/this-collection-does-not-exist.

**Expected result**
- Expect HTTP 404.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (390ms)
2. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:217)` (0ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/fn-28-functional.png" alt="FN-28 screenshot" width="420">


## Non-functional pack

### NF-01

**home page loads within performance budget**

| Field | Value |
|---|---|
| Test case ID | NF-01 |
| Pack | non-functional |
| Priority | P2 |
| Tags | `@non-functional` `@performance` `@P2` |
| Script | `tests/non-functional/performance.spec.ts:42` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (2.6s) |

**Test steps**
1. Measure TTFB (<1500ms), DOMContentLoaded (<4000ms), load (<8000ms), LCP (<4000ms) and transfer size (<4000KB).

**Expected result**
- Measure TTFB (<1500ms), DOMContentLoaded (<4000ms), load (<8000ms), LCP (<4000ms) and transfer size (<4000KB).

<details><summary>Steps executed in this run (6)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (539ms)
2. ✓ **Assert** `ttfbMs 7 exceeds budget 1500 (performance.spec.ts:53)` (0ms)
3. ✓ **Assert** `domContentLoadedMs 334 exceeds budget 4000 (performance.spec.ts:53)` (0ms)
4. ✓ **Assert** `loadMs 513 exceeds budget 8000 (performance.spec.ts:53)` (0ms)
5. ✓ **Assert** `lcpMs 344 exceeds budget 4000 (performance.spec.ts:53)` (0ms)
6. ✓ **Assert** `pageWeightKb 1191 exceeds budget 4000 (performance.spec.ts:53)` (0ms)

</details>

**Actual result:** ✅ As expected. 5/5 assertions passed. Measured: ttfbMs=7, domContentLoadedMs=334, loadMs=513, lcpMs=344, pageWeightKb=1191.

<img src="evidence/nf-01-non-functional.png" alt="NF-01 screenshot" width="420">


### NF-02

**collection page loads within performance budget**

| Field | Value |
|---|---|
| Test case ID | NF-02 |
| Pack | non-functional |
| Priority | P2 |
| Tags | `@non-functional` `@performance` `@P2` |
| Script | `tests/non-functional/performance.spec.ts:42` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (2.6s) |

**Test steps**
1. Measure TTFB (<1500ms), DOMContentLoaded (<4000ms), load (<8000ms), LCP (<4000ms) and transfer size (<4000KB).

**Expected result**
- Measure TTFB (<1500ms), DOMContentLoaded (<4000ms), load (<8000ms), LCP (<4000ms) and transfer size (<4000KB).

<details><summary>Steps executed in this run (6)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (533ms)
2. ✓ **Assert** `ttfbMs 7 exceeds budget 1500 (performance.spec.ts:53)` (0ms)
3. ✓ **Assert** `domContentLoadedMs 304 exceeds budget 4000 (performance.spec.ts:53)` (0ms)
4. ✓ **Assert** `loadMs 499 exceeds budget 8000 (performance.spec.ts:53)` (0ms)
5. ✓ **Assert** `lcpMs 284 exceeds budget 4000 (performance.spec.ts:53)` (0ms)
6. ✓ **Assert** `pageWeightKb 1197 exceeds budget 4000 (performance.spec.ts:53)` (1ms)

</details>

**Actual result:** ✅ As expected. 5/5 assertions passed. Measured: ttfbMs=7, domContentLoadedMs=304, loadMs=499, lcpMs=284, pageWeightKb=1197.

<img src="evidence/nf-02-non-functional.png" alt="NF-02 screenshot" width="420">


### NF-03

**product page loads within performance budget**

| Field | Value |
|---|---|
| Test case ID | NF-03 |
| Pack | non-functional |
| Priority | P2 |
| Tags | `@non-functional` `@performance` `@P2` |
| Script | `tests/non-functional/performance.spec.ts:42` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (2.7s) |

**Test steps**
1. Measure TTFB (<1500ms), DOMContentLoaded (<4000ms), load (<8000ms), LCP (<4000ms) and transfer size (<4000KB).

**Expected result**
- Measure TTFB (<1500ms), DOMContentLoaded (<4000ms), load (<8000ms), LCP (<4000ms) and transfer size (<4000KB).

<details><summary>Steps executed in this run (6)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (628ms)
2. ✓ **Assert** `ttfbMs 5 exceeds budget 1500 (performance.spec.ts:53)` (0ms)
3. ✓ **Assert** `domContentLoadedMs 418 exceeds budget 4000 (performance.spec.ts:53)` (0ms)
4. ✓ **Assert** `loadMs 601 exceeds budget 8000 (performance.spec.ts:53)` (0ms)
5. ✓ **Assert** `lcpMs 256 exceeds budget 4000 (performance.spec.ts:53)` (0ms)
6. ✓ **Assert** `pageWeightKb 1240 exceeds budget 4000 (performance.spec.ts:53)` (0ms)

</details>

**Actual result:** ✅ As expected. 5/5 assertions passed. Measured: ttfbMs=5, domContentLoadedMs=418, loadMs=601, lcpMs=256, pageWeightKb=1240.

<img src="evidence/nf-03-non-functional.png" alt="NF-03 screenshot" width="420">


### NF-04

**no JavaScript errors on key pages**

| Field | Value |
|---|---|
| Test case ID | NF-04 |
| Pack | non-functional |
| Priority | P2 |
| Tags | `@non-functional` `@P2` `@regression` |
| Script | `tests/non-functional/performance.spec.ts:58` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (2.8s) |

**Test steps**
1. Visit home, collection, product and cart pages.
2. No uncaught JavaScript errors may occur.

**Expected result**
- Visit home, collection, product and cart pages.
- No uncaught JavaScript errors may occur.

<details><summary>Steps executed in this run (5)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (620ms)
2. ✓ `Navigate (fixtures.ts:55)` (543ms)
3. ✓ `Navigate (fixtures.ts:55)` (538ms)
4. ✓ `Navigate (fixtures.ts:55)` (351ms)
5. ✓ **Assert** `Expect "toEqual" (performance.spec.ts:68)` (1ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/nf-04-non-functional.png" alt="NF-04 screenshot" width="420">


### NF-05

**no critical or serious WCAG 2.1 AA violations on key pages**

| Field | Value |
|---|---|
| Test case ID | NF-05 |
| Pack | non-functional |
| Priority | P2 |
| Tags | `@non-functional` `@a11y` `@P2` |
| Script | `tests/non-functional/accessibility-seo.spec.ts:11` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ❌ Failed (7.4s) |

**Test steps**
1. Run axe-core (WCAG 2.0/2.1 A + AA rules) on home, collection, product and cart pages.
2. No critical or serious violations allowed.

**Expected result**
- Run axe-core (WCAG 2.0/2.1 A + AA rules) on home, collection, product and cart pages.
- No critical or serious violations allowed.

<details><summary>Steps executed in this run (16)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (637ms)
2. ✓ `Create page (index.mjs:315)` (64ms)
3. ✓ `Close page (index.mjs:336)` (38ms)
4. ✗ **Assert** `/ (accessibility-seo.spec.ts:28)` (5ms)
5. ✓ `Navigate (fixtures.ts:55)` (602ms)
6. ✓ `Create page (index.mjs:315)` (73ms)
7. ✓ `Close page (index.mjs:336)` (36ms)
8. ✗ **Assert** `/collections/all (accessibility-seo.spec.ts:28)` (1ms)
9. ✓ `Navigate (fixtures.ts:55)` (525ms)
10. ✓ `Create page (index.mjs:315)` (82ms)
11. ✓ `Close page (index.mjs:336)` (31ms)
12. ✗ **Assert** `/products/the-collection-snowboard-liquid (accessibility-seo.spec.ts:28)` (1ms)
13. ✓ `Navigate (fixtures.ts:55)` (312ms)
14. ✓ `Create page (index.mjs:315)` (37ms)
15. ✓ `Close page (index.mjs:336)` (49ms)
16. ✓ **Assert** `/cart (accessibility-seo.spec.ts:28)` (0ms)

</details>

**Actual result:** ❌ Failed: Error: /

```
Error: /
expect(received).toEqual(expected) // deep equality
- Expected  - 1
+ Received  + 4
- Array []
+ Array [
+   "[serious] color-contrast: Elements must meet minimum color contrast ratio thresholds (1 element)
+     -> #NoMediaStandardBadge-template--22398821138593__featured_collection-8873174991009 | <span id=\"NoMediaStandardBadge-template--22398821138593__featured_collection-8873174991009\" class=\"badge badge--bottom-left color-accent-2\"> | Element has insufficient color contrast of 2.21 (foreground color: #ffffff, background color: #45c0b6, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
```

<img src="evidence/nf-05-non-functional.png" alt="NF-05 screenshot" width="420">


### NF-06

**all images have alt text**

| Field | Value |
|---|---|
| Test case ID | NF-06 |
| Pack | non-functional |
| Priority | P3 |
| Tags | `@non-functional` `@a11y` `@P3` |
| Script | `tests/non-functional/accessibility-seo.spec.ts:33` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (3.8s) |

**Test steps**
1. Every <img> on key pages must have an alt attribute (empty alt allowed for decorative images).

**Expected result**
- Every <img> on key pages must have an alt attribute (empty alt allowed for decorative images).

<details><summary>Steps executed in this run (8)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (1102ms)
2. ✓ **Assert** `/: images without alt (accessibility-seo.spec.ts:40)` (1ms)
3. ✓ `Navigate (fixtures.ts:55)` (499ms)
4. ✓ **Assert** `/collections/all: images without alt (accessibility-seo.spec.ts:40)` (0ms)
5. ✓ `Navigate (fixtures.ts:55)` (739ms)
6. ✓ **Assert** `/products/the-collection-snowboard-liquid: images without alt (accessibility-seo.spec.ts:40)` (0ms)
7. ✓ `Navigate (fixtures.ts:55)` (411ms)
8. ✓ **Assert** `/cart: images without alt (accessibility-seo.spec.ts:40)` (0ms)

</details>

**Actual result:** ✅ As expected. 4/4 assertions passed.

<img src="evidence/nf-06-non-functional.png" alt="NF-06 screenshot" width="420">


### NF-07

**key pages have title, meta description, canonical and social image**

| Field | Value |
|---|---|
| Test case ID | NF-07 |
| Pack | non-functional |
| Priority | P3 |
| Tags | `@non-functional` `@seo` `@P3` |
| Script | `tests/non-functional/accessibility-seo.spec.ts:46` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ❌ Failed (52.7s) |

**Test steps**
1. Home, collection and product pages need a <title>, meta description (20+ chars), canonical URL and og:image.

**Expected result**
- Home, collection and product pages need a <title>, meta description (20+ chars), canonical URL and og:image.

<details><summary>Steps executed in this run (15)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (643ms)
2. ✓ **Assert** `/: title (accessibility-seo.spec.ts:52)` (35ms)
3. ✗ **Assert** `/: meta description (accessibility-seo.spec.ts:53)` (10016ms)
4. ✓ **Assert** `/: canonical (accessibility-seo.spec.ts:54)` (10ms)
5. ✗ **Assert** `/: og:image (accessibility-seo.spec.ts:55)` (10010ms)
6. ✓ `Navigate (fixtures.ts:55)` (399ms)
7. ✓ **Assert** `/collections/all: title (accessibility-seo.spec.ts:52)` (49ms)
8. ✗ **Assert** `/collections/all: meta description (accessibility-seo.spec.ts:53)` (10022ms)
9. ✓ **Assert** `/collections/all: canonical (accessibility-seo.spec.ts:54)` (12ms)
10. ✗ **Assert** `/collections/all: og:image (accessibility-seo.spec.ts:55)` (10014ms)
11. ✓ `Navigate (fixtures.ts:55)` (414ms)
12. ✓ **Assert** `/products/the-collection-snowboard-liquid: title (accessibility-seo.spec.ts:52)` (91ms)
13. ✗ **Assert** `/products/the-collection-snowboard-liquid: meta description (accessibility-seo.spec.ts:53)` (10051ms)
14. ✓ **Assert** `/products/the-collection-snowboard-liquid: canonical (accessibility-seo.spec.ts:54)` (10ms)
15. ✓ **Assert** `/products/the-collection-snowboard-liquid: og:image (accessibility-seo.spec.ts:55)` (10ms)

</details>

**Actual result:** ❌ Failed: Error: /: meta description

```
Error: /: meta description
expect(locator).toHaveAttribute(expected) failed
Locator: locator('meta[name="description"]')
Expected pattern: /.{20,}/
Timeout: 10000ms
Error: element(s) not found
Call log:
  - /: meta description locator('meta[name="description"]') with timeout 10000ms
```

<img src="evidence/nf-07-non-functional.png" alt="NF-07 screenshot" width="420">


### NF-08

**product page has Product structured data with price**

| Field | Value |
|---|---|
| Test case ID | NF-08 |
| Pack | non-functional |
| Priority | P3 |
| Tags | `@non-functional` `@seo` `@P3` |
| Script | `tests/non-functional/accessibility-seo.spec.ts:59` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (1.1s) |

**Test steps**
1. Product page must include JSON-LD of @type Product with offers and a price, for Google rich results.

**Expected result**
- Product page must include JSON-LD of @type Product with offers and a price, for Google rich results.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (658ms)
2. ✓ **Assert** `No Product JSON-LD (accessibility-seo.spec.ts:67)` (1ms)
3. ✓ **Assert** `Expect "toMatch" (accessibility-seo.spec.ts:68)` (0ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/nf-08-non-functional.png" alt="NF-08 screenshot" width="420">


### NF-09

**HTTP redirects to HTTPS**

| Field | Value |
|---|---|
| Test case ID | NF-09 |
| Pack | non-functional |
| Priority | P1 |
| Tags | `@non-functional` `@edge` `@security` `@P1` |
| Script | `tests/non-functional/accessibility-seo.spec.ts:73` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (0.9s) |

**Test steps**
1. Requesting the store over http:// must end on an https:// URL.

**Expected result**
- Requesting the store over http:// must end on an https:// URL.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (492ms)
2. ✓ **Assert** `Expect "toMatch" (accessibility-seo.spec.ts:78)` (0ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/nf-09-non-functional.png" alt="NF-09 screenshot" width="420">


### NF-10

**security headers are present**

| Field | Value |
|---|---|
| Test case ID | NF-10 |
| Pack | non-functional |
| Priority | P2 |
| Tags | `@non-functional` `@security` `@P2` |
| Script | `tests/non-functional/accessibility-seo.spec.ts:81` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (0.9s) |

**Test steps**
1. Home page response must send HSTS, X-Content-Type-Options: nosniff, and clickjacking protection (CSP frame-ancestors or X-Frame-Options).

**Expected result**
- Home page response must send HSTS, X-Content-Type-Options: nosniff, and clickjacking protection (CSP frame-ancestors or X-Frame-Options).

<details><summary>Steps executed in this run (4)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (496ms)
2. ✓ **Assert** `Strict-Transport-Security (accessibility-seo.spec.ts:88)` (0ms)
3. ✓ **Assert** `X-Content-Type-Options (accessibility-seo.spec.ts:89)` (1ms)
4. ✓ **Assert** `CSP frame-ancestors or X-Frame-Options (accessibility-seo.spec.ts:91)` (0ms)

</details>

**Actual result:** ✅ As expected. 3/3 assertions passed.

<img src="evidence/nf-10-non-functional.png" alt="NF-10 screenshot" width="420">


### NF-11

**session and cart cookies are Secure and HttpOnly where applicable**

| Field | Value |
|---|---|
| Test case ID | NF-11 |
| Pack | non-functional |
| Priority | P2 |
| Tags | `@non-functional` `@security` `@P2` |
| Script | `tests/non-functional/accessibility-seo.spec.ts:94` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ❌ Failed (2.2s) |

**Test steps**
1. Preference cookies (e.g.
2. localization, cart_currency) are reported but not failed.

**Expected result**
- After adding to cart, cookies that identify the session or cart (cart, _shopify_essential, _shopify_s, _secure_session_id, storefront_digest) must have the Secure flag.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (949ms)
2. ✓ **Assert** `expected at least one session/cart cookie (accessibility-seo.spec.ts:107)` (0ms)
3. ✗ **Assert** `Session/cart cookies without Secure flag: cart (accessibility-seo.spec.ts:109)` (5ms)

</details>

**Actual result:** ❌ Failed: Error: Session/cart cookies without Secure flag: cart

```
Error: Session/cart cookies without Secure flag: cart
expect(received).toEqual(expected) // deep equality
- Expected  - 1
+ Received  + 3
- Array []
+ Array [
+   "cart",
+ ]
```

<img src="evidence/nf-11-non-functional.png" alt="NF-11 screenshot" width="420">


### NF-12

**unknown URLs return a proper 404 page**

| Field | Value |
|---|---|
| Test case ID | NF-12 |
| Pack | non-functional |
| Priority | P3 |
| Tags | `@non-functional` `@edge` `@P3` |
| Script | `tests/non-functional/accessibility-seo.spec.ts:114` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (0.9s) |

**Test steps**
1. A non-existent product URL must return HTTP 404 with a friendly page, not a server error.

**Expected result**
- A non-existent product URL must return HTTP 404 with a friendly page, not a server error.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (493ms)
2. ✓ **Assert** `Expect "toBe" (accessibility-seo.spec.ts:119)` (0ms)
3. ✓ **Assert** `Expect "toBeVisible" (accessibility-seo.spec.ts:120)` (32ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/nf-12-non-functional.png" alt="NF-12 screenshot" width="420">


### NF-13

**without the storefront password, pages redirect to the password page**

| Field | Value |
|---|---|
| Test case ID | NF-13 |
| Pack | non-functional |
| Priority | P1 |
| Tags | `@non-functional` `@edge` `@security` `@P1` |
| Script | `tests/non-functional/edge-cases.spec.ts:10` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (1.0s) |

**Test steps**
1. In a new session with no password cookie, open home, a product and the cart.

**Expected result**
- Each must redirect to /password and show the password form, not store content.

<details><summary>Steps executed in this run (9)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (239ms)
2. ✓ **Assert** `/ should redirect to /password (edge-cases.spec.ts:18)` (26ms)
3. ✓ **Assert** `/ password form (edge-cases.spec.ts:19)` (5ms)
4. ✓ `Navigate (fixtures.ts:55)` (258ms)
5. ✓ **Assert** `/products/the-collection-snowboard-liquid should redirect to /password (edge-cases.spec.ts:18)` (23ms)
6. ✓ **Assert** `/products/the-collection-snowboard-liquid password form (edge-cases.spec.ts:19)` (6ms)
7. ✓ `Navigate (fixtures.ts:55)` (230ms)
8. ✓ **Assert** `/cart should redirect to /password (edge-cases.spec.ts:18)` (24ms)
9. ✓ **Assert** `/cart password form (edge-cases.spec.ts:19)` (7ms)

</details>

**Actual result:** ✅ As expected. 6/6 assertions passed.

<img src="evidence/nf-13-non-functional.png" alt="NF-13 screenshot" width="420">


### NF-14

**product page is usable on a slow 3G connection**

| Field | Value |
|---|---|
| Test case ID | NF-14 |
| Pack | non-functional |
| Priority | P2 |
| Tags | `@non-functional` `@edge` `@performance` `@P2` |
| Script | `tests/non-functional/edge-cases.spec.ts:25` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (13.0s) |

**Test steps**
1. Throttle to slow 3G (400 ms latency, ~400 kbps).

**Expected result**
- The product page must show its title and an enabled Add to cart within 30 seconds.

<details><summary>Steps executed in this run (3)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (12527ms)
2. ✓ **Assert** `Expect "toBeVisible" (edge-cases.spec.ts:42)` (34ms)
3. ✓ **Assert** `Expect "toBeEnabled" (edge-cases.spec.ts:43)` (10ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed. Measured: usable after 12612ms on slow 3G.

<img src="evidence/nf-14-non-functional.png" alt="NF-14 screenshot" width="420">


### NF-15

**going offline during Add to cart fails cleanly and recovers**

| Field | Value |
|---|---|
| Test case ID | NF-15 |
| Pack | non-functional |
| Priority | P3 |
| Tags | `@non-functional` `@edge` `@P3` |
| Script | `tests/non-functional/edge-cases.spec.ts:47` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Non-functional: ✅ Passed (3.9s) |

**Test steps**
1. Load a product, go offline, click Add to cart.

**Expected result**
- Nothing may be added and the page must not break.
- Back online, Add to cart must work and give exactly 1 item.

<details><summary>Steps executed in this run (8)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (426ms)
2. ✓ `Set offline mode (edge-cases.spec.ts:55)` (2ms)
3. ✓ `Click (edge-cases.spec.ts:56)` (72ms)
4. ✓ `Set offline mode (edge-cases.spec.ts:58)` (1ms)
5. ✓ **Assert** `offline click must not add anything (edge-cases.spec.ts:60)` (0ms)
6. ✓ **Assert** `Expect "toBeVisible" (edge-cases.spec.ts:61)` (12ms)
7. ✓ `Click (ProductPage.ts:57)` (32ms)
8. ✓ **Assert** `Expect "toBe" (edge-cases.spec.ts:63)` (0ms)

</details>

**Actual result:** ✅ As expected. 3/3 assertions passed.

<img src="evidence/nf-15-non-functional.png" alt="NF-15 screenshot" width="420">


## API pack

### API-01

**GET /products/{handle}.js returns a valid product**

| Field | Value |
|---|---|
| Test case ID | API-01 |
| Pack | api |
| Priority | P1 |
| Tags | `@api` `@P1` `@regression` |
| Script | `tests/api/storefront-api.spec.ts:15` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.5s) |

**Test steps**
1. Fetch an in-stock product.

**Expected result**
- Expect 200, JSON with id/title/handle/variants, prices in cents, and a fast response.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-01-api.png" alt="API-01 screenshot" width="420">


### API-02

**catalogue data is complete (titles, prices, images, variants)**

| Field | Value |
|---|---|
| Test case ID | API-02 |
| Pack | api |
| Priority | P2 |
| Tags | `@api` `@P2` |
| Script | `tests/api/storefront-api.spec.ts:32` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: ✅ Passed (1.3s) |

**Test steps**
1. Every product in the catalogue must have a title, at least one variant, at least one image, and prices above zero.

**Expected result**
- Every product in the catalogue must have a title, at least one variant, at least one image, and prices above zero.

<details><summary>Steps executed in this run (60)</summary>

1. ✓ **Assert** `Expect "toBeGreaterThan" (storefront-api.spec.ts:37)` (0ms)
2. ✓ **Assert** `product 8873175515297 title (storefront-api.spec.ts:39)` (0ms)
3. ✓ **Assert** `the-collection-snowboard-liquid variants (storefront-api.spec.ts:40)` (0ms)
4. ✓ **Assert** `the-collection-snowboard-liquid has no images (storefront-api.spec.ts:41)` (0ms)
5. ✓ **Assert** `the-collection-snowboard-liquid / Default Title price (storefront-api.spec.ts:42)` (0ms)
6. ✓ **Assert** `product 8873175416993 title (storefront-api.spec.ts:39)` (0ms)
7. ✓ **Assert** `the-collection-snowboard-oxygen variants (storefront-api.spec.ts:40)` (0ms)
8. ✓ **Assert** `the-collection-snowboard-oxygen has no images (storefront-api.spec.ts:41)` (0ms)
9. ✓ **Assert** `the-collection-snowboard-oxygen / Default Title price (storefront-api.spec.ts:42)` (0ms)
10. ✓ **Assert** `product 8873175220385 title (storefront-api.spec.ts:39)` (0ms)
11. ✓ **Assert** `the-collection-snowboard-hydrogen variants (storefront-api.spec.ts:40)` (0ms)
12. ✓ **Assert** `the-collection-snowboard-hydrogen has no images (storefront-api.spec.ts:41)` (0ms)
13. ✓ **Assert** `the-collection-snowboard-hydrogen / Default Title price (storefront-api.spec.ts:42)` (0ms)
14. ✓ **Assert** `product 8873175384225 title (storefront-api.spec.ts:39)` (0ms)
15. ✓ **Assert** `the-multi-location-snowboard variants (storefront-api.spec.ts:40)` (0ms)
16. ✓ **Assert** `the-multi-location-snowboard has no images (storefront-api.spec.ts:41)` (0ms)
17. ✓ **Assert** `the-multi-location-snowboard / Default Title price (storefront-api.spec.ts:42)` (0ms)
18. ✓ **Assert** `product 8873175351457 title (storefront-api.spec.ts:39)` (0ms)
19. ✓ **Assert** `the-multi-managed-snowboard variants (storefront-api.spec.ts:40)` (0ms)
20. ✓ **Assert** `the-multi-managed-snowboard has no images (storefront-api.spec.ts:41)` (0ms)
21. ✓ **Assert** `the-multi-managed-snowboard / Default Title price (storefront-api.spec.ts:42)` (0ms)
22. ✓ **Assert** `product 8873175318689 title (storefront-api.spec.ts:39)` (0ms)
23. ✓ **Assert** `the-3p-fulfilled-snowboard variants (storefront-api.spec.ts:40)` (0ms)
24. ✓ **Assert** `the-3p-fulfilled-snowboard has no images (storefront-api.spec.ts:41)` (0ms)
25. ✓ **Assert** `the-3p-fulfilled-snowboard / Default Title price (storefront-api.spec.ts:42)` (0ms)
26. ✓ **Assert** `product 8873175187617 title (storefront-api.spec.ts:39)` (0ms)
27. ✓ **Assert** `the-complete-snowboard variants (storefront-api.spec.ts:40)` (0ms)
28. ✓ **Assert** `the-complete-snowboard has no images (storefront-api.spec.ts:41)` (0ms)
29. ✓ **Assert** `the-complete-snowboard / Ice price (storefront-api.spec.ts:42)` (0ms)
30. ✓ **Assert** `the-complete-snowboard / Dawn price (storefront-api.spec.ts:42)` (0ms)
31. ✓ **Assert** `the-complete-snowboard / Powder price (storefront-api.spec.ts:42)` (0ms)
32. ✓ **Assert** `the-complete-snowboard / Electric price (storefront-api.spec.ts:42)` (0ms)
33. ✓ **Assert** `the-complete-snowboard / Sunset price (storefront-api.spec.ts:42)` (0ms)
34. ✓ **Assert** `product 8873175089313 title (storefront-api.spec.ts:39)` (0ms)
35. ✓ **Assert** `selling-plans-ski-wax variants (storefront-api.spec.ts:40)` (0ms)
36. ✓ **Assert** `selling-plans-ski-wax has no images (storefront-api.spec.ts:41)` (0ms)
37. ✓ **Assert** `selling-plans-ski-wax / Selling Plans Ski Wax price (storefront-api.spec.ts:42)` (0ms)
38. ✓ **Assert** `selling-plans-ski-wax / Special Selling Plans Ski Wax price (storefront-api.spec.ts:42)` (0ms)
39. ✓ **Assert** `selling-plans-ski-wax / Sample Selling Plans Ski Wax price (storefront-api.spec.ts:42)` (0ms)
40. ✓ **Assert** `product 8873175056545 title (storefront-api.spec.ts:39)` (0ms)
41. ✓ **Assert** `the-videographer-snowboard variants (storefront-api.spec.ts:40)` (0ms)
42. ✓ **Assert** `the-videographer-snowboard has no images (storefront-api.spec.ts:41)` (0ms)
43. ✓ **Assert** `the-videographer-snowboard / Default Title price (storefront-api.spec.ts:42)` (0ms)
44. ✓ **Assert** `product 8873174991009 title (storefront-api.spec.ts:39)` (0ms)
45. ✓ **Assert** `the-compare-at-price-snowboard variants (storefront-api.spec.ts:40)` (0ms)
46. ✓ **Assert** `the-compare-at-price-snowboard has no images (storefront-api.spec.ts:41)` (0ms)
47. ✓ **Assert** `the-compare-at-price-snowboard / Default Title price (storefront-api.spec.ts:42)` (0ms)
48. ✓ **Assert** `product 8873175122081 title (storefront-api.spec.ts:39)` (0ms)
49. ✓ **Assert** `the-out-of-stock-snowboard variants (storefront-api.spec.ts:40)` (0ms)
50. ✓ **Assert** `the-out-of-stock-snowboard has no images (storefront-api.spec.ts:41)` (0ms)
51. ✓ **Assert** `the-out-of-stock-snowboard / Default Title price (storefront-api.spec.ts:42)` (0ms)
52. ✓ **Assert** `product 8873174925473 title (storefront-api.spec.ts:39)` (0ms)
53. ✓ **Assert** `the-inventory-not-tracked-snowboard variants (storefront-api.spec.ts:40)` (0ms)
54. ✓ **Assert** `the-inventory-not-tracked-snowboard has no images (storefront-api.spec.ts:41)` (0ms)
55. ✓ **Assert** `the-inventory-not-tracked-snowboard / Default Title price (storefront-api.spec.ts:42)` (0ms)
56. ✓ **Assert** `product 8873174892705 title (storefront-api.spec.ts:39)` (0ms)
57. ✓ **Assert** `gift-card variants (storefront-api.spec.ts:40)` (0ms)
58. ✓ **Assert** `gift-card has no images (storefront-api.spec.ts:41)` (0ms)
59. ✓ **Assert** `gift-card / $10 price (storefront-api.spec.ts:42)` (0ms)
60. ✓ **Assert** `gift-card / $25 price (storefront-api.spec.ts:42)` (0ms)

</details>

**Actual result:** ✅ As expected. 60/60 assertions passed.

<img src="evidence/api-02-api.png" alt="API-02 screenshot" width="420">


### API-03

**GET unknown product returns 404**

| Field | Value |
|---|---|
| Test case ID | API-03 |
| Pack | api |
| Priority | P2 |
| Tags | `@api` `@edge` `@P2` |
| Script | `tests/api/storefront-api.spec.ts:46` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.9s) |

**Test steps**
1. Fetch /products/<nonexistent>.js.

**Expected result**
- Expect HTTP 404.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-03-api.png" alt="API-03 screenshot" width="420">


### API-04

**predictive search API returns matching products**

| Field | Value |
|---|---|
| Test case ID | API-04 |
| Pack | api |
| Priority | P2 |
| Tags | `@api` `@P2` |
| Script | `tests/api/storefront-api.spec.ts:54` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.3s) |

**Test steps**
1. GET /search/suggest.json?q=<product word>.

**Expected result**
- Expect 200 and the product among suggested results.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-04-api.png" alt="API-04 screenshot" width="420">


### API-05

**POST /cart/add.js adds an item and totals are correct**

| Field | Value |
|---|---|
| Test case ID | API-05 |
| Pack | api |
| Priority | P1 |
| Tags | `@api` `@P1` `@regression` |
| Script | `tests/api/storefront-api.spec.ts:73` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.6s) |

**Test steps**
1. Add 2 of an in-stock variant.

**Expected result**
- Expect 200, cart item_count 2, and total_price = 2 x variant price (in cents).

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-05-api.png" alt="API-05 screenshot" width="420">


### API-06

**POST /cart/change.js updates quantity; 0 removes the line**

| Field | Value |
|---|---|
| Test case ID | API-06 |
| Pack | api |
| Priority | P1 |
| Tags | `@api` `@edge` `@P1` |
| Script | `tests/api/storefront-api.spec.ts:86` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.4s) |

**Test steps**
1. Add 1 item, change it to 3 (expect item_count 3), then to 0 (expect empty cart).

**Expected result**
- Add 1 item, change it to 3 (expect item_count 3), then to 0 (expect empty cart).

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-06-api.png" alt="API-06 screenshot" width="420">


### API-07

**POST /cart/clear.js empties the cart**

| Field | Value |
|---|---|
| Test case ID | API-07 |
| Pack | api |
| Priority | P2 |
| Tags | `@api` `@P2` |
| Script | `tests/api/storefront-api.spec.ts:99` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.4s) |

**Test steps**
1. Add an item, call /cart/clear.js.

**Expected result**
- Expect item_count 0.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-07-api.png" alt="API-07 screenshot" width="420">


### API-08

**adding an invalid variant is rejected with an error**

| Field | Value |
|---|---|
| Test case ID | API-08 |
| Pack | api |
| Priority | P2 |
| Tags | `@api` `@edge` `@P2` |
| Script | `tests/api/storefront-api.spec.ts:110` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.4s) |

**Test steps**
1. POST /cart/add.js with variant id 1.

**Expected result**
- Expect a 4xx status with an error description, and the cart unchanged.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-08-api.png" alt="API-08 screenshot" width="420">


### API-09

**adding a sold-out variant is rejected**

| Field | Value |
|---|---|
| Test case ID | API-09 |
| Pack | api |
| Priority | P1 |
| Tags | `@api` `@edge` `@P1` |
| Script | `tests/api/storefront-api.spec.ts:121` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.4s) |

**Test steps**
1. POST /cart/add.js with a sold-out variant.

**Expected result**
- Expect 422 and the cart unchanged.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-09-api.png" alt="API-09 screenshot" width="420">


### API-10

**negative quantity is rejected**

| Field | Value |
|---|---|
| Test case ID | API-10 |
| Pack | api |
| Priority | P3 |
| Tags | `@api` `@edge` `@P3` |
| Script | `tests/api/storefront-api.spec.ts:132` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.3s) |

**Test steps**
1. POST /cart/add.js with quantity -1.

**Expected result**
- Expect a 4xx status and the cart unchanged.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-10-api.png" alt="API-10 screenshot" width="420">


### API-11

**GET /cart.js returns the documented shape**

| Field | Value |
|---|---|
| Test case ID | API-11 |
| Pack | api |
| Priority | P3 |
| Tags | `@api` `@P3` |
| Script | `tests/api/storefront-api.spec.ts:142` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.4s) |

**Test steps**
1. GET /cart.js.

**Expected result**
- Expect token, item_count, total_price, currency and items[] fields.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-11-api.png" alt="API-11 screenshot" width="420">


### API-12

**quantity 0 on add is rejected or ignored**

| Field | Value |
|---|---|
| Test case ID | API-12 |
| Pack | api |
| Priority | P2 |
| Tags | `@api` `@edge` `@P2` |
| Script | `tests/api/edge-cases.spec.ts:11` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.9s) |

**Test steps**
1. POST /cart/add.js with quantity 0.

**Expected result**
- Expect a 4xx or a no-op; the cart must stay empty.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-12-api.png" alt="API-12 screenshot" width="420">


### API-13

**very large quantity is limited by stock or rejected**

| Field | Value |
|---|---|
| Test case ID | API-13 |
| Pack | api |
| Priority | P2 |
| Tags | `@api` `@edge` `@P2` |
| Script | `tests/api/edge-cases.spec.ts:21` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (11.1s) |

**Test steps**
1. POST /cart/add.js with quantity 999999.

**Expected result**
- Expect 422 with an inventory message, or the quantity capped.
- Never a 5xx.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-13-api.png" alt="API-13 screenshot" width="420">


### API-14

**malformed JSON body returns a 4xx, not a server error**

| Field | Value |
|---|---|
| Test case ID | API-14 |
| Pack | api |
| Priority | P2 |
| Tags | `@api` `@edge` `@P2` |
| Script | `tests/api/edge-cases.spec.ts:36` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (11.0s) |

**Test steps**
1. POST /cart/add.js with a broken JSON body.

**Expected result**
- Expect a 4xx status and the cart unchanged.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-14-api.png" alt="API-14 screenshot" width="420">


### API-15

**changing a line that is not in the cart returns a 4xx**

| Field | Value |
|---|---|
| Test case ID | API-15 |
| Pack | api |
| Priority | P3 |
| Tags | `@api` `@edge` `@P3` |
| Script | `tests/api/edge-cases.spec.ts:49` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (11.0s) |

**Test steps**
1. POST /cart/change.js for a variant id not in the cart.

**Expected result**
- Expect a 4xx and no items added.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-15-api.png" alt="API-15 screenshot" width="420">


### API-16

**/cart/update.js sets several line quantities at once**

| Field | Value |
|---|---|
| Test case ID | API-16 |
| Pack | api |
| Priority | P3 |
| Tags | `@api` `@edge` `@P3` |
| Script | `tests/api/edge-cases.spec.ts:60` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.9s) |

**Test steps**
1. Add two products, then POST /cart/update.js with new quantities for both (3 and 0).

**Expected result**
- Expect the first at 3 and the second removed.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-16-api.png" alt="API-16 screenshot" width="420">


### API-17

**string, decimal and missing ids are rejected cleanly**

| Field | Value |
|---|---|
| Test case ID | API-17 |
| Pack | api |
| Priority | P3 |
| Tags | `@api` `@edge` `@P3` |
| Script | `tests/api/edge-cases.spec.ts:74` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup); requests sent from inside the browser session |
| Result | API: 🚧 Blocked (10.9s) |

**Test steps**
1. POST /cart/add.js with id "abc", id 1.5 and no id at all.

**Expected result**
- Each must return a 4xx and leave the cart empty.

**Actual result:** 🚧 Not verified: Blocked by Shopify bot protection (HTTP 429 "Verifying your connection") before the test could check anything. Environment issue, not a store defect; re-run from CI or after a cool-down.

<img src="evidence/api-17-api.png" alt="API-17 screenshot" width="420">


## Regression pack

### REG-01

**browse → product → add to cart → checkout**

| Field | Value |
|---|---|
| Test case ID | REG-01 |
| Pack | regression |
| Priority | P1 |
| Tags | `@regression` `@P1` |
| Script | `tests/regression/critical-journeys.spec.ts:12` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Regression: ✅ Passed (7.0s) |

**Test steps**
1. Shopper journey: home → Catalog → open product → Add to cart → cart page → Checkout.
2. Stops at Shopify checkout; no payment entered.

**Expected result**
- Shopper journey: home → Catalog → open product → Add to cart → cart page → Checkout.
- Stops at Shopify checkout; no payment entered.

<details><summary>Steps executed in this run (17)</summary>

1. ✓ **Step** `Open home and go to the catalogue (critical-journeys.spec.ts:18)` (1787ms)
2. ✓ `Navigate (fixtures.ts:55)` (807ms)
3. ✓ `Click (critical-journeys.spec.ts:20)` (448ms)
4. ✓ **Assert** `Expect "toHaveURL" (critical-journeys.spec.ts:21)` (240ms)
5. ✓ **Step** `Open the product from the catalogue (critical-journeys.spec.ts:24)` (438ms)
6. ✓ `Click (critical-journeys.spec.ts:25)` (405ms)
7. ✓ **Assert** `Expect "toHaveURL" (critical-journeys.spec.ts:26)` (29ms)
8. ✓ **Step** `Add to cart (critical-journeys.spec.ts:30)` (1367ms)
9. ✓ `Click (ProductPage.ts:57)` (207ms)
10. ✓ **Assert** `Expect "toBe" (critical-journeys.spec.ts:32)` (1ms)
11. ✓ **Step** `Review cart (critical-journeys.spec.ts:35)` (663ms)
12. ✓ `Navigate (fixtures.ts:55)` (408ms)
13. ✓ **Assert** `Expect "toHaveCount" (critical-journeys.spec.ts:37)` (30ms)
14. ✓ **Assert** `Expect "toContainText" (critical-journeys.spec.ts:38)` (17ms)
15. ✓ **Step** `Proceed to checkout (critical-journeys.spec.ts:41)` (678ms)
16. ✓ `Click (critical-journeys.spec.ts:42)` (234ms)
17. ✓ **Assert** `Expect "toHaveURL" (critical-journeys.spec.ts:43)` (414ms)

</details>

**Actual result:** ✅ As expected. 6/6 assertions passed.

<img src="evidence/reg-01-regression.png" alt="REG-01 screenshot" width="420">


### REG-02

**search → product → add to cart**

| Field | Value |
|---|---|
| Test case ID | REG-02 |
| Pack | regression |
| Priority | P1 |
| Tags | `@regression` `@P1` |
| Script | `tests/regression/critical-journeys.spec.ts:47` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Regression: ✅ Passed (5.8s) |

**Test steps**
1. Shopper journey via search: search for a product, open it from results, add to cart.

**Expected result**
- Shopper journey via search: search for a product, open it from results, add to cart.

<details><summary>Steps executed in this run (8)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (876ms)
2. ✓ `Click (BasePage.ts:52)` (71ms)
3. ✓ `Fill "The Collection Snowboard: Liquid" (critical-journeys.spec.ts:54)` (78ms)
4. ✓ `Press "Enter" (critical-journeys.spec.ts:55)` (396ms)
5. ✓ `Click (critical-journeys.spec.ts:58)` (629ms)
6. ✓ **Assert** `Expect "toHaveURL" (critical-journeys.spec.ts:59)` (344ms)
7. ✓ `Click (ProductPage.ts:57)` (165ms)
8. ✓ **Assert** `Expect "toBe" (critical-journeys.spec.ts:61)` (0ms)

</details>

**Actual result:** ✅ As expected. 2/2 assertions passed.

<img src="evidence/reg-02-regression.png" alt="REG-02 screenshot" width="420">


### REG-03

**home page above the fold matches baseline**

| Field | Value |
|---|---|
| Test case ID | REG-03 |
| Pack | regression |
| Priority | P2 |
| Tags | `@regression` `@visual` `@P2` |
| Script | `tests/regression/critical-journeys.spec.ts:69` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Regression: ✅ Passed (5.7s) |

**Test steps**
1. Screenshot the top of the home page and compare it with the approved baseline.

**Expected result**
- Screenshot the top of the home page and compare it with the approved baseline.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (622ms)
2. ✓ **Assert** `Expect "toHaveScreenshot(home.png)" (critical-journeys.spec.ts:75)` (436ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/reg-03-regression.png" alt="REG-03 screenshot" width="420">


### REG-04

**product page matches baseline**

| Field | Value |
|---|---|
| Test case ID | REG-04 |
| Pack | regression |
| Priority | P2 |
| Tags | `@regression` `@visual` `@P2` |
| Script | `tests/regression/critical-journeys.spec.ts:78` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Regression: ✅ Passed (5.0s) |

**Test steps**
1. Screenshot the product page top section and compare it with the approved baseline.

**Expected result**
- Screenshot the product page top section and compare it with the approved baseline.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (564ms)
2. ✓ **Assert** `Expect "toHaveScreenshot(product.png)" (critical-journeys.spec.ts:85)` (356ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/reg-04-regression.png" alt="REG-04 screenshot" width="420">


### REG-05

**empty cart page matches baseline**

| Field | Value |
|---|---|
| Test case ID | REG-05 |
| Pack | regression |
| Priority | P3 |
| Tags | `@regression` `@visual` `@P3` |
| Script | `tests/regression/critical-journeys.spec.ts:88` |
| Preconditions | Storefront password entered; product catalogue loaded (global setup) |
| Result | Regression: ✅ Passed (4.6s) |

**Test steps**
1. Screenshot the empty cart page and compare it with the approved baseline.

**Expected result**
- Screenshot the empty cart page and compare it with the approved baseline.

<details><summary>Steps executed in this run (2)</summary>

1. ✓ `Navigate (fixtures.ts:55)` (374ms)
2. ✓ **Assert** `Expect "toHaveScreenshot(cart-empty.png)" (critical-journeys.spec.ts:94)` (227ms)

</details>

**Actual result:** ✅ As expected. 1/1 assertions passed.

<img src="evidence/reg-05-regression.png" alt="REG-05 screenshot" width="420">

