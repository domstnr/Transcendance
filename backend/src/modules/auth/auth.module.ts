import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { WsJwtGuard } from "./guards/ws-jwt.guard";
import { UserModule } from "../user/user.module";
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [HttpModule, ConfigModule, UserModule,
    JwtModule.register({
        secret: process.env.JWT_SECRET || 'MySecret',
        signOptions: { expiresIn: '15m' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        WsJwtGuard,
    ],
    exports: [JwtModule, WsJwtGuard],
})
export class AuthnModule {}
