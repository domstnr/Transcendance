export enum EventType
{
    BID_CREATED = 'BID_CREATED',
    BID_PLACED = 'BID_PLACED',
    BID_CLOSED = 'BID_CLOSED',
    AUCTION_CREATED = 'AUCTION_CREATED',
    AUCTION_UPDATED = 'AUCTION_UPDATED',
    USER_REGISTERED = 'USER_REGISTERED',
}

// src/core/bus/bus.types.ts
export type eCallback<T = any> = (payload: T) => void | Promise<void>;

export interface BidPlacedPayload {
  auctionId: string;
  amount: number;
  userId: string;
}