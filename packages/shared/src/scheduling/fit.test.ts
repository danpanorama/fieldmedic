import { describe, expect, it } from 'vitest';
import { evaluateFit, type ScheduledMatch, type TravelMinutes } from './fit';

const at = (hhmm: string) => new Date(`2026-10-10T${hhmm}:00+03:00`);
const match = (id: string, from: string, to: string, venueId: string): ScheduledMatch => ({
  id,
  startsAt: at(from),
  endsAt: at(to),
  venueId,
});

// Fixed travel table so every test is predictable.
const DRIVES: Record<string, number> = {
  'kiryat-eliezer>romema': 15,
  'romema>kiryat-eliezer': 15,
  'kiryat-eliezer>tel-aviv': 100,
  'tel-aviv>kiryat-eliezer': 100,
};
const travel: TravelMinutes = (from, to) => (from === to ? 0 : (DRIVES[`${from}>${to}`] ?? 60));

const morningGame = match('held', '08:30', '09:45', 'kiryat-eliezer');

describe('evaluateFit', () => {
  it('is free when the medic has no matches', () => {
    expect(evaluateFit(match('c', '10:00', '11:45', 'romema'), [], travel)).toEqual({
      kind: 'free',
    });
  });

  it('clashes when the times overlap', () => {
    const fit = evaluateFit(match('c', '09:00', '10:45', 'romema'), [morningGame], travel);
    expect(fit).toMatchObject({ kind: 'clash', reason: 'overlap', withMatchId: 'held' });
  });

  it('clashes when there is no time to drive between venues', () => {
    // Ends 09:45, next starts 10:00, but the drive is 100 minutes.
    const fit = evaluateFit(match('c', '10:00', '11:45', 'tel-aviv'), [morningGame], travel);
    expect(fit).toMatchObject({ kind: 'clash', reason: 'travel', travelMinutes: 100 });
  });

  it('suggests back-to-back when the next match is reachable in time', () => {
    // The scenario from the design: 08:30 game ends 09:45, Romema starts 10:00, 15 min drive.
    const fit = evaluateFit(match('c', '10:00', '11:45', 'romema'), [morningGame], travel);
    expect(fit).toEqual({
      kind: 'back-to-back',
      withMatchId: 'held',
      position: 'before',
      travelMinutes: 15,
      gapMinutes: 15,
    });
  });

  it('detects back-to-back when the held match comes after the candidate', () => {
    const fit = evaluateFit(match('c', '07:00', '08:00', 'romema'), [morningGame], travel);
    expect(fit).toMatchObject({ kind: 'back-to-back', position: 'after', gapMinutes: 30 });
  });

  it('is free when the gap is longer than the back-to-back window', () => {
    const fit = evaluateFit(match('c', '16:30', '18:00', 'romema'), [morningGame], travel);
    expect(fit).toEqual({ kind: 'free' });
  });

  it('treats matches that touch exactly at the same venue as back-to-back', () => {
    const fit = evaluateFit(match('c', '09:45', '11:00', 'kiryat-eliezer'), [morningGame], travel);
    expect(fit).toMatchObject({ kind: 'back-to-back', gapMinutes: 0, travelMinutes: 0 });
  });

  it('prefers an overlap over a travel clash with another match', () => {
    const schedule = [
      match('far', '06:00', '07:55', 'tel-aviv'),
      match('overlapping', '08:30', '09:30', 'romema'),
    ];
    const fit = evaluateFit(match('c', '08:00', '09:00', 'kiryat-eliezer'), schedule, travel);
    expect(fit).toMatchObject({ kind: 'clash', reason: 'overlap', withMatchId: 'overlapping' });
  });

  it('picks the closest neighbour when several are back-to-back', () => {
    const schedule = [
      match('early', '07:00', '08:30', 'romema'),
      match('late', '12:30', '14:00', 'romema'),
    ];
    const fit = evaluateFit(match('c', '09:00', '12:00', 'romema'), schedule, travel);
    expect(fit).toMatchObject({ kind: 'back-to-back', withMatchId: 'early', gapMinutes: 30 });
  });

  it('ignores the candidate itself if it is already in the schedule', () => {
    expect(evaluateFit(morningGame, [morningGame], travel)).toEqual({ kind: 'free' });
  });
});
