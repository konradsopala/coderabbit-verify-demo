import { Link } from 'react-router-dom';
import { useStore } from '../state/StoreContext';

export function Footer() {
  const { resetDemo } = useStore();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="logo">
            <span className="logo__mark" aria-hidden="true" />
            Lumen Supply
          </p>
          <p className="muted">Thoughtfully made gear for your home office. A demo store — no real orders ship.</p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/shop">Shop</Link>
          <Link to="/orders">Order history</Link>
          <Link to="/wishlist">Wishlist</Link>
        </nav>
        <div>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => {
              if (window.confirm('Clear your cart, wishlist, orders, and stock changes?')) resetDemo();
            }}
          >
            Reset demo data
          </button>
        </div>
      </div>
    </footer>
  );
}
