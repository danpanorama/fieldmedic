import { estimateTravelMinutes, type TravelMinutes } from '@fieldmedic/shared';
import type { AssignmentRepository } from '../assignments/assignment.repository';
import type { Match, Venue } from './match.model';
import type { MatchSource } from './match.source';

const LOOKAHEAD_DAYS = 14;
const DAY = 24 * 60 * 60 * 1000;

export interface MedicSchedule {
  /** Every match from now until the lookahead window ends. */
  upcoming: Match[];
  /** Matches in that window the medic already holds. */
  myMatches: Match[];
  /** Ids of matches anyone holds. */
  takenIds: Set<string>;
  matchById: Map<string, Match>;
  venueOf: (venueId: string) => Venue;
  travel: TravelMinutes;
}

/** Loads everything needed to judge a medic's schedule. Shared by "open matches" and "take a match". */
export async function loadMedicSchedule(
  deps: { matches: MatchSource; assignments: AssignmentRepository },
  medicId: string,
  now: Date,
): Promise<MedicSchedule> {
  const [upcoming, venues, assignments] = await Promise.all([
    deps.matches.listMatches({ from: now, to: new Date(now.getTime() + LOOKAHEAD_DAYS * DAY) }),
    deps.matches.listVenues(),
    deps.assignments.listAll(),
  ]);

  const venueById = new Map(venues.map((v) => [v.id, v]));
  const venueOf = (id: string): Venue => {
    const venue = venueById.get(id);
    if (!venue) throw new Error(`Unknown venue ${id}`);
    return venue;
  };

  const myIds = new Set(assignments.filter((a) => a.medicId === medicId).map((a) => a.matchId));

  return {
    upcoming,
    myMatches: upcoming.filter((m) => myIds.has(m.id)),
    takenIds: new Set(assignments.map((a) => a.matchId)),
    matchById: new Map(upcoming.map((m) => [m.id, m])),
    venueOf,
    travel: (from, to) => estimateTravelMinutes(venueOf(from).location, venueOf(to).location),
  };
}
