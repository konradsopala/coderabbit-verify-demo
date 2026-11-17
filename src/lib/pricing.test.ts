import { describe, expect, it } from 'vitest';
import { PROMO_CODES, computeSetupDiscount, computeTotals, validatePromo } from './pricing';

describe('computeTotals', () => {
  it('returns zeros for an empty cart', () => {
    expect(computeTotals([])).toMatchObject({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  });

  it('charges standard shipping under the free-shipping threshold', () => {
    const t = computeTotals([{ price: 4900, quantity: 1 }]);
    expect(t.shipping).toBe(799);
    expect(t.tax).toBe(392);
    expect(t.total).toBe(4900 + 799 + 392);
  });

  it('gives free standard shipping at $150 and above', () => {
    const t = computeTotals([{ price: 7500, quantity: 2 }]);
    expect(t.freeShippingApplied).toBe(true);
    expect(t.shipping).toBe(0);
  });

  it('always charges express shipping', () => {
    const t = computeTotals([{ price: 64900, quantity: 1 }], 'express');
    expect(t.shipping).toBe(1999);
  });

  it('applies a percentage promo before tax and shipping', () => {
    const t = computeTotals([{ price: 10000, quantity: 1 }], 'standard', PROMO_CODES.WELCOME10);
    expect(t.discount).toBe(1000);
    expect(t.tax).toBe(720);
    expect(t.shipping).toBe(799);
  });

  it('uses the discounted subtotal for the free-shipping threshold', () => {
    const t = computeTotals([{ price: 16000, quantity: 1 }], 'standard', PROMO_CODES.WELCOME10);
    expect(t.discount).toBe(1600);
    expect(t.freeShippingApplied).toBe(false);
  });

  it('makes standard shipping free with FREESHIP', () => {
    const t = computeTotals([{ price: 2900, quantity: 1 }], 'standard', PROMO_CODES.FREESHIP);
    expect(t.shipping).toBe(0);
  });
});

describe('validatePromo', () => {
  it('accepts codes case-insensitively', () => {
    expect(validatePromo('  welcome10 ', 1000)).toMatchObject({ ok: true });
  });

  it('rejects unknown codes', () => {
    expect(validatePromo('NOPE', 1000)).toMatchObject({ ok: false });
  });

  it('enforces the DESK25 minimum subtotal', () => {
    expect(validatePromo('DESK25', 19999).ok).toBe(false);
    expect(validatePromo('DESK25', 20000).ok).toBe(true);
  });
});

describe('desk setups', () => {
  const setup = [
    { price: 64900, quantity: 1, setupId: 's1' },
    { price: 18900, quantity: 1, setupId: 's1' },
    { price: 8900, quantity: 1, setupId: 's1' },
  ];

  it('takes 10% off items in a setup', () => {
    expect(computeSetupDiscount(setup)).toBe(9270);
  });

  it('does not discount items outside a setup', () => {
    expect(computeSetupDiscount([...setup, { price: 4900, quantity: 2 }])).toBe(9270);
  });

  it('applies the setup discount before promo codes and tax', () => {
    const t = computeTotals(setup, 'standard', PROMO_CODES.WELCOME10);
    expect(t.setupDiscount).toBe(9270);
    expect(t.discount).toBe(8343);
    expect(t.tax).toBe(Math.round((92700 - 9270 - 8343) * 0.08));
  });
});
