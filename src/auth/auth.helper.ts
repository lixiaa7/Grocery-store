import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ITokenPayload } from './types';

@Injectable()
export class AuthHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async generateAccessToken(user: { id: number; email: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
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
      expiresIn: Number(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN')),
    });
  }

  public hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(createHash('sha256').update(token).digest('hex'), 10);
  }

  public async isRefreshTokenValid(
    hashedRefreshToken: string,
    hashedTokenFromDB: string,
  ): Promise<boolean> {
    return bcrypt.compare(
      createHash('sha256').update(hashedRefreshToken).digest('hex'),
      hashedTokenFromDB,
    );
  }
}
