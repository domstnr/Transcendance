export interface AuctionState
{
    readonly id: string;
    readonly sellerId: string;
    readonly currentPrice: number;
    readonly highestBidderId: string | null;
    readonly status: 'OPEN' | 'CLOSED';
    readonly version: number;
    endDate: Date;
}