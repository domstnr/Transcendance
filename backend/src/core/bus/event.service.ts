import { Injectable, Logger } from '@nestjs/common';
import { IEvent } from './event.interface';
import { EventType, eCallback } from './event.types';

@Injectable()
export class EventBus {
    private readonly logger = new Logger(EventBus.name);
    // Store handlers by event type
    private readonly handlers = new Map<EventType, eCallback[]>();

    // Subscribe a handler to an event type
    on(type: EventType, handler: eCallback) {
        const currentHandlers = this.handlers.get(type) || [];
        this.handlers.set(type, [...currentHandlers, handler]);
        
        // Return a teardown function to unsubscribe
        return () => {
             const updatedHandlers = (this.handlers.get(type) || []).filter(h => h !== handler);
             this.handlers.set(type, updatedHandlers);
        };
    }

    // Publish waits for all handlers to complete and throws if any fail
    async publish(event: IEvent): Promise<void> {
        this.logger.log(`[Event] ${event.type} dispatched`);
        
        const registeredHandlers = this.handlers.get(event.type) || [];
        
        // Execute all handlers concurrently and wait for them
        await Promise.all(registeredHandlers.map(async (handler) => await handler(event.payload)));
    }
}





/*import { Injectable, Logger } from '@nestjs/common';
import { IEvent } from './event.interface';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { EventType } from './event.types';

@Injectable()
export class EventBus {
    private readonly logger = new Logger(EventBus.name);
    private events$ = new Subject<IEvent>();

    publish(event: IEvent)
    {
        this.logger.log(`[Event] ${event.type} dispatched`);
        this.events$.next(event);
    }

    on(type: EventType): Observable<IEvent>
    {
        return this.events$.pipe(
            filter(eventT => eventT.type === type)
        );
    }
}


*/