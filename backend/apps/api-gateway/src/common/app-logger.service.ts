import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { AsyncContextService } from './async-context.service';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: Logger;

  constructor(private readonly asyncContextService: AsyncContextService) {
    this.logger = new Logger();
  }

  private formatMessage(context: string, message: string, data?: any): string {
    const correlationId = this.asyncContextService.getCorrelationId() || 'N/A';
    const baseMessage = `[CorrelationID: ${correlationId}] [${context}] ${message}`;
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data)}`;
    }
    
    return baseMessage;
  }

  log(message: string, context?: string) {
    this.logger.log(this.formatMessage(context || 'App', message));
  }

  error(message: string, trace?: string, context?: string) {
    const formattedMessage = this.formatMessage(context || 'App', message);
    if (trace) {
      this.logger.error(`${formattedMessage}\n${trace}`);
    } else {
      this.logger.error(formattedMessage);
    }
  }

  warn(message: string, context?: string) {
    this.logger.warn(this.formatMessage(context || 'App', message));
  }

  debug(message: string, context?: string) {
    this.logger.debug(this.formatMessage(context || 'App', message));
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(this.formatMessage(context || 'App', message));
  }

  logWithData(message: string, data: any, context?: string) {
    this.logger.log(this.formatMessage(context || 'App', message, data));
  }
}

