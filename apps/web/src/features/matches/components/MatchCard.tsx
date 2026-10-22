import type { OpenMatchDto } from '@fieldmedic/shared';
import { Button, Card } from '../../../components/ui';
import { formatTime } from '../../../lib/format';
import { FitNotice } from './FitNotice';

interface MatchCardProps {
  match: OpenMatchDto;
  /** False when the medic's license is not valid. */
  canTakeMatches: boolean;
  /** Not wired yet: self-assignment arrives in Sprint 1. Without it, no take button is shown. */
  onTake?: (matchId: string) => void;
}

export function MatchCard({ match, canTakeMatches, onTake }: MatchCardProps) {
  const clashes = match.fit.kind === 'clash';
  const title = match.league ? `${match.ageGroup} · ${match.league}` : match.ageGroup;

  return (
    <Card className="space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            {formatTime(match.startsAt)}–{formatTime(match.endsAt)}
          </p>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-muted">
            {match.venue.name}, {match.venue.city}
          </p>
        </div>
        <span className="shrink-0 font-bold text-brand-700">₪{match.payIls}</span>
      </header>

      <FitNotice fit={match.fit} />

      {clashes ? (
        <Button fullWidth disabled>
          לא זמין בשעה הזו
        </Button>
      ) : (
        onTake && (
          <Button fullWidth disabled={!canTakeMatches} onClick={() => onTake(match.id)}>
            {canTakeMatches ? 'לקחת את המשחק' : 'נדרש רישיון בתוקף'}
          </Button>
        )
      )}
    </Card>
  );
}
