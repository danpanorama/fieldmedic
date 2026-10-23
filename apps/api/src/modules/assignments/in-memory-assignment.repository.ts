import type { Assignment, AssignmentRepository } from './assignment.repository';

export function createInMemoryAssignmentRepository(
  initial: Assignment[] = [],
): AssignmentRepository {
  const byMatchId = new Map(initial.map((a) => [a.matchId, a]));

  return {
    listAll: async () => [...byMatchId.values()],

    // Check and set with no `await` in between: JavaScript runs this as one uninterrupted step,
    // so two concurrent claims can never both win. The Postgres version gets the same guarantee
    // from a UNIQUE constraint on match_id (see docs/adr/0003).
    claim: async (assignment) => {
      if (byMatchId.has(assignment.matchId)) return 'already-taken';
      byMatchId.set(assignment.matchId, assignment);
      return 'claimed';
    },
  };
}
