import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { ApiSuccess } from '../types/api-response.type';

type PayloadWithData = {
  data: unknown;
  meta?: Record<string, unknown>;
  traceId?: string;
};

function hasDataPayload(value: unknown): value is PayloadWithData {
  return typeof value === 'object' && value !== null && 'data' in value;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { headers: Record<string, string> }>();
    const traceId = request.headers['x-request-id'];

    return next.handle().pipe(
      map((payload: unknown) => {
        if (hasDataPayload(payload)) {
          return {
            ...payload,
            traceId: payload.traceId ?? traceId,
          };
        }

        const response: ApiSuccess<unknown> = {
          data: payload,
          traceId,
        };
        return response;
      }),
    );
  }
}
