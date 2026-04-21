import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'

const CART_URL = import.meta.env.VITE_CART_URL || 'http://localhost:3001'

const EVENT_COLOURS = {
  CART_ITEM_ADDED:    '#60a5fa',
  PAYMENT_INITIATED:  '#f59e0b',
  PAYMENT_SUCCESS:    '#34d399',
  PAYMENT_FAILED:     '#f87171',
  ORDER_CREATED:      '#a78bfa',
  STOCK_UPDATED:      '#38bdf8',
  NOTIFICATION_SENT:  '#fb923c',
}

const SERVICES = ['cart','payment','order','inventory','notification','visualiser']

const MOCK_EVENTS = [
  { type:'CART_ITEM_ADDED',   service:'cart',         payload:{ item:'Laptop', qty:1 } },
  { type:'PAYMENT_INITIATED', service:'payment',      payload:{ amount:999 } },
  { type:'PAYMENT_SUCCESS',   service:'payment',      payload:{ txId:'TX-001' } },
  { type:'ORDER_CREATED',     service:'order',        payload:{ orderId:'ORD-001' } },
  { type:'STOCK_UPDATED',     service:'inventory',    payload:{ item:'Laptop', stock:9 } },
  { type:'NOTIFICATION_SENT', service:'notification', payload:{ msg:'Order confirmed' } },
]

