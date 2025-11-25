import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  lineTotal: number;
}

