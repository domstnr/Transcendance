import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { EventBus } from '../../core/bus/event.service';
import { EventType } from '../../core/bus/event.types';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
    AuctionStatus,
    GetAuctionResponseDto,
    GetBidHistoryResponseDto,
    PlaceBidResultDto,
} from './dto/auction-response.dto';

const MAX_BID_CONCURRENCY_RETRIES = 3;

class AuctionVersionConflictError extends Error {}

type CreateAuctionForItemInput = {
    itemId: string;
    sellerId: string;
    startPrice: number;
    endDate: Date;
};

type DeleteAuctionForItemInput = {
    itemId: string;
    sellerId: string;
};

type PlaceBidInput = {
    auctionId: string;
    bidderId: string;
    amount: number;
};

@Injectable()
export class AuctionService {
    private readonly logger = new Logger(AuctionService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventBus: EventBus,
    ) {}

    async findById(auctionId: string): Promise<GetAuctionResponseDto> {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            select: {
                id: true,
                itemId: true,
                startPrice: true,
                currentPrice: true,
                highestBidder: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                status: true,
                version: true,
                endDate: true,
            },
        });

        if (!auction) {
            throw new NotFoundException(`Auction ${auctionId} not found.`);
        }

        return {
            auction: {
                ...auction,
                status: auction.status as AuctionStatus,
            },
        };
    }

    async getBidHistory(auctionId: string): Promise<GetBidHistoryResponseDto> {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            select: {
                id: true,
                bids: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        amount: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!auction) {
            throw new NotFoundException(`Auction ${auctionId} not found.`);
        }

        return {
            auctionId: auction.id,
            totalBids: auction.bids.length,
            bids: auction.bids.map(({ user, ...bid }) => ({
                ...bid,
                bidder: user,
            })),
        };
    }

    async placeBid(input: PlaceBidInput): Promise<PlaceBidResultDto> {
        for (let attempt = 0; attempt < MAX_BID_CONCURRENCY_RETRIES; attempt += 1) {
            try {
                const result = await this.prisma.$transaction(async (tx) => {
                    const auction = await tx.auction.findUnique({
                        where: { id: input.auctionId },
                        select: {
                            id: true,
                            sellerId: true,
                            currentPrice: true,
                            status: true,
                            version: true,
                            endDate: true,
                        },
                    });

                    if (!auction) {
                        throw new NotFoundException(`Auction ${input.auctionId} not found.`);
                    }

                    if (auction.sellerId === input.bidderId) {
                        throw new ForbiddenException('You cannot bid on your own auction.');
                    }

                    if (auction.status !== 'OPEN') {
                        throw new BadRequestException('This auction is closed.');
                    }

                    if (auction.endDate.getTime() <= Date.now()) {
                        throw new BadRequestException('This auction has expired.');
                    }

                    if (input.amount <= auction.currentPrice) {
                        throw new BadRequestException(
                            `Bid must be greater than the current price of ${auction.currentPrice}.`,
                        );
                    }

                    const updatedRows = await tx.$executeRaw`
                        UPDATE "Auction"
                        SET
                            "currentPrice" = ${input.amount},
                            "highestBidderId" = ${input.bidderId},
                            "version" = "version" + 1,
                            "updatedAt" = clock_timestamp()
                        WHERE
                            "id" = ${auction.id}
                            AND "version" = ${auction.version}
                            AND "status" = 'OPEN'
                            AND "endDate" > clock_timestamp()
                    `;

                    if (updatedRows !== 1) {
                        throw new AuctionVersionConflictError();
                    }

                    const bid = await tx.bid.create({
                        data: {
                            auctionId: auction.id,
                            userId: input.bidderId,
                            amount: input.amount,
                            status: 'ACCEPTED',
                        },
                        select: {
                            id: true,
                            amount: true,
                            createdAt: true,
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatarUrl: true,
                                },
                            },
                        },
                    });

                    const committedAuction = await tx.auction.findUniqueOrThrow({
                        where: { id: auction.id },
                        select: {
                            id: true,
                            itemId: true,
                            sellerId: true,
                            startPrice: true,
                            currentPrice: true,
                            highestBidderId: true,
                            highestBidder: {
                                select: {
                                    id: true,
                                    username: true,
                                    avatarUrl: true,
                                },
                            },
                            status: true,
                            version: true,
                            endDate: true,
                        },
                    });

                    const {
                        sellerId,
                        highestBidderId,
                        highestBidder,
                        ...publicAuctionState
                    } = committedAuction;
                    const { user, ...publicBid } = bid;

                    return {
                        publicResult: {
                            auction: {
                                ...publicAuctionState,
                                status: publicAuctionState.status as AuctionStatus,
                                highestBidder,
                            },
                            bid: {
                                ...publicBid,
                                bidder: user,
                            },
                        },
                        eventState: {
                            ...publicAuctionState,
                            sellerId,
                            highestBidderId,
                            highestBidderName: highestBidder?.username ?? null,
                        },
                    };
                });

                try {
                    await this.eventBus.publish({
                        type: EventType.AUCTION_UPDATED,
                        timestamp: Date.now(),
                        payload: result.eventState,
                    });
                } catch (error) {
                    this.logger.error(
                        `Bid committed for auction ${input.auctionId}, but its live update could not be published.`,
                        error instanceof Error ? error.stack : String(error),
                    );
                }

                return result.publicResult;
            } catch (error) {
                if (error instanceof AuctionVersionConflictError) {
                    continue;
                }

                throw error;
            }
        }

        throw new ConflictException(
            'The auction changed while your bid was being processed. Please try again.',
        );
    }

    async createForItem(tx: Prisma.TransactionClient, input: CreateAuctionForItemInput) {
        if (input.endDate.getTime() <= Date.now()) {
            throw new ConflictException('Auction end date must be in the future.');
        }

        const existingAuction = await tx.auction.findUnique({
            where: { itemId: input.itemId },
            select: { id: true },
        });

        if (existingAuction) {
            throw new ConflictException('Auction already exists for this item.');
        }

        return tx.auction.create({
            data: {
                id: input.itemId,
                itemId: input.itemId,
                sellerId: input.sellerId,
                startPrice: input.startPrice,
                currentPrice: input.startPrice,
                highestBidderId: null,
                status: 'OPEN',
                version: 0,
                endDate: input.endDate,
            },
            select: {
                id: true,
                startPrice: true,
                currentPrice: true,
                status: true,
                endDate: true,
            },
        });
    }

    async deleteForItem(tx: Prisma.TransactionClient, input: DeleteAuctionForItemInput) {
        const auction = await tx.auction.findUnique({
            where: { itemId: input.itemId },
            select: {
                id: true,
                sellerId: true,
                _count: {
                    select: {
                        bids: true,
                        messages: true,
                        participations: true,
                    },
                },
            },
        });

        if (!auction) {
            return;
        }

        if (auction.sellerId !== input.sellerId) {
            throw new ForbiddenException('You cannot delete another seller auction.');
        }

        if (auction._count.bids > 0 || auction._count.messages > 0 || auction._count.participations > 0) {
            throw new ConflictException('Cannot delete a listing once auction activity exists.');
        }

        await tx.auction.delete({
            where: { id: auction.id },
        });
    }
}
