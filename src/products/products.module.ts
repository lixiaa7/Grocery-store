import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsPrismaService } from './products.prisma.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsPrismaService],
  exports: [ProductsPrismaService],
})
export class ProductsModule {}
