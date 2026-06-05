import { Module } from '@nestjs/common'
import { ApiKeyService } from './api-key.service'
import { ApiKeyController } from './api-key.controller'
import { ApiKeyGuard } from './api-key.guard'

@Module({
	providers: [ApiKeyService, ApiKeyGuard],
	controllers: [ApiKeyController],
	exports: [ApiKeyGuard],
})
export class ApiKeyModule {}