import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../../shared/prisma/prisma.service";


@Injectable()
export class AuctionScheduler {
    private readonly logger = new Logger(AuctionScheduler.name);

    constructor(private readonly prisma: PrismaService) {}

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

        //close bids
        for (const auction of expiredAuctions) {
            await this.prisma.auction.update({
                where: { id: auction.id, version: auction.version },
                data: { status: 'CLOSED' }, //TO CHECK FOR RACE
            });

            this.logger.log(`[CLOSED] Auction ${auction.id}. Winner: ${auction.highestBidderId}`);
        }
    }
}
