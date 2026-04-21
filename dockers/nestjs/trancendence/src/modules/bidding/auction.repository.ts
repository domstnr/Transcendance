import { Injectable } from "@nestjs/common";
import { AuctionState } from "./auction.state";

@Injectable()
export class AuctionRepository
{
    private readonly storage = new Map<string, AuctionState>();

    async findById(id:string): Promise<AuctionState>{
        const auction = this.storage.get(id);
        if (!auction)
        {
            return {
                id,
                currentPrice: 0,
                highestBidderId: null,
                status: 'OPEN',
                version: 0,
            };
        }
        return Promise.resolve(auction);
    }
    async save(state: AuctionState): Promise<void>
    {
        this.storage.set(state.id, state);
        return Promise.resolve();
    }
}