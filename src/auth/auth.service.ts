import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { AuthHelper } from './auth.helper';
import { ITokenPayload, ITokensResponse, LogoutResponse } from './types';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authHelper: AuthHelper,
    private readonly redisService: RedisService,
  ) {}

  public async registerUser(dto: RegisterDto): Promise<ITokensResponse> {
    const { email, password, adminPassword } = dto;

    const ifExistsUser = await this.usersService.findUserByEmail(email);

    if (ifExistsUser) {
      throw new ConflictException('User already exists');
    }

    const isAdmin = this.authHelper.isAdmin(adminPassword);
    const hashPassword = await this.authHelper.hashPassword(password);
    const user = await this.usersService.createUser(email, hashPassword, isAdmin);

    const tokens = await this.issueTokens(user);
    return tokens;
  }

  public async loginUser(dto: LoginDto): Promise<ITokensResponse> {
    const { email } = dto;

    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('User with this email not exist');
    }

    const validPassword = await this.authHelper.isValidPassword(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new BadRequestException('Invalid password');
    }

    const tokens = await this.issueTokens(user);
    return tokens;
  }

  public async refresh(refreshToken: string): Promise<ITokensResponse> {
    const payload = await this.authHelper.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findUserById(payload.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingRefreshToken = await this.redisService.getRefreshToken(user.id);

    if (!existingRefreshToken) {
      throw new NotFoundException('Refresh token not found');
    }

    const isTokenMatchingStored = await this.authHelper.isTokenMatchingStored(
      refreshToken,
      existingRefreshToken,
    );

    if (!isTokenMatchingStored) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.issueTokens(user);
    return tokens;
  }

  private async issueTokens(user: ITokenPayload): Promise<ITokensResponse> {
    const tokens = await this.authHelper.generateTokens(user);
    const hashed = await this.authHelper.hashRefreshToken(tokens.refreshToken);
    await this.redisService.saveRefreshToken(user.id, hashed);
    return tokens;
  }

  public async logout(userId: number): Promise<LogoutResponse> {
    return await this.redisService.logout(userId);
  }
}
