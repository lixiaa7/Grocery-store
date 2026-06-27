import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  productId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}
