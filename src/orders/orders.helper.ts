import { BadRequestException, Injectable } from '@nestjs/common';
import { CartWithItems } from './types';

@Injectable()
export class OrdersHelper {
  public getTotalAmount(cart: CartWithItems): number {
    return cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);
  }

  public getCurrency(cart: CartWithItems): string {
    const currencies = new Set(cart.items.map((item) => item.product.currency));

    if (currencies.size > 1) {
      throw new BadRequestException('Cart contains products with different currencies');
    }

    return cart.items[0].product.currency;
  }

  public validateStock(cart: CartWithItems): void {
    for (const item of cart.items) {
      if (item.product.quantity < item.quantity) {
        throw new BadRequestException(`Not enough stock for product: ${item.product.name}`);
      }
    }
  }
}
