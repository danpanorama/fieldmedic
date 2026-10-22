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
  });
});
