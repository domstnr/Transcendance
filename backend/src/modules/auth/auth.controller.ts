import {
    Body,
    Req,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Res,
    Patch,
    UseGuards,
    NotFoundException
} from "@nestjs/common";
import { Request, Response } from "express";
import { JwtAuthGuard } from "./strategies/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { GitHubCodeDto } from "./dto/github-code.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    /* -------------------------------------------------------------------------- */
    /*                                 POST routes                                 */
    /* -------------------------------------------------------------------------- */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    register(@Body() RegisterDto: RegisterDto)  {
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
        const response = await this.authService.refresh(refreshToken);
        setAuthCookies(res, response.tokens.accessToken, response.tokens.refreshToken);
        return response;
    }

    @Post('2fa/setup')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async setupTwoFactor(@Req() req: RequestWithUser) {
        return this.authService.setupTwoFactor(req.user.userId);
    }

    @Post('2fa/enable')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async enableTwoFactor(
        @Req() req: RequestWithUser,
        @Body() body: { code: string },
    ) {
        return this.authService.enableTwoFactor(req.user.userId, body.code);
    }

    @Post('2fa/disable')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async disableTwoFactor(@Req() req: RequestWithUser) {
        return this.authService.disableTwoFactor(req.user.userId);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log(`Trying to connect... ${loginDto.email}`);

        const response = await this.authService.login(loginDto);
        if (response.status === 'success') {
            setAuthCookies(res, response.tokens.accessToken, response.tokens.refreshToken);
        }
        return response;
    }

    @Post('2fa/verify-login')
    @HttpCode(HttpStatus.OK)
    async verifyTwoFactorLogin(
        @Body() body: { tempToken: string; code: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const response = await this.authService.verifyTwoFactorLogin(body.tempToken, body.code);
        setAuthCookies(res, response.tokens.accessToken, response.tokens.refreshToken);
        return response;
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@Res({ passthrough: true }) res: Response) {
        clearAuthCookies(res);
        return { message: 'Logout successful' };
    }

    @Post('github/login')
    @HttpCode(HttpStatus.OK)
    async handleGitHubCallback(
        @Body() codeDto: GitHubCodeDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log('A user is trying to login with github: ', codeDto.code);
        const gitData = await this.authService.handleGitHubCode(codeDto);
        if (gitData.username == undefined)
            throw new NotFoundException("Failed to fetch username!");
        if (gitData.email == undefined)
            throw new NotFoundException("Failed to fetch email!");
        const response = await this.authService.findOrCreateGitHubUser(gitData.email, gitData.username);
        setAuthCookies(res, response.tokens.accessToken, response.tokens.refreshToken);
        return response;
    }

    @Patch('password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @Req() req: RequestWithUser,
        @Body() changePasswordDto: ChangePasswordDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const response = await this.authService.changePassword(req.user.userId, changePasswordDto);
        clearAuthCookies(res);
        return response;
    }
}

const ACCESS_COOKIE_NAME = 'jwt';
const REFRESH_COOKIE_NAME = 'refreshJwt';
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

interface RequestWithUser extends Request {
    user: {
        userId: string;
        username: string;
    };
}

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
