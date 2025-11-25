import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { DatabaseModule } from './database/database.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    OrdersModule,
    CartModule,
    PaymentModule,
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
