/**
 * DISPLAY FORMATTING — one place.
 *
 * A price is stored once, as an integer, and formatted here. No page builds
 * its own `$${price}` string, so a currency symbol or a thousands separator
 * cannot end up different on the listing than on the detail page.
 *
 * These functions are also where the config decides whether a figure may be
 * shown AT ALL. Putting that here rather than in each component means the
 * product card, the detail page, and anything added later cannot disagree
 * about it — there is one gate, and every price passes through it.
 */
import { site } from '../config';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Copy shown when a product has no price on record. */
export const ASK_FOR_PRICE = 'Ask for current pricing';

/**
 * 8995 → "$8,995". Zero or negative means "no price on record".
 * Returns null when the client does not publish cash prices, so every
 * surface falls back to ASK_FOR_PRICE together.
 */
export function formatPrice(value: number): string | null {
  if (!site.display.showPrice) return null;
  if (!Number.isFinite(value) || value <= 0) return null;
  return usd.format(value);
}

/**
 * 149 → "$149/mo". Null when there is no financing figure on record.
 *
 * Also null whenever this client has no financing block, no matter what the
 * database row says. A monthly payment is a credit offer: without configured
 * terms there is no lender, no APR and no disclaimer to qualify it. The row
 * can carry the number; the site will not repeat it.
 */
export function formatMonthly(value: number): string | null {
  if (!site.display.showMonthly || site.financing === null) return null;
  if (!Number.isFinite(value) || value <= 0) return null;
  return `${usd.format(value)}/mo`;
}

/**
 * Status → the pill label a customer sees, or null for statuses that carry
 * no badge. Kept here so the listing and the detail page cannot disagree
 * about what "pending" is called.
 */
export function statusLabel(status: string, quantity: number): string | null {
  switch (status) {
    case 'sold':
      return 'Sold';
    case 'pending':
      return 'Sale pending';
    case 'available':
      if (quantity === 1) return 'Last one';
      if (quantity > 1) return `${quantity} left`;
      return null;
    default:
      return null;
  }
}

/** Sold and pending units render muted rather than being hidden. */
export function isMutedStatus(status: string): boolean {
  return status === 'sold' || status === 'pending';
}
