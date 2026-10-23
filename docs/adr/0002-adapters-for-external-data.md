# ADR 0002: Interfaces (adapters) for external and stored data

- Status: accepted
- Date: 2026-10-22

## Context

Matches will come from the Football Association, and licenses from a license registry. We don't have access to either yet, and we haven't set up a database. We still want to build and demo the product now.

## Decision

Services depend only on interfaces: `MatchSource`, `MedicRepository`, `AssignmentRepository` (and later `LicenseVerifier`). For the demo, in-memory implementations in `apps/api/src/demo/` back them. `container.ts` is the single place that chooses the implementations.

## Consequences

- We can build and test the whole product before any integration exists.
- Plugging in the real feed, Postgres, or the registry is a new implementation plus one line in `container.ts`, with no changes to services or routes.
- Tests use small fakes instead of a real database, so they're fast and deterministic.
