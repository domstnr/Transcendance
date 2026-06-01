import { Module } from '@nestjs/common';
import { BiddingController } from './bidding.controller';
import { PlaceBidHandler } from './handlers/place-bid.handler';
import { AuctionRepository } from './auction.repository';
import { EventModule } from '../../core/bus/event.module';
import { CreateAuctionHandler } from './handlers/create-auction.handler';
import { AuctionScheduler } from './handlers/auction.scheduler';
import { BiddingGateway } from './bidding.gateway';
import { BidHistoryHandler } from './handlers/bid-history.handler';
import { AuthnModule } from '../auth/auth.module';
@Module({
  // On importe le bus pour qu'il soit accessible
  imports: [EventModule, AuthnModule],
  
  // On déclare le Controller pour les routes HTTP
  controllers: [BiddingController],
  
  // On déclare les services (le Handler et le Repository)
  providers: [
    BiddingGateway,
    BidHistoryHandler,
    AuctionScheduler,
    PlaceBidHandler,
    CreateAuctionHandler, 
    AuctionRepository
  ],
})
export class BiddingModule {}
