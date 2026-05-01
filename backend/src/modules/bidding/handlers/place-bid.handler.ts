import { BaseComponent } from "../../../core/bus/base.component";
import { Injectable, NotFoundException, BadRequestException, Logger} from "@nestjs/common";
import { EventBus } from "../../../core/bus/event.service";
import { BidPlacedPayload, EventType } from "../../../core/bus/event.types";
import { AuctionState } from "../auction.state";
import { AuctionRepository } from "../auction.repository";

@Injectable()
export class PlaceBidHandler extends BaseComponent
{
    private readonly logger = new Logger(PlaceBidHandler.name);

    constructor(eventBus: EventBus, private readonly auctionRepo: AuctionRepository)
    {
        super(eventBus);
    }

    protected setupSubscriptions(): void {
        this.listen(EventType.BID_PLACED, async (payload: BidPlacedPayload) => 
        {
            await this.transition(payload);
        });
    }

    private async transition(payload: BidPlacedPayload)
    {
        this.logger.log(`[Handler] New bid received for auction ${payload.auctionId}`);
        const currentState = await this.auctionRepo.findById(payload.auctionId);
        
        if (!currentState)
        {
            throw new NotFoundException(`Auction ${payload.auctionId} not found`);
        }

        if (currentState.status !== 'OPEN')
        {
            throw new BadRequestException(`Auction ${payload.auctionId} is already closed`);
        }

        //invariable check rule
        if (!this.isTransitionValid(currentState, payload))
        {
            throw new BadRequestException(`Bidding of ${payload.amount} denied (too low)`);
        }
        //next state(image)
        const nextState: AuctionState = {
            ...currentState, 
            currentPrice: payload.amount,
            highestBidderId: payload.userId,
            version: currentState.version + 1 //we go step further on "clock"
        };

        await this.auctionRepo.save(nextState);

        console.log(`[success] Transition succeed: next image ${nextState.version}`);
        await this.eventBus.publish({
            type: EventType.AUCTION_UPDATED,
            timestamp: Date.now(),
            payload: nextState,
        });
    }
    private isTransitionValid(s: AuctionState, event: BidPlacedPayload): boolean{
        return event.amount > (s.currentPrice || 0) && s.status === 'OPEN';
    }
}
