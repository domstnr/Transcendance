export enum EventType
{
    BID_CREATED = 'BID_CREATED',
    BID_CLOSED = 'BID_CLOSED',
    AUCTION_UPDATED = 'AUCTION_UPDATED',
    USER_REGISTERED = 'USER_REGISTERED',
    CHAT_MESSAGE_SENT = 'CHAT_MESSAGE_SENT',
}

// src/core/bus/bus.types.ts
export type eCallback<T = any> = (payload: T) => void | Promise<void>;

export interface ChatMessageSentPayload {
  messageId: string;
  auctionId: string;
  senderId: string;
  content: string;
}
