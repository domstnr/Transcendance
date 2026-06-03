import { Controller, Post, Body, Logger, Get, Param, Req, UseGuards } from '@nestjs/common';
import { EventBus } from '../../core/bus/event.service';
import { EventType } from '../../core/bus/event.types';
import { AuctionRepository } from './auction.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { PlaceBidDto } from './dto/place-bid.dto';
@Controller('auctions')
export class AuctionController
{
    private readonly logger = new Logger(AuctionController.name);

    constructor(private readonly eventBus: EventBus,
                private readonly auctionRepo: AuctionRepository,
                private readonly prisma:    PrismaService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post(':id/bids')
    async placeBid(
        @Param('id') auctionId: string,
        @Body() payload: PlaceBidDto,
        @Req() request: { user: { userId: string; username: string }},
    )
    {
        const safeUserId = request.user.userId;
        const safeUsername = request.user.username;
        this.logger.log(`[HTTP] new BID request from ${auctionId} `);
        const event = {
            type: EventType.BID_PLACED,
            timestamp: Date.now(),
            payload: { auctionId, amount: payload.amount, userId: safeUserId, username: safeUsername },
        };
        
        console.log(`User ${safeUserId} is bidding ${payload.amount} on ${auctionId}`);
        await this.eventBus.publish(event);
        return Promise.resolve({
            status: 'succes',
            message: `Your bid of ${payload.amount} is in treatment`
        });
    }

    @Get(':id')
    async getAuctionState(@Param('id') id: string) 
    {
        this.logger.log(`[HTTP] Consultation de l'état pour ${id}`);
  
        // On demande au repo de nous donner la dernière "photo"
        const state = await this.auctionRepo.findById(id);
  
        return state;
    }

    @Get(':id/history')
    async getAuctionHistory(@Param('id') auctionId: string)
    {
        const history = await this.prisma.bid.findMany({
            where: { auctionId: auctionId},
            orderBy: { createdAt: 'desc'},
        });

        return {
            auctionId: auctionId,
            totalBids: history.length,
            history:   history,
        };
    }
}
