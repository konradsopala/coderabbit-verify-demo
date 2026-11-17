import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/products';
import { DEFAULT_FILTERS, queryCatalog } from './catalog';

const stockOf = (id: string) => PRODUCTS.find((p) => p.id === id)?.stock ?? 0;

describe('queryCatalog', () => {
  it('filters by category', () => {
    const result = queryCatalog(PRODUCTS, { ...DEFAULT_FILTERS, category: 'desk-essentials' }, stockOf);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === 'desk-essentials')).toBe(true);
  });

  it('keeps the category filter when sorting by price', () => {
    const result = queryCatalog(
      PRODUCTS,
      { ...DEFAULT_FILTERS, category: 'desk-essentials', sort: 'price-asc' },
      stockOf,
    );
    expect(result.every((p) => p.category === 'desk-essentials')).toBe(true);
    const prices = result.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('searches across name and summary with every term', () => {
    const result = queryCatalog(PRODUCTS, { ...DEFAULT_FILTERS, query: 'oak desk' }, stockOf);
    expect(result.map((p) => p.id)).toEqual(['oak-standing-desk']);
  });

  it('hides out-of-stock products when asked', () => {
    const result = queryCatalog(PRODUCTS, { ...DEFAULT_FILTERS, inStockOnly: true }, stockOf);
    expect(result.some((p) => p.stock === 0)).toBe(false);
  });

  it('applies an inclusive price range in dollars', () => {
    const result = queryCatalog(PRODUCTS, { ...DEFAULT_FILTERS, minPrice: 49, maxPrice: 89 }, stockOf);
    expect(result.every((p) => p.price >= 4900 && p.price <= 8900)).toBe(true);
    expect(result.some((p) => p.price === 4900)).toBe(true);
    expect(result.some((p) => p.price === 8900)).toBe(true);
  });
});
