import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchCart, type CartResponse } from '../services/cartApi';
import { processPayment } from '../services/paymentApi';
import { createOrder } from '../services/orderApi';

interface PaymentFormData {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
}

interface FormErrors {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  cardholderName?: string;
}

interface ShippingAddress {
  customerName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const shippingAddress = (location.state as { shippingAddress?: ShippingAddress })?.shippingAddress;

  useEffect(() => {
    loadCart();
    
    // Redirect if no shipping address
    if (!shippingAddress) {
      toast.error('Please complete shipping information first');
      navigate('/shipping');
    }
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await fetchCart();
      setCart(cartData);
      
      if (!cartData || cartData.items.length === 0) {
        toast.error('Your cart is empty. Redirecting to checkout...');
        setTimeout(() => navigate('/checkout'), 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cart';
      toast.error(errorMessage);
      setTimeout(() => navigate('/checkout'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const validateCardNumber = (value: string): string | null => {
    const digits = value.replace(/\s/g, '');
    if (!digits) {
      return 'Card number is required';
    }
    if (digits.length < 13 || digits.length > 19) {
      return 'Card number must be 13-19 digits';
    }
    return null;
  };

  const validateExpiry = (value: string): string | null => {
    if (!value) {
      return 'Expiry date is required';
    }
    const match = value.match(/^(\d{2})\/(\d{2})$/);
    if (!match) {
      return 'Expiry date must be in MM/YY format';
    }
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    if (month < 1 || month > 12) {
      return 'Month must be between 01 and 12';
    }
    const currentYear = new Date().getFullYear() % 100;
    if (year < currentYear || (year === currentYear && month < new Date().getMonth() + 1)) {
      return 'Card has expired';
    }
    return null;
  };

  const validateCvv = (value: string): string | null => {
    if (!value) {
      return 'CVV is required';
    }
    if (!/^\d{3,4}$/.test(value)) {
      return 'CVV must be 3-4 digits';
    }
    return null;
  };

  const validateCardholderName = (value: string): string | null => {
    if (!value.trim()) {
      return 'Cardholder name is required';
    }
    if (value.trim().length < 2) {
      return 'Cardholder name must be at least 2 characters';
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setPaymentError(null);

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let error: string | null = null;

    if (name === 'cardNumber') {
      error = validateCardNumber(value);
    } else if (name === 'expiry') {
      error = validateExpiry(value);
    } else if (name === 'cvv') {
      error = validateCvv(value);
    } else if (name === 'cardholderName') {
      error = validateCardholderName(value);
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const cardNumberError = validateCardNumber(formData.cardNumber);
    if (cardNumberError) {
      newErrors.cardNumber = cardNumberError;
      isValid = false;
    }

    const expiryError = validateExpiry(formData.expiry);
    if (expiryError) {
      newErrors.expiry = expiryError;
      isValid = false;
    }

    const cvvError = validateCvv(formData.cvv);
    if (cvvError) {
      newErrors.cvv = cvvError;
      isValid = false;
    }

    const cardholderNameError = validateCardholderName(formData.cardholderName);
    if (cardholderNameError) {
      newErrors.cardholderName = cardholderNameError;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!shippingAddress) {
      toast.error('Shipping address is missing');
      navigate('/shipping');
      return;
    }

    try {
      setSubmitting(true);
      setPaymentError(null);

      // Process payment
      const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
      const paymentResult = await processPayment({
        cardNumber: cardNumberDigits,
        expiry: formData.expiry,
        cvv: formData.cvv,
        cardholderName: formData.cardholderName,
      });

      if (!paymentResult.success) {
        setPaymentError(paymentResult.message || 'Payment failed');
        toast.error(paymentResult.message || 'Payment failed');
        return;
      }

      // Payment successful - create order
      const order = await createOrder(shippingAddress, cart.items);
      
      toast.success('Order placed successfully!');
      navigate(`/confirmation/${order.orderId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/checkout')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Checkout
          </button>
        </div>
      </div>
    );
  }

  if (!shippingAddress) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6">
                {paymentError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600" role="alert">{paymentError}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Card Number */}
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      maxLength={19}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        maxLength={5}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.expiry ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="MM/YY"
                      />
                      {errors.expiry && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {errors.expiry}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        maxLength={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="123"
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-sm text-red-600" role="alert">
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cardholderName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.cardholderName && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.cardholderName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/shipping')}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      'Complete Payment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>

              {/* Shipping Address */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{shippingAddress.customerName}</p>
                  <p>{shippingAddress.streetAddress}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>

              {/* Cart Items */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Items</h3>
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium">
                        ${Number(item.lineTotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal */}
              <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Subtotal:</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${Number(cart.subtotal).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

