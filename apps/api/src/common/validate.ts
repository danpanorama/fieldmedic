import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from './errors';

/** Validates req.body and replaces it with the parsed value, so handlers get clean, typed data. */
export const validateBody =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }
    req.body = result.data;
    next();
  };
