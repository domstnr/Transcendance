import { Logger, UseGuards } from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatMessageSentEvent } from "../../core/bus/chat-message.event";
import { EventBus } from "../../core/bus/event.service";
import { WsJwtGuard } from "../auth/guards/ws-jwt.guard";
import { AuthenticatedSocket } from "../auth/interfaces/auth-socket.interface";
import { ChatService } from "./chat.service";

@WebSocketGateway({
    namespace: 'chat',
    cors: {
        origin: process.env.FRONTEND_ORIGIN,
        credentials: true,
    },
})
export class ChatGateway {
    @WebSocketServer() server!: Server;

    private readonly logger = new Logger(ChatGateway.name);
    private readonly activeConnections = new Map<string, string>();

    constructor(
        private readonly chatService: ChatService,
        private readonly eventBus: EventBus,
    ) {}

    handleConnection(client: AuthenticatedSocket) {
        this.logger.log(`Chat connection attempt: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const userId = this.activeConnections.get(client.id);
        if (userId) {
            this.logger.log(`Disconnect of user [${userId}] (socket: ${client.id})`);
            this.activeConnections.delete(client.id);
            return;
        }

        this.logger.log(`Disconnect of unidentified user (socket: ${client.id})`);
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('join_auction')
    async handleJoinAuction(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { auctionId: string },
    ) {
        try {
            const userId = client.user.userId;
            this.activeConnections.set(client.id, userId);
            await this.chatService.verifyCanJoinAuction(userId, data.auctionId);

            const roomName = `auction:${data.auctionId}`;
            client.join(roomName);
            this.logger.log(`Client ${userId} joined the room ${roomName}`);
            return { event: 'joined', data: { room: roomName } };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Connection failed';
            this.logger.error('Connection failed', message);
            return { event: 'exception', data: { message } };
        }
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { auctionId: string; content: string },
    ) {
        const userId = client.user.userId;
        const roomName = `auction:${data.auctionId}`;
        const savedMessage = await this.chatService.saveMessage(userId, data.auctionId, data.content);

        client.to(roomName).emit('new_message', savedMessage);
        await this.eventBus.publish(
            new ChatMessageSentEvent({
                messageId: savedMessage.id,
                auctionId: savedMessage.auctionId,
                senderId: savedMessage.senderId,
                content: savedMessage.content,
            }),
        );

        return { event: 'message_sent', data: { message: savedMessage } };
    }
}
