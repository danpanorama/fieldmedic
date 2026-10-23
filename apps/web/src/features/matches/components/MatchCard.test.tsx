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
    render(<MatchCard match={makeMatch({ kind: 'free' })} canTakeMatches onTake={vi.fn()} />);
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
    render(<MatchCard match={makeMatch(fit)} canTakeMatches onTake={vi.fn()} />);
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

  it('shows a saving state and blocks double taps while the request is in flight', () => {
    const onTake = vi.fn();
    render(
      <MatchCard match={makeMatch({ kind: 'free' })} canTakeMatches onTake={onTake} isTaking />,
    );
    const button = screen.getByRole('button', { name: 'שומר…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(button);
    expect(onTake).not.toHaveBeenCalled();
  });

  it('is disabled while another match is being taken', () => {
    render(
      <MatchCard match={makeMatch({ kind: 'free' })} canTakeMatches onTake={vi.fn()} isBusy />,
    );
    expect(screen.getByRole('button', { name: 'לקחת את המשחק' })).toBeDisabled();
  });
});
