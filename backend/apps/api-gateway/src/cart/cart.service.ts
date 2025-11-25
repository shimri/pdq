import { Injectable } from '@nestjs/common';
import { CartResponseDto } from './dto/cart-response.dto';
import { CartItemDto } from './dto/cart-item.dto';

@Injectable()
export class CartService {
  getCart(): CartResponseDto {
    const mockProducts: Omit<CartItemDto, 'lineTotal'>[] = [
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

    const items: CartItemDto[] = mockProducts.map((product) => ({
      ...product,
      lineTotal: product.quantity * product.unitPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      items,
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
    };
  }
}

