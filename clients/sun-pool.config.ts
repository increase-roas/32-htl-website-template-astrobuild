/**
 * EXAMPLE CLIENT CONFIG — Sun Pool & Spa Supply.
 *
 * This is a REFERENCE, not the template default. It lives here, outside
 * src/, so no Sun Pool fact can ever be imported by a component. The
 * template itself ships with placeholder facts and zero categories.
 *
 * To build the Sun Pool site from this template:
 *   npm run client:use sun-pool
 * (copies this file to src/config/client.config.ts)
 *
 * It exists to prove one thing: swapping THIS file for the placeholder
 * changes the entire site — name, phone, year, colours, logo, nav,
 * categories, schema.org — with zero edits to any component.
 *
 * ⚠ FIELDS MARKED "CONFIRM" ARE UNVERIFIED. They are left null rather than
 * guessed. Inventing a plausible-looking fact is exactly the class of bug
 * this template exists to prevent — a wrong fact that renders perfectly.
 */

import type { ClientConfigInput } from '../src/config/schema';

export const rawClientConfig: ClientConfigInput = {
  deployMode: 'client',

  identity: {
    name: 'Sun Pool & Spa Supply',
    shortName: 'Sun Pool',
    // The logo says EST. 1978. On the old site, "1979" was typed into 17
    // files and one of them was wrong. Here it is one number.
    foundedYear: 1978,
    tagline: 'The best hot tub and swim spa store in San Diego County. Real units on the floor.',
    siteUrl: 'https://sunpoolandspasupply.com',
  },

  contact: {
    phone: '+16195618587',
    phoneDisplayOverride: null,
    smsPhone: null,
    email: null, // CONFIRM — not published on the current site.
  },

  address: {
    street: '12473 Woodside Ave',
    street2: 'Suite C',
    city: 'Lakeside',
    region: 'CA',
    postalCode: '92040',
    country: 'US',
    // From TEMPLATE_DEFECTS "still open" list — the geo the old schema lacked.
    latitude: 32.857086,
    longitude: -116.924479,
    googlePlaceId: null, // CONFIRM — optional, improves the directions link.
  },

  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:30', closes: '17:00' },
    { days: ['Saturday'], opens: '09:00', closes: '17:00' },
    { days: ['Sunday'], opens: '10:00', closes: '14:00' },
  ],

  // CONFIRM — the defect list says a Facebook URL existed in the old config
  // and an Instagram URL was added, but neither URL was recorded in the
  // handoff docs. Left null deliberately. Fill these in and BOTH the footer
  // icons and the JSON-LD sameAs populate from this one place.
  social: {
    facebook: null,
    instagram: null,
    youtube: null,
    tiktok: null,
    x: null,
    linkedin: null,
    googleBusiness: null,
  },

  // The navy + gold ramp, lifted from the live site's theme.css.
  brand: {
    colors: {
      primary: '#16469B', // --navy-royal
      primaryMid: '#0F327A', // --navy-mid
      deep: '#0B2559', // --navy-deep
      night: '#06183D', // --navy-night
      abyss: '#030C20', // --navy-abyss
      accent: '#FFB81C', // --gold
      accentSoft: '#FFCB57', // --gold-soft
      accentDeep: '#E8A400', // --gold-deep
      accentDark: '#8F6400', // --gold-dark
      accentLift: '#FFD46A', // gold gradient top stop
      accentPress: '#F0A400', // gold gradient bottom stop
      accentGlow: '#FFE29A', // .deg accent-text gradient start
      urgent: '#D7261E', // --red
      urgentLight: '#E8382F', // red gradient top stop
      urgentDark: '#B71E17', // red gradient bottom stop
      surface: '#FFFFFF',
      surfaceAlt: '#F8F4EC', // --sand
      ink: '#141927', // --ink
      inkMuted: '#4A5268', // --ink-soft
      onDark: '#C6D4EF',
      onDarkMuted: '#8FA6D2',
    },
    fonts: {
      display: "'Bricolage Grotesque', system-ui, sans-serif",
      body: "'Instrument Sans', system-ui, sans-serif",
      mono: "'Spline Sans Mono', ui-monospace, monospace",
      googleFontsHref:
        'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Sans:wght@400..700&family=Spline+Sans+Mono:wght@400..600&display=swap',
    },
    logos: {
      nav: 'https://pub-24055549503540b0b5ff19237b87d146.r2.dev/logos/logo-nav.png',
      footer: 'https://pub-24055549503540b0b5ff19237b87d146.r2.dev/logos/logo-footer.png',
      inventory: 'https://pub-24055549503540b0b5ff19237b87d146.r2.dev/logos/logo-inventory.png',
      favicon: '/brand/favicon.svg', // CONFIRM — no R2 favicon recorded.
      ogImage: '/brand/og-default.png', // CONFIRM — no R2 OG image recorded.
    },
    radius: { card: 20, button: 14, pill: 999 },
  },

  nav: {
    items: [
      // Expands to Hot Tubs, Swim Spas — and nothing else, because nothing
      // else is enabled below. No saunas link can appear here.
      { type: 'categories' },
      { type: 'link', label: 'Find Your Match', href: '/find-your-match', inHeader: true, inFooter: true },
      { type: 'link', label: 'Inventory', href: '/inventory', inHeader: true, inFooter: true },
      { type: 'link', label: 'Financing', href: '/financing', inHeader: true, inFooter: true },
      // ONE label for this destination. The old site had five:
      // "Contact" / "Visit Us" / "VISIT US" / "Contact Us" / "Visit".
      { type: 'link', label: 'Visit Us', href: '/visit-us', inHeader: true, inFooter: true },
    ],
    primaryCta: { label: 'Shop Inventory', href: '/inventory' },
    // Bottom-bar legal strip. In config, so the Footer component
    // contains no hard-coded hrefs of its own.
    legalItems: [{ label: 'Privacy Policy', href: '/privacy-policy' }],
  },

  // Sun Pool sells hot tubs and swim spas. Nothing else is enabled, so
  // saunas / massage chairs / cold plunges do not exist on this site —
  // no page, no nav item, no sitemap entry, no admin dropdown option.
  categories: {
    'hot-tub': { enabled: true, sortOrder: 10 },
    'swim-spa': { enabled: true, sortOrder: 20 },
  },

  // Sourced from the live footer: "Serving Lakeside, El Cajon, Santee, and
  // all of East County San Diego." Not guessed.
  serviceAreas: ['Lakeside', 'El Cajon', 'Santee', 'East County San Diego'],

  integrations: {
    d1BindingName: 'DB',
    r2BindingName: 'PRODUCT_IMAGES',
    ghl: { enabled: true },
    meta: { enabled: true },
    zaraz: { enabled: true },
    sentry: { enabled: true },
  },
};
