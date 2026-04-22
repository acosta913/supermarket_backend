import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<
      Request & { headers: Record<string, string> }
    >();
    const response = http.getResponse<{ statusCode: number }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsedMs = Date.now() - startedAt;
        const requestId = request.headers['x-request-id'];
        this.logger.log(
          `${request.method} ${request.url} ${response.statusCode} ${elapsedMs}ms requestId=${requestId ?? 'n/a'}`,
        );
      }),
    );
  }
}
