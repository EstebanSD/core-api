import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { CustomLoggerService } from '../logger/custom-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new CustomLoggerService();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const time = Date.now() - now;
        this.logger.log(`${method} ${url} -> ${time}ms`, 'HTTP');
      }),
    );
  }
}
