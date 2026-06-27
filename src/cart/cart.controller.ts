import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartItem } from '../generated/prisma/client';
import { CurrentUserId } from '../common/decorators/current-user-id.decorator';
import { UpdateCartDto } from './dto/update-cart.dto';

//TODO: just thoughts. If some user know another userId - can this user manage other carts of another users?
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCartByUserId(@CurrentUserId() userId: number) {
    return this.cartService.getCartByUserId(userId);
  }

  @Post('items')
  addProductToCart(@Body() dto: AddToCartDto, @CurrentUserId() userId: number): Promise<CartItem> {
    return this.cartService.addProductToCart(userId, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  updateCartItemQuantity(
    @Body() dto: UpdateCartDto,
    @CurrentUserId() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.updateCartItemQuantity(userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  removeProductFromCart(
    @CurrentUserId() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.deleteProductFromCart(userId, productId);
  }

  @Delete('items')
  clearCart(@CurrentUserId() userId: number) {
    return this.cartService.clearCart(userId);
  }
}
