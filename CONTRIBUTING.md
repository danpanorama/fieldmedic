# Contributing

## Workflow

1. Every change starts from an **issue** with a clear definition of done.
2. Create a branch from `main`:
   - `feature/<short-name>`: new capability
   - `fix/<short-name>`: bug fix
   - `chore/<short-name>`: tooling, config, docs
3. Commit in small steps using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: let medics take an open match`
   - `fix: block matches that overlap with travel time`
   - `test: cover back-to-back after a held match`
4. Open a **pull request** using the template. Keep it small (ideally < 400 lines).
5. CI must pass (lint, typecheck, tests, build) and the PR needs a review before merging.
6. **Squash and merge** into `main`. Nobody pushes to `main` directly.

## Code structure

```
apps/api/src/
├── modules/<feature>/     routes → controller → service → repository/source
├── common/                errors and middleware shared by all modules
├── demo/                  in-memory data for the demo
└── container.ts           wires implementations to interfaces

apps/web/src/
├── components/ui/         reusable, business-agnostic components
├── features/<feature>/    api.ts, hooks/, components/, index.ts (public API)
├── pages/                 thin: compose features, handle loading/error/empty
└── lib/                   api client, formatting, helpers

packages/shared/src/       pure domain logic and API contracts used by both apps
```

### Rules of thumb

- **Controllers** translate HTTP only. **Services** hold business logic and don't know about HTTP.
- Services depend on **interfaces**, not on concrete databases or APIs.
- Components don't call `fetch`. Data flows: `api.ts` → hook (TanStack Query) → component.
- A component over ~150 lines usually wants to be split.
- Import a feature only through its `index.ts`.
- Every bug fix comes with a test that would have caught it.

## Running checks locally

```bash
npm run lint
npm run typecheck
npm test
```

A pre-commit hook (Husky + lint-staged) formats and lints the files you commit.
