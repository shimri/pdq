import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppLoggerService } from '../common/app-logger.service';

interface HealthStatus {
  status: 'ok' | 'error';
  database: {
    status: 'up' | 'down';
    responseTime?: number;
    error?: string;
  };
  timestamp: Date;
}

@Injectable()
export class HealthService {
  private lastHealthStatus: HealthStatus | null = null;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: AppLoggerService,
  ) {}

  @Cron('* * * * *') // Run every minute
  async performHealthCheck() {
    const startTime = Date.now();
    try {
      // Check database connectivity
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      this.lastHealthStatus = {
        status: 'ok',
        database: {
          status: 'up',
          responseTime,
        },
        timestamp: new Date(),
      };

      this.logger.log(
        `Health check passed - Database: UP (${responseTime}ms)`,
        'HealthService',
      );
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.lastHealthStatus = {
        status: 'error',
        database: {
          status: 'down',
          responseTime,
          error: errorMessage,
        },
        timestamp: new Date(),
      };

      this.logger.error(
        `Health check failed - Database: DOWN - ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
        'HealthService',
      );
    }
  }

  getHealthStatus(): HealthStatus | null {
    return this.lastHealthStatus;
  }

  async checkDatabaseHealth(): Promise<{
    status: 'up' | 'down';
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      return {
        status: 'up',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

