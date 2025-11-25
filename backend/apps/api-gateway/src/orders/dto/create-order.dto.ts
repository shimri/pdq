import { IsString, IsNotEmpty, IsArray, ValidateNested, Matches, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Customer name must not exceed 100 characters' })
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Street address must not exceed 200 characters' })
  streetAddress: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'City must not exceed 100 characters' })
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'State must not exceed 50 characters' })
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'Postal code must not exceed 20 characters' })
  @Matches(/^[A-Za-z0-9\s-]{5,10}$/, {
    message: 'Postal code must be alphanumeric and between 5-10 characters',
  })
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Country must not exceed 100 characters' })
  country: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
