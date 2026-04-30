import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

/**
 * Token is a security measure, refreshing permission every x Time
 * doing it twice garanties, at same time short spam interval access refreshing every x minutes
 * while waiting '7d' -> 7 days for another big refresh
 * payload() is what the case contains, a userId & username
 * accessToken() -> is short term token, signed w module key
 * refreshToken() -> is longterm token in 7 days
 */
@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateTokens(userId: string, username: string) {
        const payload = { sub: userId, username: username };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });

        return {
            accessToken,
            refreshToken,
        };
    }
}