export interface JwtPayload {
    sub: string;
    username: string;
    tokenType: 'access' | 'refresh' | '2fa';
    iat?: number;
    exp?: number;
}
