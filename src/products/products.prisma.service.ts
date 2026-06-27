import { Injectable } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProductDto } from './dto/product.dto';
import { Prisma, Product } from '../generated/prisma/client';

type PrismaTransaction = Prisma.TransactionClient;

@Injectable()
export class ProductsPrismaService {
  constructor(private readonly prismaService: PrismaService) {}

  public createProduct(productDto: ProductDto): Promise<Product> {
    return this.prismaService.product.create({ data: productDto });
  }

  public getProducts(): Promise<Product[]> {
    return this.prismaService.product.findMany();
  }

  public findProductById(id: number): Promise<Product | null> {
    return this.prismaService.product.findUnique({
      where: {
        productId: id,
      },
    });
  }

  public updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.prismaService.product.update({
      where: {
        productId: id,
      },
      data: updateProductDto,
    });
  }

  public removeProduct(id: number): Promise<Product> {
    return this.prismaService.product.delete({
      where: {
        productId: id,
      },
    });
  }

  /**
   * Atomically decrements stock only if there is enough on hand (the `gte`
   * guard). Returns a batch payload whose `count` is 0 when stock was
   * insufficient. Always run inside a transaction so it stays consistent with
   * the related order/cart writes.
   */
  public decreaseQuantity(
    productId: number,
    quantity: number,
    tx: PrismaTransaction,
  ): Promise<Prisma.BatchPayload> {
    return tx.product.updateMany({
      where: {
        productId,
        quantity: {
          gte: quantity,
        },
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }
}
