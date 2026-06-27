import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrderStatus } from '../generated/prisma/enums';
import { OrdersPrismaService } from '../orders/orders.prisma.service';
import { StripePrismaService } from './stripe.prisma.service';
import { InsufficientStockError } from '../common/errors/insufficient-stock.error';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersPrismaService: OrdersPrismaService,
    private readonly stripePrismaService: StripePrismaService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'));
  }

  public async createCheckoutSessionForOrder(userId: number, orderId: number) {
    const order = await this.ordersPrismaService.getOrderWithItems(orderId);

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Only pending orders can be paid');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: this.configService.getOrThrow<string>('CLIENT_SUCCESS_URL'),
      cancel_url: this.configService.getOrThrow<string>('CLIENT_CANCEL_URL'),
      metadata: {
        orderId: String(order.id),
        userId: String(userId),
      },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: order.currency,
          unit_amount: item.price,
          product_data: {
            name: item.title,
          },
        },
      })),
    });

    await this.ordersPrismaService.updateOrderSessionId(order.id, session.id);

    return {
      orderId: order.id,
      paymentUrl: session.url,
    };
  }

  public async handleWebhook(rawBody: Buffer | undefined, signature: string) {
    if (!rawBody) {
      throw new BadRequestException('Raw body is missing');
    }

    const webhookSecret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      await this.handleCheckoutSessionCompleted(event.data.object);
    }

    return {
      received: true,
    };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      throw new BadRequestException('Order id is missing in Stripe metadata');
    }

    if (session.payment_status !== 'paid') {
      return;
    }

    const order = await this.ordersPrismaService.getOrderWithItems(Number(orderId));

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.PAID) {
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string' ? session.payment_intent : null;

    try {
      await this.stripePrismaService.markOrderPaid(order, paymentIntentId);
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        // Payment was captured but stock ran out before fulfilment. Flag the
        // order for manual review/refund and acknowledge the webhook so Stripe
        // stops retrying (a 4xx here would loop forever on an already-paid order).
        await this.ordersPrismaService.markOrderFailed(order.id);
        return;
      }
      throw error;
    }
  }
}
