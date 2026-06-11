import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(dto: RegisterDto) {
    const isExistUser = await this.findUserByEmail(dto);
    if (isExistUser) {
      throw new ConflictException('User already exists');
    }
    const hashPassword = bcrypt.hashSync(dto.password, 7);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });
  }

  async loginUser(dto: RegisterDto) {
    const user = await this.findUserByEmail(dto);
    if (!user) {
      throw new BadRequestException('User with this email not exist');
    }
    const validPassword = bcrypt.compareSync(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new BadRequestException('Invalid password');
    }
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  private async findUserByEmail(dto: RegisterDto) {
    const { email } = dto;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  private async generateAccessToken(user: { id: number; email: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(user: { id: number; email: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: Number(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN')),
    });
  }

  // bcrypt обрезает вход до 72 байт, а JWT длиннее и имеет общий префикс,
  // поэтому токен сначала сворачиваем в SHA-256 (фиксированные 64 байта).
  private sha256(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(this.sha256(refreshToken), 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash,
      },
    });
  }

  async refresh(refreshToken: string) {
    let payload: { sub: number; email: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
      }>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      this.sha256(refreshToken),
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied');
    }

    const accessToken = await this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user);

    await this.saveRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
