import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { QuantityStepper } from '../components/QuantityStepper';
import { Rating } from '../components/Rating';
import { PRODUCTS, getCategory, getProduct } from '../data/products';
import { formatPrice } from '../lib/format';
import { useStore } from '../state/StoreContext';
import { NotFound } from './NotFound';

export function ProductPage() {
  const { id = '' } = useParams();
  const product = getProduct(id);
  const { stockOf, availableToAdd, addToCart, wishlist, toggleWishlist, cart } = useStore();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  if (!product) return <NotFound />;

  const category = getCategory(product.category);
  const stock = stockOf(product.id);
  const available = availableToAdd(product.id);
  const inCart = cart.find((l) => l.productId === product.id)?.quantity ?? 0;
  const saved = wishlist.includes(product.id);
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="container product-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{' '}
        <Link to={`/shop?category=${product.category}`}>{category?.name}</Link> / <span>{product.name}</span>
      </nav>

      <div className="product-page__layout">
        <ProductImage product={product} size="lg" />
        <div className="product-page__info">
          <p className="eyebrow">{category?.name}</p>
          <h1>{product.name}</h1>
          <Rating value={product.rating} count={product.reviewCount} />
          <p className="price price--large">
            {formatPrice(product.price)}
            {product.compareAtPrice && (
              <>
                <s className="price__was">{formatPrice(product.compareAtPrice)}</s>
                <span className="badge badge--sale badge--inline">
                  Save {formatPrice(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </p>
          <p className="lead">{product.description}</p>

          <p className={`stock ${stock === 0 ? 'stock--out' : stock <= 5 ? 'stock--low' : 'stock--in'}`} data-testid="stock-status">
            {stock === 0 ? 'Out of stock' : stock <= 5 ? `Only ${stock} left in stock` : 'In stock, ships in 1–2 days'}
          </p>

          <div className="buy-box">
            {available > 0 && (
              <QuantityStepper label={`Quantity of ${product.name}`} value={Math.min(quantity, available)} max={available} onChange={setQuantity} />
            )}
            <button
              type="button"
              className="btn btn--primary btn--large"
              disabled={available === 0}
              onClick={() => {
                addToCart(product.id, Math.min(quantity, available));
                setQuantity(1);
              }}
            >
              {stock === 0 ? 'Out of stock' : available === 0 ? 'All in your cart' : 'Add to cart'}
            </button>
            <button
              type="button"
              className={`btn btn--ghost btn--large${saved ? ' btn--saved' : ''}`}
              aria-pressed={saved}
              onClick={() => toggleWishlist(product.id)}
            >
              {saved ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
          {inCart > 0 && (
            <p className="muted">
              {inCart} in your cart · <Link to="/cart">View cart</Link>
            </p>
          )}

          <h2 className="h3">Highlights</h2>
          <ul className="features">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="section">
        <h2>Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="muted">No written reviews yet.</p>
        ) : (
          <div className="reviews">
            {product.reviews.map((r) => (
              <article key={r.author + r.title} className="card review">
                <Rating value={r.rating} />
                <h3>{r.title}</h3>
                <p>{r.body}</p>
                <p className="muted">— {r.author}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="section">
          <h2>More {category?.name.toLowerCase()}</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
