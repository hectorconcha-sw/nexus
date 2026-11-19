import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis(this.config.getOrThrow<string>('REDIS_URL'));
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // We store the cart as a simple JSON string in Redis.
  // Key format: cart:{cartId}
  async getCart(cartId: string): Promise<string | null> {
    return this.client.get(`cart:${cartId}`);
  }

  async setCart(cartId: string, cartData: string): Promise<void> {
    // 7 days TTL (expire the cart if inactive for a week)
    await this.client.setex(`cart:${cartId}`, 60 * 60 * 24 * 7, cartData);
  }
}
