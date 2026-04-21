const request = require('supertest')
const { app } = require('../index')

beforeEach(async () => {
  await request(app).post('/cart/clear')
})

describe('GET /health', () => {
  test('returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('GET /products', () => {
  test('returns all 3 products with correct shape', async () => {
    const res = await request(app).get('/products')
    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(3)
    res.body.products.forEach(p => {
      expect(p).toMatchObject({ id: expect.any(String), name: expect.any(String), price: expect.any(Number) })
    })
  })
})

describe('GET /cart', () => {
  test('returns empty cart initially', async () => {
    const res = await request(app).get('/cart')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ items: [], total: 0 })
  })
})

describe('POST /cart/add', () => {
  test('valid productId adds item and returns updated cart', async () => {
    const res = await request(app).post('/cart/add').send({ productId: 'laptop' })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.cart.items).toHaveLength(1)
    expect(res.body.cart.items[0]).toMatchObject({ productId: 'laptop', name: 'Laptop', price: 999 })
    expect(res.body.cart.total).toBe(999)
  })

  test('unknown productId returns 400', async () => {
    const res = await request(app).post('/cart/add').send({ productId: 'toaster' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'product not found' })
  })

  test('missing productId returns 400', async () => {
    const res = await request(app).post('/cart/add').send({})
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'productId required' })
  })

  test('POSTs CART_ITEM_ADDED event to visualiser with correct payload', async () => {
    const originalFetch = global.fetch
    const mockFetch = jest.fn().mockResolvedValue({ ok: true })
    global.fetch = mockFetch

    try {
      await request(app).post('/cart/add').send({ productId: 'keyboard' })
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, opts] = mockFetch.mock.calls[0]
      expect(url).toContain('/event')
      const body = JSON.parse(opts.body)
      expect(body).toMatchObject({
        type: 'CART_ITEM_ADDED',
        service: 'cart',
        payload: { item: 'Keyboard', qty: 1 },
      })
    } finally {
      global.fetch = originalFetch
    }
  })
})

describe('POST /cart/clear', () => {
  test('empties the cart', async () => {
    await request(app).post('/cart/add').send({ productId: 'mouse' })
    const after = await request(app).post('/cart/clear')
    expect(after.status).toBe(200)
    expect(after.body).toEqual({ ok: true })
    const cart = await request(app).get('/cart')
    expect(cart.body).toEqual({ items: [], total: 0 })
  })
})
