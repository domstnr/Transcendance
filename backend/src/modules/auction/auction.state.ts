export interface AuctionState
{
    readonly id: string;
    readonly itemId: string;
    readonly sellerId: string;
    readonly startPrice: number;
    readonly currentPrice: number;
    readonly highestBidderId: string | null;
    readonly highestBidderName: string | null;
    readonly status: 'OPEN' | 'CLOSED';
    readonly version: number;
    endDate: Date;
}
