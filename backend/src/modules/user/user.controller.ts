import {
    Controller,
    Get, Delete, Patch,
    Logger,
    UnauthorizedException,
    BadRequestException,
    Query,
    Req, Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Param,
    NotFoundException,
} from "@nestjs/common";
import type { Request } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
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
            throw new UnauthorizedException('Session invalid: user not found.');
        }
        return {
            message: 'Welcome, success',
            user: {
                userId: user.id,
                username: user.username,
                avatarUrl: user.avatarUrl ?? null,
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

    @Patch('me/avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/avatars',
                filename: (_req, file, cb) => {
                    cb(null, `${randomUUID()}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (_req, file, cb) => {
                if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
                    cb(new BadRequestException('Only image files are allowed (jpeg, png, gif, webp)'), false);
                    return;
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async uploadAvatar(
        @Req() req: RequestWithUser,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        await this.userService.updateAvatar(req.user.userId, avatarUrl);
        return { message: 'Avatar updated successfully', avatarUrl };
    }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    async searchUsers(@Req() req: RequestWithUser, @Query('q') q: string) {
        if (!q || q.trim().length < 2) return [];
        return this.userService.searchUsers(q.trim(), req.user.userId);
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

    @Get(':userId')
    @UseGuards(JwtAuthGuard)
    async getPublicProfile(@Param('userId') userId: string) {
        const user = await this.userService.findPublicProfile(userId);
        return {
            userId: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl ?? null,
            isOnline: user.isOnline,
        };
    }
}
