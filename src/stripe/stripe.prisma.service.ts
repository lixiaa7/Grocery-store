import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../generated/prisma/enums';
import { ProductsPrismaService } from '../products/products.prisma.service';
import { InsufficientStockError } from '../common/errors/insufficient-stock.error';
import { OrderWithItems } from '../orders/types';

@Injectable()
export class StripePrismaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsPrismaService: ProductsPrismaService,
  ) {}

  public async markOrderPaid(order: OrderWithItems, paymentIntentId: string | null): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      // Atomically claim the order: only one webhook delivery can flip
      // PENDING_PAYMENT -> PAID. Concurrent/duplicate deliveries get count 0
      // and skip the rest, which makes processing idempotent and prevents the
      // stock from being decremented twice.
      //TODO: read more about transactions
      const claimed = await tx.order.updateMany({
        where: {
          id: order.id,
          status: OrderStatus.PENDING_PAYMENT,
        },
        data: {
          status: OrderStatus.PAID,
          stripePaymentId: paymentIntentId,
        },
      });

      if (claimed.count === 0) {
        return;
      }

      for (const item of order.items) {
        const { count } = await this.productsPrismaService.decreaseQuantity(
          item.productId,
          item.quantity,
          tx,
        );

        if (count === 0) {
          // Roll back the whole transaction (including the claim above) so the
          // order stays PENDING_PAYMENT and the service can flag it as FAILED.
          throw new InsufficientStockError(item.productId);
        }
      }

      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: order.userId,
          },
        },
      });
    });
  }
}
