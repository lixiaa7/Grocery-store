import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenPayload, ITokensResponse } from './types';

@Injectable()
export class AuthHelper {
  private readonly saltRounds: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = Number(this.configService.getOrThrow<string>('SALT_ROUNDS'));
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
  private async generateAccessToken(payload: ITokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(payload: ITokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: Number(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN_SECONDS')),
    });
  }

  public hashRefreshToken(token: string): Promise<string> {
    return bcrypt.hash(createHash('sha256').update(token).digest('hex'), this.saltRounds);
  }
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
  public async isValidPassword(dtoPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(dtoPassword, passwordHash);
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

  public isAdmin(userPassword: string | undefined): boolean {
    if (!userPassword) return false;
    const adminPassword = this.configService.getOrThrow<string>('ADMIN_PASSWORD');

    const isAdmin = adminPassword === userPassword;
    return isAdmin;
  }

  public async generateTokens(subject: ITokenPayload): Promise<ITokensResponse> {
    const payload: ITokenPayload = {
      id: subject.id,
      email: subject.email,
      role: subject.role,
    };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }
}
