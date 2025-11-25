import { IsString, IsNotEmpty, IsArray, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9\s-]{5,10}$/, {
    message: 'Postal code must be alphanumeric and between 5-10 characters',
  })
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
