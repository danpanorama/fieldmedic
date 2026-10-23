import { evaluateFit, type TakeMatchResponse } from '@fieldmedic/shared';
import { ConflictError, ForbiddenError, NotFoundError } from '../../common/errors';
import type { MatchSource } from '../matches/match.source';
import { loadMedicSchedule } from '../matches/medic-schedule';
import { hasValidLicense } from '../medics/medic.model';
import type { MedicRepository } from '../medics/medic.repository';
import type { AssignmentRepository } from './assignment.repository';

export interface AssignmentServiceDeps {
  matches: MatchSource;
  medics: MedicRepository;
  assignments: AssignmentRepository;
  now: () => Date;
}

export type AssignmentService = ReturnType<typeof createAssignmentService>;

export function createAssignmentService({
  matches,
  medics,
  assignments,
  now,
}: AssignmentServiceDeps) {
  return {
    /** A medic assigns themself to an open match. */
    async takeMatch(medicId: string, matchId: string): Promise<TakeMatchResponse> {
      const medic = await medics.findById(medicId);
      if (!medic) throw new NotFoundError(`Medic ${medicId} not found`);

      const today = now();
      if (!hasValidLicense(medic, today)) {
        throw new ForbiddenError('A valid license is required to take matches', 'LICENSE_INVALID');
      }

      const match = await matches.findById(matchId);
      if (!match) throw new NotFoundError(`Match ${matchId} not found`);
      if (match.startsAt <= today) {
        throw new ConflictError('This match has already started', 'MATCH_STARTED');
      }

      const schedule = await loadMedicSchedule({ matches, assignments }, medicId, today);
      if (schedule.takenIds.has(matchId)) {
        throw new ConflictError('Someone already took this match', 'MATCH_ALREADY_TAKEN');
      }

      const fit = evaluateFit(match, schedule.myMatches, schedule.travel);
      if (fit.kind === 'clash') {
        throw new ConflictError('This match clashes with your schedule', 'SCHEDULE_CLASH', {
          reason: fit.reason,
          withMatchId: fit.withMatchId,
        });
      }

      // Everything above can race with another medic's request for the same match.
      // claim() is the single atomic step that decides who actually gets it.
      const result = await assignments.claim({ matchId, medicId });
      if (result === 'already-taken') {
        throw new ConflictError('Someone already took this match', 'MATCH_ALREADY_TAKEN');
      }

      return { assignment: { matchId, medicId } };
    },
  };
}
