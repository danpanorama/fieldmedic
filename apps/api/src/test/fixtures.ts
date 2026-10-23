import type { Assignment } from '../modules/assignments/assignment.repository';
import { createInMemoryAssignmentRepository } from '../modules/assignments/in-memory-assignment.repository';
import type { Match, Venue } from '../modules/matches/match.model';
import type { Medic } from '../modules/medics/medic.model';

// Shared test data. Fixed dates keep every test deterministic.

export const NOW = new Date('2026-10-09T12:00:00+03:00');

/** A time on Saturday 10 Oct 2026 (Israel time). */
export const at = (hhmm: string) => new Date(`2026-10-10T${hhmm}:00+03:00`);

export const venues: Venue[] = [
  { id: 'kiryat', name: 'קריית אליעזר', city: 'חיפה', location: { lat: 32.8131, lng: 34.9776 } },
  { id: 'romema', name: 'רוממה', city: 'חיפה', location: { lat: 32.7915, lng: 34.9917 } },
];

export const makeMatch = (id: string, from: string, to: string, venueId: string): Match => ({
  id,
  ageGroup: 'נוער',
  league: null,
  venueId,
  payIls: 300,
  startsAt: at(from),
  endsAt: at(to),
});

export const medics: Medic[] = [
  {
    id: 'michal',
    firstName: 'מיכל',
    lastName: 'כהן',
    licenseNumber: '1',
    licenseExpiresOn: new Date('2027-01-01'),
  },
  {
    id: 'ahmad',
    firstName: 'אחמד',
    lastName: 'חדאד',
    licenseNumber: '2',
    licenseExpiresOn: new Date('2027-01-01'),
  },
  {
    id: 'expired',
    firstName: 'יוסי',
    lastName: 'לוי',
    licenseNumber: '3',
    licenseExpiresOn: new Date('2026-01-01'),
  },
];

/** Fakes for every service dependency: no DB, no server, same interfaces as production. */
export function createTestDeps(options: {
  matches: Match[];
  assignments?: Assignment[];
  now?: Date;
}) {
  const { matches, assignments = [], now = NOW } = options;
  return {
    matches: {
      listMatches: async ({ from, to }: { from: Date; to: Date }) =>
        matches.filter((m) => m.startsAt >= from && m.startsAt < to),
      findById: async (id: string) => matches.find((m) => m.id === id) ?? null,
      listVenues: async () => venues,
    },
    medics: { findById: async (id: string) => medics.find((m) => m.id === id) ?? null },
    assignments: createInMemoryAssignmentRepository(assignments),
    now: () => now,
  };
}
