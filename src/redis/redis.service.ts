import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constants';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private refreshTokenKey = (userId: number) => `refresh-token:${userId}`;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async saveRefreshToken(userId: number, hashedRefreshToken: string): Promise<void> {
    await this.redis.set(this.refreshTokenKey(userId), hashedRefreshToken, 'EX', 60 * 60 * 24 * 7);
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    return this.redis.get(this.refreshTokenKey(userId));
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    await this.redis.del(this.refreshTokenKey(userId));
  }
}
