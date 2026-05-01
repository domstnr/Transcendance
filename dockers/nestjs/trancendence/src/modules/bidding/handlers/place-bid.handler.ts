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
        this.logger.log(`[Handler] New Bid received`);
        const auction = await this.auctionRepo.findById(payload.auctionId);

        if (!auction) {
            this.logger.warn(`ERROR: Bid doesn't exists`);
            throw new Error(`Auction not found`);
        }

        if (auction.status !== 'OPEN') {
            this.logger.warn(`[ERROR] Bid closed ${auction.status}`);
            throw new Error('Auction is Closed');
        }

        //check if amount is STRICTLY higher > amount
        const currentHighest = auction.currentPrice || 0;

        if (payload.amount <= currentHighest) {
            this.logger.warn(`[ERROR] ${payload.amount}.- is not higher than ${currentHighest}.-`);
            throw new Error(`Bid must be strictly higher than current price`);
        }
        this.logger.log(`Object ID: ${payload.auctionId}`);
        this.logger.log(`User ID: ${payload.userId}`);
        this.logger.log(`Amount: ${payload.amount}`);
        // 1. Vérifier si l'utilisateur a assez de points (Point System)
    // 2. Vérifier si l'enchère est plus haute que la précédente (Auction DB)
    // 3. Sauvegarder (Bid Update / Cache)
    // --- C'EST ICI ---
    // 1. const user = await this.userRepo.findById(event.data.userId)
    // 2. if (user.points < event.data.amount) throw Error...
    // 3. await this.auctionRepo.updateBid(...)
        //image actuelle
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