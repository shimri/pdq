import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResponseDto } from './dto/cart-response.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AppLoggerService } from '../common/app-logger.service';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly logger: AppLoggerService,
  ) {}

  @Get()
  getCart(): CartResponseDto {
    this.logger.log('GET /cart - Retrieving cart', 'CartController');
    return this.cartService.getCart();
  }

  @Post('items')
  addItem(@Body() addItemDto: AddCartItemDto): CartResponseDto {
    this.logger.logWithData(
      'POST /cart/items - Adding item to cart',
      { productId: addItemDto.productId, quantity: addItemDto.quantity },
      'CartController',
    );
    return this.cartService.addItem(addItemDto);
  }

  @Put('items/:id')
  updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateCartItemDto,
  ): CartResponseDto {
    this.logger.logWithData(
      `PUT /cart/items/${id} - Updating cart item`,
      { itemId: id, quantity: updateItemDto.quantity },
      'CartController',
    );
    return this.cartService.updateItem(id, updateItemDto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string): CartResponseDto {
    this.logger.log(`DELETE /cart/items/${id} - Removing cart item`, 'CartController');
    return this.cartService.removeItem(id);
  }
}

