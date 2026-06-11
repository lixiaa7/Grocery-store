import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { IAuthResponse } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  registration(@Body() dto: RegisterDto): Promise<void> {
    return this.authService.registerUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<IAuthResponse> {
    return this.authService.loginUser(dto);
  }
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<IAuthResponse> {
    return this.authService.refresh(dto.refreshToken);
  }

  //
  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
