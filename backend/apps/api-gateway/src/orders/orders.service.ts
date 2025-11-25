import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { AppLoggerService } from '../common/app-logger.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly logger: AppLoggerService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Generate unique orderId (timestamp-based)
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate subtotal from items
    const subtotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );

    const roundedSubtotal = Math.round(subtotal * 100) / 100;

    this.logger.logWithData(
      `Order creation started: customer=${createOrderDto.customerName}, items=${createOrderDto.items.length}, subtotal=$${roundedSubtotal}`,
      {
        orderId,
        customerName: createOrderDto.customerName,
        itemCount: createOrderDto.items.length,
        subtotal: roundedSubtotal,
      },
      'OrdersService',
    );

    // Create Order entity with items
    const order = this.orderRepository.create({
      orderId,
      customerName: createOrderDto.customerName,
      streetAddress: createOrderDto.streetAddress,
      city: createOrderDto.city,
      state: createOrderDto.state,
      postalCode: createOrderDto.postalCode,
      country: createOrderDto.country,
      subtotal: roundedSubtotal, // Round to 2 decimal places
      status: 'pending',
      items: createOrderDto.items.map((item) =>
        this.orderItemRepository.create({
          orderId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        }),
      ),
    });

    try {
      // Save order with cascade to items
      const savedOrder = await this.orderRepository.save(order);

      this.logger.logWithData(
        `Order created successfully: orderId=${orderId}`,
        { orderId, status: savedOrder.status, subtotal: savedOrder.subtotal },
        'OrdersService',
      );

      // Reset cart so next checkout starts from the mock products again
      this.cartService.resetCartItems();

      return savedOrder;
    } catch (error) {
      this.logger.error(
        `Order creation failed: orderId=${orderId}, error=${error.message}`,
        error.stack,
        'OrdersService',
      );
      throw error;
    }
  }

  findAll() {
    return `This action returns all orders`;
  }

  async findByOrderId(orderId: string): Promise<Order | null> {
    try {
      const order = await this.orderRepository.findOne({
        where: { orderId },
        relations: ['items'],
      });

      if (order) {
        this.logger.logWithData(
          `Order retrieved: orderId=${orderId}`,
          { orderId, status: order.status, itemCount: order.items?.length || 0 },
          'OrdersService',
        );
      } else {
        this.logger.warn(`Order not found: orderId=${orderId}`, 'OrdersService');
      }

      return order;
    } catch (error) {
      this.logger.error(
        `Order retrieval failed: orderId=${orderId}, error=${error.message}`,
        error.stack,
        'OrdersService',
      );
      throw error;
    }
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
