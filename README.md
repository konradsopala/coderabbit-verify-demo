# Lumen Supply

A demo home-office store built to try out [CodeRabbit Verify](https://coderabbit.ai) on a real, running web app.
It is a single-page React app with no backend: catalog data ships with the app, and the cart, wishlist,
orders, and stock levels are saved in the browser's `localStorage`, so they survive a page reload.

No real orders ship and no payment is taken.

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests for pricing and catalog logic (Vitest) |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build on http://localhost:4173 |

There are no environment variables or accounts to set up.

## Key user journeys

These are the flows the store's business depends on. Each one should keep working as the app changes.

1. **Browse by category** — From the home page, open a category tile (for example *Desk essentials*). Only
   products in that category are listed, and the category radio in the filter panel is selected.
2. **Find relevant products** — Search from the header (for example `oak desk`); every search term must
   match. Combine a category with a price range (inclusive, in dollars) and *In stock only*. Sorting
   (price, rating, newest, name) reorders the current results and never drops the active filters.
   Filters live in the URL, so a reload or a shared link shows the same results. Each active filter shows
   as a removable chip, and *Clear all* resets everything.
3. **Mobile navigation** — Under 1024 px the header nav collapses into a menu drawer with search and
   every category. Under 860 px the shop's filters open as a bottom sheet from the *Filters* button.
4. **Product details** — A product page shows price, sale savings, stock status, highlights, and reviews.
   The quantity stepper never exceeds the stock that is not already in the cart. Sold-out products cannot
   be added.
5. **Cart** — Change quantities (capped at stock), remove items, and see the line totals and summary update.
   The cart badge in the header shows the total item count.
6. **Promo codes** — Codes are case-insensitive. An unknown code shows an error.
7. **Checkout** — Contact and delivery fields are validated (name, email, street, city, postal code,
   country). Submitting with errors highlights each invalid field and focuses the first one. Shipping and
   payment choices update the total, and the *Place order* button shows that total.
8. **Order confirmation and history** — Placing an order empties the cart, lowers stock, and opens the order
   page with a confirmation banner. The order stays in *Orders* after a reload, with every item, the
   delivery address, and the same totals.
9. **Cancel and buy again** — Cancelling a *Processing* order marks it *Cancelled* and returns its items to
   stock. *Buy again* puts the order's items back into the cart, as far as stock allows.
10. **Wishlist** — The heart on any product saves it. Saved products appear on the *Wishlist* page and the
    header badge counts them.

The footer's **Reset demo data** button clears the cart, wishlist, orders, and stock changes.

## Pricing rules

All amounts are integer cents internally (`src/lib/pricing.ts`).

- **Shipping:** Standard is $7.99 and free when the subtotal after discounts is $150 or more. Express is
  always $19.99.
- **Tax:** 8% of the subtotal after discounts. Shipping is not taxed.
- **Promo codes** (one per order):

  | Code | Effect |
  | --- | --- |
  | `WELCOME10` | 10% off the subtotal |
  | `DESK25` | $25 off subtotals of $200 or more |
  | `FREESHIP` | Free standard shipping |

## Test data

Some products are set up to exercise edge cases:

| Product | Why |
| --- | --- |
| Walnut Corner Desk, Ash Desk Organizer | Sold out (stock 0) |
| Fold Laptop Stand | Low stock (3 left) |
| Oakline Standing Desk, Riser Monitor Stand | On sale |

Checkout accepts any well-formed test details, for example `Test Shopper`, `shopper@example.com`,
`12 Test Street`, `Springfield`, `12345`.

## Project layout

```
src/
  data/products.ts         Catalog: categories and products
  lib/pricing.ts           Shipping, tax, promo codes, totals
  lib/catalog.ts           Search, filter, and sort
  state/StoreContext.tsx   Cart, wishlist, orders, stock; persisted to localStorage
  components/              Header (with mobile menu), product card, stepper, summary, toasts
  pages/                   Home, Shop, Product, Cart, Checkout, Orders, Order detail, Wishlist
```
