import type { TakeMatchRequest } from '@fieldmedic/shared';
import { z } from 'zod';

export const takeMatchSchema = z.object({
  matchId: z.string().trim().min(1),
}) satisfies z.ZodType<TakeMatchRequest>;
