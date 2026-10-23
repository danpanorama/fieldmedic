import type { AssignmentRepository } from '../modules/assignments/assignment.repository';
import type { MatchSource } from '../modules/matches/match.source';
import type { MedicRepository } from '../modules/medics/medic.repository';
import { buildDemoData } from './demo-data';

/** In-memory implementations of every data interface. Replaced by Postgres + the real feed later. */
export function createDemoStore(now: Date = new Date()) {
  const data = buildDemoData(now);

  const matches: MatchSource = {
    listMatches: async ({ from, to }) =>
      data.matches.filter((m) => m.startsAt >= from && m.startsAt < to),
    listVenues: async () => data.venues,
  };

  const medics: MedicRepository = {
    findById: async (id) => data.medics.find((m) => m.id === id) ?? null,
  };

  const assignments: AssignmentRepository = {
    listAll: async () => data.assignments,
  };

  return { matches, medics, assignments };
}
