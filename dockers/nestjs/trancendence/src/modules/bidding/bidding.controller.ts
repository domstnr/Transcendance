import { Controller, Post, Body, Logger, Get, Param } from '@nestjs/common';
import { EventBus } from '../../core/bus/event.service';
import { EventType } from '../../core/bus/event.types';
import { AuctionRepository } from './auction.repository';

@Controller('bidding')
export class BiddingController
{
    private readonly logger = new Logger(BiddingController.name);

    constructor(private readonly eventBus: EventBus) {}

    @Post('bid')
    async placeBid(@Body() payload: { auctionId: string; amount: number; userId: string})
    {
        this.logger.log(`[HTTP] new BID request from ${payload.auctionId} `);
        const event = {
            type: EventType.BID_PLACED,
            timestamp: Date.now(),
            payload: payload,
        };

        this.eventBus.publish(event);
        return Promise.resolve({
            status: 'Event dispatched',
            message: 'Your bid is in treatment'
        });
    }

    @Get(':id')
async getAuctionState(@Param('id') id: string) {
  this.logger.log(`[HTTP] Consultation de l'état pour ${id}`);
  
  // On demande au repo de nous donner la dernière "photo"
  const state = await this.AuctionRepository.findById(id);
  
  return state;
}
}