import { Controller, Delete, Get, Logger, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/strategies/jwt-auth.guard";
import { UserService } from "./user.service";

interface RequestWithUser extends Request {
    user: {
        userId: string;
        username: string;
    };
}

@Controller('user')
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getCurrentUser(@Req() req: RequestWithUser) {
        return {
            message: 'Welcome, success',
            user: req.user,
        };
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    async deleteCurrentUser(@Req() req: RequestWithUser) {
        const deletedUser = await this.userService.deleteUser(req.user.userId);

        this.logger.log(`Account deleted: ${deletedUser.username}`);

        return {
            status: 'success',
            message: 'Your account has been deleted',
        };
    }
}
