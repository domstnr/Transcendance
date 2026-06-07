import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemService } from './item.service';
import { UpdateItemDto } from './dto/update-item.dto';

const ALLOWED_ITEM_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

@Controller('item')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Get()
    async getItems() {
        const items = await this.itemService.findAll();
        return { items };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getCurrentUserItems(@Req() request: { user: { userId: string } }) {
        const items = await this.itemService.findBySellerId(request.user.userId);
        return { items };
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createItem(
        @Body() createItemDto: CreateItemDto,
        @Req() request: { user: { userId: string } },
    ) {
        const item = await this.itemService.createItem(request.user.userId, createItemDto);

        return {
            message: 'Listing created successfully',
            item,
        };
    }

    @Get('seller/:userId')
    async getSellerItems(@Param('userId') userId: string) {
        const items = await this.itemService.findBySellerId(userId);
        return { items };
    }

    @Get(':id')
    async getItem(@Param('id') id: string) {
        const item = await this.itemService.findById(id);
        return { item };
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/images')
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            storage: memoryStorage(),
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter: (_request, file, callback) => {
                if (!ALLOWED_ITEM_IMAGE_TYPES.has(file.mimetype)) {
                    callback(
                        new BadRequestException('Only JPEG, PNG and WebP images are allowed.'),
                        false,
                    );
                    return;
                }

                callback(null, true);
            },
        }),
    )
    async uploadImages(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Req() request: { user: { userId: string } },
    ) {
        const images = await this.itemService.addImages(
            id,
            request.user.userId,
            files ?? [],
        );

        return {
            message: 'Item images uploaded successfully',
            images,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/images/:imageId')
    async deleteImage(
        @Param('id') id: string,
        @Param('imageId') imageId: string,
        @Req() request: { user: { userId: string } },
    ) {
        await this.itemService.deleteImage(id, imageId, request.user.userId);

        return {
            message: 'Item image deleted successfully',
        };
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateItem(
        @Param('id') id: string,
        @Body() updateItemDto: UpdateItemDto,
        @Req() request: { user: { userId: string } },
    ) {
        const item = await this.itemService.updateOwnedItem(id, request.user.userId, updateItemDto);
        return {
            message: 'Item updated successfully',
            item,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteItem(
        @Param('id') id: string,
        @Req() request: { user: { userId: string } },
    ) {
        await this.itemService.deleteOwnedItem(id, request.user.userId);
        return {
            message: 'Item deleted successfully',
        };
    }
}
