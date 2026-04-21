import { EventType } from "./event.types";

export interface IEvent
{
    readonly payload: any;
    readonly timestamp: number;
    readonly type : EventType;
}