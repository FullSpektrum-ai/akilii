const STATUS_BY_CODE = Object.freeze({
  VERSION_CONFLICT: 409,
  IDEMPOTENCY_CONFLICT: 409,
  CAPABILITY_UNAVAILABLE: 409,
  SUBJECT_MISMATCH: 404,
  EXPLICIT_MODE_REQUIRED: 400,
  PROVIDER_UNAVAILABLE: 503,
});

export class IntegrationHttpError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name = 'IntegrationHttpError';
    this.status = status;
    this.code = code;
  }
}

export function toIntegrationHttpError(error) {
  if (error instanceof IntegrationHttpError) return error;
  const code = typeof error?.code === 'string' ? error.code : null;
  const status = STATUS_BY_CODE[code] || Number(error?.status) || 500;
  const message = status >= 500 && !code
    ? 'The service could not complete this request.'
    : (error?.message || 'The request could not be completed.');
  return new IntegrationHttpError(status, message, code);
}
