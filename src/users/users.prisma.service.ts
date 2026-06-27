import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';

@Injectable()
export class UsersPrismaService {
  constructor(private readonly prismaService: PrismaService) {}

  public async createUser(email: string, hashedPassword: string, isAdmin = false): Promise<User> {
    return this.prismaService.user.create({
      data: {
        email: email,
        passwordHash: hashedPassword,
        role: isAdmin ? Role.ADMIN : Role.USER,
      },
    });
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  public async findUserById(userId: number): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
