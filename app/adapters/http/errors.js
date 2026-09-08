const STATUS_BY_CODE = Object.freeze({
  VERSION_CONFLICT: 409,
  CAPABILITY_UNAVAILABLE: 409,
  SUBJECT_MISMATCH: 404,
  EXPLICIT_MODE_REQUIRED: 400,
  PROVIDER_UNAVAILABLE: 503,
});

export class HttpError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export function toHttpError(error) {
  if (error instanceof HttpError) return error;
  const code = typeof error?.code === 'string' ? error.code : null;
  const status = STATUS_BY_CODE[code] || Number(error?.status) || 500;
  const safe = status >= 500 && !code
    ? 'The service could not complete this request.'
    : (error?.message || 'The request could not be completed.');
  return new HttpError(status, safe, code);
}
