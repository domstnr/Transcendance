import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class PresenceService {
    // track how many sockets each user has open
    private readonly socketCount = new Map<string, number>();

    constructor(private readonly userService: UserService) {}

    async handleConnect(userId: string) {
        const count = (this.socketCount.get(userId) ?? 0) + 1;
        this.socketCount.set(userId, count);
        if (count === 1) {
            await this.userService.setOnlineStatus(userId, true);
        }
    }

    async handleDisconnect(userId: string) {
        const count = Math.max((this.socketCount.get(userId) ?? 1) - 1, 0);
        this.socketCount.set(userId, count);
        if (count === 0) {
            this.socketCount.delete(userId);
            await this.userService.setOnlineStatus(userId, false);
        }
    }
}
