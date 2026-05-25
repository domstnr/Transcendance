export interface JwtPayload {
    sub: string;
    username: string;
    tokenType: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}
