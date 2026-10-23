import type { ErrorRequestHandler, RequestHandler } from 'express';
import { NotFoundError } from './errors';

export const notFoundRoute: RequestHandler = (req) => {
  throw new NotFoundError(`Route not found: ${req.method} ${req.path}`);
};

// Express 5 forwards errors thrown in async handlers here, so no try/catch in controllers.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
