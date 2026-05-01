import { IEvent } from "../../../core/bus/event.interface";
import { EventType } from "../../../core/bus/event.types";

export interface BidPlacedPayload {
    auctionId: string;
    userId: string;
    amount: number;
}

export class BidPlacedEvent implements IEvent<BidPlacedPayload> {
    public readonly type = EventType.BID_PLACED;

    public readonly timestamp: number = Date.now();

    constructor(
        public readonly payload: BidPlacedPayload
    ) {}
}