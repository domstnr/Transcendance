import { Logger, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { WsJwtGuard } from "../auth/guards/ws-jwt.guard";
import { EventBus } from "src/core/bus/event.service";
import { ChatMessageSentEvent } from "src/core/bus/chat-message.event";

export interface AuthenticatedSocket extends Socket {
    user: {
        userId: string;
        username: string;
    };
}

@WebSocketGateway({ cors: { origin: '*'}})
export class ChatGateway {
    @WebSocketServer() server!: Server;
    private readonly logger = new Logger(ChatGateway.name);

    constructor(
        private readonly chatService: ChatService,
        private readonly eventBus:    EventBus,
    ) {}

    // 🚀 AJOUTE CETTE MÉTHODE ICI :
  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`🔌 Tentative de connexion détectée ! ID: ${client.id}`);
    
    // On regarde si des cookies sont présents dans la poignée de main (handshake)
    const cookies = client.handshake.headers.cookie;
    this.logger.log(`🔍 Cookies reçus : ${cookies ? 'OUI' : 'NON (C\'est sûrement ça le problème !)'}`);
  }

    //@UseGuards(WsJwtGuard)
    @SubscribeMessage('join_auction')
    async handleJoinAuction(@ConnectedSocket() client: AuthenticatedSocket, 
    @MessageBody() data: { auctionId: string }) {
        const userId = client.user.userId;
        await this.chatService.verifyCanJoinAuction(userId, data.auctionId);
        const roomName = `auction:${data.auctionId}`;
        client.join(roomName);
        this.logger.log(`Client ${userId} joined the room ${roomName}`);
        return { event: 'joined', room: roomName };
    }
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('send_message')
    async handleSendMessage(@ConnectedSocket() client: AuthenticatedSocket, 
    @MessageBody() data: { auctionId: string; content: string }) {
        const userId = client.user.userId;
        const roomName = `auction:${data.auctionId}`;
        this.logger.log(`📥 MESSAGE REÇU ! Contenu: ${data.content}`);
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
        return { event: 'message_sent', message: savedMessage };
    }
}