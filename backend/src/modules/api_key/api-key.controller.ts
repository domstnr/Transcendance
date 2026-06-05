import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { ApiKeyService } from './api-key.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
	constructor(private readonly apiKeyService: ApiKeyService) {}

	@Get()
	list(@Request() req: any) {
		return this.apiKeyService.list(req.user.userId)
	}

	@Post()
	generate(@Request() req:any, @Body('name') name:string) {
		return this.apiKeyService.generate(req.user.userId, name)
	}

	@Delete(':id')
	revoke(@Param('id') id: string, @Request() req: any) {
		return this.apiKeyService.revoke(id, req.user.userId)
	}
}