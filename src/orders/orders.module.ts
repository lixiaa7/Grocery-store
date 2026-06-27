import { forwardRef, Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersPrismaService } from './orders.prisma.service';
import { OrdersHelper } from './orders.helper';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [forwardRef(() => StripeModule)],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersPrismaService, OrdersHelper],
  exports: [OrdersPrismaService],
})
export class OrdersModule {}
