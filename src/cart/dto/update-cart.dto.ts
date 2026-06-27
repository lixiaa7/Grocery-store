import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}
