import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { User } from '../../generated/prisma/client';

//TODO: I'm not sure if it will work, but can we create the same strategy for refresh token?
//TODO: It's should be easier for refresh token validation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }): Promise<User> {
    const user = await this.usersService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
