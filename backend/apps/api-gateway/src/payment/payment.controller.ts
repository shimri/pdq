import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { PaymentService, PaymentResult } from './payment.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { AppLoggerService } from '../common/app-logger.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly logger: AppLoggerService,
  ) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto): Promise<PaymentResult> {
    const maskedCard = processPaymentDto.cardNumber.replace(/\s/g, '').slice(-4);
    this.logger.logWithData(
      'POST /payment/process - Processing payment',
      {
        cardLast4: maskedCard,
        cardholderName: processPaymentDto.cardholderName,
      },
      'PaymentController',
    );
    
    try {
      return await this.paymentService.processPayment(processPaymentDto);
    } catch (error) {
      // If it's already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Log unexpected errors
      this.logger.error(
        `Payment processing error: ${error.message}`,
        error.stack,
        'PaymentController',
      );
      
      // Return 503 for service unavailable scenarios
      throw new HttpException(
        'Payment service is temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

