import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorDetails {
  message?: string;
  errors?: Record<string, string[]>;
}

export function parseApiError(error: HttpErrorResponse): ApiErrorDetails {
  const body: unknown = error.error;
  if (!isRecord(body)) return {};

  const details: ApiErrorDetails = {};
  const message = body['message'];
  if (typeof message === 'string') details.message = message;

  // TODO: API_DOCUMENTATION.md does not show the 422 response schema; this reads Laravel's standard errors map.
  const errors = body['errors'];
  if (isRecord(errors)) {
    details.errors = Object.fromEntries(
      Object.entries(errors).flatMap(([field, messages]) => {
        if (!Array.isArray(messages)) return [];
        const validMessages = messages.filter((item): item is string => typeof item === 'string');
        return validMessages.length ? [[field, validMessages]] : [];
      }),
    );
  }
  return details;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
