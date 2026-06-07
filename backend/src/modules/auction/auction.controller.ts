import { Controller, Post, Body, Logger, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { PlaceBidDto } from './dto/place-bid.dto';
import { AuctionService } from './auction.service';
import {
    GetAuctionResponseDto,
    GetBidHistoryResponseDto,
    PlaceBidResponseDto,
} from './dto/auction-response.dto';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('auctions')
export class AuctionController
{
    private readonly logger = new Logger(AuctionController.name);

    constructor(private readonly auctionService: AuctionService) {}

    @UseGuards(JwtAuthGuard)
    @Post(':id/bids')
    async placeBid(
        @Param('id') auctionId: string,
        @Body() payload: PlaceBidDto,
        @Req() request: { user: { userId: string }},
    ): Promise<PlaceBidResponseDto>
    {
        this.logger.log(`[HTTP] new BID request from ${auctionId} `);

        const result = await this.auctionService.placeBid({
            auctionId,
            bidderId: request.user.userId,
            amount: payload.amount,
        });

        return {
            status: 'success',
            message: `Your bid of ${payload.amount} was accepted.`,
            ...result,
        };
    }

    @Get(':id')
    async getAuctionState(@Param('id') id: string): Promise<GetAuctionResponseDto>
    {
        this.logger.log(`[HTTP] Consultation de l'état pour ${id}`);

        return this.auctionService.findById(id);
    }

    @Get(':id/history')
    async getAuctionHistory(
        @Param('id') auctionId: string,
    ): Promise<GetBidHistoryResponseDto>
    {
        return this.auctionService.getBidHistory(auctionId);
    }
}
