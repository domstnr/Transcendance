import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../../prisma.service";


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
            const result = await this.prisma.auction.updateMany({
                where: { 
                    id: auction.id,
                    status: 'OPEN',
                    version: auction.version 
                },
                data: { 
                    status: 'CLOSED', 
                    version: { increment: 1}
                }, //TO CHECK FOR RACE

            });
            if (result.count === 1) {
                this.logger.log(`[CLOSED] Auction ${auction.id}. Winner: ${auction.highestBidderId}`);

            }
            else {
                this.logger.debug(`Bid ${auction.id} has already closed.`);
            }


        }
    }
}