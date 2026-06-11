import { User } from '../generated/prisma/client';

export interface ITokenPayload {
  sub: number;
  email: string;
}

export interface IAuthResponse {
  user: User;
  refreshToken: string;
  accessToken: string;
}
