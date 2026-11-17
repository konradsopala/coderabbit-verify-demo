import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ProductImage } from '../components/ProductImage';
import { PRODUCTS, getProduct, type Product } from '../data/products';
import { formatPrice } from '../lib/format';
import { SETUP_DISCOUNT_RATE } from '../lib/pricing';
import { useStore } from '../state/StoreContext';

type StepKey = 'desk' | 'keyboard' | 'stand';

/** Stands that fit on every desk in the catalog. */
const STAND_IDS = ['monitor-stand', 'laptop-stand'];

const STEPS: { key: StepKey; title: string; hint: string; options: Product[] }[] = [
  {
    key: 'desk',
    title: 'Choose a desk',
    hint: 'The base of your setup.',
    options: PRODUCTS.filter((p) => p.category === 'desks'),
  },
  {
    key: 'keyboard',
    title: 'Choose a keyboard',
    hint: 'Pick the feel you like typing on.',
    options: PRODUCTS.filter((p) => p.category === 'keyboards'),
  },
  {
    key: 'stand',
    title: 'Choose a stand',
    hint: 'Raise your screen to eye level.',
    options: PRODUCTS.filter((p) => STAND_IDS.includes(p.id)),
  },
];

export function SetupBuilder() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { availableToAdd, addSetup } = useStore();

  /** Selections live in the URL so a setup can be shared or survive a reload. */
  const selected: Record<StepKey, Product | undefined> = {
    desk: undefined,
    keyboard: undefined,
    stand: undefined,
  };
  for (const step of STEPS) {
    const product = getProduct(params.get(step.key) ?? '');
    if (product && step.options.some((o) => o.id === product.id)) selected[step.key] = product;
  }

  function choose(key: StepKey, id: string) {
    const next = new URLSearchParams(params);
    next.set(key, id);
    setParams(next, { replace: true });
  }

  const chosen = STEPS.map((s) => selected[s.key]).filter((p): p is Product => Boolean(p));
  const complete = chosen.length === STEPS.length;
  const subtotal = chosen.reduce((sum, p) => sum + p.price, 0);
  const savings = Math.round(subtotal * SETUP_DISCOUNT_RATE);

  function addToCart() {
    if (!selected.desk || !selected.keyboard || !selected.stand) return;
    const added = addSetup({
      deskId: selected.desk.id,
      keyboardId: selected.keyboard.id,
      standId: selected.stand.id,
    });
    if (added) navigate('/cart');
  }

  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <span>Setup builder</span>
      </nav>
      <p className="eyebrow">Desk setup builder</p>
      <h1>Build your desk setup</h1>
      <p className="lead">
        Pick a desk, a keyboard, and a stand. Buy all three together and save {SETUP_DISCOUNT_RATE * 100}% on the
        set.
      </p>

      <div className="two-col">
        <div className="builder-steps">
          {STEPS.map((step, index) => (
            <fieldset key={step.key} className="card form-card builder-step">
              <legend className="h3">
                <span className="builder-step__num" aria-hidden="true">
                  {index + 1}
                </span>
                {step.title}
              </legend>
              <p className="muted">{step.hint}</p>
              <div className="builder-options">
                {step.options.map((p) => {
                  const soldOut = availableToAdd(p.id) < 1;
                  const isSelected = selected[step.key]?.id === p.id;
                  return (
                    <label
                      key={p.id}
                      className={`builder-option${isSelected ? ' builder-option--selected' : ''}${soldOut ? ' builder-option--disabled' : ''}`}
                    >
                      <input
                        type="radio"
                        name={step.key}
                        value={p.id}
                        checked={isSelected}
                        disabled={soldOut}
                        onChange={() => choose(step.key, p.id)}
                      />
                      <ProductImage product={p} size="sm" />
                      <span className="builder-option__text">
                        <strong>{p.name}</strong>
                        <span className="muted">{p.summary}</span>
                      </span>
                      <span className="builder-option__price">{soldOut ? 'Sold out' : formatPrice(p.price)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <aside className="card sidebar-card" aria-label="Your setup">
          <h2 className="h3">Your setup</h2>
          <ul className="mini-lines" data-testid="setup-items">
            {STEPS.map((step) => (
              <li key={step.key}>
                <span className={selected[step.key] ? undefined : 'muted'}>
                  {selected[step.key]?.name ?? `No ${step.key} chosen`}
                </span>
                <span>{selected[step.key] ? formatPrice(selected[step.key]!.price) : '—'}</span>
              </li>
            ))}
          </ul>
          <dl className="summary">
            <div className="summary__row">
              <dt>Items</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="summary__row summary__row--discount">
              <dt>Setup savings ({SETUP_DISCOUNT_RATE * 100}%)</dt>
              <dd data-testid="setup-savings">{complete ? `−${formatPrice(savings)}` : 'Choose all three'}</dd>
            </div>
            <div className="summary__row summary__row--total">
              <dt>Setup price</dt>
              <dd data-testid="setup-price">{formatPrice(complete ? subtotal - savings : subtotal)}</dd>
            </div>
          </dl>
          <button type="button" className="btn btn--primary btn--block btn--large" disabled={!complete} onClick={addToCart}>
            Add setup to cart
          </button>
          {!complete && (
            <p className="muted small">
              Choose {STEPS.filter((s) => !selected[s.key]).map((s) => `a ${s.key}`).join(', ')} to continue.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
