import type { CartItem } from './cartApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CreateOrderRequest {
  customerName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

export interface OrderResponse {
  id: number;
  orderId: string;
  customerName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  subtotal: number;
  status: string;
  createdAt: string;
  items: {
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

export const createOrder = async (
  shippingAddress: {
    customerName: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  },
  cartItems: CartItem[]
): Promise<OrderResponse> => {
  const orderData: CreateOrderRequest = {
    ...shippingAddress,
    items: cartItems.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  };

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to create order: ${response.statusText}`
    );
  }

  return response.json();
};

export const getOrderByOrderId = async (orderId: string): Promise<OrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch order: ${response.statusText}`
    );
  }

  return response.json();
};

export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<OrderResponse> => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to update order status: ${response.statusText}`
    );
  }

  return response.json();
};

