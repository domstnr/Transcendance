import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseComponent } from "../../../core/bus/base.component";
import { EventBus } from "../../../core/bus/event.service";
import { AuctionRepository } from "../auction.repository";
import { EventType } from "../../../core/bus/event.types";
import { AuctionState } from "../auction.state";

interface CreateAuctionPayload
{
    id: string;
    userId: string;
    startPrice: number;
    creatorId: string;
}

@Injectable()
export class CreateAuctionHandler extends BaseComponent
{
    constructor(
        eventBus: EventBus,
        private readonly auctionRepo: AuctionRepository,
    ){
        super(eventBus);
    }

    protected setupSubscriptions(): void {
        this.listen<CreateAuctionPayload>(EventType.AUCTION_CREATED, async (payload) => {
            await this.handleCreation(payload);
        });
    }

    private async handleCreation(payload: CreateAuctionPayload)
    {
        const exists = await this.auctionRepo.findById(payload.id);
        if (exists)
        {
            throw new BadRequestException(`Auction ${payload.id} already exists`);
        }
        const  initialState: AuctionState = {
        id: payload.id,
        sellerId: payload.userId,
        currentPrice: payload.startPrice,
        highestBidderId: null,
        status: 'OPEN',
        version: 0,
        endDate : new Date(Date.now() + 2 * 60000),
        };
        await this.auctionRepo.save(initialState);
        console.log(`[Success] Auction ${payload.id} created at version 0`);
    }

}
