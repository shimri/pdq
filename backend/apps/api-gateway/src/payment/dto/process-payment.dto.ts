import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, {
    message: 'Card number must be 13-19 digits',
  })
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Expiry date must be in MM/YY format',
  })
  expiry: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3,4}$/, {
    message: 'CVV must be 3-4 digits',
  })
  cvv: string;

  @IsString()
  @IsNotEmpty()
  cardholderName: string;
}

