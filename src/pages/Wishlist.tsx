import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { getProduct, type Product } from '../data/products';
import { useStore } from '../state/StoreContext';

export function Wishlist() {
  const { wishlist } = useStore();
  const products = wishlist.map(getProduct).filter((p): p is Product => Boolean(p));

  if (products.length === 0) {
    return (
      <div className="container empty empty--page">
        <p className="empty__emoji" aria-hidden="true">
          ♡
        </p>
        <h1>Your wishlist is empty</h1>
        <p className="muted">Tap the heart on any product to save it for later.</p>
        <Link to="/shop" className="btn btn--primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Wishlist</h1>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
