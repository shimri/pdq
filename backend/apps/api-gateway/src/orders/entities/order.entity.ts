import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
@Index('IDX_orders_status_createdAt', ['status', 'createdAt'])
@Index('IDX_orders_createdAt_status', ['createdAt', 'status'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true, length: 100 })
  orderId: string;

  @Column('varchar', { length: 100 })
  customerName: string;

  @Column('varchar', { length: 200 })
  streetAddress: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 50 })
  state: string;

  @Column('varchar', { length: 20 })
  postalCode: string;

  @Column('varchar', { length: 100 })
  country: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column('varchar', { length: 500, nullable: true })
  formattedAddress: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Index('IDX_orders_status')
  @Column('varchar', { length: 50 })
  status: string;

  @Index('IDX_orders_createdAt')
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];
}
