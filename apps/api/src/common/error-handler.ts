import type { ApiErrorBody } from '@fieldmedic/shared';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError, NotFoundError } from './errors';

export const notFoundRoute: RequestHandler = (req) => {
  throw new NotFoundError(`Route not found: ${req.method} ${req.path}`);
};

const send = (res: Parameters<ErrorRequestHandler>[2], status: number, body: ApiErrorBody) => {
  res.status(status).json(body);
};

// Express 5 forwards errors thrown in async handlers here, so no try/catch in controllers.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    send(res, err.status, { error: err.message, code: err.code, details: err.details });
    return;
  }
  // express.json() throws a SyntaxError with a `body` field for malformed JSON.
  if (err instanceof SyntaxError && 'body' in err) {
    send(res, 400, { error: 'Malformed JSON body', code: 'VALIDATION_FAILED' });
    return;
  }
  console.error(err);
  send(res, 500, { error: 'Internal server error', code: 'INTERNAL' });
};
