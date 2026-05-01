import { 
    ConnectedSocket, 
    MessageBody, 
    SubscribeMessage, 
    WebSocketGateway, 
    WebSocketServer } from "@nestjs/websockets";
import { BaseComponent } from "../../core/bus/base.component";
import { Server, Socket } from "socket.io";
import { Logger, UseGuards } from "@nestjs/common";
import { EventBus } from '../../core/bus/event.service';
import { EventType } from "../../core/bus/event.types";
import { AuctionState } from "./auction.state";
import { WsJwtGuard } from "../auth/guards/ws-jwt.guard";
import { AuthenticatedSocket } from "../auth/interfaces/auth-socket.interface";
import { BidPlacedEvent } from "./events/bid-placed.event";



@WebSocketGateway({
    namespace: 'auctions',
    cors: { origin: '*' },
})
export class BiddingGateway extends BaseComponent {
    @WebSocketServer()
    private readonly server!: Server;
    private readonly logger = new Logger(BiddingGateway.name);

    constructor(eventBus: EventBus) {
        super(eventBus);
    }

    protected setupSubscriptions(): void {
        this.logger.log(`Bid viewer gateway init, listening to bus... `);

        //bus listen for event, AUCTION_UPDATING
        this.listen<AuctionState>(EventType.AUCTION_UPDATED, (state: AuctionState) => {
            this.logger.log(`Diffuse new bid ${state.id}`);
            this.server.to(state.id).emit('bidUpdated', {
                newPrice: state.currentPrice,
                bidderId: state.highestBidderId,
                timestamp: new Date(),
            });
        });
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('placeBid')
    async handlePlaceBid(
        @MessageBody() data: { auctionId: string; amount: number },
        @ConnectedSocket() client: AuthenticatedSocket,
    ) {
        await this.eventBus.publish(new BidPlacedEvent({
            auctionId: data.auctionId,
            userId: client.user.userId,
            amount: data.amount,
        }));

        return {
            status: 'success',
            message: 'Bid authenticated & sent to queue',
        };
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
