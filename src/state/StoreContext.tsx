import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import { PRODUCTS, getProduct, type Product } from '../data/products';
import {
  computeTotals,
  validatePromo,
  type PromoResult,
  type ShippingMethodId,
  type Totals,
} from '../lib/pricing';

const STORAGE_KEY = 'lumen-supply:v1';

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = 'pay-on-delivery' | 'invoice';
export type OrderStatus = 'Processing' | 'Cancelled';

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  customer: CustomerDetails;
  shippingMethod: ShippingMethodId;
  payment: PaymentMethod;
  promoCode: string | null;
  totals: Totals;
}

interface PersistedState {
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  /** Remaining stock per product id. */
  inventory: Record<string, number>;
  promoCode: string | null;
}

type Action =
  | { type: 'cart/add'; productId: string; quantity: number }
  | { type: 'cart/set'; productId: string; quantity: number }
  | { type: 'cart/remove'; productId: string }
  | { type: 'cart/clear' }
  | { type: 'wishlist/toggle'; productId: string }
  | { type: 'promo/set'; code: string | null }
  | { type: 'order/place'; order: Order }
  | { type: 'order/cancel'; orderId: string }
  | { type: 'reset' };

function initialInventory(): Record<string, number> {
  return Object.fromEntries(PRODUCTS.map((p) => [p.id, p.stock]));
}

function freshState(): PersistedState {
  return { cart: [], wishlist: [], orders: [], inventory: initialInventory(), promoCode: null };
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart.filter((l) => getProduct(l.productId)) : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      inventory: { ...initialInventory(), ...(parsed.inventory ?? {}) },
      promoCode: parsed.promoCode ?? null,
    };
  } catch {
    return freshState();
  }
}

function clampToStock(state: PersistedState, productId: string, quantity: number): number {
  const stock = state.inventory[productId] ?? 0;
  return Math.max(0, Math.min(quantity, stock));
}

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'cart/add': {
      const existing = state.cart.find((l) => l.productId === action.productId);
      const wanted = (existing?.quantity ?? 0) + action.quantity;
      const quantity = clampToStock(state, action.productId, wanted);
      if (quantity <= 0) return state;
      const cart = existing
        ? state.cart.map((l) => (l.productId === action.productId ? { ...l, quantity } : l))
        : [...state.cart, { productId: action.productId, quantity }];
      return { ...state, cart };
    }
    case 'cart/set': {
      const quantity = clampToStock(state, action.productId, action.quantity);
      const cart =
        quantity <= 0
          ? state.cart.filter((l) => l.productId !== action.productId)
          : state.cart.map((l) => (l.productId === action.productId ? { ...l, quantity } : l));
      return { ...state, cart };
    }
    case 'cart/remove':
      return { ...state, cart: state.cart.filter((l) => l.productId !== action.productId) };
    case 'cart/clear':
      return { ...state, cart: [], promoCode: null };
    case 'wishlist/toggle': {
      const has = state.wishlist.includes(action.productId);
      return {
        ...state,
        wishlist: has
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      };
    }
    case 'promo/set':
      return { ...state, promoCode: action.code };
    case 'order/place': {
      const inventory = { ...state.inventory };
      for (const line of action.order.lines) {
        inventory[line.productId] = Math.max(0, (inventory[line.productId] ?? 0) - line.quantity);
      }
      return { ...state, inventory, orders: [action.order, ...state.orders], cart: [], promoCode: null };
    }
    case 'order/cancel': {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order || order.status !== 'Processing') return state;
      const inventory = { ...state.inventory };
      for (const line of order.lines) {
        inventory[line.productId] = (inventory[line.productId] ?? 0) + line.quantity;
      }
      return {
        ...state,
        inventory,
        orders: state.orders.map((o) => (o.id === order.id ? { ...o, status: 'Cancelled' } : o)),
      };
    }
    case 'reset':
      return freshState();
    default:
      return state;
  }
}

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
}

export interface DetailedCartLine extends CartLine {
  product: Product;
  lineTotal: number;
}

