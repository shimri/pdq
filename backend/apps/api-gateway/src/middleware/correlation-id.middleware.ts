import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncContextService } from '../common/async-context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly asyncContextService: AsyncContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Generate or use existing correlation ID from header
    const correlationId =
      req.headers['x-correlation-id']?.toString() ||
      `CID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Set correlation ID in response header
    res.setHeader('X-Correlation-ID', correlationId);

    // Run the request in async context with correlation ID
    this.asyncContextService.run(correlationId, () => {
      // Call next() to continue the request pipeline
      next();
    });
  }
}

