import { Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CurrentUserId } from '../common/decorators/current-user-id.decorator';
import { StripeService } from '../stripe/stripe.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
  ) {}

  @Post()
  createOrder(@CurrentUserId() userId: number) {
    return this.ordersService.createOrderFromCart(userId);
  }

  @Post(':id/checkout')
  createCheckoutSession(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    //TODO: this is bad practice. Using another service from another module. You should create appropriate function inside ordersService
    //TODO: and create something like 'stripe.helper.ts' with some function that will just return created session.id and url. Other logic should be handled by ordersService
    return this.stripeService.createCheckoutSessionForOrder(userId, orderId);
  }

  @Get()
  getOrdersById(@CurrentUserId() userId: number) {
    return this.ordersService.getOrdersById(userId);
  }

  @Get(':orderId')
  getOneOrderById(
    @CurrentUserId() userId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOneOrderById(userId, orderId);
  }

  @Patch(':id/cancel')
  cancelOrder(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) orderId: number) {
    return this.ordersService.cancelOrder(userId, orderId);
  }
}
