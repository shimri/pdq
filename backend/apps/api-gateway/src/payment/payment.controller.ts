import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService, PaymentResult } from './payment.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto): Promise<PaymentResult> {
    return this.paymentService.processPayment(processPaymentDto);
  }
}

