import { Controller, Post, Body, Logger, Get, Param, Req, UseGuards } from '@nestjs/common';
import { EventBus } from '../../core/bus/event.service';
import { EventType } from '../../core/bus/event.types';
import { AuctionRepository } from './auction.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
@Controller('bidding')
export class BiddingController
{
    private readonly logger = new Logger(BiddingController.name);

    constructor(private readonly eventBus: EventBus,
                private readonly auctionRepo: AuctionRepository,
                private readonly prisma:    PrismaService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('bid')
    async placeBid(@Body() payload: { auctionId: string; amount: number; userId: string}, 
                    @Req() request: { user: { userId: string; username: string }})
    {
        const safeUserId = request.user.userId;
        const safeUsername = request.user.username;
        this.logger.log(`[HTTP] new BID request from ${payload.auctionId} `);
        const event = {
            type: EventType.BID_PLACED,
            timestamp: Date.now(),
            payload: {...payload, userId: safeUserId, username: safeUsername},
        };
        
        console.log(`User ${safeUserId} is bidding ${payload.amount} on ${payload.auctionId}`);
        await this.eventBus.publish(event);
        return Promise.resolve({
            status: 'succes',
            message: `Your bid of ${payload.amount} is in treatment`
        });
    }

    @Post('create')
    async create(@Body() payload: { id: string; startPrice: number; userId: string }){
        await this.eventBus.publish({
            type: EventType.AUCTION_CREATED,
            timestamp: Date.now(),
            payload,
        });
        return { status: 'Auction successfully created'};
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
