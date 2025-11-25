import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResponseDto } from './dto/cart-response.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(): CartResponseDto {
    return this.cartService.getCart();
  }

  @Post('items')
  addItem(@Body() addItemDto: AddCartItemDto): CartResponseDto {
    return this.cartService.addItem(addItemDto);
  }

  @Put('items/:id')
  updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateCartItemDto,
  ): CartResponseDto {
    return this.cartService.updateItem(id, updateItemDto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string): CartResponseDto {
    return this.cartService.removeItem(id);
  }
}

