import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductDto } from './dto/product.dto';
import { ProductsPrismaService } from './products.prisma.service';
import { Product } from '../generated/prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly productsPrismaService: ProductsPrismaService) {}

  public async createProduct(productDto: ProductDto): Promise<Product> {
    return this.productsPrismaService.createProduct(productDto);
  }

  public async getProducts(): Promise<Product[]> {
    return this.productsPrismaService.getProducts();
  }

  public async findProductById(id: number): Promise<Product> {
    const foundProduct = await this.productsPrismaService.findProductById(id);

    if (!foundProduct) {
      throw new NotFoundException();
    }

    return foundProduct;
  }

  public async updateProduct(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productsPrismaService.updateProduct(id, updateProductDto);
  }

  public async removeProduct(id: number): Promise<Product> {
    return this.productsPrismaService.removeProduct(id);
  }
}
