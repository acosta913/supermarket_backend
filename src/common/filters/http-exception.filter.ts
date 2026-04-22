import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ErrorCodes, type ErrorCode } from '../constants/error-codes';

const STATUS_BAD_REQUEST = 400;

const STATUS_TO_ERROR_CODE: Record<number, ErrorCode> = {
  401: ErrorCodes.UNAUTHORIZED,
  403: ErrorCodes.FORBIDDEN,
  404: ErrorCodes.NOT_FOUND,
  409: ErrorCodes.CONFLICT,
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const traceId = request.headers['x-request-id'] as string | undefined;

    if (exception instanceof HttpException) {
      const status = this.toStatusCode(exception.getStatus());
      const exceptionResponse = exception.getResponse();
      const details =
        typeof exceptionResponse === 'object' ? exceptionResponse : undefined;
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exception.message;

      response.status(status).json({
        error: {
          code: this.mapStatusToErrorCode(status, details),
          message,
          details,
          traceId,
        },
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Unexpected internal server error',
        traceId,
      },
    });
  }

  private mapStatusToErrorCode(status: number, details?: unknown): ErrorCode {
    if (status === STATUS_BAD_REQUEST) {
      if (
        details &&
        typeof details === 'object' &&
        'message' in details &&
        Array.isArray((details as { message?: unknown }).message)
      ) {
        return ErrorCodes.VALIDATION_ERROR;
      }
      return ErrorCodes.BAD_REQUEST;
    }

    return STATUS_TO_ERROR_CODE[status] ?? ErrorCodes.INTERNAL_ERROR;
  }

  private toStatusCode(value: number): number {
    return Number.isInteger(value) ? value : HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
