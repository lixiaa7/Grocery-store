import { Body, Injectable, UseGuards } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../generated/prisma/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Injectable()
export class ProductsService {

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() UpdateProductDto: UpdateProductDto) {
    return 'This action adds a new product';
  }

  get() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  // @Roles(Role.ADMIN)
  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  // @Roles(Role.ADMIN)
  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
