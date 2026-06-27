import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersPrismaService } from './users.prisma.service';

@Module({
  providers: [UsersService, UsersPrismaService],
  exports: [UsersService],
})
export class UsersModule {}
