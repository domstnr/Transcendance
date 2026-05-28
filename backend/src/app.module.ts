import { Module } from '@nestjs/common';
import { EventModule } from './core/bus/event.module';
import { BiddingModule } from './modules/bidding/bidding.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthnModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { UserModule } from './modules/user/user.module';
import { FriendsModule } from './modules/friends/friends.module';
import { PresenceModule } from './modules/presence/presence.module';

@Module({
  imports: [PrismaModule, BiddingModule, EventModule, ScheduleModule.forRoot(), AuthnModule, ChatModule, UserModule, FriendsModule, PresenceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
