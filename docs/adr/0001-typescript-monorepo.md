# ADR 0001: TypeScript monorepo with a shared package

- Status: accepted
- Date: 2026-10-22

## Context

The API and the web app must agree on the rules for clashes and back-to-back matches, and on the JSON shapes they exchange. If each side keeps its own copy, they drift apart and bugs show up only in production.

## Decision

- One repository with npm workspaces: `apps/api`, `apps/web`, `packages/shared`.
- Strict TypeScript everywhere.
- Scheduling rules (`evaluateFit`) and API contracts (`contracts.ts`) live in `packages/shared` as pure code with no framework dependencies.

## Consequences

- A contract change that breaks the other side fails `npm run typecheck` before merge.
- The scheduling engine is tested once, in isolation, and reused by both apps.
- Slightly more setup (workspaces, bundling `shared` into the API build) than two separate repos.
