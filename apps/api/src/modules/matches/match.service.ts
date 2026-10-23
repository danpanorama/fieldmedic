import { evaluateFit, type OpenMatchesResponse } from '@fieldmedic/shared';
import { NotFoundError } from '../../common/errors';
import type { AssignmentRepository } from '../assignments/assignment.repository';
import { hasValidLicense } from '../medics/medic.model';
import type { MedicRepository } from '../medics/medic.repository';
import { toOpenMatchDto } from './match.mapper';
import type { MatchSource } from './match.source';
import { loadMedicSchedule } from './medic-schedule';

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
      const schedule = await loadMedicSchedule({ matches, assignments }, medicId, today);

      const open = schedule.upcoming
        .filter((m) => !schedule.takenIds.has(m.id))
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
        .map((m) =>
          toOpenMatchDto(m, evaluateFit(m, schedule.myMatches, schedule.travel), schedule),
        );

      return {
        medic: {
          id: medic.id,
          firstName: medic.firstName,
          licenseValid: hasValidLicense(medic, today),
        },
        myMatchCount: schedule.myMatches.length,
        matches: open,
      };
    },
  };
}
