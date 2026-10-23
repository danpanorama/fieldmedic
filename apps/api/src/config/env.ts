import 'dotenv/config';
import { z } from 'zod';

// Validated once at startup: a missing or wrong variable crashes immediately with a clear message,
// instead of failing later in the middle of a request.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
