# M-store

A responsive fashion storefront built as a frontend portfolio. The focus is a complete browse-to-checkout journey, accessible interactions and predictable shopping state.

[Live demo](https://shopmstore.vercel.app)

Checkout and newsletter subscriptions are simulated. There is no payment provider, email delivery or order backend.

## Run locally

Node.js 22 is specified in `package.json`.

```powershell
npm.cmd ci
npm.cmd start
```

The development server opens on `http://localhost:3000`. On macOS/Linux, use `npm` in place of `npm.cmd`.

```powershell
npm.cmd run build
npm.cmd run test:ci
```

The production build is written to `build/`. Hosting must route application paths such as `/product/1` and `/cart` to `index.html`.

## Experience

- Responsive catalog with search, price and category filters, sorting, result counts and active filter chips.
- Filters stored in the URL, including browser Back/Forward and refresh support.
- Product gallery with keyboard and touch navigation and image enlargement.
- Size/color selection when those options exist in the product data.
- Cart variants, quantity controls, derived totals, removal undo and a persistent wishlist.
- Demo checkout with validation, processing and a dedicated confirmation.
- Loading skeletons, empty states, recoverable request errors and missing-page handling.
- Drawers with Escape, focus trapping and focus restoration.
- Carousel navigation, autoplay with pause on focus/hover and reduced-motion support.
- Newsletter validation and a local confirmation without an outgoing request.

Home collection links use the existing catalog route:

- `/products/all?collection=sale` includes only products whose API previous price is greater than the current price.
- `/products/all?collection=new` includes only products marked `isNew`.
- `/products/all?sub=shoes` and `/products/all?sub=accessories` show those product types across the collection.

The all-product catalog reads `/product` and derives its category filters from the response. Collection chips can be removed or cleared, and the selection survives refresh and browser Back/Forward. Sale can be empty when the API has no reduced prices.

## Architecture

| Area | Responsibility | Entry point |
| --- | --- | --- |
| Routing | Page routes and shared layout | `src/App.js` |
| Catalog | URL parsing, pure filtering and responsive controls | `src/pages/Products/` |
| Requests | Axios requests with cancellation and retry | `src/custom/useFetch.js` |
| Product data | API product fields, optional prices and available variants | `src/helpers/product.js` |
| Shopping state | Cart and wishlist actions; derived quantities/totals | `src/redux/`, `src/helpers/cart.js` |
| Persistence | Cart items and wishlist, excluding open panels and undo state | `src/redux/store.js` |
| Visual system | Colors, spacing, controls, motion and shared Sass mixins | `src/styles/` |

The stack is React 18, React Router 6, Redux Toolkit, Redux Persist, Axios, Sass and selected Material UI primitives. The existing Create React App toolchain is retained.

### Decisions

- **Client-side filtering:** the URL describes the active selection for this small MockAPI collection. A larger catalog would need server-side search, filtering and pagination.
- **Separate remote and shopping state:** request effects abort on unmount or URL changes, and stale responses cannot overwrite the current route. Redux holds cart and wishlist interactions.
- **Derived totals:** totals and item counts are computed from current cart contents. Different size/color combinations have distinct identities.
- **Selective persistence:** refresh restores shopping choices while temporary dialogs and removal feedback start closed.
- **Reduced motion:** user preferences disable animation and carousel autoplay.

## MockAPI

The base URL is configured in `src/helpers/baseURL.js`. Requests read `/product`, `/product/:id` and `/category/:id`. The application does not edit MockAPI records or simulate alternative API responses.

Product titles, descriptions and image URLs come from the API without rewritten copy. Brands are taken from explicit API fields, without inference from the title.

Optional product fields:

```json
{
  "sizes": ["XS", "S", "M", "L", "XL"],
  "colors": ["Black", "Natural"],
  "vendor": "Your actual product brand",
  "compareAtPrice": 79.99
}
```

- `sizes` and `colors` accept arrays of strings or objects with `label`, `name` or `value`. Controls appear only when the API provides options; missing groups are omitted and do not block purchase. Available options must be selected before adding the product.
- `vendor` or `brand` supplies the product brand. Missing brands are not invented.
- `compareAtPrice`, `previousPrice` or `oldPrice` supplies a previous price. It appears only when valid and greater than the current price.
- `isNew` accepts `true` or the string `"true"`.

## Checkout

Use **Fill test details** to populate the form. Invalid fields show validation messages and leave the cart unchanged. A valid submission opens the order confirmation and clears the cart.

Only the order summary needed for confirmation is retained for the current browser session. Payment fields are not sent or persisted.

## Validation

Jest and React Testing Library cover request races and recovery, catalog query handling, cart variants and totals, checkout validation, newsletter validation and carousel accessibility.

```powershell
npm.cmd run test:ci
```

For manual review:

1. Open a collection, search and filter, refresh, then use Back/Forward.
2. Where API options exist, choose two variants and confirm they remain separate cart items.
3. Open a product without variant fields and confirm it can be added directly.
4. Change quantities, remove an item and restore it with Undo.
5. Submit invalid details, confirm the cart is unchanged, then complete the demo checkout.
6. Use the mobile menu, filters and cart with Tab and Escape.
7. Enable reduced motion and confirm the carousel stays still until manually navigated.