function CartPanel() {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    fetch(`${CART_URL}/products`)
      .then(r => r.json())
      .then(d => setProducts(d.products))
      .catch(() => setUnavailable(true))
  }, [])

  async function handleAdd(productId) {
    try {
      const res = await fetch(`${CART_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) return
      const data = await res.json()
      setCartItems(data.cart.items)
    } catch {
      // silent — event simply didn't happen
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.price, 0)

  if (unavailable) return (
    <div style={{ background:'#141824', borderRadius:12, padding:20 }}>
      <h2 style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>🛒 Cart</h2>
      <p style={{ color:'#475569', fontSize:13, marginTop:20 }}>Service unavailable</p>
    </div>
  )

  return (
    <div style={{ background:'#141824', borderRadius:12, padding:20 }}>
      <h2 style={{ fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>🛒 Cart</h2>

      <div style={{ fontSize:10, color:'#475569', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>Products</div>
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
        {products.map(p => (
          <div key={p.id} style={{ background:'#1e2533', borderRadius:8, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{p.name}</div>
              <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>${p.price}</div>
            </div>
            <button onClick={() => handleAdd(p.id)} style={{ padding:'5px 14px', borderRadius:6, border:'none', background:'#3b82f6', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              + Add
            </button>
          </div>
        ))}
      </div>

      <div style={{ borderTop:'1px solid #1e2533', paddingTop:16, marginBottom:12 }}>
        <div style={{ fontSize:10, color:'#475569', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 }}>
          Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {cartItems.length === 0
            ? <p style={{ color:'#334155', fontSize:12, textAlign:'center', paddingTop:4 }}>Empty</p>
            : cartItems.map((item, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#94a3b8', background:'#0f1117', padding:'8px 10px', borderRadius:6 }}>
                <span>{item.name}</span><span>${item.price}</span>
              </div>
            ))
          }
        </div>
      </div>

      {cartItems.length > 0 && (
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'#e2e8f0', fontWeight:700, marginBottom:14, padding:'0 2px' }}>
          <span>Total</span><span>${total}</span>
        </div>
      )}

      <button disabled style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid #2d3748', background:'#1e2533', color:'#475569', fontSize:13, fontWeight:600, cursor:'not-allowed' }}>
        Checkout → (payment not wired)
      </button>
    </div>
  )
}

function EventPill({ event }) {
  const colour = EVENT_COLOURS[event.type] || '#94a3b8'
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
      style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'8px 12px', borderRadius:8, marginBottom:6,
        background:'#1e2533', borderLeft:`3px solid ${colour}`,
      }}
    >
      <span style={{ color:colour, fontWeight:700, fontSize:12 }}>{event.type}</span>
      <span style={{ color:'#64748b', fontSize:11 }}>← {event.service}</span>
      <span style={{ color:'#475569', fontSize:11, marginLeft:'auto' }}>
        {JSON.stringify(event.payload)}
      </span>
    </motion.div>
  )
}

function ServiceNode({ name, active }) {
  return (
    <motion.div
      animate={{ scale: active ? 1.08 : 1, boxShadow: active ? '0 0 16px #60a5fa88' : 'none' }}
      transition={{ type:'spring', stiffness:300, damping:20 }}
      style={{
        padding:'10px 16px', borderRadius:10,
        background: active ? '#1e3a5f' : '#1a1f2e',
        border:`1px solid ${active ? '#60a5fa' : '#2d3748'}`,
        fontSize:13, fontWeight:600, color: active ? '#93c5fd' : '#94a3b8',
        textAlign:'center', cursor:'default', userSelect:'none',
      }}
    >
      {name}-service
    </motion.div>
  )
}

export default function App() {
  const [events, setEvents]        = useState([])
  const [activeService, setActive] = useState(null)
  const [connected, setConnected]  = useState(false)
  const [replaying, setReplaying]  = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = io('http://localhost:3006', { autoConnect:true, reconnectionAttempts:3 })
    socketRef.current = socket
    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('event', (evt) => {
      setEvents(prev => [evt, ...prev].slice(0, 50))
      setActive(evt.service)
      setTimeout(() => setActive(null), 800)
    })
    return () => socket.disconnect()
  }, [])

  async function handleReplay() {
    setReplaying(true)
    setEvents([])
    for (const evt of MOCK_EVENTS) {
      await new Promise(r => setTimeout(r, 900))
      setEvents(prev => [evt, ...prev])
      setActive(evt.service)
      await new Promise(r => setTimeout(r, 600))
      setActive(null)
    }
    setReplaying(false)
  }

  return (
    <div style={{ minHeight:'100vh', padding:24, display:'flex', flexDirection:'column', gap:20, background:'#0f1117', color:'#e2e8f0', fontFamily:'system-ui' }}>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700 }}>⚡ Event-Driven Microservices</h1>
          <p style={{ fontSize:12, color:'#475569', marginTop:2 }}>RabbitMQ · Socket.IO · Kubernetes</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{
            fontSize:11, padding:'4px 10px', borderRadius:20,
            background: connected ? '#052e16' : '#1c1917',
            color: connected ? '#34d399' : '#78716c',
            border:`1px solid ${connected ? '#166534' : '#44403c'}`,
          }}>
            {connected ? '● live' : '○ mock'}
          </span>
          <button onClick={handleReplay} disabled={replaying} style={{
            padding:'8px 16px', borderRadius:8, border:'none',
            cursor: replaying ? 'not-allowed' : 'pointer',
            background: replaying ? '#1e2533' : '#3b82f6',
            color:'#fff', fontWeight:600, fontSize:13, opacity: replaying ? 0.5 : 1,
          }}>
            {replaying ? '▶ replaying…' : '▶ Replay Demo'}
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 180px 1fr', gap:16, flex:1 }}>

        <CartPanel />

        <div style={{ background:'#141824', borderRadius:12, padding:16 }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:'#64748b', marginBottom:14, textTransform:'uppercase', letterSpacing:1 }}>Services</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {SERVICES.map(s => <ServiceNode key={s} name={s} active={activeService === s} />)}
          </div>
        </div>

        <div style={{ background:'#141824', borderRadius:12, padding:16, display:'flex', flexDirection:'column' }}>
          <h2 style={{ fontSize:13, fontWeight:700, color:'#64748b', marginBottom:14, textTransform:'uppercase', letterSpacing:1 }}>Event Stream</h2>
          <div style={{ flex:1, overflowY:'auto' }}>
            <AnimatePresence initial={false}>
              {events.map((evt, i) => <EventPill key={`${evt.type}-${i}`} event={evt} />)}
            </AnimatePresence>
            {events.length === 0 && (
              <p style={{ color:'#334155', fontSize:13, textAlign:'center', marginTop:40 }}>
                No events yet — hit ▶ Replay Demo
              </p>
            )}
          </div>
          <div style={{ borderTop:'1px solid #1e2533', paddingTop:12, marginTop:8 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>▾ Legend</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {Object.entries(EVENT_COLOURS).map(([type, colour]) => (
                <div key={type} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:colour, flexShrink:0 }} />
                  <span style={{ fontSize:10, color:'#64748b' }}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div style={{ textAlign:'center', fontSize:11, color:'#334155' }}>
        RabbitMQ management → <a href="http://localhost:15672" target="_blank" rel="noreferrer" style={{ color:'#475569' }}>localhost:15672</a> (guest/guest)
      </div>
    </div>
  )
}
