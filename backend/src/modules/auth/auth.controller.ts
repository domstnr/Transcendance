import { Body, Req, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginUseCase } from "./auth.login";
import { RefreshDto } from "./dto/refresh.dto";
import { RefreshUseCase } from "./auth.refresh";
import { Request, Response } from "express";

const ACCESS_COOKIE_NAME = 'jwt';
const REFRESH_COOKIE_NAME = 'refreshJwt';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function getCookieValue(request: Request, name: string): string | null {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
        return null;
    }

    for (const part of cookieHeader.split(';')) {
        const [rawName, ...rawValue] = part.trim().split('=');
        if (rawName === name) {
            return decodeURIComponent(rawValue.join('='));
        }
    }

    return null;
}

function setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
    const secure = process.env.NODE_ENV === 'production';

    response.cookie(ACCESS_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        maxAge: ACCESS_COOKIE_MAX_AGE,
    });
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        maxAge: REFRESH_COOKIE_MAX_AGE,
    });
}

function clearAuthCookies(response: Response) {
    const secure = process.env.NODE_ENV === 'production';

    response.clearCookie(ACCESS_COOKIE_NAME, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
    });
    response.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
    });
}

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshUseCase: RefreshUseCase,
    ) {}

    /* -------------------------------------------------------------------------- */
    /*                                 POST routes                                 */
    /* -------------------------------------------------------------------------- */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() RegisterDto: RegisterDto)    {
        console.log('A user is trying to signup: ', RegisterDto.username);

        return this.authService.register(RegisterDto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Body() refreshDto: Partial<RefreshDto>,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = refreshDto?.refreshToken ?? getCookieValue(req, REFRESH_COOKIE_NAME) ?? undefined;
        const response = await this.refreshUseCase.execute(refreshToken);
        setAuthCookies(res, response.tokens.accessToken, response.tokens.refreshToken);
        return response;
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log(`Trying to connect... ${loginDto.email}`);

        const response = await this.loginUseCase.execute(loginDto);
        setAuthCookies(res, response.tokens.accessToken, response.tokens.refreshToken);
        return response;
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) res: Response) {
        clearAuthCookies(res);
        return { message: 'Logout successful' };
    }

}
