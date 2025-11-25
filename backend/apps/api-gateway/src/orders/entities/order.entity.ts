import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderId: string;

  @Column()
  customerName: string;

  @Column()
  streetAddress: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];
}
