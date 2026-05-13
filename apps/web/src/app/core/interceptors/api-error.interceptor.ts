import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface ApiError {
  message: string;
  status: number;
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(catchError((error: unknown) => throwError(() => normalizeApiError(error))));

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    const message = extractBackendMessage(error.error) ?? fallbackMessage(error.status);

    return {
      message,
      status: error.status,
    };
  }

  return {
    message: 'Something went wrong. Please try again.',
    status: 0,
  };
}

function extractBackendMessage(errorBody: unknown): string | undefined {
  if (!errorBody || typeof errorBody !== 'object') {
    return undefined;
  }

  const body = errorBody as Record<string, unknown>;
  const message = body['message'];

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(' ');
  }

  return undefined;
}

function fallbackMessage(status: number): string {
  if (status === 0) {
    return 'Unable to reach the currency service. Check that the backend is running.';
  }

  if (status >= 500) {
    return 'The currency service is temporarily unavailable.';
  }

  return 'The request could not be completed.';
}
