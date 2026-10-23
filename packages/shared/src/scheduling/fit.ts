const MINUTE = 60_000;

/** A free gap up to this long next to a held match counts as "back-to-back". */
export const BACK_TO_BACK_WINDOW_MINUTES = 90;

export interface ScheduledMatch {
  id: string;
  startsAt: Date;
  endsAt: Date;
  venueId: string;
}

/** Driving minutes between two venues. Injected so the engine stays pure and testable. */
export type TravelMinutes = (fromVenueId: string, toVenueId: string) => number;

export type Fit =
  | { kind: 'free' }
  | {
      kind: 'clash';
      /** overlap: the times collide. travel: no time to drive between the venues. */
      reason: 'overlap' | 'travel';
      withMatchId: string;
      travelMinutes: number;
    }
  | {
      kind: 'back-to-back';
      withMatchId: string;
      /** Where the held match sits relative to the candidate. */
      position: 'before' | 'after';
      travelMinutes: number;
      gapMinutes: number;
    };

type BackToBack = Extract<Fit, { kind: 'back-to-back' }>;
type Clash = Extract<Fit, { kind: 'clash' }>;

/**
 * Decides whether a medic who already holds `schedule` can also take `candidate`.
 * A time overlap wins over a travel clash, and a travel clash wins over back-to-back.
 */
export function evaluateFit(
  candidate: ScheduledMatch,
  schedule: readonly ScheduledMatch[],
  travelMinutes: TravelMinutes,
): Fit {
  let travelClash: Clash | undefined;
  let closest: BackToBack | undefined;

  for (const held of schedule) {
    if (held.id === candidate.id) continue;

    const heldIsBefore = held.endsAt <= candidate.startsAt;
    const heldIsAfter = candidate.endsAt <= held.startsAt;
    if (!heldIsBefore && !heldIsAfter) {
      return { kind: 'clash', reason: 'overlap', withMatchId: held.id, travelMinutes: 0 };
    }

    const gapMinutes = heldIsBefore
      ? (candidate.startsAt.getTime() - held.endsAt.getTime()) / MINUTE
      : (held.startsAt.getTime() - candidate.endsAt.getTime()) / MINUTE;
    const travel = heldIsBefore
      ? travelMinutes(held.venueId, candidate.venueId)
      : travelMinutes(candidate.venueId, held.venueId);

    if (gapMinutes < travel) {
      travelClash ??= {
        kind: 'clash',
        reason: 'travel',
        withMatchId: held.id,
        travelMinutes: travel,
      };
    } else if (
      gapMinutes <= BACK_TO_BACK_WINDOW_MINUTES &&
      (!closest || gapMinutes < closest.gapMinutes)
    ) {
      closest = {
        kind: 'back-to-back',
        withMatchId: held.id,
        position: heldIsBefore ? 'before' : 'after',
        travelMinutes: travel,
        gapMinutes,
      };
    }
  }

  return travelClash ?? closest ?? { kind: 'free' };
}
