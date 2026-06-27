import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersPrismaService } from './orders.prisma.service';
import { OrdersHelper } from './orders.helper';
import { OrderWithItems } from './types';
import { OrderStatus } from '../generated/prisma/enums';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersPrismaService: OrdersPrismaService,
    private readonly ordersHelper: OrdersHelper,
  ) {}

  //TODO: looks pretty beautiful how you are using prisma services here. Well done
  public async createOrderFromCart(userId: number): Promise<OrderWithItems> {
    const cart = await this.ordersPrismaService.findCartWithItems(userId);

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    this.ordersHelper.validateStock(cart);

    const totalAmount = this.ordersHelper.getTotalAmount(cart);
    const currency = this.ordersHelper.getCurrency(cart);

    const items = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      title: item.product.name,
    }));

    return this.ordersPrismaService.createOrder(userId, totalAmount, currency, items);
  }

  public getOrdersById(userId: number): Promise<OrderWithItems[]> {
    return this.ordersPrismaService.getOrdersByUserId(userId);
  }

  public async getOneOrderById(userId: number, orderId: number): Promise<OrderWithItems> {
    const order = await this.ordersPrismaService.getOneOrderByUserId(userId, orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  public async cancelOrder(userId: number, orderId: number) {
    // getOneOrderById already throws NotFoundException when the order is missing.
    const order = await this.getOneOrderById(userId, orderId);

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Paid order cannot be canceled');
    }

    if (order.status === OrderStatus.CANCELED) {
      throw new BadRequestException('Order already canceled');
    }

    return this.ordersPrismaService.setStatusOrderToCancel(order.id);
  }
}
