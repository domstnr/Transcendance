import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "../auth/strategies/jwt-auth.guard";

interface RequestWithUser extends Request {
    user: {
        userId?: string;
        sub?:   string;
    };
}

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    //We rather get old messages through http request than websockets, so server is not overload
    @UseGuards(JwtAuthGuard)
    @Get(':auctionId/messages')
    async getAuctionMessages(
        @Param('auctionId') auctionId: string,
        @Req() req: RequestWithUser,
        @Query('cursor') cursor?: string,
    ) {
        const userId = req.user.userId || req.user.sub;

        //if token is wrongly formed
        if (!userId) {
            throw new Error("User identification failed");
        }
        //En appelant verifyCanJoinAuction, on s'assure que les règles strictes (vendeur/gagnant uniquement si l'enchère est fermée) s'appliquent aussi bien pour le temps réel (WebSocket) que pour la lecture de l'historique (HTTP REST)
        await this.chatService.verifyCanJoinAuction(userId, auctionId);
        return this.chatService.getMessages(auctionId, cursor)
    }
}