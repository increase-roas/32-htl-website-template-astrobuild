# Hot Tub Store Website Template

A reusable Astro 6 template that generates client store sites. **This repo is the template, not a client site.**

The template exists to make one class of bug structurally impossible: the same fact drifting across many files. Everything a client site needs to know about itself lives in exactly one place — `src/config/client.config.ts`.

---

## THE ONE LAW

**One fact lives in ONE place.**

Name, phone, founding year, address, hours, nav links, labels, logos, colours, categories, social URLs — each exists exactly once, in the config. Every page reads it. Anything computable from those facts (the `tel:` href, the display phone number, the formatted address, the map embed, the directions link, years in business, `sameAs`) is **derived**, not stored, so a derived value can never disagree with its source.

If you ever see the same fact typed into two files, **that is the bug**. Fix the source, not the copies.

---

## Build a client site

```bash
npm install
npm run client:use sun-pool     # or: copy any clients/*.config.ts over src/config/client.config.ts
npm run build
```

That is the whole operation. No component, page, layout, stylesheet or API route changes between clients.

The repo ships with a **placeholder** config (`deployMode: 'template'`), so a fresh clone renders obviously-fake facts and a red TEMPLATE MODE banner. The deploy gate refuses to ship anything still in template mode — that is what keeps placeholder text off a live site.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with Cloudflare bindings |
| `npm run build` | Production build. **Validates the config first** — an invalid config fails the build with a plain-English list of what is wrong |
| `npm run check` | Type-check every `.astro` and `.ts` file |
| `npm run client:use <name>` | Make `clients/<name>.config.ts` the active config |
| `npm run preview` | Run the built Worker locally via Wrangler |
| `npm run deploy` | Deploy to Cloudflare Workers (**operator only**) |

---

## Stack (locked — do not substitute)

