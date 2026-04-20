const request = require('supertest')
const { app } = require('../index')

describe('visualiser service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  test('POST /event broadcasts and returns ok', async () => {
    const evt = { type: 'TEST_EVENT', service: 'visualiser', payload: { foo: 'bar' } }
    const res = await request(app).post('/event').send(evt)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  test('POST /event missing fields returns 400', async () => {
    const res = await request(app).post('/event').send({ service: 'x' })
    expect(res.status).toBe(400)
  })
})
