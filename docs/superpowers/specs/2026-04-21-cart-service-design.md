# Cart Service Design

**Date:** 2026-04-21  
**Scope:** `services/cart` backend + `frontend/src/App.jsx` cart panel  
**Status:** Approved for implementation

---

## Problem

The project has a scaffolded cart-service placeholder and a frontend that only displays events. There is no way for a user to interact with the demo — no products to add, no cart to view, no event to trigger. This design adds a working cart service and a cart panel in the React UI to make the demo driveable by hand.

---

## Scope

**In scope:**
- `cart-service` Express app (port 3001): product catalogue, in-memory cart, 5 REST endpoints
- `CartPanel` React component: product list, cart items, total, disabled checkout button
- Frontend layout change: 3-column grid → `Cart (280px) | Services (180px) | Event Stream (1fr)`
- Legend moves from standalone right column into Event Stream panel footer
- docker-compose: add `cart` service entry

**Out of scope:**
- Checkout / payment wiring (payment-service is a separate design)
- Quantity increment (each add creates a new line item — demo simplicity)
- Cart persistence across restarts
- Auth

---

## Architecture

### `cart-service` (port 3001)

Express.js service, Node.js. No database. Two in-memory structures:

**Product catalogue** (hard-coded at startup, never mutates):
```js
[
  { id: 'laptop',   name: 'Laptop',   price: 999 },
  { id: 'keyboard', name: 'Keyboard', price: 129 },
  { id: 'mouse',    name: 'Mouse',    price: 49  },
]
```

**Cart** (mutable in-memory array, resets on restart):
```js
// Each entry:
{ productId, name, price }
```

**Endpoints:**

| Method | Path | Request | Response |
|--------|------|---------|----------|
| `GET` | `/health` | — | `{ status: 'ok' }` |
| `GET` | `/products` | — | `{ products: [...] }` |
| `GET` | `/cart` | — | `{ items: [...], total: number }` |
| `POST` | `/cart/add` | `{ productId: string }` | `{ ok: true, cart: { items, total } }` |
| `POST` | `/cart/clear` | — | `{ ok: true }` |

On `POST /cart/add`, the service:
1. Validates `productId` exists in catalogue
2. Appends `{ productId, name, price }` to cart array
3. POSTs `CART_ITEM_ADDED` event to `visualiser-service` (fire-and-forget, errors logged but not fatal)
4. Returns `{ ok: true, cart: { items, total } }`

### Frontend — `CartPanel` component

New component rendered as the leftmost column in `App.jsx`.

**State:** `products` (fetched once on mount), `cartItems` (updated from `POST /cart/add` response).

**Interactions:**
- Mount: `GET /products` → populate product list
- `+ Add` click: `POST /cart/add { productId }` → update `cartItems` from response
- Cart items section renders current `cartItems` with per-item price and running total
- Checkout button: always rendered, always disabled; label `"Checkout → (payment not wired)"`

### Layout change

Current grid: `1fr 1fr 1fr` (Services | Event Stream | Legend)  
New grid: `280px 180px 1fr` (Cart | Services | Event Stream)

Legend moves into the Event Stream panel as a compact footer (colour dots + event name labels, horizontally wrapped).

---

## Data Flow

```
User clicks "+ Add" (Laptop)
  → CartPanel: POST /cart/add { productId: "laptop" }
    → cart-service: appends to cart array
    → cart-service: POST visualiser:3006/event
        { type: "CART_ITEM_ADDED", service: "cart", payload: { item: "Laptop", qty: 1 } }
        (qty is always 1 — no quantity tracking, each add is a separate line item)
    → cart-service: returns { ok: true, cart: { items, total } }
  → CartPanel: updates cartItems state from response body
  → Visualiser: broadcasts CART_ITEM_ADDED via Socket.IO
  → App.jsx: event pill appears in stream, cart-service node pulses
```

---

## Error Handling

**cart-service:**
- Missing `productId` in body → `400 { error: "productId required" }`
- Unknown `productId` → `400 { error: "product not found" }`
- Visualiser unreachable → `console.warn`, continue — return `200` with cart data (event silently drops)

**Frontend:**
- `/products` fetch fails → show `"Service unavailable"` message in cart panel
- `/cart/add` fails → no optimistic update; show no UI change (event simply didn't happen)

---

## Testing

**`services/cart/__tests__/cart.test.js`** (Jest + Supertest):

| Test | Type |
|------|------|
| `GET /health` returns `{ status: 'ok' }` | Integration |
| `GET /products` returns all 3 products with correct shape | Integration |
| `GET /cart` returns empty cart initially | Integration |
| `POST /cart/add` with valid productId → 200, cart contains item | Integration |
| `POST /cart/add` with unknown productId → 400 | Integration |
| `POST /cart/add` missing productId → 400 | Integration |
| `POST /cart/clear` empties cart | Integration |
| `POST /cart/add` posts CART_ITEM_ADDED to visualiser (mock fetch) | Unit |
| Event payload shape matches `{ type, service, payload: { item, qty } }` | Unit |

---

## docker-compose changes

Add to `docker-compose.yml`:

```yaml
  cart:
    build:
      context: ./services/cart
    image: cart-service:dev
    ports:
      - '3001:3001'
    environment:
      - PORT=3001
      - VISUALISER_URL=http://visualiser:3006
    depends_on:
      - visualiser
```

Frontend environment variable: `VITE_CART_URL=http://localhost:3001` (`.env.development`).

---

## Files Affected

| File | Change |
|------|--------|
| `services/cart/index.js` | Implement full service (replaces scaffold) |
| `services/cart/package.json` | Add `express`, `cors` (native fetch used — Node 20+) |
| `services/cart/Dockerfile` | Update for production-ready image |
| `services/cart/__tests__/cart.test.js` | New test file |
| `frontend/src/App.jsx` | Add `CartPanel`, update layout, move legend to footer |
| `frontend/.env.development` | Add `VITE_CART_URL` |
| `docker-compose.yml` | Add cart service entry |
