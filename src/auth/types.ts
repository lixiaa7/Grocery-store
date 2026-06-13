export interface ITokenPayload {
  sub: number;
  email: string;
}
export interface ITokensResponse {
  accessToken: string;
  refreshToken: string;
}