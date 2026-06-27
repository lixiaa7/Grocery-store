import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartPrismaService } from './cart.prisma.service';
import { CartController } from './cart.controller';

@Module({
  controllers: [CartController],
  providers: [CartService, CartPrismaService],
  exports: [CartService],
})
export class CartModule {}
