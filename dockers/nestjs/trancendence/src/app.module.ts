import { Module } from '@nestjs/common';
import { BiddingController } from './modules/bidding/bidding.controller';
import { EventModule } from './core/bus/event.module';
import { PlaceBidHandler } from './modules/bidding/handlers/place-bid.handler';
import { AuctionRepository } from './modules/bidding/auction.repository';
@Module({
  imports: [EventModule],
  controllers: [BiddingController],
  providers: [PlaceBidHandler, AuctionRepository],
})
export class AppModule {}
