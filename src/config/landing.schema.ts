/**
 * PAID LANDING PAGE SCHEMA — the contract for ad landing pages.
 *
 * A landing page is ONE config file. Same law as the rest of the template:
 * every word, image and claim lives here exactly once, and no component
 * contains copy.
 *
 * WHY LANDING PAGES ARE THEIR OWN THING
 * -------------------------------------
 * A paid landing page is not a normal page with different content. It has the
 * opposite requirements to every other page on the site:
 *
 *   - it must NOT be indexed (it is paid-only; organic traffic to it is waste
 *     and it competes with the real pages for the same keywords)
 *   - it must NOT have nav, a footer sitemap, or any organic link out — every
 *     escape hatch is a paid click leaving without converting
 *   - it repeats the SAME call to action rather than offering choices
 *
 * Rendering one through BaseLayout would give it a header, a nav and a footer
 * full of links. So it gets its own layout, and its own route prefix that
 * robots.txt disallows and the sitemap excludes.
 *
 * WHAT IS TEMPLATED AND WHAT IS NOT
 * ---------------------------------
 * The STRUCTURE is templated: hero, benefit stack, gallery, testimonials,
 * trust bar, repeated CTA, FAQ, disclosures. The CLAIMS are not, and cannot
 * be. "The #1 rated hot tub dealer" is a true statement for one client and a
 * false advertising claim for another. So every superlative carries a required
 * footnote, and the build fails without it.
 */

import { z } from 'zod';
import { CATEGORY_SLUGS } from './categories';

const absoluteAsset = z
  .string()
  .min(1)
  .refine(
    (v) => v.startsWith('/') || v.startsWith('https://'),
    'Asset paths must be absolute: start with "/" or "https://".',
  );

/* ------------------------------------------------------------------ */
/* Claims — the part that carries legal weight                         */
/* ------------------------------------------------------------------ */

/**
 * Any statement of fact shown to a paid audience.
 *
 * `superlative: true` means the copy asserts a best/most/#1/-est claim. The
 * FTC expects those to be substantiated, so the schema requires a footnote
 * and the build fails without one. This is the one place the template refuses
 * to let a client ship something merely because it renders.
 */
export const claimSchema = z
  .object({
    text: z.string().min(1),
    superlative: z.boolean().default(false),
    /** What backs the claim up. Rendered in the disclosures block. */
    footnote: z.string().min(1).nullable().default(null),
  })
  .superRefine((c, ctx) => {
    if (c.superlative && !c.footnote) {
      ctx.addIssue({
        code: 'custom',
        path: ['footnote'],
        message: `Superlative claim "${c.text}" has no substantiation footnote. Add one or set superlative: false.`,
      });
    }
  });

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const heroSchema = z.object({
  type: z.literal('hero'),
  /**
   * The headline. Deliberately NOT the business name — a paid headline names
   * the outcome, not the seller.
   */
  headline: z.string().min(1),
  /**
   * Pre-qualifying subhead. Its job is to lose the wrong clicks BEFORE they
   * cost you a lead, e.g. "For homeowners in East County San Diego with a
   * level backyard."
   */
  subhead: z.string().min(1),
  /** Outcome-framed, not feature-framed. Keep to 3-6. */
  bullets: z.array(claimSchema).min(1).max(6),
  image: absoluteAsset.nullable().default(null),
});

const benefitStackSchema = z.object({
  type: z.literal('benefits'),
  heading: z.string().min(1).nullable().default(null),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        icon: absoluteAsset.nullable().default(null),
      }),
    )
    .min(1),
});

const gallerySchema = z.object({
  type: z.literal('gallery'),
  heading: z.string().min(1).nullable().default(null),
  /** Proof of scale. Real photos of real installs, never stock. */
  images: z
    .array(z.object({ src: absoluteAsset, alt: z.string().min(1) }))
    .min(1),
});

const testimonialsSchema = z.object({
  type: z.literal('testimonials'),
  heading: z.string().min(1).nullable().default(null),
  items: z
    .array(
      z.object({
        /** First name + last initial. Never a full name without consent. */
        name: z.string().min(1),
        location: z.string().min(1).nullable().default(null),
        quote: z.string().min(1),
        /** A specific detail is what makes a testimonial read as real. */
        detail: z.string().min(1).nullable().default(null),
      }),
    )
    .min(1),
});

