import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "./token.service";
import { RefreshDto } from "./dto/refresh.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class RefreshUseCase {
    private readonly logger = new Logger(RefreshUseCase.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly tokenService: TokenService,
    ) {}

    async execute(refreshDto: RefreshDto) {
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshDto.refreshToken);
            const tokens = await this.tokenService.generateTokens(payload.sub, payload.username);
            this.logger.log(`Tokens found for user : ${payload.sub}`);
            return {
                status: 'success',
                message: 'Tokens refreshed with success',
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                }
            };
        } catch (err) {
            console.log(err);
            this.logger.warn(`Refresh Failed... Token invalid or expired`);
            throw new UnauthorizedException('Expired session, refresh');
        }
    }
}