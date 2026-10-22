import {
  estimateTravelMinutes,
  evaluateFit,
  type Fit,
  type FitDto,
  type MatchSummaryDto,
  type OpenMatchDto,
  type OpenMatchesResponse,
} from '@fieldmedic/shared';
import { NotFoundError } from '../../common/errors';
import type { AssignmentRepository } from '../assignments/assignment.repository';
import { hasValidLicense } from '../medics/medic.model';
import type { MedicRepository } from '../medics/medic.repository';
import type { Match, Venue } from './match.model';
import type { MatchSource } from './match.source';

const LOOKAHEAD_DAYS = 14;
const DAY = 24 * 60 * 60 * 1000;

export interface MatchServiceDeps {
  matches: MatchSource;
  medics: MedicRepository;
  assignments: AssignmentRepository;
  now: () => Date;
}

export type MatchService = ReturnType<typeof createMatchService>;

export function createMatchService({ matches, medics, assignments, now }: MatchServiceDeps) {
  return {
    /** Unassigned upcoming matches, each marked free / clash / back-to-back for this medic. */
    async getOpenMatchesFor(medicId: string): Promise<OpenMatchesResponse> {
      const medic = await medics.findById(medicId);
      if (!medic) throw new NotFoundError(`Medic ${medicId} not found`);

      const today = now();
      const [upcoming, venues, allAssignments] = await Promise.all([
        matches.listMatches({ from: today, to: new Date(today.getTime() + LOOKAHEAD_DAYS * DAY) }),
        matches.listVenues(),
        assignments.listAll(),
      ]);

      const venueById = new Map(venues.map((v) => [v.id, v]));
      const venueOf = (id: string): Venue => {
        const venue = venueById.get(id);
        if (!venue) throw new Error(`Unknown venue ${id}`);
        return venue;
      };

      const takenIds = new Set(allAssignments.map((a) => a.matchId));
      const myIds = new Set(
        allAssignments.filter((a) => a.medicId === medicId).map((a) => a.matchId),
      );
      const myMatches = upcoming.filter((m) => myIds.has(m.id));
      const matchById = new Map(upcoming.map((m) => [m.id, m]));
      const travel = (from: string, to: string) =>
        estimateTravelMinutes(venueOf(from).location, venueOf(to).location);

      const toSummary = (m: Match): MatchSummaryDto => {
        const { id, name, city } = venueOf(m.venueId);
        return {
          id: m.id,
          startsAt: m.startsAt.toISOString(),
          endsAt: m.endsAt.toISOString(),
          venue: { id, name, city },
        };
      };

      const toFitDto = (fit: Fit): FitDto => {
        if (fit.kind === 'free') return fit;
        const other = toSummary(matchById.get(fit.withMatchId)!);
        return fit.kind === 'clash'
          ? { kind: 'clash', reason: fit.reason, travelMinutes: fit.travelMinutes, other }
          : {
              kind: 'back-to-back',
              position: fit.position,
              travelMinutes: fit.travelMinutes,
              other,
            };
      };

      const open: OpenMatchDto[] = upcoming
        .filter((m) => !takenIds.has(m.id))
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
        .map((m) => ({
          ...toSummary(m),
          ageGroup: m.ageGroup,
          league: m.league,
          payIls: m.payIls,
          fit: toFitDto(evaluateFit(m, myMatches, travel)),
        }));

      return {
        medic: {
          id: medic.id,
          firstName: medic.firstName,
          licenseValid: hasValidLicense(medic, today),
        },
        myMatchCount: myMatches.length,
        matches: open,
      };
    },
  };
}
