import { forwardRef, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripePrismaService } from './stripe.prisma.service';
import { StripeController } from './stripe.controller';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ConfigModule, ProductsModule, forwardRef(() => OrdersModule)],
  controllers: [StripeController],
  providers: [StripeService, StripePrismaService],
  exports: [StripeService],
})
export class StripeModule {}
