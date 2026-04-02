import type { ValidationErrorDetail } from '@/api/types/common.types';

export class AppApiError extends Error {
  readonly status: number;

  readonly code?: string;

  readonly details?: ValidationErrorDetail[];

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: ValidationErrorDetail[],
  ) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(e: unknown): e is AppApiError {
  return e instanceof AppApiError;
}
