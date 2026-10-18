/** Base class for every error thrown by this library. */
export class PgPodcasterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PgPodcasterError';
  }
}

/** Client was constructed with missing or invalid configuration. */
export class PgPodcasterConfigError extends PgPodcasterError {
  constructor(message: string) {
    super(message);
    this.name = 'PgPodcasterConfigError';
  }
}

/** The API returned a non-success HTTP status. */
export class PgPodcasterApiError extends PgPodcasterError {
  readonly statusCode: number;
  readonly body: string;

  constructor(statusCode: number, message: string, body: string) {
    super(`HTTP ${statusCode}: ${message}`);
    this.name = 'PgPodcasterApiError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

/** 401: missing or invalid bearer token. */
export class PgPodcasterAuthError extends PgPodcasterApiError {
  constructor(body: string) {
    super(401, 'unauthorized', body);
    this.name = 'PgPodcasterAuthError';
  }
}

/** 403: authenticated but not allowed. */
export class PgPodcasterForbiddenError extends PgPodcasterApiError {
  constructor(body: string) {
    super(403, 'forbidden', body);
    this.name = 'PgPodcasterForbiddenError';
  }
}

/** 404: resource does not exist. */
export class PgPodcasterNotFoundError extends PgPodcasterApiError {
  constructor(body: string) {
    super(404, 'not found', body);
    this.name = 'PgPodcasterNotFoundError';
  }
}

/** 422: request body failed validation. */
export class PgPodcasterValidationError extends PgPodcasterApiError {
  constructor(body: string) {
    super(422, 'validation error', body);
    this.name = 'PgPodcasterValidationError';
  }
}

/** Map an HTTP error status to the matching exception. No-op on 2xx. */
export function throwForStatus(statusCode: number, body: string): void {
  if (statusCode >= 200 && statusCode < 300) {
    return;
  }
  switch (statusCode) {
    case 401:
      throw new PgPodcasterAuthError(body);
    case 403:
      throw new PgPodcasterForbiddenError(body);
    case 404:
      throw new PgPodcasterNotFoundError(body);
    case 422:
      throw new PgPodcasterValidationError(body);
    default:
      throw new PgPodcasterApiError(statusCode, 'request failed', body);
  }
}
