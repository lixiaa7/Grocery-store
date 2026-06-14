import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenPayload } from './types';
import { REDIS_CLIENT } from '../redis/redis.constants';
import Redis from 'ioredis';
import { Role } from '../generated/prisma/enums';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  public async generateAccessToken(user: { id: number; email: string; role: Role }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }

  public async verifyRefreshToken(refreshToken: string): Promise<ITokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<ITokenPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  public async generateRefreshToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email: email,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: Number(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN_SECONDS')),
    });
  }

  public hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(createHash('sha256').update(token).digest('hex'), 10);
  }

  public async isTokenMatchingStored(
    refreshToken: string,
    hashedTokenFromDB: string,
  ): Promise<boolean> {
    return bcrypt.compare(
      createHash('sha256').update(refreshToken).digest('hex'),
      hashedTokenFromDB,
    );
  }

  public isAdmin(dto: RegisterDto) {
    const adminEmails = this.configService
      .getOrThrow<string>('ADMIN_EMAILS')
      .split(',')
      .map((email) => email.trim().toLowerCase());

    const role = adminEmails.includes(dto.email.toLowerCase()) ? Role.ADMIN : Role.USER;
  }
  // async saveRefreshToken(userId: number, hashedRefreshToken: string): Promise<void> {
  //   await this.redis.set(`refresh-token:${userId}`, hashedRefreshToken, 'EX', 60 * 60 * 24 * 7);
  // }
  //
  // async getRefreshToken(userId: number): Promise<string | null> {
  //   return this.redis.get(`refresh-token:${userId}`);
  // }
  //
  // async deleteRefreshToken(userId: number): Promise<void> {
  //   await this.redis.del(`refresh-token:${userId}`);
  // }
}
