import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from './app-logger.service';
import { AsyncContextService } from './async-context.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly asyncContext: AsyncContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = this.asyncContext.getCorrelationId() || 'N/A';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      message: typeof message === 'string' ? message : (message as any).message || message,
    };

    // Log error with correlation ID
    if (status >= 500) {
      // Server errors - log with stack trace
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `HTTP ${status} Error: ${request.method} ${request.url} - ${errorMessage}`,
        stack,
        'HttpExceptionFilter',
      );
    } else {
      // Client errors - log without stack trace
      this.logger.warn(
        `HTTP ${status} Error: ${request.method} ${request.url} - ${JSON.stringify(message)}`,
        'HttpExceptionFilter',
      );
    }

    response.status(status).json(errorResponse);
  }
}

