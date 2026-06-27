import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  quantity: number;

  // Price in the smallest currency unit (e.g. cents) — must be an integer for Stripe.
  @IsInt()
  @Min(0)
  price: number;
}