interface StoreValue {
  cart: DetailedCartLine[];
  cartCount: number;
  wishlist: string[];
  orders: Order[];
  promoCode: string | null;
  toasts: Toast[];
  stockOf: (productId: string) => number;
  /** Stock left after subtracting what is already in the cart. */
  availableToAdd: (productId: string) => number;
  totalsFor: (shippingMethod: ShippingMethodId) => Totals;
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  applyPromo: (code: string) => PromoResult;
  removePromo: () => void;
  placeOrder: (input: {
    customer: CustomerDetails;
    shippingMethod: ShippingMethodId;
    payment: PaymentMethod;
  }) => Order;
  cancelOrder: (orderId: string) => void;
  buyAgain: (orderId: string) => number;
  resetDemo: () => void;
  notify: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function generateOrderId(existing: Order[]): string {
  let id = '';
  do {
    id = `LS-${Math.floor(100000 + Math.random() * 900000)}`;
  } while (existing.some((o) => o.id === id));
  return id;
}

let toastSeq = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode); the store still works in memory.
    }
  }, [state]);

  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const cart = useMemo<DetailedCartLine[]>(
    () =>
      state.cart.flatMap((line) => {
        const product = getProduct(line.productId);
        return product ? [{ ...line, product, lineTotal: product.price * line.quantity }] : [];
      }),
    [state.cart],
  );

  const cartCount = cart.reduce((n, l) => n + l.quantity, 0);

  const promo = useMemo(() => {
    if (!state.promoCode) return null;
    const subtotal = cart.reduce((s, l) => s + l.lineTotal, 0);
    const result = validatePromo(state.promoCode, subtotal);
    return result.ok ? result.promo : null;
  }, [state.promoCode, cart]);

  const stockOf = useCallback((id: string) => state.inventory[id] ?? 0, [state.inventory]);

  const availableToAdd = useCallback(
    (id: string) => {
      const inCart = state.cart.find((l) => l.productId === id)?.quantity ?? 0;
      return Math.max(0, (state.inventory[id] ?? 0) - inCart);
    },
    [state.cart, state.inventory],
  );

  const totalsFor = useCallback(
    (method: ShippingMethodId) =>
      computeTotals(
        cart.map((l) => ({ price: l.product.price, quantity: l.quantity })),
        method,
        promo,
      ),
    [cart, promo],
  );

  const value: StoreValue = {
    cart,
    cartCount,
    wishlist: state.wishlist,
    orders: state.orders,
    promoCode: promo?.code ?? null,
    toasts,
    stockOf,
    availableToAdd,
    totalsFor,
    addToCart: (productId, quantity = 1) => {
      const product = getProduct(productId);
      if (!product) return;
      const available = availableToAdd(productId);
      if (available <= 0) {
        notify(
          stockOf(productId) <= 0
            ? `${product.name} is out of stock.`
            : `You already have all ${stockOf(productId)} in your cart.`,
          'error',
        );
        return;
      }
      const added = Math.min(quantity, available);
      dispatch({ type: 'cart/add', productId, quantity: added });
      notify(added < quantity ? `Only ${added} more available — added to cart.` : `Added ${product.name} to your cart.`);
    },
    setQuantity: (productId, quantity) => dispatch({ type: 'cart/set', productId, quantity }),
    removeFromCart: (productId) => {
      dispatch({ type: 'cart/remove', productId });
      const product = getProduct(productId);
      if (product) notify(`Removed ${product.name}.`, 'info');
    },
    toggleWishlist: (productId) => {
      const product = getProduct(productId);
      const saved = state.wishlist.includes(productId);
      dispatch({ type: 'wishlist/toggle', productId });
      if (product) notify(saved ? `Removed ${product.name} from your wishlist.` : `Saved ${product.name} to your wishlist.`, 'info');
    },
    applyPromo: (code) => {
      const subtotal = cart.reduce((s, l) => s + l.lineTotal, 0);
      const result = validatePromo(code, subtotal);
      if (result.ok) dispatch({ type: 'promo/set', code: result.promo.code });
      return result;
    },
    removePromo: () => dispatch({ type: 'promo/set', code: null }),
    placeOrder: ({ customer, shippingMethod, payment }) => {
      const order: Order = {
        id: generateOrderId(state.orders),
        createdAt: new Date().toISOString(),
        status: 'Processing',
        lines: cart.map((l) => ({
          productId: l.productId,
          name: l.product.name,
          price: l.product.price,
          quantity: l.quantity,
        })),
        customer,
        shippingMethod,
        payment,
        promoCode: promo?.code ?? null,
        totals: totalsFor(shippingMethod),
      };
      dispatch({ type: 'order/place', order });
      return order;
    },
    cancelOrder: (orderId) => {
      dispatch({ type: 'order/cancel', orderId });
      notify(`Order ${orderId} was cancelled.`, 'info');
    },
    buyAgain: (orderId) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return 0;
      let added = 0;
      for (const line of order.lines) {
        const qty = Math.min(line.quantity, availableToAdd(line.productId));
        if (qty > 0) {
          dispatch({ type: 'cart/add', productId: line.productId, quantity: qty });
          added += qty;
        }
      }
      notify(added > 0 ? `Added ${added} item${added === 1 ? '' : 's'} to your cart.` : 'Those items are out of stock.', added > 0 ? 'success' : 'error');
      return added;
    },
    resetDemo: () => {
      dispatch({ type: 'reset' });
      notify('Demo data reset.', 'info');
    },
    notify,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
