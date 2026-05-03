import { Logger, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { WsJwtGuard } from "../auth/guards/ws-jwt.guard";
import { EventBus } from "../../core/bus/event.service";
import { ChatMessageSentEvent } from "../../core/bus/chat-message.event";

export interface AuthenticatedSocket extends Socket {
    user: {
        userId: string;
        username: string;
    };
}

@WebSocketGateway({ namespace: 'chat', cors: { 
    origin: process.env.FRONTEND_URL,
    credentials: true
    }
})
export class ChatGateway {
    @WebSocketServer() server!: Server;
    private readonly logger = new Logger(ChatGateway.name);
    //something to keep count of connections, map -> key socket.id - value userId
    private activeConnections = new Map<string, string>();
    constructor(
        private readonly chatService: ChatService,
        private readonly eventBus:    EventBus,
    ) {}

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`🔌 Tentative de connexion détectée ! ID: ${client.id}`);
    // On regarde si des cookies sont présents dans la poignée de main (handshake)
    const cookies = client.handshake.headers.cookie;
    this.logger.log(`🔍 Cookies reçus : ${cookies ? 'OUI' : 'NON (C\'est sûrement ça le problème !)'}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.activeConnections.get(client.id);
    if (userId) {
        this.logger.log(`Disconnect of user [${userId}] (socket: ${client.id})`);
        this.activeConnections.delete(client.id);
    } else {
        this.logger.log(`Disconnect of unidentified user (socket: ${client.id})`);
    }
  }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('join_auction')
    async handleJoinAuction(@ConnectedSocket() client: AuthenticatedSocket, 
    @MessageBody() data: { auctionId: string }) {
        try {
            const userId = client.user.userId;
            this.activeConnections.set(client.id, userId);
            await this.chatService.verifyCanJoinAuction(userId, data.auctionId);
            const roomName = `auction:${data.auctionId}`;
            client.join(roomName);
            this.logger.log(`Client ${userId} joined the room ${roomName}`);
            return { event: 'joined', data: {room: roomName} };
        } catch (e) {
            const error = e as Error;
            this.logger.error(`Connection failed`, error.message);
            return { event: 'exception', data: { message: error.message }};
        }
    }
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('send_message')
    async handleSendMessage(@ConnectedSocket() client: AuthenticatedSocket, 
    @MessageBody() data: { auctionId: string; content: string }) {
        const userId = client.user.userId;
        const roomName = `auction:${data.auctionId}`;
        this.logger.log(`Message received ! content: ${data.content}`);
        //ask chat service to interact w db
        const savedMessage = await this.chatService.saveMessage(userId, data.auctionId, data.content);
        //gateway only serves to diffuse mesage
        client.to(roomName).emit('new_message', savedMessage);
        await this.eventBus.publish(
            new ChatMessageSentEvent({
                messageId: savedMessage.id,
                auctionId: savedMessage.auctionId,
                senderId:   savedMessage.senderId,
                content:    savedMessage.content,
            })
        );
        return { event: 'message_sent', data: {message: savedMessage} };
    }
}