import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cart, CartItem } from '../generated/prisma/client';

@Injectable()
export class CartPrismaService {
  constructor(private readonly prismaService: PrismaService) {}

  public upsertCart(userId: number): Promise<Cart> {
    return this.prismaService.cart.upsert({
      where: {
        userId,
      },
      update: {},
      create: {
        userId,
      },
    });
  }

  public findCartByUserId(userId: number): Promise<Cart | null> {
    return this.prismaService.cart.findUnique({
      where: {
        userId,
      },
    });
  }

  public findCartItem(cartId: number, productId: number): Promise<CartItem | null> {
    return this.prismaService.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  }

  public findItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | null> {
    return this.prismaService.cartItem.findFirst({
      where: {
        productId,
        cart: {
          userId,
        },
      },
    });
  }

  public getItemsByUserId(userId: number): Promise<CartItem[]> {
    return this.prismaService.cartItem.findMany({
      where: {
        cart: {
          userId,
        },
      },
    });
  }

  public createCartItem(cartId: number, productId: number, quantity: number): Promise<CartItem> {
    return this.prismaService.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
      },
    });
  }

  public setCartItemQuantity(itemId: number, quantity: number): Promise<CartItem> {
    return this.prismaService.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity,
      },
    });
  }

  public increaseCartItemQuantity(itemId: number, delta: number): Promise<CartItem> {
    return this.prismaService.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity: {
          increment: delta,
        },
      },
    });
  }

  public deleteCartItem(itemId: number): Promise<CartItem> {
    return this.prismaService.cartItem.delete({
      where: {
        id: itemId,
      },
    });
  }

  public deleteItemsByCartId(cartId: number): Promise<{ count: number }> {
    return this.prismaService.cartItem.deleteMany({
      where: {
        cartId,
      },
    });
  }
}
