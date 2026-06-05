import { Module } from '@nestjs/common';
import { EventModule } from './core/bus/event.module';
import { AuctionModule } from './modules/auction/auction.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthnModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { UserModule } from './modules/user/user.module';
import { ItemModule } from './modules/item/item.module';
import { FriendsModule } from './modules/friends/friends.module';
import { PresenceModule } from './modules/presence/presence.module';
import { HealthModule } from './modules/health/health.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { ApiKeyModule } from './modules/api_key/api-key.module';

@Module({
  imports: [PrismaModule, AuctionModule, EventModule, ScheduleModule.forRoot(), AuthnModule, ChatModule, UserModule, ItemModule, FriendsModule, PresenceModule, HealthModule, ThrottlerModule.forRoot([{ ttl: 60000, limit: 30}]), ApiKeyModule],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
