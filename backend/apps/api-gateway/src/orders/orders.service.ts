import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Generate unique orderId (timestamp-based)
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate subtotal from items
    const subtotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );

    // Create Order entity
    const order = this.orderRepository.create({
      orderId,
      customerName: createOrderDto.customerName,
      streetAddress: createOrderDto.streetAddress,
      city: createOrderDto.city,
      state: createOrderDto.state,
      postalCode: createOrderDto.postalCode,
      country: createOrderDto.country,
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
      status: 'pending',
      items: createOrderDto.items.map((item) =>
        this.orderRepository.manager.create(OrderItem, {
          orderId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        }),
      ),
    });

    // Save order with cascade to items
    return await this.orderRepository.save(order);
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
