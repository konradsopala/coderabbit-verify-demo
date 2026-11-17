import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary';
import { formatDate, formatPrice } from '../lib/format';
import { SHIPPING_METHODS } from '../lib/pricing';
import { useStore } from '../state/StoreContext';
import { NotFound } from './NotFound';

export function OrderDetail() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { orders, cancelOrder, buyAgain } = useStore();
  const order = orders.find((o) => o.id === id);

  if (!order) return <NotFound />;

  const justPlaced = params.get('placed') === '1';
  const shipping = SHIPPING_METHODS[order.shippingMethod];

  return (
    <div className="container page">
      {justPlaced && (
        <div className="banner banner--success" role="status">
          <strong>Thanks, {order.customer.fullName.split(' ')[0]}! Your order is confirmed.</strong>
          <span>
            We sent a confirmation to {order.customer.email}. Order number <strong>{order.id}</strong>.
          </span>
        </div>
      )}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/orders">Orders</Link> / <span>{order.id}</span>
      </nav>
      <div className="order-head">
        <div>
          <h1>Order {order.id}</h1>
          <p className="muted">Placed {formatDate(order.createdAt)}</p>
        </div>
        <span className={`status status--${order.status.toLowerCase()}`} data-testid="order-status">
          {order.status}
        </span>
      </div>

      <div className="two-col">
        <div>
          <section className="card form-card">
            <h2 className="h3">Items</h2>
            <ul className="mini-lines mini-lines--spacious" aria-label="Order items">
              {order.lines.map((l) => (
                <li key={l.productId}>
                  <span>
                    {l.quantity} × <Link to={`/product/${l.productId}`}>{l.name}</Link>
                  </span>
                  <span>{formatPrice(l.price * l.quantity)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card form-card details-grid">
            <div>
              <h2 className="h3">Delivery</h2>
              <address>
                {order.customer.fullName}
                <br />
                {order.customer.address}
                <br />
                {order.customer.postalCode} {order.customer.city}
                <br />
                {order.customer.country}
              </address>
            </div>
            <div>
              <h2 className="h3">Shipping</h2>
              <p>
                {shipping.label} · {shipping.eta}
              </p>
              <h2 className="h3">Payment</h2>
              <p>{order.payment === 'invoice' ? 'Company invoice' : 'Pay on delivery'}</p>
            </div>
          </section>
        </div>

        <aside className="card sidebar-card">
          <h2 className="h3">Summary</h2>
          <OrderSummary totals={order.totals} shippingMethod={order.shippingMethod} promoCode={order.promoCode} />
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => {
              if (buyAgain(order.id) > 0) navigate('/cart');
            }}
          >
            Buy again
          </button>
          {order.status === 'Processing' && (
            <button
              type="button"
              className="btn btn--ghost btn--block btn--danger"
              onClick={() => {
                if (window.confirm(`Cancel order ${order.id}? Items go back into stock.`)) cancelOrder(order.id);
              }}
            >
              Cancel order
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
