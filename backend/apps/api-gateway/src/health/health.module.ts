import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TerminusModule, TypeOrmModule, CommonModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}

