import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  createProducts(@Body() ProductDto: ProductDto) {
    return this.productsService.create(ProductDto);
  }

  @Get()
  getAllProducts() {
    return this.productsService.get();
  }

  @Get(':id')
  findProductById(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  updateProductById(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  removeProductById(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
