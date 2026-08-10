import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// THE ONE LAW applies here too: the canonical site URL is not retyped in the
// build config. It is read from the same client config every page reads.
// Importing it here also means an invalid config fails at `astro build`
// startup rather than halfway through rendering.
import { writeFile, mkdir } from 'node:fs/promises';
import { site, derived, enabledCategories } from './src/config';

/**
 * Writes the resolved config to dist/gate-manifest.json at the end of every
 * build.
 *
 * The gate runs in plain Node and cannot import the TypeScript config, so the
 * build hands it the already-validated facts instead. That also means the
 * gate checks what was actually BUILT rather than re-reading source and
 * hoping the two agree.
 */
function gateManifest() {
  return {
    name: 'gate-manifest',
    hooks: {
      'astro:build:done': async ({ dir }: { dir: URL }) => {
        const manifest = {
          generatedAt: new Date().toISOString(),
          deployMode: site.deployMode,
          identity: {
            name: site.identity.name,
            siteUrl: site.identity.siteUrl,
            foundedYear: site.identity.foundedYear,
          },
          contact: { phone: site.contact.phone, email: site.contact.email },
          address: {
            street: site.address.street,
            city: site.address.city,
            postalCode: site.address.postalCode,
            latitude: site.address.latitude,
            longitude: site.address.longitude,
          },
          hoursCount: site.hours.length,
          sameAs: derived.sameAs,
          serviceAreas: site.serviceAreas,
          categories: enabledCategories.map((c) => ({
            slug: c.slug,
            segment: c.segment,
            href: c.href,
            label: c.label,
          })),
          nav: {
            header: derived.headerNav.map((n) => ({ label: n.label, href: n.href })),
            footer: derived.footerNav.map((n) => ({ label: n.label, href: n.href })),
            primaryCta: site.nav.primaryCta,
            legalItems: site.nav.legalItems,
          },
          integrations: site.integrations,
          logos: site.brand.logos,
          /** Public routes the gate should crawl. */
          routes: [
            '/',
            '/inventory',
            '/find-your-match',
            '/thank-you',
            '/404',
            ...enabledCategories.map((c) => c.href),
          ],
        };
        // Written to dist/, NOT dist/client/. Anything in the client dir is
        // publicly served — a manifest of the client's configuration sitting
        // at /gate-manifest.json would be an information leak, and exactly
        // the kind of "works fine, shouldn't be there" defect this gate
        // exists to catch.
        const target = new URL('../gate-manifest.json', dir);
        await mkdir(new URL('./', target), { recursive: true });
        await writeFile(target, JSON.stringify(manifest, null, 2));
      },
    },
  };
}

export default defineConfig({
  site: site.identity.siteUrl,
  output: 'server',

  // Adapter v13 wires the Cloudflare Vite plugin itself, so D1/R2 bindings
  // and env vars are available in `astro dev` with no extra options.
  adapter: cloudflare(),

  integrations: [
    // React is loaded but used ONLY for genuinely interactive islands
    // (the quiz, Phase 5). Everything else stays zero-JS static Astro.
    react(),
    gateManifest(),
    sitemap({
      // Admin is never public, never crawled, never linked.
      filter: (page) => !page.includes('/admin'),
      // In SSR the sitemap only sees prerendered routes, so the dynamic
      // [category] pages have to be declared. They are declared FROM the
      // enabled-categories array, which means a category the client does not
      // sell has no sitemap entry — the same single source that decides its
      // route, its nav link and its database visibility.
      customPages: enabledCategories.map((c) => new URL(c.href, site.identity.siteUrl).href),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
