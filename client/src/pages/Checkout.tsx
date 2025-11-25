import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchCart, updateCartItem, removeCartItem, type CartResponse } from '../services/cartApi';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [itemErrors, setItemErrors] = useState<Map<string, string>>(new Map());
  const [quantityInputs, setQuantityInputs] = useState<Map<string, string>>(new Map());
  const loadingRef = useRef(false);

  const loadCart = async () => {
    // Prevent duplicate calls
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setItemErrors(new Map());
      const cartData = await fetchCart();
      setCart(cartData);
      // Initialize quantity inputs with current quantities
      const inputs = new Map<string, string>();
      cartData.items.forEach((item) => {
        inputs.set(item.id, item.quantity.toString());
      });
      setQuantityInputs(inputs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cart';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const validateQuantity = (quantity: number): string | null => {
    if (isNaN(quantity) || !Number.isInteger(quantity)) {
      return 'Quantity must be a whole number';
    }
    if (quantity < 1) {
      return 'Quantity must be at least 1';
    }
    if (quantity > 999) {
      return 'Quantity cannot exceed 999';
    }
    return null;
  };

  const handleQuantityInputChange = (itemId: string, value: string) => {
    setQuantityInputs((prev) => {
      const next = new Map(prev);
      next.set(itemId, value);
      return next;
    });
    // Clear error for this item when user starts typing
    setItemErrors((prev) => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleQuantityInputBlur = async (itemId: string) => {
    const inputValue = quantityInputs.get(itemId);
    if (!inputValue) return;

    const quantity = parseInt(inputValue, 10);
    const validationError = validateQuantity(quantity);
    
    if (validationError) {
      setItemErrors((prev) => {
        const next = new Map(prev);
        next.set(itemId, validationError);
        return next;
      });
      // Reset to current cart quantity
      const currentItem = cart?.items.find((item) => item.id === itemId);
      if (currentItem) {
        setQuantityInputs((prev) => {
          const next = new Map(prev);
          next.set(itemId, currentItem.quantity.toString());
          return next;
        });
      }
      return;
    }

    const currentItem = cart?.items.find((item) => item.id === itemId);
    if (currentItem && currentItem.quantity === quantity) {
      return; // No change needed
    }

    await updateItemQuantity(itemId, quantity);
  };

  const handleQuantityInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    const validationError = validateQuantity(newQuantity);
    if (validationError) {
      setItemErrors((prev) => {
        const next = new Map(prev);
        next.set(itemId, validationError);
        return next;
      });
      return;
    }

    const currentItem = cart?.items.find((item) => item.id === itemId);
    const itemName = currentItem?.productName || 'Item';

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      setItemErrors((prev) => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      });
      const updatedCart = await updateCartItem(itemId, { quantity: newQuantity });
      setCart(updatedCart);
      // Update input to match new quantity
      setQuantityInputs((prev) => {
        const next = new Map(prev);
        next.set(itemId, newQuantity.toString());
        return next;
      });
      toast.success(`Updated ${itemName} quantity to ${newQuantity}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item quantity';
      toast.error(errorMessage);
      // Reset input to current cart quantity on error
      if (currentItem) {
        setQuantityInputs((prev) => {
          const next = new Map(prev);
          next.set(itemId, currentItem.quantity.toString());
          return next;
        });
      }
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleQuantityChange = async (itemId: string, delta: number) => {
    const currentItem = cart?.items.find((item) => item.id === itemId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity + delta;
    await updateItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    const currentItem = cart?.items.find((item) => item.id === itemId);
    const itemName = currentItem?.productName || 'Item';

    if (!confirm(`Are you sure you want to remove ${itemName} from your cart?`)) {
      return;
    }

    try {
      setUpdatingItems((prev) => new Set(prev).add(itemId));
      setItemErrors((prev) => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      });
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
      // Remove from quantity inputs
      setQuantityInputs((prev) => {
        const next = new Map(prev);
        next.delete(itemId);
        return next;
      });
      toast.success(`Removed ${itemName} from cart`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      toast.error(errorMessage);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-600 text-lg mb-4">Unable to load cart</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={loadCart}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Cart Summary</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Unit Price
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Line Total
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cart.items.map((item) => {
                  const isUpdating = updatingItems.has(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={isUpdating || item.quantity <= 1}
                              className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[32px] flex items-center justify-center"
                              aria-label="Decrease quantity"
                            >
                              {isUpdating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                              ) : (
                                '−'
                              )}
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="999"
                              value={quantityInputs.get(item.id) || item.quantity.toString()}
                              onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                              onBlur={() => handleQuantityInputBlur(item.id)}
                              onKeyDown={handleQuantityInputKeyDown}
                              disabled={isUpdating}
                              className={`w-16 px-2 py-1 text-sm text-center border rounded ${
                                itemErrors.has(item.id)
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300 bg-white'
                              } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                              aria-label={`Quantity for ${item.productName}`}
                            />
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={isUpdating}
                              className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[32px] flex items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              {isUpdating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                              ) : (
                                '+'
                              )}
                            </button>
                          </div>
                          {itemErrors.has(item.id) && (
                            <p className="text-xs text-red-600 mt-1" role="alert">
                              {itemErrors.get(item.id)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 hidden sm:table-cell">
                        ${Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        ${Number(item.lineTotal).toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          aria-label={`Remove ${item.productName} from cart`}
                        >
                          {isUpdating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                              <span>Removing...</span>
                            </>
                          ) : (
                            'Remove'
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Subtotal:</span>
              <span className="text-xl font-bold text-gray-900">
                ${Number(cart.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => navigate('/shipping')}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Proceed to Shipping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

