import { Injectable } from '@nestjs/common';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { AppLoggerService } from '../common/app-logger.service';

export interface PaymentResult {
  success: boolean;
  message?: string;
  transactionId?: string;
}

@Injectable()
export class PaymentService {
  constructor(private readonly logger: AppLoggerService) {}

  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length <= 4) {
      return '****';
    }
    return `****${cleaned.slice(-4)}`;
  }
  /**
   * Mock payment gateway processing
   * Simulates payment processing with failure scenarios:
   * - Fails if card number starts with "4" (simulating declined card)
   * - Random 10% failure rate for other cards
   */
  async processPayment(paymentDto: ProcessPaymentDto): Promise<PaymentResult> {
    const maskedCard = this.maskCardNumber(paymentDto.cardNumber);
    
    this.logger.logWithData(
      `Payment processing started: card ending ${maskedCard.slice(-4)}, cardholder=${paymentDto.cardholderName}`,
      {
        cardLast4: maskedCard.slice(-4),
        cardholderName: paymentDto.cardholderName,
        expiry: paymentDto.expiry,
      },
      'PaymentService',
    );

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cardNumber = paymentDto.cardNumber.replace(/\s/g, '');

    // Simulate declined card (card number starting with "4")
    if (cardNumber.startsWith('4')) {
      const result = {
        success: false,
        message: 'Payment declined. Please check your card details or try a different payment method.',
      };
      this.logger.logWithData(
        `Payment declined: card ending ${maskedCard.slice(-4)}, reason=card declined`,
        { cardLast4: maskedCard.slice(-4) },
        'PaymentService',
      );
      return result;
    }

    // Simulate random 10% failure rate
    if (Math.random() < 0.01) {
      const result = {
        success: false,
        message: 'Payment processing failed. Please try again.',
      };
      this.logger.logWithData(
        `Payment processing failed: card ending ${maskedCard.slice(-4)}, reason=processing error`,
        { cardLast4: maskedCard.slice(-4) },
        'PaymentService',
      );
      return result;
    }

    // Generate mock transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    this.logger.logWithData(
      `Payment successful: transactionId=${transactionId}, card ending ${maskedCard.slice(-4)}`,
      { transactionId, cardLast4: maskedCard.slice(-4) },
      'PaymentService',
    );

    return {
      success: true,
      message: 'Payment processed successfully',
      transactionId,
    };
  }
}

