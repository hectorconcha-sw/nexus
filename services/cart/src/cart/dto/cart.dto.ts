import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId!: string;

  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}
