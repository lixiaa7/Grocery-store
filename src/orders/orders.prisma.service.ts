import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { CartWithItems, OrderWithItems } from './types';

@Injectable()
export class OrdersPrismaService {
  constructor(private readonly prismaService: PrismaService) {}

  public async findCartWithItems(userId: number): Promise<CartWithItems | null> {
    return this.prismaService.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  public async createOrder(
    userId: number,
    totalAmount: number,
    currency: string,
    items: Prisma.OrderItemUncheckedCreateWithoutOrderInput[],
  ): Promise<OrderWithItems> {
    return this.prismaService.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING_PAYMENT,
        totalAmount,
        currency,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    });
  }

  public async getOrdersByUserId(userId: number): Promise<OrderWithItems[]> {
    return this.prismaService.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });
  }

  public async updateOrderSessionId(orderId: number, sessionId: string): Promise<OrderWithItems> {
    return this.prismaService.order.update({
      where: {
        id: orderId,
      },
      data: {
        stripeSessionId: sessionId,
      },
      include: {
        items: true,
      },
    });
  }

  public async getOrderWithItems(orderId: number): Promise<OrderWithItems | null> {
    return this.prismaService.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });
  }

  public async getOneOrderByUserId(
    userId: number,
    orderId: number,
  ): Promise<OrderWithItems | null> {
    return this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
      },
    });
  }

  public async setStatusOrderToCancel(orderId: number) {
    return this.prismaService.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.CANCELED,
      },
    });
  }

  public async markOrderFailed(orderId: number) {
    return this.prismaService.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.FAILED,
      },
    });
  }
}
