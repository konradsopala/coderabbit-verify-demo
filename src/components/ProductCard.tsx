import { Link } from 'react-router-dom';
import { getCategory, type Product } from '../data/products';
import { formatPrice } from '../lib/format';
import { useStore } from '../state/StoreContext';
import { ProductImage } from './ProductImage';
import { Rating } from './Rating';

export function ProductCard({ product }: { product: Product }) {
  const { stockOf, addToCart, wishlist, toggleWishlist } = useStore();
  const stock = stockOf(product.id);
  const saved = wishlist.includes(product.id);
  const category = getCategory(product.category);

  return (
    <article className="card product-card" data-product-id={product.id}>
      <Link to={`/product/${product.id}`} className="product-card__media">
        <ProductImage product={product} />
        {product.compareAtPrice && <span className="badge badge--sale">Sale</span>}
        {stock === 0 && <span className="badge badge--muted">Sold out</span>}
        {stock > 0 && stock <= 5 && <span className="badge badge--warn">Only {stock} left</span>}
      </Link>
      <button
        type="button"
        className={`wish-btn${saved ? ' wish-btn--active' : ''}`}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        onClick={() => toggleWishlist(product.id)}
      >
        {saved ? '♥' : '♡'}
      </button>
      <div className="product-card__body">
        <p className="eyebrow">{category?.name}</p>
        <h3 className="product-card__title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <Rating value={product.rating} count={product.reviewCount} />
        <div className="product-card__footer">
          <p className="price">
            {formatPrice(product.price)}
            {product.compareAtPrice && <s className="price__was">{formatPrice(product.compareAtPrice)}</s>}
          </p>
          <button
            type="button"
            className="btn btn--small"
            disabled={stock === 0}
            onClick={() => addToCart(product.id)}
            aria-label={`Add ${product.name} to cart`}
          >
            {stock === 0 ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}
