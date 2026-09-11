# QA checklist

Tester: __________________  
Build / URL: __________________  
Client: __________________  
Date: __________________  
Browsers/devices used: __________________

Mark **P** (pass), **F** (fail — bug ID), or **B** (blocked).

Copy this file per cycle (or tick in your tracker). Do not leave items blank.

Related: [TESTING-INSTRUCTIONS.md](./TESTING-INSTRUCTIONS.md).

---

## A. Launch / truth (human-only — automation will not catch these)

| # | Check | P/F/B | Bug |
|---|---|---|---|
| A1 | No TEMPLATE MODE banner on this URL | | |
| A2 | Business **name** matches the client (header, footer, titles, quiz consent) | | |
| A3 | **Phone** is this client’s number everywhere (header, footer, visit us, quiz errors, thank-you, inventory empty state) | | |
| A4 | Phone is always a tappable `tel:` link, never plain text | | |
| A5 | **Address** and city/region match the client; map pin is the shop | | |
| A6 | **Hours** match the client (Visit Us + footer + Find Your Match sidebar) | | |
| A7 | **Founded / “since {year}”** and copyright year are consistent and true | | |
| A8 | **Categories in nav** are only things this client sells (no leftover saunas, chairs, etc.) | | |
| A9 | Homepage / section copy does not mention products or towns from **another** client | | |
| A10 | Nav **labels** match what this client calls things (one label per destination) | | |
| A11 | Service-area chips / towns are places they actually serve | | |
| A12 | Logos: header (light bar) readable; drawer + footer **knockout/light** logo readable on dark | | |
| A13 | Favicon loads | | |
| A14 | Nothing internal visible: no `/admin` link, no “TODO”, no “CONFIRM”, no staging passwords | | |

---

## B. Header, footer, global chrome

| # | Check | P/F/B | Bug |
|---|---|---|---|
| B1 | Desktop: every nav item + primary CTA | | |
| B2 | Mobile: hamburger opens/closes; links work on Home | | |
| B3 | Mobile hamburger works on Inventory, a category page, a product page, Find Your Match, Visit Us, Privacy | | |
| B4 | Active nav state looks correct on the current page | | |
| B5 | Header **Text** uses `sms:` and opens the messenger on a phone | | |
| B6 | Header CTA label and destination match (e.g. Shop Inventory → `/inventory`) | | |
| B7 | Footer **Quick links** match header destinations (same labels) | | |
| B8 | Footer **legal** includes Privacy Policy and it works | | |
| B9 | Social icons: only real networks; each opens the correct profile (`target=_blank`) | | |
| B10 | Footer map iframe loads; **Get directions** (Visit Us) opens maps to the same address | | |
| B11 | No horizontal overflow at 390px and 1440px on Home | | |

---

## C. Homepage

| # | Check | P/F/B | Bug |
|---|---|---|---|
| C1 | Hero headline/subhead readable on mobile and desktop | | |
| C2 | Hero / announcement links go to the stated pages | | |
| C3 | Lead card quiz: category step → form → submit (if leads allowed) | | |
| C4 | Images (hero, showroom, product shots) load, not stretched or 1px | | |
| C5 | Buttons have enough tap space; gold/primary CTAs visible | | |
| C6 | Page does not jump wildly while images load | | |

---

## D. Inventory and categories

| # | Check | P/F/B | Bug |
|---|---|---|---|
| D1 | `/inventory` lists units or a clear empty/unconfigured message (never a crash) | | |
| D2 | Category jump links (if more than one category) match counts roughly | | |
| D3 | Each enabled category URL (e.g. `/hot-tubs`) lists only that category | | |
| D4 | Product cards: name, image, price/monthly or “Ask for current pricing” | | |
| D5 | Card click opens the matching detail URL | | |
| D6 | **Draft** products not on public listing | | |
| D7 | **Hidden** products not on public listing | | |
| D8 | **Sold** / **pending** still visible but clearly labelled and muted | | |
| D9 | Disabled category URL 404s and is not in nav or 404 shortcuts | | |

---

## E. Product detail

