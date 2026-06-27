import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ITokensResponse, LogoutResponse } from './types';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUserId } from '../common/decorators/current-user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('registration')
  registration(@Body() dto: RegisterDto): Promise<ITokensResponse> {
    return this.authService.registerUser(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<ITokensResponse> {
    return this.authService.loginUser(dto);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<ITokensResponse> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  async logout(@CurrentUserId() userId: number): Promise<LogoutResponse> {
    return this.authService.logout(userId);
  }
}
