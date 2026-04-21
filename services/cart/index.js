const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const VISUALISER_URL = process.env.VISUALISER_URL || 'http://localhost:3006'

const PRODUCTS = [
  { id: 'laptop',   name: 'Laptop',   price: 999 },
  { id: 'keyboard', name: 'Keyboard', price: 129 },
  { id: 'mouse',    name: 'Mouse',    price: 49  },
]

let cart = []

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0)
}

function cartSnapshot() {
  return { items: [...cart], total: cartTotal() }
}

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.get('/products', (req, res) => res.json({ products: PRODUCTS }))

app.get('/cart', (req, res) => res.json(cartSnapshot()))

app.post('/cart/add', async (req, res) => {
  const { productId } = req.body || {}
  if (!productId) return res.status(400).json({ error: 'productId required' })

  const product = PRODUCTS.find(p => p.id === productId)
  if (!product) return res.status(400).json({ error: 'product not found' })

  cart.push({ productId: product.id, name: product.name, price: product.price })

  fetch(`${VISUALISER_URL}/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'CART_ITEM_ADDED', service: 'cart', payload: { item: product.name, qty: 1 } }),
  }).catch(err => console.warn('visualiser unreachable:', err.message))

  return res.json({ ok: true, cart: cartSnapshot() })
})

app.post('/cart/clear', (req, res) => {
  cart = []
  return res.json({ ok: true })
})

if (require.main === module) {
  const port = process.env.PORT || 3001
  app.listen(port, () => console.log(`cart-service listening on ${port}`))
}

module.exports = { app }
