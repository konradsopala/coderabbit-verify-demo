import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary';
import { formatPrice } from '../lib/format';
import { SHIPPING_METHODS, type ShippingMethodId } from '../lib/pricing';
import { useStore, type CustomerDetails, type PaymentMethod } from '../state/StoreContext';

type Errors = Partial<Record<keyof CustomerDetails, string>>;

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'Poland'];

export function validateCustomer(c: CustomerDetails): Errors {
  const errors: Errors = {};
  if (c.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) errors.email = 'Enter a valid email address.';
  if (c.address.trim().length < 5) errors.address = 'Enter your street address.';
  if (c.city.trim().length < 2) errors.city = 'Enter your city.';
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(c.postalCode.trim())) errors.postalCode = 'Enter a valid postal code.';
  if (!COUNTRIES.includes(c.country)) errors.country = 'Choose a country.';
  return errors;
}

const EMPTY: CustomerDetails = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'United States',
};

export function Checkout() {
  const { cart, totalsFor, promoCode, placeOrder } = useStore();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>('standard');
  const [payment, setPayment] = useState<PaymentMethod>('pay-on-delivery');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (cart.length === 0 && !submitting) return <Navigate to="/cart" replace />;

  const totals = totalsFor(shippingMethod);

  function field(name: keyof CustomerDetails) {
    return {
      id: `checkout-${name}`,
      name,
      value: customer[name],
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `checkout-${name}-error` : undefined,
      onChange: (e: { target: { value: string } }) => {
        setCustomer((c) => ({ ...c, [name]: e.target.value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
      },
    };
  }

  function errorFor(name: keyof CustomerDetails) {
    return errors[name] ? (
      <p id={`checkout-${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const found = validateCustomer(customer);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    const order = placeOrder({ customer, shippingMethod, payment });
    navigate(`/orders/${order.id}?placed=1`, { replace: true });
  }

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/cart">Cart</Link> / <span>Checkout</span>
      </nav>
      <h1>Checkout</h1>
      <form className="two-col" onSubmit={submit} noValidate>
        <div className="checkout-form">
          <section className="card form-card">
            <h2 className="h3">Contact &amp; delivery</h2>
            <div className="form-grid">
              <div className="field field--full">
                <label htmlFor="checkout-fullName">Full name</label>
                <input {...field('fullName')} autoComplete="name" />
                {errorFor('fullName')}
              </div>
              <div className="field field--full">
                <label htmlFor="checkout-email">Email</label>
                <input {...field('email')} type="email" autoComplete="email" />
                {errorFor('email')}
              </div>
              <div className="field field--full">
                <label htmlFor="checkout-address">Street address</label>
                <input {...field('address')} autoComplete="street-address" />
                {errorFor('address')}
              </div>
              <div className="field">
                <label htmlFor="checkout-city">City</label>
                <input {...field('city')} autoComplete="address-level2" />
                {errorFor('city')}
              </div>
              <div className="field">
                <label htmlFor="checkout-postalCode">Postal code</label>
                <input {...field('postalCode')} autoComplete="postal-code" />
                {errorFor('postalCode')}
              </div>
              <div className="field field--full">
                <label htmlFor="checkout-country">Country</label>
                <select {...field('country')} autoComplete="country-name">
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {errorFor('country')}
              </div>
            </div>
          </section>

          <fieldset className="card form-card">
            <legend className="h3">Shipping method</legend>
            {Object.values(SHIPPING_METHODS).map((m) => {
              const free = m.id === 'standard' && totalsFor('standard').freeShippingApplied;
              return (
                <label key={m.id} className={`option${shippingMethod === m.id ? ' option--selected' : ''}`}>
                  <input
                    type="radio"
                    name="shipping"
                    value={m.id}
                    checked={shippingMethod === m.id}
                    onChange={() => setShippingMethod(m.id)}
                  />
                  <span className="option__label">
                    <strong>{m.label}</strong>
                    <span className="muted">{m.eta}</span>
                  </span>
                  <span className="option__price">{free ? 'Free' : formatPrice(m.price)}</span>
                </label>
              );
            })}
          </fieldset>

          <fieldset className="card form-card">
            <legend className="h3">Payment</legend>
            <label className={`option${payment === 'pay-on-delivery' ? ' option--selected' : ''}`}>
              <input type="radio" name="payment" checked={payment === 'pay-on-delivery'} onChange={() => setPayment('pay-on-delivery')} />
              <span className="option__label">
                <strong>Pay on delivery</strong>
                <span className="muted">Pay the courier when your order arrives.</span>
              </span>
            </label>
            <label className={`option${payment === 'invoice' ? ' option--selected' : ''}`}>
              <input type="radio" name="payment" checked={payment === 'invoice'} onChange={() => setPayment('invoice')} />
              <span className="option__label">
                <strong>Company invoice</strong>
                <span className="muted">We email an invoice payable within 14 days.</span>
              </span>
            </label>
          </fieldset>
        </div>

        <aside className="card sidebar-card">
          <h2 className="h3">Your order</h2>
          <ul className="mini-lines">
            {cart.map((l) => (
              <li key={l.productId}>
                <span>
                  {l.quantity} × {l.product.name}
                </span>
                <span>{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary totals={totals} shippingMethod={shippingMethod} promoCode={promoCode} />
          <button type="submit" className="btn btn--primary btn--block btn--large" disabled={submitting}>
            Place order · {formatPrice(totals.total)}
          </button>
          <p className="muted small">This is a demo store. No payment is taken and nothing ships.</p>
        </aside>
      </form>
    </div>
  );
}
