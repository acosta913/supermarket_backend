import type { ErrorCode } from '../constants/error-codes';

export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  traceId?: string;
};

export type ApiError = {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    traceId?: string;
  };
};
