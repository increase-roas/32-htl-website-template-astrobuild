/**
 * DISPLAY FORMATTING — one place.
 *
 * A price is stored once, as an integer, and formatted here. No page builds
 * its own `$${price}` string, so a currency symbol or a thousands separator
 * cannot end up different on the listing than on the detail page.
 */

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Copy shown when a product has no price on record. */
export const ASK_FOR_PRICE = 'Ask for current pricing';

/** 8995 → "$8,995". Zero or negative means "no price on record". */
export function formatPrice(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return usd.format(value);
}

/** 149 → "$149/mo". Null when there is no financing figure on record. */
export function formatMonthly(value: number): string | null {
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
