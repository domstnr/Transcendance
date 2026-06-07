import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EventBus } from "../../../core/bus/event.service";
import { EventType } from "../../../core/bus/event.types";
import { PrismaService } from "../../../shared/prisma/prisma.service";


@Injectable()
export class AuctionScheduler {
    private readonly logger = new Logger(AuctionScheduler.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventBus: EventBus,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async checkAndCloseAuctions() {
        const now = new Date();

        const expiredAuctions = await this.prisma.auction.findMany({
            where: {
                status: 'OPEN',
                endDate: { lte: now},
            },
        });

        if (expiredAuctions.length == 0) return;

        this.logger.log(`Found ${expiredAuctions.length} auctions to close`);

        for (const auction of expiredAuctions) {
            const result = await this.prisma.auction.updateMany({
                where: {
                    id: auction.id,
                    version: auction.version,
                    status: 'OPEN',
                    endDate: { lte: now },
                },
                data: {
                    status: 'CLOSED',
                    version: { increment: 1 },
                },
            });

            if (result.count === 1) {
                const closedAuction = await this.prisma.auction.findUniqueOrThrow({
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
                                username: true,
                            },
                        },
                        status: true,
                        version: true,
                        endDate: true,
                    },
                });
                const { highestBidder, ...auctionState } = closedAuction;

                try {
                    await this.eventBus.publish({
                        type: EventType.AUCTION_UPDATED,
                        timestamp: Date.now(),
                        payload: {
                            ...auctionState,
                            highestBidderName: highestBidder?.username ?? null,
                        },
                    });
                } catch (error) {
                    this.logger.error(
                        `Auction ${auction.id} was closed, but its live update could not be published.`,
                        error instanceof Error ? error.stack : String(error),
                    );
                }

                this.logger.log(`[CLOSED] Auction ${auction.id}. Winner: ${auction.highestBidderId}`);
            } else {
                this.logger.debug(
                    `[SKIPPED] Auction ${auction.id} changed while closure was being processed.`,
                );
            }
        }
    }
}
