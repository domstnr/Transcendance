import { Injectable, Logger } from '@nestjs/common';
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