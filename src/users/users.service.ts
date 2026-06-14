import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  public async createUser(email: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: email,
        passwordHash: hashedPassword,
      },
    });
  }

  // public async updateUser(userId: number, data: IUpdateUser): Promise<User> {
  //   const { hashedRefreshToken } = data;
  //
  //   return this.prisma.user.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       refreshTokenHash: hashedRefreshToken,
  //     },
  //   });
  // }

  public async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async findUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
