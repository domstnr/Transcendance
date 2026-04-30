import { Body, Req, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginUseCase } from "./auth.login";
import { RefreshDto } from "./dto/refresh.dto";
import { RefreshUseCase } from "./auth.refresh";
import { JwtAuthGuard } from "./strategies/jwt-auth.guard";
import { Request } from "express";

interface RequestWithUser extends Request {
    user: {
        userId: string;
        username: string;
    };
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
    async refresh(@Body() refreshDto: RefreshDto) {
        return this.refreshUseCase.execute(refreshDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        console.log(`Trying to connect... ${loginDto.email}`);

        return this.loginUseCase.execute(loginDto);
    }

    /* -------------------------------------------------------------------------- */
    /*                                 GET routes                                 */
    /* -------------------------------------------------------------------------- */
    @Get('profile')
    @UseGuards(JwtAuthGuard) //token guard for safety, if no token no access
    getProfile(@Req() req: RequestWithUser) {
        //if reach here token isValid
        return {
            message: 'Welcome, success',
            user: req.user
        };
    }
    
    @Delete('delete/:id')
    async deleteAccount(@Param('id') id: string) {
        console.log(`Deleting request for ID: ${id}`);
        return this.authService.deleteAccount(id);
    }
}