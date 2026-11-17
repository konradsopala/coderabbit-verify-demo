/** All money values are integer cents. */

export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 15000;
/** Discount on every item that is part of a desk setup built in the setup builder. */
export const SETUP_DISCOUNT_RATE = 0.1;

export type ShippingMethodId = 'standard' | 'express';

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  price: number;
  eta: string;
}

export const SHIPPING_METHODS: Record<ShippingMethodId, ShippingMethod> = {
  standard: { id: 'standard', label: 'Standard', price: 799, eta: '3–5 business days' },
  express: { id: 'express', label: 'Express', price: 1999, eta: '1–2 business days' },
};

export type Promo =
  | { code: string; kind: 'percent'; value: number; description: string }
  | { code: string; kind: 'fixed'; value: number; minSubtotal: number; description: string }
  | { code: string; kind: 'free-shipping'; description: string };

export const PROMO_CODES: Record<string, Promo> = {
  WELCOME10: { code: 'WELCOME10', kind: 'percent', value: 10, description: '10% off your order' },
  DESK25: {
    code: 'DESK25',
    kind: 'fixed',
    value: 2500,
    minSubtotal: 20000,
    description: '$25 off orders of $200 or more',
  },
  FREESHIP: { code: 'FREESHIP', kind: 'free-shipping', description: 'Free standard shipping' },
};

export type PromoResult = { ok: true; promo: Promo } | { ok: false; error: string };

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Looks up a promo code and checks whether it applies to the given subtotal. */
export function validatePromo(code: string, subtotal: number): PromoResult {
  const normalized = normalizeCode(code);
  if (!normalized) return { ok: false, error: 'Enter a promo code.' };
  const promo = PROMO_CODES[normalized];
  if (!promo) return { ok: false, error: `“${normalized}” is not a valid promo code.` };
  if (promo.kind === 'fixed' && subtotal < promo.minSubtotal) {
    return { ok: false, error: `${promo.code} needs a subtotal of $${promo.minSubtotal / 100} or more.` };
  }
  return { ok: true, promo };
}

export interface PricedLine {
  price: number;
  quantity: number;
  /** Set when the line belongs to a desk setup; such lines get the setup discount. */
  setupId?: string;
}

export interface Totals {
  subtotal: number;
  /** Savings from desk setups. Older orders may not have this field. */
  setupDiscount?: number;
  /** Savings from the promo code. */
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  freeShippingApplied: boolean;
}

export function computeTotals(
  lines: PricedLine[],
  shippingMethod: ShippingMethodId = 'standard',
  promo?: Promo | null,
): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const setupDiscount = computeSetupDiscount(lines);
  const afterSetup = subtotal - setupDiscount;

  let discount = 0;
  if (promo?.kind === 'percent') {
    discount = Math.round((afterSetup * promo.value) / 100);
  } else if (promo?.kind === 'fixed' && afterSetup >= promo.minSubtotal) {
    discount = Math.min(promo.value, afterSetup);
  }

  const discounted = afterSetup - discount;
  const method = SHIPPING_METHODS[shippingMethod];
  const qualifiesForFreeStandard =
    discounted >= FREE_SHIPPING_THRESHOLD || promo?.kind === 'free-shipping';
  const freeShippingApplied = itemCount > 0 && shippingMethod === 'standard' && qualifiesForFreeStandard;

  let shipping = 0;
  if (itemCount > 0 && !freeShippingApplied) shipping = method.price;

  const tax = Math.round(discounted * TAX_RATE);
  const total = discounted + shipping + tax;

  return { subtotal, setupDiscount, discount, shipping, tax, total, itemCount, freeShippingApplied };
}

/** Total setup savings across all lines that belong to a desk setup. */
export function computeSetupDiscount(lines: PricedLine[]): number {
  const setupValue = lines
    .filter((l) => l.setupId)
    .reduce((sum, l) => sum + l.price * l.quantity, 0);
  return Math.round(setupValue * SETUP_DISCOUNT_RATE);
}

/** How much more (in cents) the shopper must spend to unlock free standard shipping. */
export function amountToFreeShipping(discountedSubtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
}
