import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// THE ONE LAW applies here too: the canonical site URL is not retyped in the
// build config. It is read from the same client config every page reads.
// Importing it here also means an invalid config fails at `astro build`
// startup rather than halfway through rendering.
import { site } from './src/config';

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
    sitemap({
      // Admin is never public, never crawled, never linked.
      filter: (page) => !page.includes('/admin'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
