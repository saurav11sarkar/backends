import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';

interface ApiResponse {
  message?: string;
  meta?: unknown;
  data?: unknown;
}

@Injectable()
export class UtilsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((response: unknown) => {
        if (res.statusCode === 204) return undefined;

        if (
          response &&
          typeof response === 'object' &&
          ('data' in response || 'message' in response)
        ) {
          const result = response as ApiResponse;

          return {
            statusCode: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            message: result.message ?? null,
            meta: result.meta,
            data: result.data,
          };
        }

        return {
          statusCode: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          message: 'Request successfully completed',
          data: response,
        };
      }),
    );
  }
}
