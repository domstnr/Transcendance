import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Subscription } from "rxjs";
import { EventBus } from "./event.service";
import { eCallback, EventType } from "./event.types";


export abstract class BaseComponent implements OnModuleInit, OnModuleDestroy
{
    protected subscriptions: Subscription[] = [];
    constructor (protected readonly eventBus: EventBus){}

    onModuleInit() {
        this.setupSubscriptions();
    }

    //destructor like in c++
    onModuleDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        console.log(`[lifecycle] Cleaning up subscriptions for ${this.constructor.name}`);
    }

    protected abstract setupSubscriptions(): void;


    protected listen<T>(type: EventType, callback: eCallback<T>): void
    {
        const sub = this.eventBus.on(type).subscribe((event)=> {
        void (async () => {
            try {
                await callback(event.payload as T);
            } catch (error) {console.error(`[bus error] exception in ${type} handler:`, error);}
        })();
        })
        this.subscriptions.push(sub);
    }
}