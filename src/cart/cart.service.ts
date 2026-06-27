import { Injectable, NotFoundException } from '@nestjs/common';
import { CartPrismaService } from './cart.prisma.service';
import { CartItem } from '../generated/prisma/client';
import { MessageResponse } from './types';

@Injectable()
export class CartService {
  constructor(private readonly cartPrismaService: CartPrismaService) {}

  public async addProductToCart(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItem> {
    const cart = await this.cartPrismaService.upsertCart(userId);

    const existingItem = await this.cartPrismaService.findCartItem(cart.id, productId);

    if (existingItem) {
      return this.cartPrismaService.increaseCartItemQuantity(existingItem.id, quantity);
    }

    return this.cartPrismaService.createCartItem(cart.id, productId, quantity);
  }

  public getCartByUserId(userId: number): Promise<CartItem[]> {
    return this.cartPrismaService.getItemsByUserId(userId);
  }

  public async updateCartItemQuantity(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItem> {
    const item = await this.cartPrismaService.findItemByUserAndProduct(userId, productId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.cartPrismaService.setCartItemQuantity(item.id, quantity);
  }

  public async deleteProductFromCart(userId: number, productId: number): Promise<CartItem> {
    const item = await this.cartPrismaService.findItemByUserAndProduct(userId, productId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.cartPrismaService.deleteCartItem(item.id);
  }

  public async clearCart(userId: number): Promise<MessageResponse> {
    const cart = await this.cartPrismaService.findCartByUserId(userId);

    if (!cart) {
      return { message: 'Cart is already empty' };
    }

    await this.cartPrismaService.deleteItemsByCartId(cart.id);

    return { message: 'Cart cleared' };
  }
}
