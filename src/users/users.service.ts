import { Injectable } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { UsersPrismaService } from './users.prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly usersPrismaService: UsersPrismaService) {}

  public async createUser(email: string, hashedPassword: string, isAdmin = false): Promise<User> {
    return this.usersPrismaService.createUser(email, hashedPassword, isAdmin);
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    return this.usersPrismaService.findUserByEmail(email);
  }

  public async findUserById(userId: number): Promise<User | null> {
    return this.usersPrismaService.findUserById(userId);
  }
}
