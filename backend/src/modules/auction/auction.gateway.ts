import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer } from "@nestjs/websockets";
import { BaseComponent } from "../../core/bus/base.component";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { EventBus } from '../../core/bus/event.service';
import { EventType } from "../../core/bus/event.types";
import { AuctionState } from "./auction.state";



@WebSocketGateway({
    namespace: 'auctions',
    cors: {
        origin: process.env.FRONTEND_ORIGIN?.split(',') ?? 'https://localhost',
        credentials: true,
    },
})
export class AuctionGateway extends BaseComponent {
    @WebSocketServer()
    private readonly server!: Server;
    private readonly logger = new Logger(AuctionGateway.name);

    constructor(eventBus: EventBus) {
        super(eventBus);
    }

    protected setupSubscriptions(): void {
        this.logger.log(`Bid viewer gateway init, listening to bus... `);

        this.listen<AuctionState>(EventType.AUCTION_UPDATED, (state: AuctionState) => {
            this.logger.log(`Broadcast auction update ${state.id}: ${state.status}`);
            this.server.to(state.id).emit('bidUpdated', {
                newPrice: state.currentPrice,
                bidderId: state.highestBidderId,
                bidderName: state.highestBidderName || 'A user',
                status: state.status,
                version: state.version,
                endDate: state.endDate,
                timestamp: new Date(),
            });
        });
    }

    @SubscribeMessage('joinAuction')
    handleJoinAuction(
        @MessageBody() data: { auctionId: string},
        @ConnectedSocket() client: Socket,
    ): { status: string; room: string }{
        client.join(data.auctionId);
        this.logger.log(`Client ${client.id} joins bid : ${data.auctionId}`);
        return { status: 'joined', room: data.auctionId};
    }
    @SubscribeMessage('leaveAuction')
    handleLeaveAuction(
        @MessageBody() data: { auctionId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(data.auctionId);
        this.logger.log(`Client ${client.id} left bid : ${data.auctionId}`);
    }
}