const trustBarSchema = z.object({
  type: z.literal('trust'),
  items: z.array(z.string().min(1)).min(1),
  logos: z
    .array(z.object({ src: absoluteAsset, alt: z.string().min(1) }))
    .default([]),
});

const bigNumberSchema = z.object({
  type: z.literal('bignumber'),
  /** e.g. "2,400" — specific beats round. */
  value: z.string().min(1),
  label: z.string().min(1),
  claim: claimSchema.nullable().default(null),
});

const ctaSchema = z.object({
  type: z.literal('cta'),
  heading: z.string().min(1),
  /** Soft CTAs outperform commitment CTAs on cold paid traffic. */
  buttonLabel: z.string().min(1),
  subtext: z.string().min(1).nullable().default(null),
});

const faqSchema = z.object({
  type: z.literal('faq'),
  heading: z.string().min(1).nullable().default(null),
  items: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(1),
});

export const sectionSchema = z.discriminatedUnion('type', [
  heroSchema,
  benefitStackSchema,
  gallerySchema,
  testimonialsSchema,
  trustBarSchema,
  bigNumberSchema,
  ctaSchema,
  faqSchema,
]);

/* ------------------------------------------------------------------ */
/* The landing page                                                    */
/* ------------------------------------------------------------------ */

export const landingSchema = z
  .object({
    /** URL segment. The page lives at /lp/<slug>. */
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens.'),

    /** Internal name for you, never rendered. */
    internalName: z.string().min(1),

    /** Browser tab title. Not indexed, but it shows in the tab and on share. */
    title: z.string().min(1),

    /**
     * Which category this page sells. Must be a category the client actually
     * has enabled — a landing page for a product they do not sell is the
     * saunas defect with a media budget behind it.
     */
    category: z.enum([...CATEGORY_SLUGS]),

    /**
     * The FTC advertorial label. Required and not overridable to empty: an
     * ad styled as editorial without disclosure is a deceptive format.
     */
    advertorialLabel: z.string().min(1).default('Advertorial'),

    sections: z.array(sectionSchema).min(1),

    /** Legal text under the fold. Consent language, disclaimers. */
    disclosures: z.array(z.string().min(1)).default([]),

    /**
     * The ONE link allowed off this page. Everything else is a dead end on
     * purpose. Use it for the "I'm a contractor / not a homeowner" exit that
     * monetises non-buyers, or leave it null.
     */
    exitLink: z
      .object({ label: z.string().min(1), href: z.string().min(1) })
      .nullable()
      .default(null),
  })
  .superRefine((lp, ctx) => {
    // At least one CTA, or the page cannot convert.
    if (!lp.sections.some((s) => s.type === 'cta')) {
      ctx.addIssue({
        code: 'custom',
        path: ['sections'],
        message: 'A landing page with no CTA section cannot convert. Add one.',
      });
    }
    // The first section must be the hero — a paid visitor decides in the
    // first screen, and there is nothing above it to earn the scroll.
    if (lp.sections[0]?.type !== 'hero') {
      ctx.addIssue({
        code: 'custom',
        path: ['sections', 0],
        message: 'The first section must be the hero.',
      });
    }
    // Every superlative footnote must actually be reachable in disclosures.
    const footnotes = lp.sections.flatMap((s) => {
      if (s.type === 'hero') return s.bullets.map((b) => b.footnote).filter(Boolean);
      if (s.type === 'bignumber') return s.claim?.footnote ? [s.claim.footnote] : [];
      return [];
    });
    if (footnotes.length > 0 && lp.disclosures.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['disclosures'],
        message:
          'This page makes a superlative claim but has no disclosures block to print the substantiation in.',
      });
    }
  });

export type Landing = z.infer<typeof landingSchema>;
export type LandingInput = z.input<typeof landingSchema>;
export type LandingSection = Landing['sections'][number];
export type Claim = z.infer<typeof claimSchema>;
