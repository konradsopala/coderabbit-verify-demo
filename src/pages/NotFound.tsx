import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="container empty empty--page">
      <p className="empty__emoji" aria-hidden="true">
        🧭
      </p>
      <h1>We couldn’t find that page</h1>
      <p className="muted">The link may be broken, or the product may no longer be available.</p>
      <Link to="/shop" className="btn btn--primary">
        Back to the shop
      </Link>
    </div>
  );
}
