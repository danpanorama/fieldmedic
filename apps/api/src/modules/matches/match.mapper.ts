import type { Fit, FitDto, MatchSummaryDto, OpenMatchDto } from '@fieldmedic/shared';
import type { Match } from './match.model';
import type { MedicSchedule } from './medic-schedule';

// Domain objects → JSON contracts. Kept apart from the service so business logic
// and response shape can change independently.

export function toMatchSummary(match: Match, schedule: MedicSchedule): MatchSummaryDto {
  const { id, name, city } = schedule.venueOf(match.venueId);
  return {
    id: match.id,
    startsAt: match.startsAt.toISOString(),
    endsAt: match.endsAt.toISOString(),
    venue: { id, name, city },
  };
}

export function toFitDto(fit: Fit, schedule: MedicSchedule): FitDto {
  if (fit.kind === 'free') return fit;

  const otherMatch = schedule.matchById.get(fit.withMatchId);
  if (!otherMatch) throw new Error(`Unknown match ${fit.withMatchId}`);
  const other = toMatchSummary(otherMatch, schedule);

  return fit.kind === 'clash'
    ? { kind: 'clash', reason: fit.reason, travelMinutes: fit.travelMinutes, other }
    : { kind: 'back-to-back', position: fit.position, travelMinutes: fit.travelMinutes, other };
}

export function toOpenMatchDto(match: Match, fit: Fit, schedule: MedicSchedule): OpenMatchDto {
  return {
    ...toMatchSummary(match, schedule),
    ageGroup: match.ageGroup,
    league: match.league,
    payIls: match.payIls,
    fit: toFitDto(fit, schedule),
  };
}
