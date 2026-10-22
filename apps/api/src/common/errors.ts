// Domain errors. Services throw these without knowing anything about HTTP;
// the error handler middleware translates them into status codes.

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {}
