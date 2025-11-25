import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchCart, type CartResponse } from '../services/cartApi';

interface ShippingFormData {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface FormErrors {
  fullName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

const Shipping = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadCart();
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

  const validatePostalCode = (value: string): string | null => {
    // Only allow numeric characters
    const postalCodeRegex = /^\d+$/;
    if (!postalCodeRegex.test(value)) {
      return 'Postal code must contain only numbers';
    }
    if (value.length < 5 || value.length > 10) {
      return 'Postal code must be between 5-10 digits';
    }
    if (value.length > 20) {
      return 'Postal code must not exceed 20 characters';
    }
    return null;
  };

  const validateField = (name: keyof ShippingFormData, value: string): string | null => {
    if (!value.trim()) {
      return `${name === 'fullName' ? 'Full name' : name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    }

    // Character length validations matching backend constraints
    if (name === 'fullName' && value.length > 100) {
      return 'Full name must not exceed 100 characters';
    }
    if (name === 'streetAddress' && value.length > 200) {
      return 'Street address must not exceed 200 characters';
    }
    if (name === 'city' && value.length > 100) {
      return 'City must not exceed 100 characters';
    }
    if (name === 'state' && value.length > 50) {
      return 'State must not exceed 50 characters';
    }
    if (name === 'postalCode') {
      return validatePostalCode(value);
    }
    if (name === 'country' && value.length > 100) {
      return 'Country must not exceed 100 characters';
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For postal code, only allow numeric input
    let processedValue = value;
    if (name === 'postalCode') {
      // Remove any non-numeric characters
      processedValue = value.replace(/\D/g, '');
    }
    
    // Update form data
    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Validate immediately to show errors in real-time when limit is reached or exceeded
    const error = validateField(name as keyof ShippingFormData, processedValue);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      // Clear error if validation passes
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const name = target.name;
    let pastedText = e.clipboardData.getData('text');
    
    // For postal code, filter out non-numeric characters
    if (name === 'postalCode') {
      pastedText = pastedText.replace(/\D/g, '');
    }
    
    // Get max length for the field
    const maxLengths: Record<string, number> = {
      fullName: 100,
      streetAddress: 200,
      city: 100,
      state: 50,
      postalCode: 20,
      country: 100,
    };
    
    const maxLength = maxLengths[name];
    
    if (!maxLength) return;
    
    // Check if pasted content would exceed the limit
    const currentValue = formData[name as keyof ShippingFormData];
    const selectionStart = target.selectionStart || 0;
    const selectionEnd = target.selectionEnd || 0;
    const newValue = currentValue.slice(0, selectionStart) + 
                     pastedText + 
                     currentValue.slice(selectionEnd);
    
    if (newValue.length > maxLength) {
      // Show error immediately (red styling will be applied)
      const error = validateField(name as keyof ShippingFormData, newValue);
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // For postal code, only allow numeric keys
    if (e.currentTarget.name === 'postalCode') {
      const char = String.fromCharCode(e.which || e.keyCode);
      if (!/[0-9]/.test(char)) {
        e.preventDefault();
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate on blur - set error if invalid, but don't clear existing errors
    // Errors will only be cleared when user fixes them (in handleInputChange)
    const error = validateField(name as keyof ShippingFormData, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
    // Don't clear errors on blur - let them persist until user fixes the issue
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof ShippingFormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Navigate to payment page with shipping data
    navigate('/payment', {
      state: {
        shippingAddress: {
          customerName: formData.fullName,
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      },
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Address</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Enter Your Shipping Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onPaste={handlePaste}
                  maxLength={100}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                    errors.fullName 
                      ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onPaste={handlePaste}
                  maxLength={200}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                    errors.streetAddress 
                      ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="123 Main St"
                />
                {errors.streetAddress && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.streetAddress}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onPaste={handlePaste}
                  maxLength={100}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                    errors.city 
                      ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.city}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onPaste={handlePaste}
                  maxLength={50}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                    errors.state 
                      ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="NY"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.state}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onBlur={handleBlur}
                  onPaste={handlePaste}
                  maxLength={20}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                    errors.postalCode 
                      ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="12345"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onPaste={handlePaste}
                  maxLength={100}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none ${
                    errors.country 
                      ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="United States"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.country}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Cart
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Shipping;

