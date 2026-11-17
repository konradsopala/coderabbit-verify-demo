import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary';
import { ProductImage } from '../components/ProductImage';
import { QuantityStepper } from '../components/QuantityStepper';
import { formatPrice } from '../lib/format';
import { useStore } from '../state/StoreContext';

export function Cart() {
  const { cart, setQuantity, removeFromCart, stockOf, totalsFor, promoCode, applyPromo, removePromo } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const totals = totalsFor('standard');

  function submitPromo(e: FormEvent) {
    e.preventDefault();
    const result = applyPromo(code);
    if (result.ok) {
      setPromoError(null);
      setCode('');
    } else {
      setPromoError(result.error);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container empty empty--page">
        <p className="empty__emoji" aria-hidden="true">
          🛒
        </p>
        <h1>Your cart is empty</h1>
        <p className="muted">Find something for your desk — standard shipping is free over $150.</p>
        <Link to="/shop" className="btn btn--primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Your cart</h1>
      <div className="two-col">
        <ul className="cart-lines" aria-label="Cart items">
          {cart.map((line) => (
            <li key={line.productId} className="cart-line" data-product-id={line.productId}>
              <Link to={`/product/${line.productId}`} className="cart-line__image">
                <ProductImage product={line.product} size="sm" />
              </Link>
              <div className="cart-line__info">
                <Link to={`/product/${line.productId}`} className="cart-line__name">
                  {line.product.name}
                </Link>
                <p className="muted">{formatPrice(line.product.price)} each</p>
                <button type="button" className="link-btn link-btn--danger" onClick={() => removeFromCart(line.productId)}>
                  Remove
                </button>
              </div>
              <QuantityStepper
                label={`Quantity of ${line.product.name}`}
                value={line.quantity}
                max={stockOf(line.productId)}
                onChange={(q) => setQuantity(line.productId, q)}
              />
              <p className="cart-line__total">{formatPrice(line.lineTotal)}</p>
            </li>
          ))}
        </ul>

        <aside className="card sidebar-card">
          <h2 className="h3">Order summary</h2>
          {promoCode ? (
            <div className="promo-applied">
              <span>
                Code <strong>{promoCode}</strong> applied
              </span>
              <button type="button" className="link-btn" onClick={removePromo}>
                Remove
              </button>
            </div>
          ) : (
            <form className="promo" onSubmit={submitPromo}>
              <label htmlFor="promo-code">Promo code</label>
              <div className="promo__row">
                <input
                  id="promo-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. WELCOME10"
                  aria-invalid={promoError != null}
                  aria-describedby={promoError ? 'promo-error' : undefined}
                />
                <button type="submit" className="btn btn--ghost">
                  Apply
                </button>
              </div>
              {promoError && (
                <p id="promo-error" className="field-error" role="alert">
                  {promoError}
                </p>
              )}
            </form>
          )}
          <OrderSummary totals={totals} shippingMethod="standard" promoCode={promoCode} showFreeShippingHint />
          <button type="button" className="btn btn--primary btn--block btn--large" onClick={() => navigate('/checkout')}>
            Go to checkout
          </button>
          <Link to="/shop" className="btn btn--ghost btn--block">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
