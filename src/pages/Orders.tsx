import { Link } from 'react-router-dom';
import { formatDate, formatPrice, pluralize } from '../lib/format';
import { useStore } from '../state/StoreContext';

export function Orders() {
  const { orders } = useStore();

  if (orders.length === 0) {
    return (
      <div className="container empty empty--page">
        <p className="empty__emoji" aria-hidden="true">
          📦
        </p>
        <h1>No orders yet</h1>
        <p className="muted">When you place an order, it will show up here.</p>
        <Link to="/shop" className="btn btn--primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Order history</h1>
      <ul className="order-list" aria-label="Orders">
        {orders.map((o) => {
          const itemCount = o.lines.reduce((n, l) => n + l.quantity, 0);
          return (
            <li key={o.id} className="card order-row" data-order-id={o.id}>
              <div>
                <p className="order-row__id">
                  <Link to={`/orders/${o.id}`}>Order {o.id}</Link>
                </p>
                <p className="muted">{formatDate(o.createdAt)}</p>
              </div>
              <p className="order-row__items">
                {pluralize(itemCount, 'item')}: {o.lines.map((l) => l.name).join(', ')}
              </p>
              <span className={`status status--${o.status.toLowerCase()}`}>{o.status}</span>
              <p className="order-row__total">{formatPrice(o.totals.total)}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
