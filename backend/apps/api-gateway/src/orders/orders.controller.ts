import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AppLoggerService } from '../common/app-logger.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly logger: AppLoggerService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.logWithData(
      'POST /orders - Creating new order',
      {
        customerName: createOrderDto.customerName,
        itemCount: createOrderDto.items.length,
        city: createOrderDto.city,
        state: createOrderDto.state,
      },
      'OrdersController',
    );
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    this.logger.log('GET /orders - Retrieving all orders', 'OrdersController');
    return this.ordersService.findAll();
  }

  @Get(':orderId')
  async findOne(@Param('orderId') orderId: string) {
    this.logger.log(`GET /orders/${orderId} - Retrieving order`, 'OrdersController');
    const order = await this.ordersService.findByOrderId(orderId);
    if (!order) {
      this.logger.error(
        `Order retrieval failed: orderId=${orderId} not found`,
        undefined,
        'OrdersController',
      );
      throw new NotFoundException(`Order with orderId ${orderId} not found`);
    }
    return order;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
