import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { extractWsToken } from '../auth/utils/extract-ws-token.util';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AuthenticatedSocket } from '../auth/interfaces/auth-socket.interface';
import { PresenceService } from './presence.service';

@WebSocketGateway({
    namespace: 'presence',
    cors: {
        origin: process.env.FRONTEND_ORIGIN?.split(',') ?? '*',
        credentials: true,
    },
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(PresenceGateway.name);
    private readonly socketUserMap = new Map<string, string>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly presenceService: PresenceService,
    ) {}

    async handleConnection(client: Socket) {
        const token = extractWsToken(client as AuthenticatedSocket);
        if (!token) {
            this.logger.warn(`Presence rejected (no token): ${client.id}`);
            client.disconnect();
            return;
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret: process.env.JWT_SECRET || 'MySecret',
            });
            if (payload.tokenType !== 'access') {
                client.disconnect();
                return;
            }
            this.socketUserMap.set(client.id, payload.sub);
            void this.presenceService.handleConnect(payload.sub);
            this.logger.log(`Presence connected: ${payload.username} (${client.id})`);
        } catch {
            this.logger.warn(`Presence rejected (invalid token): ${client.id}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.socketUserMap.get(client.id);
        if (userId) {
            this.socketUserMap.delete(client.id);
            void this.presenceService.handleDisconnect(userId);
            this.logger.log(`Presence disconnected: ${userId} (${client.id})`);
        }
    }
}
