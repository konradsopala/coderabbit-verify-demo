import type { CategoryId, Product } from '../data/products';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name: A–Z' },
];

export interface CatalogFilters {
  category: CategoryId | null;
  query: string;
  /** Dollars, inclusive. */
  minPrice: number | null;
  /** Dollars, inclusive. */
  maxPrice: number | null;
  inStockOnly: boolean;
  sort: SortOption;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  category: null,
  query: '',
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  sort: 'featured',
};

export function matchesQuery(product: Product, query: string): boolean {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = `${product.name} ${product.summary} ${product.category.replace('-', ' ')}`.toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

export function filterProducts(
  products: Product[],
  filters: CatalogFilters,
  stockOf: (id: string) => number,
): Product[] {
  return products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (!matchesQuery(p, filters.query)) return false;
    if (filters.minPrice != null && p.price < filters.minPrice * 100) return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice * 100) return false;
    if (filters.inStockOnly && stockOf(p.id) <= 0) return false;
    return true;
  });
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price);
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'newest':
      return list.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
    default:
      return list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

export function queryCatalog(
  products: Product[],
  filters: CatalogFilters,
  stockOf: (id: string) => number,
): Product[] {
  return sortProducts(filterProducts(products, filters, stockOf), filters.sort);
}
