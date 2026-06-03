import { Injectable, Logger } from "@nestjs/common";
import { BaseComponent } from "../../../core/bus/base.component";
import { EventBus } from "../../../core/bus/event.service";
import { PrismaService } from "../../../shared/prisma/prisma.service";
import { AuctionState } from "../auction.state";
import { EventType } from "../../../core/bus/event.types";


@Injectable()
export class BidHistoryHandler extends BaseComponent {
    private readonly logger:Logger = new Logger(BidHistoryHandler.name);

    constructor(
        eventBus: EventBus,    
        private readonly prisma : PrismaService,
    ) {
        super(eventBus);
    }

    protected setupSubscriptions(): void {
        this.listen<AuctionState>(EventType.AUCTION_UPDATED, async (state) => {
            await this.handleHistoryRecording(state);
        });
    }

    private async handleHistoryRecording(state: AuctionState): Promise<void>
    {

        if (!state.highestBidderId)
        {
            this.logger.warn(`No bidder yet for ${state.id}, skip history...`);
            return;
            
        }
        try {
            const newHistoryEntry = await this.prisma.bid.create({
                data: {
                    auctionId: state.id,
                    userId:    state.highestBidderId,
                    amount:    state.currentPrice,
                    status:    'ACCEPTED',
                },
            });
            this.logger.log(`[History] bid ${newHistoryEntry.amount} saved for ${state.id}`);
        } catch (err) {
            this.logger.error( `[History Error] Failed to archive ${state.id}, error`, err);
            
        }
        
    }
}
