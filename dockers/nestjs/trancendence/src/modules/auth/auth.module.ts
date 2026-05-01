import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { PrismaModule } from "../bidding/prisma.module";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";
import { UserService } from "./user.service";
import { LoginUseCase } from "./auth.login";
import { TokenService } from "./token.service";
import { JwtModule } from "@nestjs/jwt";
import { RefreshUseCase } from "./auth.refresh";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { WsJwtGuard } from "./guards/ws-jwt.guard";


@Module({
    imports: [PrismaModule,
    JwtModule.register({
        secret: process.env.JWT_SECRET || 'MySecret',
        signOptions: { expiresIn: '15m' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        PasswordService, 
        UserService, 
        LoginUseCase, 
        TokenService, 
        RefreshUseCase,
        JwtStrategy,
        WsJwtGuard,
    ],
    exports: [JwtModule, WsJwtGuard],
})
export class AuthnModule {}