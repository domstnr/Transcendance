import { BaseComponent } from "../../../core/bus/base.component";
import { Injectable } from "@nestjs/common";
import { EventBus } from "../../../core/bus/event.service";
import { BidPlacedPayload, EventType } from "../../../core/bus/event.types";
import { AuctionState } from "../auction.state";
import { AuctionRepository } from "../auction.repository";

@Injectable()
export class PlaceBidHandler extends BaseComponent
{
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
        //image actuelle
        const currentState = await this.auctionRepo.findById(payload.auctionId);
        
        //invariable check rule
        if (!this.isTransitionValid(currentState, payload))
        {console.error(`[Invariable error] bidding of ${payload.amount} denied for ${payload.auctionId}`);
         return;
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
    }
    private isTransitionValid(s: AuctionState, event: BidPlacedPayload): boolean{
        return event.amount > s.currentPrice && s.status === 'OPEN';
    }
}