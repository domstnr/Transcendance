import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { EventModule } from '../../core/bus/event.module';
import { AuctionScheduler } from './handlers/auction.scheduler';
import { AuctionGateway } from './auction.gateway';
import { AuthnModule } from '../auth/auth.module';
import { AuctionService } from './auction.service';

@Module({
  // On importe le bus pour qu'il soit accessible
  imports: [EventModule, AuthnModule],
  
  // On déclare le Controller pour les routes HTTP
  controllers: [AuctionController],
  
  // On déclare les services (le Handler et le Repository)
  providers: [
    AuctionService,
    AuctionGateway,
    AuctionScheduler,
  ],
  exports: [AuctionService],
})
export class AuctionModule {}
