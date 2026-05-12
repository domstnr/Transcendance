import { 
    Controller,
    Get, Delete, Patch,
    Logger,
    Req, Body,
    UseGuards }
from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/strategies/jwt-auth.guard";
import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/update-user.dto";

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
    async getCurrentUser(@Req() req: RequestWithUser) {
        const user = await this.userService.findById(req.user.userId);
        if (!user) {
            return { message: 'User not found', user: null };
        }
        return {
            message: 'Welcome, success',
            user: {
                userId: user.id,
                username: user.username,
            },
        };
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    async updateCurrentUser(
        @Req() req: RequestWithUser,
        @Body() updateUserDto: UpdateUserDto,
    ) {
      const user = await this.userService.updateUser(req.user.userId, updateUserDto);

      return {
          message: 'Profile updated successfully',
          user: {
              userId: user.id,
              username: user.username,
              email: user.email,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
          },
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
