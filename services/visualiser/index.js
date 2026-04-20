const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.post('/event', (req, res) => {
  const { type, service, payload } = req.body || {}
  if (!type || !service) return res.status(400).json({ error: 'type and service required' })

  // If socket.io is attached, broadcast to all clients
  try {
    if (global.__VISUALISER_IO) global.__VISUALISER_IO.emit('event', { type, service, payload })
  } catch (err) {
    // non-fatal
    console.error('emit error', err)
  }

  return res.json({ ok: true })
})

function start(port = process.env.PORT || 3006) {
  const http = require('http')
  const server = http.createServer(app)
  const { Server } = require('socket.io')

  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  })

  global.__VISUALISER_IO = io

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id)
    socket.on('disconnect', () => console.log('socket disconnected', socket.id))
  })

  server.listen(port, () => console.log(`visualiser listening on ${port}`))

  return { server, io }
}

if (require.main === module) {
  start()
}

module.exports = { app, start }
