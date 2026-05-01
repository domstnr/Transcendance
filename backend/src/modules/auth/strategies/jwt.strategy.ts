import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Request } from "express";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request): string | null => {
                    if (request?.cookies) {
                        const cookies = request.cookies as Record<string, string>;
                        return cookies['jwt'] || null;
                    }
                    return null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'MySecret',
        });
    }
    validate(payload: JwtPayload) {
        return { userId: payload.sub, username: payload.username};
    }
}
