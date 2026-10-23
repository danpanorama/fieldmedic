import { describe, expect, it } from 'vitest';
import { NotFoundError } from '../../common/errors';
import { createTestDeps, makeMatch } from '../../test/fixtures';
import { createMatchService } from './match.service';

const service = createMatchService(
  createTestDeps({
    matches: [
      makeMatch('free', '16:30', '18:00', 'romema'),
      makeMatch('held', '08:30', '09:45', 'kiryat'),
      makeMatch('back-to-back', '10:00', '11:45', 'romema'),
      makeMatch('overlap', '09:00', '10:45', 'romema'),
      makeMatch('taken-by-other', '12:00', '13:30', 'kiryat'),
    ],
    assignments: [
      { matchId: 'held', medicId: 'michal' },
      { matchId: 'taken-by-other', medicId: 'ahmad' },
    ],
  }),
);

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
