import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { AddToCartDto, Cart } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly redis: RedisService) {}

  async getCart(cartId: string): Promise<Cart> {
    const data = await this.redis.getCart(cartId);
    if (!data) {
      return { id: cartId, items: [] };
    }
    return JSON.parse(data) as Cart;
  }

  async addItem(cartId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(cartId);

    const existingItem = cart.items.find((item) => item.productId === dto.productId);

    if (existingItem) {
      // If item exists, just increase quantity
      existingItem.quantity += dto.quantity;
    } else {
      // Otherwise, add new item
      cart.items.push({
        productId: dto.productId,
        slug: dto.slug,
        name: dto.name,
        priceCents: dto.priceCents,
        quantity: dto.quantity,
      });
    }

    await this.redis.setCart(cartId, JSON.stringify(cart));
    return cart;
  }

  async removeItem(cartId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    await this.redis.setCart(cartId, JSON.stringify(cart));
    return cart;
  }
}
