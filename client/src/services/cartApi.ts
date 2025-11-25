export interface CartItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
}

export interface AddCartItemRequest {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchCart = async (): Promise<CartResponse> => {
  const response = await fetch(`${API_BASE_URL}/cart`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch cart data');
  }
  
  return response.json();
};

export const addCartItem = async (item: AddCartItemRequest): Promise<CartResponse> => {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add item to cart');
  }
  
  return response.json();
};

export const updateCartItem = async (
  itemId: string,
  update: UpdateCartItemRequest
): Promise<CartResponse> => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update cart item');
  }
  
  return response.json();
};

export const removeCartItem = async (itemId: string): Promise<CartResponse> => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove item from cart');
  }
  
  return response.json();
};

