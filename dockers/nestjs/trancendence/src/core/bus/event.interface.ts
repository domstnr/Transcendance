import { EventType } from "./event.types";

export interface IEvent<T = any>
{
    readonly payload: T;
    readonly timestamp: number;
    readonly type : EventType;
}