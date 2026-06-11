import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthHelper } from './auth.helper';
import { IAuthResponse } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authHelper: AuthHelper,
  ) {}

  //TODO: (thoughts): you should always define firstly: WHAT all functions should return from TypeScript perspective
  public async registerUser(dto: RegisterDto): Promise<void> {
    const { email, password } = dto;

    const isExistUser = await this.usersService.findUserByEmail(email);

    if (isExistUser) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = bcrypt.hashSync(password, 7);

    //TODO: best practice says to us that we should on /register endpoint return access_token and refresh_token as well to avoid bad user experience
    //TODO: in this scenario use will must to register and then rewrite his password and email for /login endpoint to get tokens back
    const user = this.usersService.createUser(email, hashPassword);

    return;
  }

  public async loginUser(dto: RegisterDto): Promise<IAuthResponse> {
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

    const response: IAuthResponse = {
      user,
      accessToken,
      refreshToken,
    };

    return response;
  }

  public async refresh(refreshToken: string): Promise<IAuthResponse> {
    const payload = await this.authHelper.verifyRefreshToken(refreshToken);

    const user = await this.usersService.findUserById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    //TODO: better to rename. isTokenMatchingStored or something
    const isRefreshTokenValid = await this.authHelper.isRefreshTokenValid(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Access denied');
    }

    const accessToken = await this.authHelper.generateAccessToken(user);
    const newRefreshToken = await this.authHelper.generateRefreshToken(user.id, user.email);
    const hashedRefreshToken = await this.authHelper.hashRefreshToken(refreshToken);

    await this.usersService.updateUser(user.id, { hashedRefreshToken });

    return { user, accessToken, refreshToken: newRefreshToken };
  }
}
