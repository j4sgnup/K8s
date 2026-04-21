# Changelog

<!-- Append one line per task: [YYYY-MM-DD] what was done — files affected -->

[2026-04-20] Add README.md documenting setup steps — README.md
[2026-04-20] Replaced frontend/src/App.jsx with three-zone visualiser implementation — frontend/src/App.jsx
[2026-04-20] Add visualiser service: Express + Socket.IO, tests, Dockerfile — services/visualiser/*
[2026-04-21] Implement cart-service (TDD, 8/8 tests) + CartPanel frontend component + docker-compose wiring — services/cart/*, frontend/src/App.jsx, frontend/.env.development, docker-compose.yml
[2026-04-21] Add .superpowers/ and services/cart/node_modules to .gitignore — .gitignore
[2026-04-21] Add services/*/node_modules/, frontend/node_modules/, and .env* patterns to .gitignore — .gitignore
[2026-04-21] Establish cross-agent progress-tracking workflow to keep implementation status synchronized across delivery docs — .github/copilot-instructions.md, CLAUDE.md
[2026-04-21] Align project status reporting with implemented milestones from git history (frontend visualiser, visualiser service, cart service) — .github/copilot-instructions.md, CLAUDE.md
[2026-04-21] Curate changelog language for portfolio-ready, project-impact reporting aligned with microservices/Kubernetes goals — CHANGELOG.md
