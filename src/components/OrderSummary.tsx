import { formatPrice } from '../lib/format';
import { FREE_SHIPPING_THRESHOLD, amountToFreeShipping, type ShippingMethodId, type Totals } from '../lib/pricing';

interface Props {
  totals: Totals;
  shippingMethod: ShippingMethodId;
  promoCode: string | null;
  showFreeShippingHint?: boolean;
}

export function OrderSummary({ totals, shippingMethod, promoCode, showFreeShippingHint }: Props) {
  const setupDiscount = totals.setupDiscount ?? 0;
  const remaining = amountToFreeShipping(totals.subtotal - setupDiscount - totals.discount);
  return (
    <dl className="summary" data-testid="order-summary">
      <div className="summary__row">
        <dt>Subtotal ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})</dt>
        <dd data-testid="summary-subtotal">{formatPrice(totals.subtotal)}</dd>
      </div>
      {setupDiscount > 0 && (
        <div className="summary__row summary__row--discount">
          <dt>Setup savings</dt>
          <dd data-testid="summary-setup-discount">−{formatPrice(setupDiscount)}</dd>
        </div>
      )}
      {totals.discount > 0 && (
        <div className="summary__row summary__row--discount">
          <dt>Discount{promoCode ? ` (${promoCode})` : ''}</dt>
          <dd data-testid="summary-discount">−{formatPrice(totals.discount)}</dd>
        </div>
      )}
      <div className="summary__row">
        <dt>Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</dt>
        <dd data-testid="summary-shipping">{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd>
      </div>
      <div className="summary__row">
        <dt>Estimated tax (8%)</dt>
        <dd data-testid="summary-tax">{formatPrice(totals.tax)}</dd>
      </div>
      <div className="summary__row summary__row--total">
        <dt>Total</dt>
        <dd data-testid="summary-total">{formatPrice(totals.total)}</dd>
      </div>
      {showFreeShippingHint && shippingMethod === 'standard' && totals.itemCount > 0 && !totals.freeShippingApplied && (
        <div className="free-ship">
          <p>
            Add <strong>{formatPrice(remaining)}</strong> more for free standard shipping.
          </p>
          <div className="progress" aria-hidden="true">
            <span style={{ width: `${Math.min(100, ((FREE_SHIPPING_THRESHOLD - remaining) / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
          </div>
        </div>
      )}
    </dl>
  );
}
