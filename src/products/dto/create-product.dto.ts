import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}
