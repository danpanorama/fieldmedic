# ADR 0003: Claiming a match atomically

- Status: accepted
- Date: 2026-10-23

## Context

When a match opens up, several medics may tap "take" within the same second. The service checks a few things first (license, not started, not taken, no clash), but those checks involve async reads. Two requests can both pass them before either one saves. Without protection, both medics would believe they hold the match.

## Decision

- The checks stay in the service, because they give clear, specific errors.
- The final decision is a single **atomic claim** on the repository: `claim({ matchId, medicId })` returns `'claimed'` or `'already-taken'`. The loser gets `409 MATCH_ALREADY_TAKEN`.
- **In memory (demo):** check-and-set with no `await` in between. JavaScript runs it without interruption, so only one claim can win.
- **Postgres (next):** a `UNIQUE (match_id)` constraint on active assignments, with `INSERT … ON CONFLICT DO NOTHING`. The database guarantees it across many server instances.
- A test fires two concurrent claims and asserts exactly one wins. The test was verified to fail when the atomic step is broken.

## Consequences

- Correct under concurrency for the "same match, two medics" case.
- **Known gap:** one medic taking two _different_ clashing matches at the same instant could pass both clash checks. That's rare (one person, two taps) and will be closed in the Postgres version by locking the medic's row inside a transaction during the claim.
- The web app refetches the list after every attempt, so the loser immediately sees the match disappear.
