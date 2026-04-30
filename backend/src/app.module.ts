import { Module } from '@nestjs/common';
import { EventModule } from './core/bus/event.module';
import { BiddingModule } from './modules/bidding/bidding.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './modules/bidding/prisma.module';
import { AuthnModule } from './modules/auth/auth.module';
@Module({
  imports: [PrismaModule, BiddingModule, EventModule, ScheduleModule.forRoot(), AuthnModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
