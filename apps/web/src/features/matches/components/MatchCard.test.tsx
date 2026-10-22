import type { FitDto, OpenMatchDto } from '@fieldmedic/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MatchCard } from './MatchCard';

const romema = { id: 'romema', name: 'מגרש רוממה', city: 'חיפה' };
const kiryat = { id: 'kiryat', name: 'מגרש קריית אליעזר', city: 'חיפה' };
const held = {
  id: 'held',
  startsAt: '2026-10-10T08:30:00',
  endsAt: '2026-10-10T09:45:00',
  venue: kiryat,
};

const makeMatch = (fit: FitDto): OpenMatchDto => ({
  id: 'm1',
  ageGroup: "נערים ב'",
  league: 'ליגה ארצית',
  startsAt: '2026-10-10T10:00:00',
  endsAt: '2026-10-10T11:45:00',
  venue: romema,
  payIls: 350,
  fit,
});

describe('MatchCard', () => {
  it('shows the match details', () => {
    render(<MatchCard match={makeMatch({ kind: 'free' })} canTakeMatches />);
    expect(screen.getByRole('heading', { name: "נערים ב' · ליגה ארצית" })).toBeInTheDocument();
    expect(screen.getByText('מגרש רוממה, חיפה')).toBeInTheDocument();
    expect(screen.getByText('₪350')).toBeInTheDocument();
  });

  it('explains a back-to-back suggestion', () => {
    const fit: FitDto = {
      kind: 'back-to-back',
      position: 'before',
      travelMinutes: 15,
      other: held,
    };
    render(<MatchCard match={makeMatch(fit)} canTakeMatches />);
    expect(screen.getByRole('status')).toHaveTextContent(/רצף אפשרי.*09:45.*15 דק'/);
  });

  it('blocks a clashing match', () => {
    const fit: FitDto = { kind: 'clash', reason: 'overlap', travelMinutes: 0, other: held };
    render(<MatchCard match={makeMatch(fit)} canTakeMatches onTake={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('אי אפשר להירשם');
    expect(screen.getByRole('button', { name: 'לא זמין בשעה הזו' })).toBeDisabled();
  });

  it('calls onTake with the match id', () => {
    const onTake = vi.fn();
    render(<MatchCard match={makeMatch({ kind: 'free' })} canTakeMatches onTake={onTake} />);
    fireEvent.click(screen.getByRole('button', { name: 'לקחת את המשחק' }));
    expect(onTake).toHaveBeenCalledWith('m1');
  });

  it('disables taking a match without a valid license', () => {
    render(
      <MatchCard match={makeMatch({ kind: 'free' })} canTakeMatches={false} onTake={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'נדרש רישיון בתוקף' })).toBeDisabled();
  });
});
