import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'

@Injectable()
export class ApiKeyGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const key = request.headers['x-api-key']
		if (!key) throw new UnauthorizedException('API key missing')
		
		const apiKey = await this.prisma.apiKey.findUnique({ where: { key } })
		if (!apiKey) throw new UnauthorizedException('Invalid API key')
		
		request.user = { userId: apiKey.userId }
		
		return true
	}
}