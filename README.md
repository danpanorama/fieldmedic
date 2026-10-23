# FieldMedic

**Self-scheduling for football match medics.** Medics see open matches near them and assign themselves. The system blocks clashes (including travel time between venues), suggests back-to-back matches, and helps coordinators fill last-minute gaps.

> 🚧 In active development: Sprint 1 (self-assignment) in review. Product spec: [docs/PRODUCT.md](docs/PRODUCT.md)

## What works today

- **Scheduling engine:** decides whether a match is _free_, a _clash_ (time overlap or not enough time to drive), or _back-to-back_ with a match the medic already holds
- **API:** `GET /api/medics/:id/open-matches` returns open matches with a fit for each, from demo data
- **Taking a match:** `POST /api/medics/:id/assignments`, safe when two medics tap at the same moment ([ADR 0003](docs/adr/0003-atomic-match-claim.md))
- **Web:** mobile-first Hebrew (RTL) "open matches" screen with one-tap self-assignment

## Tech stack

| Layer    | Tech                                                         |
| -------- | ------------------------------------------------------------ |
| Language | TypeScript (strict) end to end                               |
| Web      | React 19, Vite, Tailwind CSS 4, TanStack Query, React Router |
| API      | Node.js, Express 5, Zod                                      |
| Testing  | Vitest, Supertest, Testing Library                           |
| Quality  | ESLint, Prettier, Husky + lint-staged, GitHub Actions CI     |

## Architecture

```
fieldmedic/
├── apps/
│   ├── api/        Express API: feature modules (routes → controller → service → source)
│   └── web/        React app: ui components, feature folders, thin pages
└── packages/
    └── shared/     Scheduling engine + API contracts used by both apps
```

Key decisions are recorded as ADRs in [docs/adr](docs/adr).

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev:api     # http://localhost:4000
npm run dev:web     # http://localhost:5173
```

## Scripts

| Command             | What it does                       |
| ------------------- | ---------------------------------- |
| `npm test`          | All unit, integration and UI tests |
| `npm run lint`      | ESLint + Prettier check            |
| `npm run typecheck` | Type-checks every workspace        |
| `npm run build`     | Builds the API and the web app     |

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and code structure.