| Layer | Choice |
|---|---|
| Framework | Astro 6 (`6.4.8`) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` |
| Islands | React — interactive components only |
| Deploy target | Cloudflare **Workers** via `@astrojs/cloudflare` **v13** |
| Database | Cloudflare D1 |
| Storage | Cloudflare R2 |
| CRM | GoHighLevel (native `/api/lead`) |
| Tag manager | Cloudflare Zaraz |

### Two pinning rules that matter

**1. `vite` is pinned to `7.3.6` in `devDependencies` and `overrides`. Do not remove it.**

Astro 6 runs on Vite 7. `@tailwindcss/vite` declares Vite as a *peer* with range `^5 || ^6 || ^7 || ^8`, so npm happily installs Vite **8** and hoists it to the root while Astro keeps a nested Vite 7. Two Vite copies break the SSR dependency optimiser with a baffling `require_dist is not a function` at build time. The pin plus the override guarantees exactly one Vite. Verify any time dependencies change:

```bash
npm ls vite     # every line should say 7.3.6
```

**2. Do not use `@astrojs/tailwind`.** It peers to Astro ≤5 and Tailwind 3, and will not work here. Tailwind is wired through `@tailwindcss/vite` in `astro.config.ts`.

Astro **7** and `@astrojs/cloudflare` **v14** now exist. This template deliberately stays on 6/v13 — the locked stack — rather than grabbing latest. Upgrading is a separate, deliberate project.

---

## Where things live

```
src/config/schema.ts        The contract. Zod schema — enforcement, not documentation.
src/config/categories.ts    Catalog of every category the TEMPLATE supports.
src/config/client.config.ts THE active client config. The one source of truth.
src/config/index.ts         Validates the config, exposes `site` + `derived`.
clients/*.config.ts         Example / per-client configs. Never imported by components.
src/components/BrandTokens.astro  The only bridge from config colours to CSS.
src/components/Header.astro The ONE header. Contains the drawer AND its script.
src/components/Footer.astro The ONE footer. Contains no admin markup at all.
src/components/SocialIcon.astro   Glyph lookup, keyed by config social names.
src/layouts/BaseLayout.astro      Mounts Header + Footer for every page.
src/styles/theme.css        Exact port of the live design system. Zero hex codes.
src/styles/global.css       Tailwind token bridge. Zero hex codes.
src/lib/db.ts               The ONLY way products are read. Filters by config.
src/pages/api/inventory.ts  Public read-only inventory API.
db/schema.sql               D1 tables: categories, products, leads, lead_events,
                            admin_sessions.
db/seed.example.sql         Local dev fixtures. Never apply to production.
```

### Why the Header owns its own script

The live site had a hamburger button on 8 pages with no menu and no JavaScript behind it — the button was copied, the drawer and its script were not. Here the drawer markup **and** the code that opens it live inside `Header.astro`. A page that has a header has a working menu, because they are the same file. There is no way to get one without the other.

---

## Guardrails already enforced

These are not conventions to remember — the build fails if they are violated.

| Guardrail | How it is enforced |
|---|---|
| Absolute asset paths only | Schema rejects any logo or hero path that does not start with `/` or `https://` |
| Every phone is a `tel:` link | Config stores one E.164 number; the display string and `tel:` href are both derived. There is no way to render a phone as plain text |
| Categories are opt-in | Absent from config = OFF. Everything that lists categories iterates one array |
| No nav link to a disabled category | Schema cross-check fails the build |
| Colours are config values | `global.css` and every component contain no hex codes |
| Complete geo for schema.org | Latitude and longitude are required fields, not optional |
| Map is never blank | Derived from the address — there is no `mapEmbedUrl` field to leave empty |
| Social icons and `sameAs` agree | Both read the same derived list |
| Placeholder config cannot ship | `deployMode: 'template'` is refused by the deploy gate |
| Admin never crawled | Excluded from the sitemap; `noindex` in `public/_headers` |
| No admin link on public pages | The Footer component contains no admin markup — not hidden, absent |
| Mobile menu works everywhere | Drawer + its script live inside the one Header component |
| Logo present on every page, light and dark | One `<img>` in the header, one knockout variant in the drawer and footer |
| No dead social links | Icons render only for platforms with a URL in config; no `href="#"` path exists |
| Nav labels cannot drift | Header and footer render from the same config array |
| A disabled category cannot serve products | Every public query filters by `enabledCategorySlugs` — the same array the nav uses |
| Drafts and deleted rows never reach a customer | Public status filter is an allow-list (`available`, `pending`, `sold`), not a deny-list |
| Turning a category off never destroys data | Products stay in the table, become invisible, and are reported as orphans |
| The categories table cannot become a second source of truth | It has no `enabled` column; config decides, the table mirrors |

---

## Database (Cloudflare D1)

The template ships with **no database bound**. A fresh clone runs, and the
inventory API returns a 503 explaining exactly what to do rather than a 500.

To wire one up:

```bash
wrangler d1 create my-client-inventory     # copy the database_id it prints
```

Uncomment the `[[d1_databases]]` block in `wrangler.toml`, paste the id, then:

```bash
npm run db:apply:local      # create the tables locally
npm run db:seed:local       # optional: example fixtures for development
npm run db:apply:remote     # production - operator only
```

### Categories are config, not data

`db/schema.sql` has a `categories` table, but it is a **one-way mirror of
`client.config.ts`**, not a source of truth. It deliberately has no `enabled`
column. Whether this site sells saunas is decided in exactly one place - the
config - and `syncCategories()` rewrites the table to match.

Every public query filters `category IN (...)` using `enabledCategorySlugs`,
the same array the header nav renders from. So a sauna product can sit in the
database, fully valid, and never appear anywhere on the site. Flip one config
line and it appears in the API, the category route, and the nav together.

Turning a category off never deletes anything. The rows stay; they become
invisible; `syncCategories()` reports them as orphans so you know they exist.

### Astro 6 changed how bindings are read

`Astro.locals.runtime.env` was **removed in Astro 6**. Bindings now come from
the `cloudflare:workers` module:

```ts
import { env } from 'cloudflare:workers';
```

Any older Cloudflare snippet using `context.locals.runtime.env.DB` will compile
fine and then fail at runtime. `src/lib/db.ts` has the correct pattern.

---

## Rules for working in this repo

- **One job per commit.** Do not start the next job until the current one is committed.
- **Commit via terminal**, not the editor button:
  ```bash
  git add -A && git commit -m "message" && git push
  ```
- **Deploy ≠ commit.** Committing saves to GitHub; deploying makes it live. Deploy is operator-only.
- **Read-only first.** Before any risky change, list what will change, then change it.
- **Machine checks do not catch wrong, only broken.** A dead admin link, a category nobody sells, a wrong founding year — all render perfectly. Before any launch, a human clicks every page and asks "does anything here not belong, or say something false?"

---

## Secrets

Secrets never live in config and never enter git.

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put ADMIN_SESSION_SECRET
wrangler secret put GHL_API_KEY
wrangler secret put META_CAPI_ACCESS_TOKEN
```

`.env.example` lists every variable. Copy it to `.env` for local dev.

Brand colours, logos, phone, address, hours, nav and categories are **not** environment variables — they are config.
