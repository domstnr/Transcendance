import { Injectable, Logger } from "@nestjs/common";
import { BaseComponent } from "../../../core/bus/base.component";
import { EventBus } from "../../../core/bus/event.service";
import { EventType } from "../../../core/bus/event.types";
import { IEvent } from "../../../core/bus/event.interface";

interface UserRegistrationPayload {
        userId: string;
        email: string;
        username: string;
}

@Injectable()
export class UserRegistrationHandler extends BaseComponent {
    private readonly logger = new Logger(UserRegistrationHandler.name);

    constructor(eventBus: EventBus)
    {
        super(eventBus);
    }

    protected setupSubscriptions(): void {
        this.listen(EventType.USER_REGISTERED, (e: IEvent<UserRegistrationPayload>) => {
             const {username}  = e.payload;

            this.logger.log(`Handling new user registration for: ${username}`);
        });
    }
}