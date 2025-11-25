import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeOrm: TypeOrmHealthIndicator,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    // Get the latest scheduled health check status
    const lastStatus = this.healthService.getHealthStatus();

    // Perform real-time health check
    const healthCheckResult = await this.health.check([
      () => this.typeOrm.pingCheck('database'),
    ]);

    // Combine scheduled check info with real-time check
    return {
      ...healthCheckResult,
      lastChecked: lastStatus?.timestamp || null,
      scheduledCheck: lastStatus
        ? {
            status: lastStatus.status,
            database: lastStatus.database,
            timestamp: lastStatus.timestamp,
          }
        : null,
    };
  }
}

