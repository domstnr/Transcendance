import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { randomBytes} from 'crypto'

@Injectable()
export class ApiKeyService {
	constructor(private readonly prisma: PrismaService) {}

	async generate(userId: string, name: string) {
		const key = randomBytes(32).toString('hex')
		return this.prisma.apiKey.create({ data: { key, name, userId } })
	}

	async revoke(id: string, userId: string) {
		return this.prisma.apiKey.deleteMany({ where: { id, userId } })
	}

	async list(userId: string) {
		return this.prisma.apiKey.findMany({ where: { userId }, select: { id: true, name: true, createdAt: true} })
	}
}