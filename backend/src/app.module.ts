import { Module } from '@nestjs/common';
import { EventModule } from './core/bus/event.module';
import { BiddingModule } from './modules/bidding/bidding.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './modules/bidding/prisma.module';
import { AuthnModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
@Module({
  imports: [PrismaModule, BiddingModule, EventModule, ScheduleModule.forRoot(), AuthnModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
