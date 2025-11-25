import { Controller, Get } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResponseDto } from './dto/cart-response.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(): CartResponseDto {
    return this.cartService.getCart();
  }
}

