import type { OpenMatchDto } from '@fieldmedic/shared';
import { dayKey, formatDay } from '../../../lib/format';
import { MatchCard } from './MatchCard';

interface OpenMatchesListProps {
  matches: OpenMatchDto[];
  canTakeMatches: boolean;
  onTake?: (matchId: string) => void;
}

/** Groups matches by calendar day. Matches arrive sorted, so Map insertion order is chronological. */
function groupByDay(matches: OpenMatchDto[]) {
  const days = new Map<string, OpenMatchDto[]>();
  for (const match of matches) {
    const key = dayKey(match.startsAt);
    days.set(key, [...(days.get(key) ?? []), match]);
  }
  return [...days.values()];
}

export function OpenMatchesList({ matches, canTakeMatches, onTake }: OpenMatchesListProps) {
  if (matches.length === 0) {
    return (
      <p className="py-12 text-center text-muted">אין כרגע משחקים פתוחים. נעדכן כשיתפנה משהו.</p>
    );
  }

  return (
    <div className="space-y-6">
      {groupByDay(matches).map((dayMatches) => (
        <section key={dayKey(dayMatches[0]!.startsAt)} className="space-y-3">
          <h2 className="font-bold text-muted">{formatDay(dayMatches[0]!.startsAt)}</h2>
          {dayMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              canTakeMatches={canTakeMatches}
              onTake={onTake}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
