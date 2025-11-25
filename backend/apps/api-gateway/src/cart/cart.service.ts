import { Injectable, NotFoundException } from '@nestjs/common';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemDto } from './dto/cart-item.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  private cartItems: Map<string, CartItemDto> = new Map();

  private readonly initialProducts: Omit<CartItemDto, 'lineTotal'>[] = [
    {
      id: '1',
      productName: 'Wireless Mouse',
      quantity: 2,
      unitPrice: 29.99,
    },
    {
      id: '2',
      productName: 'Mechanical Keyboard',
      quantity: 1,
      unitPrice: 129.99,
    },
    {
      id: '3',
      productName: 'USB-C Hub',
      quantity: 1,
      unitPrice: 49.99,
    },
  ];

  constructor() {
    this.resetCartItems();
  }

  resetCartItems(): void {
    this.cartItems.clear();
    this.initialProducts.forEach((product) => {
      const item: CartItemDto = {
        ...product,
        lineTotal: product.quantity * product.unitPrice,
      };
      this.cartItems.set(product.id, item);
    });
  }

  getCart(): CartResponseDto {
    const items = Array.from(this.cartItems.values());
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
    };
  }

  addItem(addItemDto: AddCartItemDto): CartResponseDto {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.id === addItemDto.productId,
    );

    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += addItemDto.quantity;
      existingItem.lineTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      // Add new item
      const newItem: CartItemDto = {
        id: addItemDto.productId,
        productName: addItemDto.productName,
        quantity: addItemDto.quantity,
        unitPrice: addItemDto.unitPrice,
        lineTotal: addItemDto.quantity * addItemDto.unitPrice,
      };
      this.cartItems.set(addItemDto.productId, newItem);
    }

    return this.getCart();
  }

  updateItem(itemId: string, updateItemDto: UpdateCartItemDto): CartResponseDto {
    const item = this.cartItems.get(itemId);
    
    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    if (updateItemDto.quantity <= 0) {
      // Remove item if quantity is 0 or less
      this.cartItems.delete(itemId);
    } else {
      // Update quantity
      item.quantity = updateItemDto.quantity;
      item.lineTotal = item.quantity * item.unitPrice;
    }

    return this.getCart();
  }

  removeItem(itemId: string): CartResponseDto {
    const item = this.cartItems.get(itemId);
    
    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    this.cartItems.delete(itemId);
    return this.getCart();
  }
}

