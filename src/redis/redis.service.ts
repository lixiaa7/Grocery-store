import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constants';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import {LogoutResponse} from "../auth/types";

@Injectable()
export class RedisService {
  private refreshTokenKey = (userId: number) => `refresh-token:${userId}`;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  public async saveRefreshToken(userId: number, hashedRefreshToken: string): Promise<void> {
    await this.redis.set(
      this.refreshTokenKey(userId),
      hashedRefreshToken,
      'EX',
      Number(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN_SECONDS')),
    );
  }

  public async getRefreshToken(userId: number): Promise<string | null> {
    return this.redis.get(this.refreshTokenKey(userId));
  }

  public async logout(userId: number): Promise<LogoutResponse> {
    await this.redis.del(`refresh-token:${userId}`);

    return {
      message: 'Logged out successfully',
    };
  }
}
