import type { ErrorCode } from '@fieldmedic/shared';

// Domain errors. Services throw these without knowing anything about HTTP;
// each one carries its status and a machine-readable code, and the error handler sends them.

export abstract class AppError extends Error {
  abstract readonly status: number;

  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  override readonly status = 400;

  constructor(details: unknown) {
    super('Validation failed', 'VALIDATION_FAILED', details);
  }
}

export class NotFoundError extends AppError {
  override readonly status = 404;

  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

/** The caller is known but not allowed to do this (e.g. expired license). */
export class ForbiddenError extends AppError {
  override readonly status = 403;
}

/** The request is valid but clashes with the current state (e.g. match already taken). */
export class ConflictError extends AppError {
  override readonly status = 409;
}
