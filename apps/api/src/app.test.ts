import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app';
import { createContainer } from './container';
import type { OpenMatchesResponse } from '@fieldmedic/shared';

// Integration tests: the real app with the demo data, called over HTTP.
const app = createApp(createContainer());

describe('API', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('GET /api/medics/:id/open-matches returns open matches with a fit for each', async () => {
    const res = await request(app).get('/api/medics/michal/open-matches');
    const body = res.body as OpenMatchesResponse;

    expect(res.status).toBe(200);
    expect(body.medic.firstName).toBe('מיכל');
    expect(body.matches.length).toBeGreaterThan(0);
    const kinds = new Set(body.matches.map((m) => m.fit.kind));
    expect(kinds).toEqual(new Set(['free', 'clash', 'back-to-back']));
  });

  it('returns 404 for an unknown medic', async () => {
    const res = await request(app).get('/api/medics/nobody/open-matches');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/medics/:id/assignments', () => {
  // Taking a match changes state, so each test gets a fresh app with fresh demo data.
  const freshApp = () => createApp(createContainer());
  const take = (target: ReturnType<typeof freshApp>, medicId: string, matchId: unknown) =>
    request(target).post(`/api/medics/${medicId}/assignments`).send({ matchId });

  it('assigns the match, then refuses a second medic with 409', async () => {
    const target = freshApp();

    const first = await take(target, 'michal', 'm3');
    expect(first.status).toBe(201);
    expect(first.body).toEqual({ assignment: { matchId: 'm3', medicId: 'michal' } });

    const second = await take(target, 'ahmad', 'm3');
    expect(second.status).toBe(409);
    expect(second.body.code).toBe('MATCH_ALREADY_TAKEN');
  });

  it('removes the taken match from the open list', async () => {
    const target = freshApp();
    await take(target, 'michal', 'm3');

    const res = await request(target).get('/api/medics/michal/open-matches');
    const body = res.body as OpenMatchesResponse;
    expect(body.matches.map((m) => m.id)).not.toContain('m3');
    expect(body.myMatchCount).toBe(3);
  });

  it('returns 409 SCHEDULE_CLASH for a clashing match', async () => {
    const res = await take(freshApp(), 'michal', 'm2');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('SCHEDULE_CLASH');
  });

  it('returns 403 LICENSE_INVALID for an expired license', async () => {
    const res = await take(freshApp(), 'yossi', 'm6');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('LICENSE_INVALID');
  });

  it('returns 400 VALIDATION_FAILED for a missing matchId', async () => {
    const res = await take(freshApp(), 'michal', undefined);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.details).toEqual([expect.objectContaining({ path: 'matchId' })]);
  });
});
