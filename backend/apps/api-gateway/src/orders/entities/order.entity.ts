import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  orderId: string;

  @Column({ length: 100 })
  customerName: string;

  @Column({ length: 200 })
  streetAddress: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 50 })
  state: string;

  @Column({ length: 20 })
  postalCode: string;

  @Column({ length: 100 })
  country: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column('varchar', { length: 500, nullable: true })
  formattedAddress: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column({ length: 50 })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];
}
