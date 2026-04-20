# Event-Driven Microservices Visualiser — Setup Documentation

## Project Overview

This repository is an event-driven microservices visualiser demo: a browser-based animated visualiser showing events flowing through a RabbitMQ message broker to downstream consumers, delivered to a React frontend via Socket.IO. The stack combines Node.js/Express services, RabbitMQ, Socket.IO, a React + Vite frontend, Docker Compose for local development, and Kubernetes manifests for deployment.

## Prerequisites

- Git (latest stable)
- Node.js (16+)
- Docker Desktop (with Kubernetes enabled for optional k8s workflows)
- kubectl (configured to your cluster)
- Claude Code CLI (for installing the `superpowers` plugin)
- GitHub Copilot CLI (for installing the same plugin via Copilot)

## Initial Setup — Step by Step

Follow these exact steps in order to recreate the repository and plugin scaffolding used here.

1. Clone the repository

```bash
git clone https://github.com/j4sgnup/K8s.git
cd K8s
```

2. Download and copy policy/docs files into the repo root (place these files at repository root):

- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `CHANGELOG.md`
- `LEARNING_LOG.md`

3. Commit and push the repository after adding those files:

```bash
git add CLAUDE.md .github/copilot-instructions.md CHANGELOG.md LEARNING_LOG.md
git commit -m "chore: add policy and documentation files"
git push
```

4. Install the `superpowers` marketplace plugin using the Claude Code CLI (HTTPS form recommended):

```bash
# example: install marketplace from GitHub (HTTPS)
claude plugin marketplace add https://github.com/obra/superpowers.git
# then install the marketplace entry (name may be 'superpowers-marketplace')
claude plugin marketplace add superpowers@superpowers-marketplace
```

5. Repeat the plugin installation steps with the GitHub Copilot CLI if required by your workflow:

```bash
# example: Copilot CLI may support similar plugin commands
copilot plugin marketplace add https://github.com/obra/superpowers.git
copilot plugin marketplace add superpowers@superpowers-marketplace
```

6. Create the Claude sub-agents folder

```bash
mkdir -p .claude/agents
```

7. Fetch the four sub-agent files into `.claude/agents/` (curl examples):

```bash
curl -o .claude/agents/kubernetes-specialist.md <URL-to-VoltAgent>/categories/03-infrastructure/kubernetes-specialist.md
curl -o .claude/agents/docker-expert.md <URL-to-VoltAgent>/categories/03-infrastructure/docker-expert.md
curl -o .claude/agents/microservices-architect.md <URL-to-VoltAgent>/categories/01-core-development/microservices-architect.md
curl -o .claude/agents/react-specialist.md <URL-to-VoltAgent>/categories/02-language-specialists/react-specialist.md
```

Replace `<URL-to-VoltAgent>` with the canonical raw file URLs for the VoltAgent `awesome-claude-code-subagents` repo.

8. Commit the new sub-agents and push:

```bash
git add .claude/agents
git commit -m "chore: add Claude Code sub-agents"
git push
```

9. Scaffold the monorepo structure (mkdir examples):

```bash
mkdir -p services/cart services/payment services/order services/inventory services/notification services/visualiser frontend k8s
```

10. Create placeholder service files for each service (example loop):

```bash
for svc in cart payment order inventory notification visualiser; do
  mkdir -p services/$svc
  cat > services/$svc/index.js <<'JS'
// placeholder service
console.log('placeholder for service: $svc');
JS
  cat > services/$svc/Dockerfile <<'DOCKER'
FROM node:16-alpine
WORKDIR /app
COPY . .
CMD ["node", "index.js"]
DOCKER
  cat > services/$svc/package.json <<'PKG'
{
  "name": "${svc}-service",
  "version": "0.0.1",
  "main": "index.js"
}
PKG
done
```

11. Touch `docker-compose.yml`, `frontend/.gitkeep`, and `k8s/.gitkeep` as placeholders:

```bash
touch docker-compose.yml frontend/.gitkeep k8s/.gitkeep
```

12. Commit scaffold changes

```bash
git add services frontend k8s docker-compose.yml
git commit -m "chore: scaffold monorepo structure"
git push
```

## Notes & Next Steps

- The above `curl` lines for the VoltAgent sub-agent files require the raw file URLs; update them to the correct source location before running.
- If the `claude` or `copilot` CLIs require SSH to fetch private repos, prefer HTTPS URLs or configure SSH keys as needed.
- This README documents the exact setup actions performed; it does not modify runtime behavior of services.

## How to Run (development)

Start all services locally with Docker Compose:

```bash
docker-compose up --build
```

For Kubernetes manifests (optional):

```bash
kubectl apply -f k8s/
kubectl port-forward svc/rabbitmq 15672:15672
```
