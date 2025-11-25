import { Injectable, NotFoundException } from '@nestjs/common';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemDto } from './dto/cart-item.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AppLoggerService } from '../common/app-logger.service';

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

  constructor(private readonly logger: AppLoggerService) {
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
    this.logger.log('Cart reset: Initial products loaded', 'CartService');
  }

  getCart(): CartResponseDto {
    const items = Array.from(this.cartItems.values());
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    this.logger.logWithData(
      `Cart retrieved: ${items.length} items, subtotal: $${Math.round(subtotal * 100) / 100}`,
      { itemCount: items.length, subtotal: Math.round(subtotal * 100) / 100 },
      'CartService',
    );

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
      const oldQuantity = existingItem.quantity;
      existingItem.quantity += addItemDto.quantity;
      existingItem.lineTotal = existingItem.quantity * existingItem.unitPrice;
      this.logger.logWithData(
        `Item quantity updated: productId=${addItemDto.productId}, old quantity=${oldQuantity}, new quantity=${existingItem.quantity}`,
        { productId: addItemDto.productId, oldQuantity, newQuantity: existingItem.quantity },
        'CartService',
      );
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
      this.logger.logWithData(
        `Item added: productId=${addItemDto.productId}, productName=${addItemDto.productName}, quantity=${addItemDto.quantity}`,
        { productId: addItemDto.productId, productName: addItemDto.productName, quantity: addItemDto.quantity },
        'CartService',
      );
    }

    return this.getCart();
  }

  updateItem(itemId: string, updateItemDto: UpdateCartItemDto): CartResponseDto {
    const item = this.cartItems.get(itemId);
    
    if (!item) {
      this.logger.error(
        `Cart item update failed: itemId=${itemId} not found`,
        undefined,
        'CartService',
      );
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    const oldQuantity = item.quantity;

    if (updateItemDto.quantity <= 0) {
      // Remove item if quantity is 0 or less
      this.cartItems.delete(itemId);
      this.logger.logWithData(
        `Item removed via update: productId=${itemId}, old quantity=${oldQuantity}`,
        { productId: itemId, oldQuantity },
        'CartService',
      );
    } else {
      // Update quantity
      item.quantity = updateItemDto.quantity;
      item.lineTotal = item.quantity * item.unitPrice;
      this.logger.logWithData(
        `Item updated: productId=${itemId}, old quantity=${oldQuantity}, new quantity=${item.quantity}`,
        { productId: itemId, oldQuantity, newQuantity: item.quantity },
        'CartService',
      );
    }

    return this.getCart();
  }

  removeItem(itemId: string): CartResponseDto {
    const item = this.cartItems.get(itemId);
    
    if (!item) {
      this.logger.error(
        `Cart item removal failed: itemId=${itemId} not found`,
        undefined,
        'CartService',
      );
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    this.cartItems.delete(itemId);
    this.logger.logWithData(
      `Item removed: productId=${itemId}, productName=${item.productName}`,
      { productId: itemId, productName: item.productName },
      'CartService',
    );
    return this.getCart();
  }
}

