import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { AuctionRepository } from './auction.repository';

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

@Injectable()
export class AuctionService {
    constructor(private readonly auctionRepo: AuctionRepository) {}

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
        this.auctionRepo.evict(auction.id);
    }
}
