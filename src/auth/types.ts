import { Role } from '../generated/prisma/enums';

export interface ITokenPayload {
  id: number;
  email: string;
  role: Role;
}
export interface ITokensResponse {
  accessToken: string;
  refreshToken: string;
}

export type LogoutResponse = {
  message: string;
};