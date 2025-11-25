import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
    return this.paymentService.processPayment(processPaymentDto);
  }
}

