import { Injectable } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { UsersPrismaService } from './users.prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly usersPrismaService: UsersPrismaService) {}

  //TODO: why you bypassing from 1 function to another without any logic here? It's redundant middleware. Just call usersPrismaService whenever you need to work with 'User' table in postgreSQL
  //TODO: Only controller by it's module can call UsersSetvice but we don't have any controller in this module.'
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
