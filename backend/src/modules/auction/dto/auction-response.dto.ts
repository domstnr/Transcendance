export type AuctionStatus = 'OPEN' | 'CLOSED';

export interface PublicBidderDto {
    id: string;
    username: string;
    avatarUrl: string | null;
}

export interface AuctionStateDto {
    id: string;
    itemId: string;
    startPrice: number;
    currentPrice: number;
    status: AuctionStatus;
    version: number;
    endDate: Date;
    highestBidder: PublicBidderDto | null;
}

export interface GetAuctionResponseDto {
    auction: AuctionStateDto;
}

export interface BidHistoryEntryDto {
    id: string;
    amount: number;
    createdAt: Date;
    bidder: PublicBidderDto;
}

export interface PlaceBidResultDto {
    auction: AuctionStateDto;
    bid: BidHistoryEntryDto;
}

export interface PlaceBidResponseDto extends PlaceBidResultDto {
    status: 'success';
    message: string;
}

export interface GetBidHistoryResponseDto {
    auctionId: string;
    totalBids: number;
    bids: BidHistoryEntryDto[];
}
