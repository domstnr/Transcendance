import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { PresenceGateway } from './presence.gateway';
import { UserModule } from '../user/user.module';
import { AuthnModule } from '../auth/auth.module';

@Module({
    imports: [UserModule, AuthnModule],
    providers: [PresenceService, PresenceGateway],
})
export class PresenceModule {}
