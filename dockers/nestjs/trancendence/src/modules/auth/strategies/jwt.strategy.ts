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
                // 👈 LE MOUCHARD EST ICI
          console.log('--- TEST COOKIES ---');
          console.log('Cookies reçus :', request?.cookies);
                    if (request && request.cookies) {
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
        console.log('--- VALIDATE CALLED ---', payload);
        return { userId: payload.sub, username: payload.username};
    }
}