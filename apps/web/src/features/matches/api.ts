import type { OpenMatchesResponse, TakeMatchRequest, TakeMatchResponse } from '@fieldmedic/shared';
import { apiGet, apiPost } from '../../lib/api-client';

const medicPath = (medicId: string) => `/medics/${encodeURIComponent(medicId)}`;

export const fetchOpenMatches = (medicId: string) =>
  apiGet<OpenMatchesResponse>(`${medicPath(medicId)}/open-matches`);

export const takeMatch = (medicId: string, matchId: string) =>
  apiPost<TakeMatchResponse>(`${medicPath(medicId)}/assignments`, {
    matchId,
  } satisfies TakeMatchRequest);
