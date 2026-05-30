import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuctionService } from '../auction/auction.service';

@Injectable()
export class ItemService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auctionService: AuctionService,
    ) {}

    private readonly itemSummarySelect = {
        id: true,
        sellerId: true,
        title: true,
        description: true,
        condition: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        auction: {
            select: {
                id: true,
                startPrice: true,
                currentPrice: true,
                status: true,
                endDate: true,
            },
        },
    } as const;

    async findAll() {
        return this.prisma.item.findMany({
            orderBy: { createdAt: 'desc' },
            select: this.itemSummarySelect,
        });
    }

    async findBySellerId(sellerId: string) {
        return this.prisma.item.findMany({
            where: { sellerId },
            orderBy: { createdAt: 'desc' },
            select: this.itemSummarySelect,
        });
    }

    async createItem(sellerId: string, dto: CreateItemDto) {
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.item.create({
                data: {
                    sellerId,
                    title: dto.title.trim(),
                    description: dto.description.trim(),
                    condition: dto.condition,
                    category: dto.category,
                },
                select: {
                    id: true,
                    sellerId: true,
                    title: true,
                    description: true,
                    condition: true,
                    category: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            const auction = await this.auctionService.createForItem(tx, {
                itemId: item.id,
                sellerId,
                startPrice: dto.startPrice,
                endDate: new Date(dto.endDate),
            });

            return {
                ...item,
                auction,
            };
        });
    }

    async findById(itemId: string) {
        const item = await this.prisma.item.findUnique({
            where: { id: itemId },
            select: this.itemSummarySelect,
        });

        if (!item) {
            throw new NotFoundException(`Item ${itemId} not found.`);
        }

        return item;
    }

    async assertSellerOwnsItem(itemId: string, sellerId: string) {
        const item = await this.findById(itemId);

        if (item.sellerId !== sellerId) {
            throw new ForbiddenException('You cannot access another seller item.');
        }

        return item;
    }

    async updateOwnedItem(itemId: string, sellerId: string, dto: UpdateItemDto) {
        await this.assertSellerOwnsItem(itemId, sellerId);

        const data: { title?: string; description?: string; condition?: number; category?: UpdateItemDto['category'] } = {};

        if (dto.title !== undefined) {
            data.title = dto.title.trim();
        }

        if (dto.description !== undefined) {
            data.description = dto.description.trim();
        }

        if (dto.condition !== undefined) {
            data.condition = dto.condition;
        }

        if (dto.category !== undefined) {
            data.category = dto.category;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException('At least one item field must be provided.');
        }

        return this.prisma.item.update({
            where: { id: itemId },
            data,
            select: this.itemSummarySelect,
        });
    }

    async deleteOwnedItem(itemId: string, sellerId: string) {
        await this.assertSellerOwnsItem(itemId, sellerId);

        await this.prisma.$transaction(async (tx) => {
            await this.auctionService.deleteForItem(tx, {
                itemId,
                sellerId,
            });

            await tx.item.delete({
                where: { id: itemId },
            });
        });
    }
}
