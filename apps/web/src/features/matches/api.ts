import type { OpenMatchesResponse } from '@fieldmedic/shared';
import { apiGet } from '../../lib/api-client';

export const fetchOpenMatches = (medicId: string) =>
  apiGet<OpenMatchesResponse>(`/medics/${encodeURIComponent(medicId)}/open-matches`);
