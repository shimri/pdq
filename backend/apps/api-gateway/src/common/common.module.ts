import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AsyncContextService } from './async-context.service';
import { AppLoggerService } from './app-logger.service';
import { HttpExceptionFilter } from './http-exception.filter';

@Global()
@Module({
  providers: [
    AsyncContextService,
    AppLoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [AsyncContextService, AppLoggerService],
})
export class CommonModule {}

