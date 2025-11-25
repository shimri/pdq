import { CartItemDto } from './cart-item.dto';

export class CartResponseDto {
  items: CartItemDto[];
  subtotal: number;
}

