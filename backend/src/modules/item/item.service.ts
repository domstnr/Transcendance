import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuctionService } from '../auction/auction.service';

const MAX_ITEM_IMAGES = 5;
const ITEM_IMAGE_EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};

@Injectable()
export class ItemService {
    private readonly logger = new Logger(ItemService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly auctionService: AuctionService,
    ) {}

    private readonly itemImageSelect = {
        id: true,
        url: true,
        position: true,
    } as const;

    private readonly itemBaseSelect = {
        id: true,
        sellerId: true,
        title: true,
        description: true,
        condition: true,
        category: true,
        createdAt: true,
        updatedAt: true,
    } as const;

    private readonly auctionSummarySelect = {
        id: true,
        startPrice: true,
        currentPrice: true,
        status: true,
        endDate: true,
    } as const;

    private readonly itemSummarySelect = {
        ...this.itemBaseSelect,
        images: {
            orderBy: { position: 'asc' as const },
            take: 1,
            select: this.itemImageSelect,
        },
        auction: {
            select: this.auctionSummarySelect,
        },
    } as const;

    private readonly itemDetailsSelect = {
        ...this.itemBaseSelect,
        seller: {
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                isOnline: true,
            },
        },
        images: {
            orderBy: { position: 'asc' as const },
            select: this.itemImageSelect,
        },
        auction: {
            select: this.auctionSummarySelect,
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
                select: this.itemBaseSelect,
            });

            const auction = await this.auctionService.createForItem(tx, {
                itemId: item.id,
                sellerId,
                startPrice: dto.startPrice,
                endDate: new Date(dto.endDate),
            });

            return {
                ...item,
                images: [],
                auction,
            };
        });
    }

    async findById(itemId: string) {
        const item = await this.prisma.item.findUnique({
            where: { id: itemId },
            select: this.itemDetailsSelect,
        });

        if (!item) {
            throw new NotFoundException(`Item ${itemId} not found.`);
        }

        return item;
    }

    async assertSellerOwnsItem(itemId: string, sellerId: string) {
        const item = await this.prisma.item.findUnique({
            where: { id: itemId },
            select: { sellerId: true },
        });

        if (!item) {
            throw new NotFoundException(`Item ${itemId} not found.`);
        }

        if (item.sellerId !== sellerId) {
            throw new ForbiddenException('You cannot modify another seller item.');
        }
    }

    async addImages(
        itemId: string,
        sellerId: string,
        files: Express.Multer.File[],
    ) {
        await this.assertSellerOwnsItem(itemId, sellerId);

        if (files.length === 0) {
            throw new BadRequestException('At least one image must be provided.');
        }

        const existingImages = await this.prisma.itemImage.findMany({
            where: { itemId },
            orderBy: { position: 'asc' },
            select: { position: true },
        });

        if (existingImages.length + files.length > MAX_ITEM_IMAGES) {
            throw new BadRequestException(`An item can have at most ${MAX_ITEM_IMAGES} images.`);
        }

        const imageDirectory = this.getItemImageDirectory(itemId);
        await mkdir(imageDirectory, { recursive: true });

        const nextPosition =
            existingImages.length === 0
                ? 0
                : existingImages[existingImages.length - 1].position + 1;

        const pendingImages = files.map((file, index) => {
            const extension = ITEM_IMAGE_EXTENSIONS[file.mimetype];

            if (!extension) {
                throw new BadRequestException('Unsupported image type.');
            }

            const filename = `${randomUUID()}${extension}`;

            return {
                itemId,
                url: `/uploads/items/${itemId}/${filename}`,
                position: nextPosition + index,
                path: join(imageDirectory, filename),
                buffer: file.buffer,
            };
        });

        try {
            await Promise.all(
                pendingImages.map((image) => writeFile(image.path, image.buffer, { flag: 'wx' })),
            );

            return await this.prisma.$transaction(
                pendingImages.map((image) =>
                    this.prisma.itemImage.create({
                        data: {
                            itemId: image.itemId,
                            url: image.url,
                            position: image.position,
                        },
                        select: this.itemImageSelect,
                    }),
                ),
            );
        } catch (error) {
            await Promise.all(
                pendingImages.map((image) => rm(image.path, { force: true })),
            );
            throw error;
        }
    }

    async deleteImage(itemId: string, imageId: string, sellerId: string) {
        await this.assertSellerOwnsItem(itemId, sellerId);

        const image = await this.prisma.itemImage.findFirst({
            where: { id: imageId, itemId },
            select: { id: true, url: true },
        });

        if (!image) {
            throw new NotFoundException(`Image ${imageId} not found for item ${itemId}.`);
        }

        await this.prisma.itemImage.delete({
            where: { id: image.id },
        });

        const imagePath = join(this.getItemImageDirectory(itemId), basename(image.url));

        try {
            await rm(imagePath, { force: true });
        } catch (error) {
            this.logger.warn(`Failed to remove item image file ${imagePath}: ${String(error)}`);
        }
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

        if (Object.keys(data).length === 0 && dto.endDate === undefined) {
            throw new BadRequestException('At least one field must be provided.');
        }

        return this.prisma.$transaction(async (tx) => {
            if (dto.endDate !== undefined) {
                await tx.auction.updateMany({
                    where: { itemId },
                    data: { endDate: new Date(dto.endDate) },
                });
            }

            if (Object.keys(data).length === 0) {
                return tx.item.findUnique({ where: { id: itemId }, select: this.itemSummarySelect });
            }

            return tx.item.update({
                where: { id: itemId },
                data,
                select: this.itemSummarySelect,
            });
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

        const imageDirectory = this.getItemImageDirectory(itemId);

        try {
            await rm(imageDirectory, { recursive: true, force: true });
        } catch (error) {
            this.logger.warn(`Failed to remove item image directory ${imageDirectory}: ${String(error)}`);
        }
    }

    private getItemImageDirectory(itemId: string) {
        return join(process.cwd(), 'uploads', 'items', itemId);
    }
}