| # | Check | P/F/B | Bug |
|---|---|---|---|
| E1 | Title, description, badges match the listing card | | |
| E2 | Cash / monthly / ask-for-price **identical** to the card | | |
| E3 | Gallery thumbs switch the main image (if present) | | |
| E4 | Breadcrumbs: Home → category → product; all work | | |
| E5 | Quiz on the page submits; thank-you works | | |
| E6 | Related products (if any) stay in the same category and load | | |
| E7 | Fake slug `/hot-tubs/not-a-real-unit` → branded 404 | | |
| E8 | Product in the wrong category segment → 404 | | |

---

## F. Find Your Match, financing, visit, legal, thank-you

| # | Check | P/F/B | Bug |
|---|---|---|---|
| F1 | `/find-your-match`: quiz hydrates (options clickable, not a dead heading) | | |
| F2 | Quiz options = enabled categories + Just browsing — nothing extra | | |
| F3 | Sidebar hours + call link match the rest of the site | | |
| F4 | Browse-instead links match enabled categories | | |
| F5 | `/visit-us`: address, hours, directions, phone, email (if published), quiz | | |
| F6 | `/financing`: if client has financing, terms + **visible disclaimer** + quiz; apply URL (if any) opens lender | | |
| F7 | `/financing`: if client has **no** financing, page is 404 and **not** in nav | | |
| F8 | `/privacy-policy`: readable on mobile; contact phone/email match | | |
| F9 | `/thank-you`: loads with or without `?ref=`; call CTA works | | |
| F10 | Direct visit to `/thank-you` without submitting is acceptable (no crash) | | |

---

## G. Lead form quality

| # | Check | P/F/B | Bug |
|---|---|---|---|
| G1 | Labels present for name, phone, email | | |
| G2 | iPhone Safari autofill fills name / tel / email | | |
| G3 | Invalid email blocked | | |
| G4 | Short/invalid phone blocked with error + call link | | |
| G5 | Submit disabled while Sending… | | |
| G6 | Network failure (offline) shows error, not a silent thank-you | | |
| G7 | Consent line names the **this** business | | |
| G8 | After success, campaign URL test lead confirmed in CRM **or** marked B | | |
| G9 | Second submit in same browser updates the same enquiry (no obvious duplicate flood) — operator may confirm | | |

---

## H. 404 and SEO hygiene (spot check)

| # | Check | P/F/B | Bug |
|---|---|---|---|
| H1 | Random path: branded 404, working next-step buttons | | |
| H2 | `/admin/` not listed in `/sitemap-index.xml` or `/sitemap-0.xml` (or equivalent) | | |
| H3 | `/lp/` URLs (if any) not in the public sitemap | | |
| H4 | Homepage `<title>` and meta description are client-specific, not “Template” | | |
| H5 | Open Graph image (if any) loads when sharing a product URL in Slack/iMessage | | |

---

## I. Paid landing (`/lp/{slug}`) — skip if none

| # | Check | P/F/B | Bug |
|---|---|---|---|
| I1 | Advertising / advertorial label visible at top | | |
| I2 | No main site nav / footer sitemap | | |
| I3 | Logo present; phone or form can convert | | |
| I4 | Lead submit → thank-you | | |
| I5 | Disclosures/footnotes readable | | |
| I6 | `noindex` in document head | | |

---

## J. Admin — skip if not assigned

| # | Check | P/F/B | Bug |
|---|---|---|---|
| J1 | URL not linked from public pages | | |
| J2 | Logged out: no product data in HTML | | |
| J3 | Bad password rejected | | |
| J4 | Good password: list loads | | |
| J5 | Create draft → absent on public site | | |
| J6 | Publish available → appears in correct category | | |
| J7 | Edit name/price → listing and detail agree | | |
| J8 | Image upload appears on the public product page | | |
| J9 | Logout works | | |

---

## K. Cross-cutting visual / a11y smoke

| # | Check | P/F/B | Bug |
|---|---|---|---|
| K1 | No overlapping header vs hero on mobile | | |
| K2 | Quiz options readable and tappable (2-col mobile / 3-col desktop) | | |
| K3 | Keyboard: tab through quiz fields on desktop | | |
| K4 | Reduced: no console errors on Home, Inventory, Find Your Match | | |
| K5 | Print not required; skip unless asked | | |

---

## Sign-off

Smoke pass completed on required devices: **Yes / No**

S1 open: _____ S2 open: _____ S3/S4 open: _____

Operator confirmed test lead in CRM: **Yes / No / N/A**

Tester signature / date: __________________
