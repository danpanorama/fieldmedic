import type { FitDto } from '@fieldmedic/shared';
import { Notice } from '../../../components/ui';
import { formatTime } from '../../../lib/format';

const drive = (minutes: number) => (minutes === 0 ? 'באותו מגרש' : `נסיעה של כ-${minutes} דק'`);

/** Explains in plain Hebrew how an open match fits the medic's schedule. */
export function FitNotice({ fit }: { fit: FitDto }) {
  if (fit.kind === 'free') return null;

  const { other } = fit;
  const where = `ב${other.venue.name}`;

  if (fit.kind === 'back-to-back') {
    return (
      <Notice tone="info">
        {fit.position === 'before'
          ? `רצף אפשרי: המשחק שלך ב-${formatTime(other.startsAt)} ${where} נגמר ב-${formatTime(other.endsAt)}. ${drive(fit.travelMinutes)}.`
          : `רצף אפשרי: המשחק הבא שלך מתחיל ב-${formatTime(other.startsAt)} ${where}. ${drive(fit.travelMinutes)}.`}
      </Notice>
    );
  }

  return (
    <Notice tone="warning">
      {fit.reason === 'overlap'
        ? `חופף למשחק שלך ב-${formatTime(other.startsAt)} ${where}. אי אפשר להירשם.`
        : `אין מספיק זמן להגיע: המשחק שלך ב-${formatTime(other.startsAt)} ${where}, ${drive(fit.travelMinutes)}.`}
    </Notice>
  );
}
