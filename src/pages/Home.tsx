import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES, PRODUCTS } from '../data/products';

export function Home() {
  const featured = PRODUCTS.filter((p) => p.featured);
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div>
            <p className="eyebrow eyebrow--light">New autumn collection</p>
            <h1>Build a desk you love coming back to.</h1>
            <p className="hero__lead">
              Standing desks, ergonomic chairs, and the small details that make a workspace yours. Free standard
              shipping on orders over $150.
            </p>
            <div className="hero__ctas">
              <Link to="/shop" className="btn btn--primary btn--large">
                Shop the collection
              </Link>
              <Link to="/setup-builder" className="btn btn--ghost-light btn--large">
                Build your setup — save 10%
              </Link>
            </div>
          </div>
          <div className="hero__art" aria-hidden="true">
            <div className="hero__orb" />
            <span className="hero__emoji hero__emoji--1">🪵</span>
            <span className="hero__emoji hero__emoji--2">⌨️</span>
            <span className="hero__emoji hero__emoji--3">💡</span>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Shop by category</h2>
          <Link to="/shop">View all products →</Link>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/shop?category=${c.id}`} className="category-tile">
              <span className="category-tile__emoji" aria-hidden="true">
                {c.emoji}
              </span>
              <span className="category-tile__name">{c.name}</span>
              <span className="category-tile__tagline">{c.tagline}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Featured</h2>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container section">
        <ul className="perks">
          <li>
            <strong>Free shipping over $150</strong>
            <span>Standard delivery in 3–5 business days.</span>
          </li>
          <li>
            <strong>30-day returns</strong>
            <span>Changed your mind? Send it back, free.</span>
          </li>
          <li>
            <strong>Use code WELCOME10</strong>
            <span>10% off your first order.</span>
          </li>
        </ul>
      </section>
    </>
  );
}
