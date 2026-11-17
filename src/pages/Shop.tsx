import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES, PRODUCTS, getCategory, type CategoryId } from '../data/products';
import {
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  queryCatalog,
  type CatalogFilters,
  type SortOption,
} from '../lib/catalog';
import { pluralize } from '../lib/format';
import { useStore } from '../state/StoreContext';

function parseNumber(value: string | null): number | null {
  if (value == null || value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function filtersFromParams(params: URLSearchParams): CatalogFilters {
  const category = params.get('category');
  const sort = params.get('sort');
  return {
    category: category && getCategory(category) ? (category as CategoryId) : null,
    query: params.get('q') ?? '',
    minPrice: parseNumber(params.get('min')),
    maxPrice: parseNumber(params.get('max')),
    inStockOnly: params.get('inStock') === '1',
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortOption) : DEFAULT_FILTERS.sort,
  };
}

export function Shop() {
  const [params, setParams] = useSearchParams();
  const { stockOf } = useStore();
  const filters = filtersFromParams(params);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minDraft, setMinDraft] = useState(params.get('min') ?? '');
  const [maxDraft, setMaxDraft] = useState(params.get('max') ?? '');

  useEffect(() => {
    setMinDraft(params.get('min') ?? '');
    setMaxDraft(params.get('max') ?? '');
  }, [params]);

  const results = useMemo(
    () => queryCatalog(PRODUCTS, filters, stockOf),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params, stockOf],
  );

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value == null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setParams(next);
  }

  function categoryCount(id: CategoryId | null) {
    return queryCatalog(PRODUCTS, { ...filters, category: id }, stockOf).length;
  }

  const category = filters.category ? getCategory(filters.category) : null;
  const heading = filters.query ? `Results for “${filters.query}”` : (category?.name ?? 'All products');
  const priceError =
    filters.minPrice != null && filters.maxPrice != null && filters.minPrice > filters.maxPrice
      ? 'Minimum price is higher than maximum.'
      : null;

  const chips: { label: string; clear: Record<string, null> }[] = [];
  if (category) chips.push({ label: category.name, clear: { category: null } });
  if (filters.query) chips.push({ label: `“${filters.query}”`, clear: { q: null } });
  if (filters.minPrice != null) chips.push({ label: `From $${filters.minPrice}`, clear: { min: null } });
  if (filters.maxPrice != null) chips.push({ label: `Up to $${filters.maxPrice}`, clear: { max: null } });
  if (filters.inStockOnly) chips.push({ label: 'In stock', clear: { inStock: null } });

  return (
    <div className="container shop">
      <div className="shop__head">
        <div>
          <p className="eyebrow">{category?.tagline ?? 'Everything for your workspace'}</p>
          <h1>{heading}</h1>
        </div>
      </div>

      <div className="shop__layout">
        <div
          className={`drawer-backdrop drawer-backdrop--mobile-only${filtersOpen ? ' drawer-backdrop--open' : ''}`}
          onClick={() => setFiltersOpen(false)}
          aria-hidden="true"
        />
        <aside className={`filters${filtersOpen ? ' filters--open' : ''}`} aria-label="Filters">
          <div className="filters__head">
            <h2>Filters</h2>
            <button type="button" className="icon-btn filters__close" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
              ×
            </button>
          </div>

          <fieldset className="filters__group">
            <legend>Category</legend>
            <label className="radio">
              <input
                type="radio"
                name="category"
                checked={filters.category == null}
                onChange={() => update({ category: null })}
              />
              All <span className="muted">({categoryCount(null)})</span>
            </label>
            {CATEGORIES.map((c) => (
              <label key={c.id} className="radio">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === c.id}
                  onChange={() => update({ category: c.id })}
                />
                {c.name} <span className="muted">({categoryCount(c.id)})</span>
              </label>
            ))}
          </fieldset>

          <form
            className="filters__group"
            onSubmit={(e) => {
              e.preventDefault();
              update({ min: minDraft.trim() || null, max: maxDraft.trim() || null });
            }}
          >
            <fieldset>
              <legend>Price (USD)</legend>
              <div className="price-range">
                <label>
                  <span className="sr-only">Minimum price</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={minDraft}
                    onChange={(e) => setMinDraft(e.target.value)}
                    aria-label="Minimum price"
                  />
                </label>
                <span aria-hidden="true">–</span>
                <label>
                  <span className="sr-only">Maximum price</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={maxDraft}
                    onChange={(e) => setMaxDraft(e.target.value)}
                    aria-label="Maximum price"
                  />
                </label>
                <button type="submit" className="btn btn--small btn--ghost">
                  Apply
                </button>
              </div>
              {priceError && (
                <p className="field-error" role="alert">
                  {priceError}
                </p>
              )}
            </fieldset>
          </form>

          <div className="filters__group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => update({ inStock: e.target.checked ? '1' : null })}
              />
              In stock only
            </label>
          </div>

          <button type="button" className="btn btn--primary btn--block filters__done" onClick={() => setFiltersOpen(false)}>
            Show {pluralize(results.length, 'product')}
          </button>
        </aside>

        <section className="shop__results" aria-label="Products">
          <div className="toolbar">
            <button type="button" className="btn btn--ghost btn--small toolbar__filters" onClick={() => setFiltersOpen(true)}>
              Filters{chips.length > 0 ? ` (${chips.length})` : ''}
            </button>
            <p className="toolbar__count" data-testid="result-count">
              {pluralize(results.length, 'product')}
            </p>
            <label className="toolbar__sort">
              <span>Sort by</span>
              <select value={filters.sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? null : e.target.value })}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="chips">
              {chips.map((chip) => (
                <button key={chip.label} type="button" className="chip" onClick={() => update(chip.clear)} aria-label={`Remove filter ${chip.label}`}>
                  {chip.label} <span aria-hidden="true">×</span>
                </button>
              ))}
              <button type="button" className="link-btn" onClick={() => setParams(new URLSearchParams())}>
                Clear all
              </button>
            </div>
          )}

          {results.length === 0 ? (
            <div className="empty">
              <p className="empty__emoji" aria-hidden="true">
                🔍
              </p>
              <h2>No products match those filters</h2>
              <p className="muted">Try a different search or clear a filter.</p>
              <button type="button" className="btn btn--primary" onClick={() => setParams(new URLSearchParams())}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
