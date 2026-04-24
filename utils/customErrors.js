class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad Request") { super(message, 400); }
}

class NotFoundError extends AppError {
  constructor(message = "Profile not found") { super(message, 404); }
}

class UnprocessableEntityError extends AppError {
  constructor(message = "Invalid parameter type or format") { super(message, 422); }
}

module.exports = { AppError, BadRequestError, NotFoundError, UnprocessableEntityError };