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

@Module({
  imports: [PrismaModule, AuctionModule, EventModule, ScheduleModule.forRoot(), AuthnModule, ChatModule, UserModule, ItemModule, FriendsModule, PresenceModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
