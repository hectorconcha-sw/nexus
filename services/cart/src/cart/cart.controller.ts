import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Helper to extract cart ID from headers (e.g., a session ID or User ID)
  private getCartId(cartId?: string): string {
    if (!cartId) {
      throw new UnauthorizedException('x-cart-id header is missing');
    }
    return cartId;
  }

  @Get()
  getCart(@Headers('x-cart-id') cartId?: string) {
    return this.cartService.getCart(this.getCartId(cartId));
  }

  @Post('items')
  addItem(@Headers('x-cart-id') cartId: string | undefined, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(this.getCartId(cartId), dto);
  }

  @Delete('items/:productId')
  removeItem(
    @Headers('x-cart-id') cartId: string | undefined,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(this.getCartId(cartId), productId);
  }
}
