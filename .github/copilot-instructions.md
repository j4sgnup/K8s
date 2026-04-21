# Event-Driven Microservices Demo — Copilot Instructions

## Repository

**GitHub:** https://github.com/j4sgnup/K8s

---

## What This Is

A browser-based animated visualiser demonstrating an event-driven microservices architecture in real time. The user adds products to a cart, triggers checkout, and watches events flow through a RabbitMQ message broker to downstream consumers — all animated live in a React frontend via Socket.IO. Built for demo purposes: in-memory state, no auth, no database.

---

## Logging Rules (MANDATORY)

After **every task or code change**, append one line to `CHANGELOG.md`:
```
[YYYY-MM-DD] <what was done> — <files affected>
```

When you hit a **non-obvious problem, make a design decision, or learn something unexpected**, append one line to `LEARNING_LOG.md`:
```
[YYYY-MM-DD] INSIGHT/MISTAKE/DECISION: <what happened and why it matters>
```

Never rewrite these files. Always append. Never skip this step.

---

## Status Sync Rules (MANDATORY)

After every meaningful progress update (task completed, milestone reached, blocker found/cleared), update the **Current Status** section in both instruction files:
- `.github/copilot-instructions.md`
- `CLAUDE.md`

Keep these three lines in sync across both files:
- **Last completed**
- **Currently working on**
- **Known issues / blockers**

Do not wait for the user to ask. If progress changed, update both files in the same response.

---


## README Maintenance

The README.md must always reflect the current state of the project.

After any of the following, update README.md immediately:
- A new setup step is completed (installs, scaffolding, config)
- A new service is created or wired up
- A new tool, plugin, or sub-agent is added
- docker-compose.yml or any k8s manifest is changed
- A new npm dependency is added to any service or the frontend

### README sections to keep in sync

| Section | What triggers an update |
|---|---|
| Initial Setup | Any new shell command run during project setup |
| Repo Structure | Any new file or directory added |
| Sub-Agents | Any new .claude/agents/ file |
| Service Map | Any new service or port change |
| Dependencies | Any npm install across any package.json |
| How to Run | Any change to docker-compose or k8s manifests |

### Rule
When Copilot generates or edits any file in this repo, check whether that change 
affects the README. If it does, append or update the relevant section in the same 
response. Never leave README.md stale.

## Monorepo Structure

```
event-demo/
├── services/
│   ├── cart/
│   ├── payment/
│   ├── order/
│   ├── inventory/
│   ├── notification/
│   └── visualiser/
├── frontend/
├── k8s/
├── docker-compose.yml
├── .github/
│   └── copilot-instructions.md
├── CHANGELOG.md
└── LEARNING_LOG.md
```

---

## Service Map

| Service | Port | Role |
|---|---|---|
| `cart-service` | 3001 | Hard-coded product catalogue, in-memory cart, POST endpoints |
| `payment-service` | 3002 | Hard-coded payment, success by default, force-fail toggle |
| `order-service` | 3003 | Consumes `PAYMENT_SUCCESS`, emits `ORDER_CREATED` |
| `inventory-service` | 3004 | Consumes `PAYMENT_SUCCESS`, emits `STOCK_UPDATED` |
| `notification-service` | 3005 | Consumes `ORDER_CREATED`, emits `NOTIFICATION_SENT` |
| `visualiser-service` | 3006 | Socket.IO hub — all services POST events here, broadcasts to frontend |
| `frontend` | 5173 | React/Vite, Socket.IO client, animated three-zone layout |
| `rabbitmq` | 5672 / 15672 | AMQP broker + management UI (guest/guest) |

---

## Event Flow

```
User: Add to Cart     → cart-service         → CART_ITEM_ADDED
User: Checkout        → payment-service      → PAYMENT_INITIATED → PAYMENT_SUCCESS / PAYMENT_FAILED
PAYMENT_SUCCESS       → order-service        → ORDER_CREATED
PAYMENT_SUCCESS       → inventory-service    → STOCK_UPDATED
ORDER_CREATED         → notification-service → NOTIFICATION_SENT
```

All services POST to `visualiser-service` on port 3006 when they emit or consume an event.
`visualiser-service` broadcasts via Socket.IO to the React frontend.

---

## Tech Stack

- **Services**: Node.js / Express
- **Message broker**: RabbitMQ (`rabbitmq:management`) via `amqplib`
- **Real-time push**: Socket.IO
- **Frontend**: React + Vite + Framer Motion
- **Containers**: Docker + docker-compose
- **Orchestration**: Kubernetes (Deployments, ClusterIP Services, Ingress)

---

## Decisions Already Made — Do Not Revisit

- **In-memory state only** — no databases, no persistence across restarts
- **No auth** — demo only
- **RabbitMQ over Redis/Kafka** — management UI at 15672 is part of the demo
- **Artificial 800ms delay** in every consumer — makes animation readable
- **Visualiser as HTTP event sink** — services POST events to it; it does not consume from RabbitMQ directly
- **docker-compose is the dev environment** — K8s manifests are a deliverable, not dev workflow
- **React canvas built against mock data first** — canned replay button validates animation before backend is wired

---

## Testing Stack

| Layer | Tool | What |
|---|---|---|
| Unit | Jest | Service logic, event payload shapes |
| Integration | Supertest | HTTP endpoints per service |
| E2E | Playwright | Full flow via React UI |
| Load | k6 (Phase 2) | Multi-user horizontal scaling demo |

Every service has a `__tests__/` folder. Do not skip tests.

---

## Build Order

- [ ] 1. React frontend — three-zone layout, Framer Motion, Socket.IO client, mock replay button
- [ ] 2. Visualiser service — Express + Socket.IO hub, accepts POST `/event`, broadcasts to clients
- [ ] 3. Cart service — hard-coded products, in-memory cart, POST `/cart/add` and `/cart/clear`
- [ ] 4. Payment service — POST `/payment/process`, force-fail toggle, publishes to RabbitMQ
- [ ] 5. Order, inventory, notification consumers — consume from RabbitMQ, POST to visualiser
- [ ] 6. docker-compose — wire all services, RabbitMQ, environment variables
- [ ] 7. K8s manifests — Deployments, ClusterIP Services, Ingress

---

## Current Status

> **Update this section as you build.**

**Last completed:** _frontend visualiser, visualiser service, and cart service with tests wired in docker-compose_
**Currently working on:** _payment service implementation and RabbitMQ publish flow_
**Known issues / blockers:** _none_

---

## How to Run

```bash
# Dev
docker-compose up --build

# K8s
kubectl apply -f k8s/
kubectl port-forward svc/rabbitmq 15672:15672
```

| URL | What |
|---|---|
| http://localhost:5173 | React visualiser |
| http://localhost:15672 | RabbitMQ management UI |
