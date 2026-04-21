# Learning Log

<!-- Append one line per insight: [YYYY-MM-DD] INSIGHT/MISTAKE/DECISION: what happened and why it matters -->
[2026-04-21] MISTAKE: Assumed Node 16 from README prerequisite — actual Dockerfiles use node:20-alpine and local runtime is Node 22; Node 20+ has native fetch so node-fetch is never needed in this project.
[2026-04-21] INSIGHT: Copilot CLI adjusted frontend deps during install (`socket.io-client` resolved to 4.8.3 in lockfile while `package.json` lists ^4.7.2). `framer-motion` remains on v10 in `package.json` (10.x) but v12 is available upstream — v12 is a major rework (rebranded to Motion, new import paths like `motion/react`) yet its peerDependencies explicitly support `react` ^18 || ^19, so React 19 is supported. Recommendation: keep framer-motion at v10 unless you want to migrate code to Motion v12; update `package.json` to align `socket.io-client` to ^4.8.3 or run `npm install` to sync lockfile. — investigation: checked npm registry and package-lock.json
