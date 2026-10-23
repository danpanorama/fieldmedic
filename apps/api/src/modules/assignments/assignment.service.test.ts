import { describe, expect, it } from 'vitest';
import { ConflictError, ForbiddenError, NotFoundError } from '../../common/errors';
import { at, createTestDeps, makeMatch } from '../../test/fixtures';
import { createAssignmentService } from './assignment.service';

const matches = [
  makeMatch('held', '08:30', '09:45', 'kiryat'),
  makeMatch('open', '10:00', '11:45', 'romema'),
  makeMatch('overlap', '09:00', '10:45', 'romema'),
  makeMatch('taken', '12:00', '13:30', 'kiryat'),
];

function setup(now?: Date) {
  const deps = createTestDeps({
    matches,
    assignments: [
      { matchId: 'held', medicId: 'michal' },
      { matchId: 'taken', medicId: 'ahmad' },
    ],
    now,
  });
  return { service: createAssignmentService(deps), assignments: deps.assignments };
}

describe('AssignmentService.takeMatch', () => {
  it('assigns an open match to the medic', async () => {
    const { service, assignments } = setup();

    await expect(service.takeMatch('michal', 'open')).resolves.toEqual({
      assignment: { matchId: 'open', medicId: 'michal' },
    });
    expect(await assignments.listAll()).toContainEqual({ matchId: 'open', medicId: 'michal' });
  });

  it('rejects a match someone already holds', async () => {
    const { service } = setup();
    await expect(service.takeMatch('michal', 'taken')).rejects.toMatchObject({
      code: 'MATCH_ALREADY_TAKEN',
    });
  });

  it('rejects a match that clashes with the medic’s schedule', async () => {
    const { service } = setup();
    const error = await service.takeMatch('michal', 'overlap').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictError);
    expect(error).toMatchObject({
      code: 'SCHEDULE_CLASH',
      details: { reason: 'overlap', withMatchId: 'held' },
    });
  });

  it('rejects a medic with an expired license', async () => {
    const { service } = setup();
    const error = await service.takeMatch('expired', 'open').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error).toMatchObject({ code: 'LICENSE_INVALID' });
  });

  it('rejects a match that has already started', async () => {
    const { service } = setup(at('10:30'));
    await expect(service.takeMatch('ahmad', 'open')).rejects.toMatchObject({
      code: 'MATCH_STARTED',
    });
  });

  it('throws NotFoundError for an unknown match or medic', async () => {
    const { service } = setup();
    await expect(service.takeMatch('michal', 'nope')).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.takeMatch('nobody', 'open')).rejects.toBeInstanceOf(NotFoundError);
  });

  // The core guarantee of this feature: two medics tap "take" at the same moment.
  it('gives the match to exactly one medic when two take it at the same time', async () => {
    const { service, assignments } = setup();

    const results = await Promise.allSettled([
      service.takeMatch('michal', 'open'),
      service.takeMatch('ahmad', 'open'),
    ]);

    const won = results.filter((r) => r.status === 'fulfilled');
    const lost = results.filter((r) => r.status === 'rejected');
    expect(won).toHaveLength(1);
    expect(lost).toHaveLength(1);
    expect((lost[0] as PromiseRejectedResult).reason).toMatchObject({
      code: 'MATCH_ALREADY_TAKEN',
    });

    const holders = (await assignments.listAll()).filter((a) => a.matchId === 'open');
    expect(holders).toHaveLength(1);
  });
});
