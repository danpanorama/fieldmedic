import { describe, expect, it } from 'vitest';
import { NotFoundError } from '../../common/errors';
import type { Assignment } from '../assignments/assignment.repository';
import type { Medic } from '../medics/medic.model';
import type { Match, Venue } from './match.model';
import { createMatchService } from './match.service';

const NOW = new Date('2026-10-09T12:00:00+03:00');
const at = (hhmm: string) => new Date(`2026-10-10T${hhmm}:00+03:00`);

const venues: Venue[] = [
  { id: 'kiryat', name: 'קריית אליעזר', city: 'חיפה', location: { lat: 32.8131, lng: 34.9776 } },
  { id: 'romema', name: 'רוממה', city: 'חיפה', location: { lat: 32.7915, lng: 34.9917 } },
];

const match = (id: string, from: string, to: string, venueId: string): Match => ({
  id,
  ageGroup: 'נוער',
  league: null,
  venueId,
  payIls: 300,
  startsAt: at(from),
  endsAt: at(to),
});

const matches: Match[] = [
  match('free', '16:30', '18:00', 'romema'),
  match('held', '08:30', '09:45', 'kiryat'),
  match('back-to-back', '10:00', '11:45', 'romema'),
  match('overlap', '09:00', '10:45', 'romema'),
  match('taken-by-other', '12:00', '13:30', 'kiryat'),
];

const medics: Medic[] = [
  {
    id: 'michal',
    firstName: 'מיכל',
    lastName: 'כהן',
    licenseNumber: '1',
    licenseExpiresOn: new Date('2027-01-01'),
  },
  {
    id: 'expired',
    firstName: 'יוסי',
    lastName: 'לוי',
    licenseNumber: '2',
    licenseExpiresOn: new Date('2026-01-01'),
  },
];

const assignments: Assignment[] = [
  { matchId: 'held', medicId: 'michal' },
  { matchId: 'taken-by-other', medicId: 'someone-else' },
];

// Fakes: tiny in-memory implementations of the interfaces, so the test needs no DB or server.
const service = createMatchService({
  matches: { listMatches: async () => matches, listVenues: async () => venues },
  medics: { findById: async (id) => medics.find((m) => m.id === id) ?? null },
  assignments: { listAll: async () => assignments },
  now: () => NOW,
});

describe('MatchService.getOpenMatchesFor', () => {
  it('returns only unassigned matches, sorted by start time', async () => {
    const res = await service.getOpenMatchesFor('michal');
    expect(res.matches.map((m) => m.id)).toEqual(['overlap', 'back-to-back', 'free']);
  });

  it('marks each match with how it fits the medic’s schedule', async () => {
    const res = await service.getOpenMatchesFor('michal');
    const fitById = Object.fromEntries(res.matches.map((m) => [m.id, m.fit.kind]));
    expect(fitById).toEqual({ overlap: 'clash', 'back-to-back': 'back-to-back', free: 'free' });
  });

  it('describes the neighbouring match so the UI can explain the suggestion', async () => {
    const res = await service.getOpenMatchesFor('michal');
    const fit = res.matches.find((m) => m.id === 'back-to-back')!.fit;
    expect(fit).toMatchObject({
      kind: 'back-to-back',
      position: 'before',
      other: { id: 'held', venue: { name: 'קריית אליעזר' } },
    });
  });

  it('returns medic info and how many matches they hold', async () => {
    const res = await service.getOpenMatchesFor('michal');
    expect(res.medic).toEqual({ id: 'michal', firstName: 'מיכל', licenseValid: true });
    expect(res.myMatchCount).toBe(1);
  });

  it('flags an expired license', async () => {
    const res = await service.getOpenMatchesFor('expired');
    expect(res.medic.licenseValid).toBe(false);
  });

  it('throws NotFoundError for an unknown medic', async () => {
    await expect(service.getOpenMatchesFor('nobody')).rejects.toBeInstanceOf(NotFoundError);
  });
});
