import type { OpenMatchDto } from '@fieldmedic/shared';
import { Button, Card } from '../../../components/ui';
import { formatTime } from '../../../lib/format';
import { FitNotice } from './FitNotice';

interface MatchCardProps {
  match: OpenMatchDto;
  /** False when the medic's license is not valid. */
  canTakeMatches: boolean;
  onTake: (matchId: string) => void;
  /** This card's take request is in flight. */
  isTaking?: boolean;
  /** Another card's request is in flight: one at a time. */
  isBusy?: boolean;
}

function takeButtonLabel(clashes: boolean, canTakeMatches: boolean, isTaking: boolean) {
  if (clashes) return 'לא זמין בשעה הזו';
  if (!canTakeMatches) return 'נדרש רישיון בתוקף';
  if (isTaking) return 'שומר…';
  return 'לקחת את המשחק';
}

export function MatchCard({
  match,
  canTakeMatches,
  onTake,
  isTaking = false,
  isBusy = false,
}: MatchCardProps) {
  const clashes = match.fit.kind === 'clash';
  const title = match.league ? `${match.ageGroup} · ${match.league}` : match.ageGroup;
  const disabled = clashes || !canTakeMatches || isTaking || isBusy;

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

      <Button fullWidth disabled={disabled} aria-busy={isTaking} onClick={() => onTake(match.id)}>
        {takeButtonLabel(clashes, canTakeMatches, isTaking)}
      </Button>
    </Card>
  );
}
