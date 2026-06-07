import { Body, Controller, Delete, Get, Param, Put, Post, Request, UseGuards } from '@nestjs/common'
import { ItemService } from './item.service'
import { ApiKeyGuard } from '../api_key/api-key.guard'
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiBody } from '@nestjs/swagger';


@Controller('public-api/item')
@UseGuards(ApiKeyGuard)
export class ItemPublicAPIController {
	constructor(private readonly itemService: ItemService) {}

	@Get()
	async getItems() {
		const items = await this.itemService.findAll();
		return { items };
	}

	@Get(':id')
	async getItem(@Param('id') id: string) {
		const item = await this.itemService.findById(id);
		return { item };
	}

	@Get('seller/:userId')
	async getSellerItems(@Param('userId') userId: string) {
		const items = await this.itemService.findBySellerId(userId);
		return { items };
	}

	@Post()
	@ApiBody({
		schema: {
			example: {
				title: 'Gaming Laptop',
				description: 'Barely used, runs everything smoothly',
				condition: 8,
				category: 'ELECTRONICS',
				startPrice: 500.00,
				endDate: '2026-12-31T00:00:00Z',
			},
		},
	})
	async createItem(@Body() CreateItemDto: CreateItemDto, @Request() req: any) {
		const item = await this.itemService.createItem(req.user.userId, CreateItemDto)
		return { message: 'Item created successfully', item }
	}

	@Put(':id')
	@ApiBody({
		schema: {
			example: {
				title: 'Updated title',
				description: 'Updated description',
				condition: 7,
				category: 'ELECTRONICS',
				endDate: '2026-12-31T00:00:00Z',
			},
		},
	})
	async updateItem(@Param('id') id: string, @Body() UpdateItemDto: UpdateItemDto, @Request() req: any) {
		const item = await this.itemService.updateOwnedItem(id, req.user.userId, UpdateItemDto)
		return { message: 'Item updated successfully', item }
	}

	@Delete(':id')
	async deleteItem(@Param('id') id: string, @Request() req: any) {
		await this.itemService.deleteOwnedItem(id, req.user.userId)
		return { message: 'Item deleted successfully' }
	}
}