import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthHelper } from './auth.helper';
import { ITokensResponse } from './types';
import { REDIS_CLIENT } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authHelper: AuthHelper,
    @Inject(REDIS_CLIENT)
    private readonly redisService: RedisService,
  ) {}

  public async registerUser(dto: RegisterDto): Promise<ITokensResponse> {
    const { email, password } = dto;

    const ifExistsUser = await this.usersService.findUserByEmail(email);

    if (ifExistsUser) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = bcrypt.hashSync(password, 7);

    const user = await this.usersService.createUser(email, hashPassword);
    const accessToken = await this.authHelper.generateAccessToken(user);
    const refreshToken = await this.authHelper.generateRefreshToken(user.id, user.email);
    const hashedRefreshToken = await this.authHelper.hashRefreshToken(refreshToken);

    await this.redisService.saveRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  public async loginUser(dto: RegisterDto): Promise<ITokensResponse> {
    const { email } = dto;

    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('User with this email not exist');
    }

    const validPassword = bcrypt.compareSync(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new BadRequestException('Invalid password');
    }

    const accessToken = await this.authHelper.generateAccessToken(user);
    const refreshToken = await this.authHelper.generateRefreshToken(user.id, user.email);
    const hashedRefreshToken = await this.authHelper.hashRefreshToken(refreshToken);

    await this.usersService.updateUser(user.id, { hashedRefreshToken });
    await this.redisService.saveRefreshToken(user.id, hashedRefreshToken);

    const response: ITokensResponse = {
      accessToken,
      refreshToken,
    };

    return response;
  }

  public async refresh(refreshToken: string): Promise<ITokensResponse> {
    const payload = await this.authHelper.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findUserById(payload.sub);

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

    const accessToken = await this.authHelper.generateAccessToken(user);
    const newRefreshToken = await this.authHelper.generateRefreshToken(user.id, user.email);
    const hashedRefreshToken = await this.authHelper.hashRefreshToken(refreshToken);

    await this.usersService.updateUser(user.id, { hashedRefreshToken });
    await this.redisService.saveRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
