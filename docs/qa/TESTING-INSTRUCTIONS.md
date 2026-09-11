# Testing instructions (for hired QA)

Hand this document to every tester with the **URL**, **which client** (for example Sun Pool), and whether they may use **admin** and **live lead** credentials.

Machine checks (`npm run gate`) catch *broken* markup. QA exists to catch *wrong* facts, dead customer paths, and “it works on my laptop” defects.

---

## 1. What you are testing

This is a **store website** (hot tubs / spas and similar). Customers browse inventory, call or text the shop, and submit a short quiz so the business can send pricing.

Typical public routes:

| Route | Purpose |
|---|---|
| `/` | Homepage (hero, lead card, sections) |
| `/hot-tubs`, `/swim-spas`, … | Category listings (only categories this client sells) |
| `/hot-tubs/{slug}` | Product detail |
| `/inventory` | All in-stock units |
| `/find-your-match` | Full-page quiz |
| `/visit-us` | Address, hours, map, directions |
| `/financing` | Financing terms **or** 404 if this client has none |
| `/privacy-policy` | Legal |
| `/thank-you` | After a successful lead |
| `/lp/{slug}` | Paid ads landing (no main nav) |
| `/admin/` | Inventory admin — **never** linked from the public site |

There is **one** header, **one** footer, and **one** quiz. If the menu works on Home and fails on Visit Us, that is a P1.

---

## 2. Before you start

Ask the hiring manager for:

1. **Base URL** (preview or production). Never invent one.
2. **Client facts sheet**: legal name, phone, address, hours, founding year, categories they actually sell, service areas.
3. **Whether leads are live**: preview vs production CRM (GoHighLevel). If live, use **test name/email/phone** they provide — never your personal number unless they say so.
4. **Admin password** only if you are assigned admin testing. Do not request it otherwise.
5. **Paid landing slugs** if any (`/lp/...`).
6. **Devices required** (default matrix below if they do not specify).

Confirm the site is **not** showing a red **TEMPLATE MODE** banner and not using placeholder facts (555 numbers, example.com, Null Island). If it is, **stop public testing** and report immediately.

---

## 3. How to work

- Test **like a customer first**, then like a skeptic (wrong URLs, empty states, double-tap submit).
- Complete one **area** of the checklist, then file bugs, then continue. Do not batch 40 issues in your head.
- **Every bug needs a URL.** “The button is broken” is not a report.
- If a defect appears on more than one page, say so (same header/footer/quiz = likely one root cause).
- Do not “fix” copy you think is ugly. Report it. Truth of facts (year, phone, prices) is in scope; taste is only in scope if it blocks use (unreadable text, overlapping buttons).
- Do not scrape, brute-force admin, or test security beyond: “admin is not linked from the footer” and “wrong password is rejected.”

### Pass / fail

- **Pass** = you performed the step and the expected result happened.
- **Fail** = file a bug; leave the checklist item unchecked and put the bug ID next to it.
- **Blocked** = you could not run the step (no admin access, CRM not connected). Say what blocked you.

---

## 4. Device and browser matrix

Run the **smoke pass** (section 6) on every cell. Run the **full checklist** on at least one desktop and one real phone.

| | Chrome | Safari | Firefox | Edge |
|---|---|---|---|---|
| Desktop ~1440px | Required | macOS if available | Nice to have | Windows required |
| Tablet ~768px | Required | iPad if available | — | — |
| Phone ~390px | Android Chrome required | **iPhone Safari required** | — | — |

Facebook in-app browser (iOS) is the highest-risk form traffic. If you can open the URL from a Facebook ad preview or Messenger, do the quiz there once.

**Always** test:

- Mobile **hamburger**: tap to open, tap a link, tap overlay/close, confirm body does not stay locked from scrolling.
- Header **Call** (`tel:`) and **Text** (`sms:`) on a real phone.
- Form **autofill** for name, phone, email on iPhone Safari.

---

## 5. Severity (use these labels)

| Severity | Meaning | Examples |
|---|---|---|
| **S1 — Blocker** | Customer cannot enquire, call, or trust the business | Quiz never submits; thank-you never appears; all phones untappable; site down; TEMPLATE MODE on a live URL |
| **S2 — High** | Major path broken or false | Wrong phone/address; hamburger dead on some pages; lead saved but user sees an error; sold unit looks buyable as new; financing rate with no disclaimer |
| **S3 — Medium** | Workaround exists | Broken product image; 404 copy is branded but a nav label is wrong; map pin slightly off |
| **S4 — Low** | Polish | Alignment, hover, minor copy typo that does not change meaning |

If you are unsure, pick the **higher** severity.

---

## 6. Smoke pass (15–20 minutes)

Do this at the start of every build/URL you are given.

1. Home loads; logo visible; no TEMPLATE banner.
2. Click **every** header link; each goes where the label says.
3. Repeat every header link from the **mobile menu**.
4. Tap/click the header phone — it is a `tel:` link, not selected text.
5. Primary CTA (for example “Shop Inventory”) reaches `/inventory`.
6. Open one category, one product, `/visit-us`, `/find-your-match`, `/privacy-policy`.
7. Submit the quiz with the test contact (if allowed) and land on `/thank-you`.
8. Footer: no **Admin** link; social icons open real profiles; map iframe shows the shop; privacy link works.
9. Visit a garbage URL (e.g. `/this-page-does-not-exist`) — branded 404, useful next steps, same phone number.

If smoke fails, **do not** spend hours on visual polish. File S1/S2 and wait.

