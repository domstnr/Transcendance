import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { FriendParamDto } from './dto/friend.dto';

interface RequestWithUser extends Request {
    user: { userId: string; username: string };
}

@ApiExcludeController()
@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    @Get()
    getFriends(@Req() req: RequestWithUser) {
        return this.friendsService.getFriends(req.user.userId);
    }

    @Get('requests/received')
    getPendingRequests(@Req() req: RequestWithUser) {
        return this.friendsService.getPendingRequests(req.user.userId);
    }

    @Get('requests/sent')
    getSentRequests(@Req() req: RequestWithUser) {
        return this.friendsService.getSentRequests(req.user.userId);
    }

    @Post('request/:userId')
    @HttpCode(HttpStatus.CREATED)
    sendRequest(@Req() req: RequestWithUser, @Param() { userId }: FriendParamDto) {
        return this.friendsService.sendRequest(req.user.userId, userId);
    }

    @Patch('accept/:userId')
    acceptRequest(@Req() req: RequestWithUser, @Param() { userId }: FriendParamDto) {
        return this.friendsService.acceptRequest(req.user.userId, userId);
    }

    @Patch('decline/:userId')
    declineRequest(@Req() req: RequestWithUser, @Param() { userId }: FriendParamDto) {
        return this.friendsService.declineRequest(req.user.userId, userId);
    }

    @Delete(':userId')
    @HttpCode(HttpStatus.OK)
    removeFriend(@Req() req: RequestWithUser, @Param() { userId }: FriendParamDto) {
        return this.friendsService.removeFriend(req.user.userId, userId);
    }
}
