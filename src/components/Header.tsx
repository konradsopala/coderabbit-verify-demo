import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../data/products';
import { useStore } from '../state/StoreContext';

function SearchForm({ id, onSubmitted }: { id: string; onSubmitted?: () => void }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');

  useEffect(() => {
    setQuery(params.get('q') ?? '');
  }, [params]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
    onSubmitted?.();
  }

  return (
    <form className="search" role="search" onSubmit={submit}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        type="search"
        placeholder="Search desks, chairs, lamps…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="search__btn" aria-label="Search">
        ⌕
      </button>
    </form>
  );
}

export function Header() {
  const { cartCount, wishlist } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isShop = location.pathname === '/shop';
  const activeCategory = new URLSearchParams(location.search).get('category');
  const navClass = (active: boolean) => (active ? 'active' : undefined);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="container header__inner">
        <button
          type="button"
          className="icon-btn header__menu-btn"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <Link to="/" className="logo" aria-label="Lumen Supply home">
          <span className="logo__mark" aria-hidden="true" />
          Lumen Supply
        </Link>
        <nav className="header__nav" aria-label="Main">
          <Link to="/shop" className={navClass(isShop && activeCategory !== 'desk-essentials')}>
            Shop all
          </Link>
          <Link to="/shop?category=desk-essentials" className={navClass(isShop && activeCategory === 'desk-essentials')}>
            Desk essentials
          </Link>
          <Link to="/setup-builder" className={navClass(location.pathname === '/setup-builder')}>
            Setup builder
          </Link>
          <Link to="/orders" className={navClass(location.pathname.startsWith('/orders'))}>
            Orders
          </Link>
        </nav>
        <div className="header__search">
          <SearchForm id="header-search" />
        </div>
        <div className="header__actions">
          <Link to="/wishlist" className="icon-btn" aria-label={`Wishlist, ${wishlist.length} items`}>
            ♡{wishlist.length > 0 && <span className="count-badge">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${cartCount} items`}>
            🛒{cartCount > 0 && <span className="count-badge" data-testid="cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {createPortal(
        <>
          <div
            className={`drawer-backdrop${menuOpen ? ' drawer-backdrop--open' : ''}`}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-menu"
            className={`drawer drawer--left${menuOpen ? ' drawer--open' : ''}`}
            aria-label="Menu"
            aria-hidden={!menuOpen}
          >
            <div className="drawer__head">
              <span className="logo">
                <span className="logo__mark" aria-hidden="true" />
                Lumen Supply
              </span>
              <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                ×
              </button>
            </div>
            <SearchForm id="mobile-search" onSubmitted={() => setMenuOpen(false)} />
            <nav className="drawer__nav" aria-label="Mobile">
              <Link to="/shop">Shop all</Link>
              {CATEGORIES.map((c) => (
                <Link key={c.id} to={`/shop?category=${c.id}`}>
                  <span aria-hidden="true">{c.emoji}</span> {c.name}
                </Link>
              ))}
              <hr />
              <Link to="/setup-builder">Setup builder</Link>
              <Link to="/orders">Orders</Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/cart">Cart ({cartCount})</Link>
            </nav>
          </aside>
        </>,
        document.body,
      )}
    </header>
  );
}