---

## 7. Lead / quiz testing (critical path)

The quiz is two steps: **pick a category** (or “Just browsing”), then **name / phone / email**.

### Happy path

1. Prefer a campaign URL when asked to test ads:

   `https://{site}/find-your-match?utm_source=facebook&utm_campaign=qa&fbclid=QA-TEST-001`

2. Choose a category this client **sells**. Confirm the form shows “Looking at: {that label}” and that **Change** returns to step 1.
3. Fill name, phone (10+ digits), email. Optional message is optional.
4. Submit once. Button should show **Sending…** and disable (no double posts).
5. You land on `/thank-you?ref=...`.
6. If CRM testing is in scope: contact appears in GoHighLevel with tags such as `website-lead`, category tag, and UTM/source fields. Ask the operator to confirm — testers often cannot see GHL.
7. Thank-you still offers a working **Call** link.

### Negative and edge

| Test | Expected |
|---|---|
| Submit empty required fields | Stays on form; does not hit thank-you |
| Email without `@` | Error or browser validation; no thank-you |
| Phone with fewer than 10 digits | Rejected with a clear error and a call link |
| Double-click submit | One lead, or second request is harmless — not two identical CRM contacts from one click |
| “Just browsing” | Lead still captured; not tagged as a category they do not sell |
| Quiz on homepage **and** `/find-your-match` | Both submit; `source_page` should differ (operator/CRM) |
| Quiz on a **product** page | Lead associated with that product if CRM is in scope |
| Fill the hidden “Company” field | Do **not** do this unless asked (honeypot). Humans should never see it. |

Do **not** paste real customer PII into tickets. Mask phone/email in screenshots.

---

## 8. Inventory and products

Public catalog should only show statuses **available**, **pending**, and **sold**. **Draft** and **hidden** must not appear on `/inventory` or category pages.

| Check | Expected |
|---|---|
| Listing vs detail price | Same cash and monthly strings (or both “Ask for current pricing”) |
| Pending / sold | Clearly labelled; look muted, not like a fresh “buy now” |
| Quantity 1 available | “Last one” (or equivalent badge) consistent on card and detail |
| Images | Main + gallery load; no broken icons; alt text is the product or business name, not empty |
| Wrong category in URL (product in hot-tubs opened under swim-spas) | 404 “not on the floor” |
| Category this client does **not** sell (e.g. `/saunas` if they do not sell saunas) | 404, and **no** nav or 404-page button advertising it |

If the database is not connected, inventory should show a **configured empty/error message**, not a blank crash or a 500 page.

---

## 9. Admin (only if assigned)

`/admin/` is typed in the address bar. It must **not** appear in the footer, header, or sitemap.

1. Logged-out view: login form only — **no** product table.
2. Wrong password: error, still logged out.
3. Right password: product list loads.
4. Create a product as **draft** — confirm it is **absent** from the public site.
5. Set **available** — it appears in the right category and `/inventory`.
6. Image: upload under 6 MB JPG/PNG/WEBP/GIF; public page shows it.
7. Sign out; refresh `/admin/` — logged out again.

Do not delete live inventory unless given a disposable test product.

---

## 10. Paid landing pages (`/lp/...`)

If slugs are provided:

- Page has an **advertorial / advertising** disclosure at the top.
- **No** full site nav (by design — ads should not leak to `/inventory` before convert).
- Form still submits to thank-you.
- View source / inspector: `noindex`.
- Phone still works.
- Footnotes/disclosures at the bottom are readable.

---

## 11. Accessibility and layout (minimum)

Not a full WCAG audit unless contracted. Still fail:

- Text over busy photos with contrast so low you cannot read the headline.
- Buttons or links smaller than ~44px on mobile, or overlapping the hamburger.
- Focus outline completely missing when tabbing the quiz (desktop).
- Horizontal scroll on a 390px-wide phone on Home, Inventory, Find Your Match, Visit Us.
- Map iframe with no title, or social links with no accessible name.

---

## 12. How to file a bug

Use **one ticket per defect**. Title format:

`[S2] [mobile Safari] Quiz submit stays on Sending… — /find-your-match`

Body must include:

1. **URL** (full, including query string if relevant).
2. **Device / OS / browser / viewport**.
3. **Steps** numbered from a cold load (or “cookies cleared”).
4. **Expected** vs **actual**.
5. **Screenshot or short video** (required for visual and layout bugs).
6. **Console errors** (F12 → Console), if any.
7. **Severity** from section 5.
8. **Happens on** which pages (one page vs all pages with header).

Template: [BUG-REPORT-TEMPLATE.md](./BUG-REPORT-TEMPLATE.md).

---

## 13. What “done” means for a pass

A testing cycle is complete when:

- Smoke pass is green on the required matrix.
- Full [CHECKLIST.md](./CHECKLIST.md) is filled (pass / fail+ticket / blocked).
- All S1 and S2 bugs are filed; S3/S4 filed or listed as deferred with the manager’s OK.
- At least **one** successful test lead is confirmed by the operator (or explicitly marked blocked).
- You listed **content truth** issues separately (wrong year, leftover client name, category they do not sell) — these ship even when the site “works.”

---

## 14. Out of scope unless asked

- Load / penetration testing.
- Changing production inventory or CRM automations.
- Deploying, merging code, or running `wrangler` / gate (operators).
- Pixel / Zaraz configuration in Cloudflare (operators). If leads duplicate in Meta Ads Manager, report the symptom; do not reconfigure tags.
