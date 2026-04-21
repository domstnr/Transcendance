import { Module } from '@nestjs/common';
import { BiddingController } from './bidding.controller';
import { PlaceBidHandler } from './handlers/place-bid.handler';
import { AuctionRepository } from './auction.repository';
import { EventModule } from '../../core/bus/event.module';

@Module({
  // On importe le bus pour qu'il soit accessible
  imports: [EventModule],
  
  // On déclare le Controller pour les routes HTTP
  controllers: [BiddingController],
  
  // On déclare les services (le Handler et le Repository)
  providers: [
    PlaceBidHandler, 
    AuctionRepository
  ],
})
export class BiddingModule {}