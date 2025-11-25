import { Injectable } from '@nestjs/common';
import { ProcessPaymentDto } from './dto/process-payment.dto';

export interface PaymentResult {
  success: boolean;
  message?: string;
  transactionId?: string;
}

@Injectable()
export class PaymentService {
  /**
   * Mock payment gateway processing
   * Simulates payment processing with failure scenarios:
   * - Fails if card number starts with "4" (simulating declined card)
   * - Random 10% failure rate for other cards
   */
  async processPayment(paymentDto: ProcessPaymentDto): Promise<PaymentResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cardNumber = paymentDto.cardNumber.replace(/\s/g, '');

    // Simulate declined card (card number starting with "4")
    if (cardNumber.startsWith('4')) {
      return {
        success: false,
        message: 'Payment declined. Please check your card details or try a different payment method.',
      };
    }

    // Simulate random 10% failure rate
    if (Math.random() < 0.1) {
      return {
        success: false,
        message: 'Payment processing failed. Please try again.',
      };
    }

    // Generate mock transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      success: true,
      message: 'Payment processed successfully',
      transactionId,
    };
  }
}

