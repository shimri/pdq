const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ProcessPaymentRequest {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
}

export interface PaymentResult {
  success: boolean;
  message?: string;
  transactionId?: string;
}

export const processPayment = async (
  paymentData: ProcessPaymentRequest
): Promise<PaymentResult> => {
  const response = await fetch(`${API_BASE_URL}/payment/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Payment processing failed: ${response.statusText}`
    );
  }

  return response.json();
};

