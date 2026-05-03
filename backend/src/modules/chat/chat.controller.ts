import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/strategies/jwt-auth.guard";
import { ChatService } from "./chat.service";

interface RequestWithUser extends Request {
    user: {
        userId?: string;
        sub?: string;
    };
}

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @UseGuards(JwtAuthGuard)
    @Get(':auctionId/messages')
    async getAuctionMessages(
        @Param('auctionId') auctionId: string,
        @Req() req: RequestWithUser,
        @Query('cursor') cursor?: string,
    ) {
        const userId = req.user.userId || req.user.sub;
        if (!userId) {
            throw new Error('User identification failed');
        }

        await this.chatService.verifyCanJoinAuction(userId, auctionId);
        return this.chatService.getMessages(auctionId, cursor);
    }
}
