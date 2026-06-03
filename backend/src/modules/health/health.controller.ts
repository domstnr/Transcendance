import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus'
import { PrismaHealthIndicator } from './prisma.health'

@Controller('health')
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly prismaHealth: PrismaHealthIndicator,
		private readonly memory: MemoryHealthIndicator,
		private readonly disk: DiskHealthIndicator,	
	) {}

	@Get()
	@HealthCheck()
	check() {
		return this.health.check([
			() => this.prismaHealth.isHealthy('database'),
			() => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
			() => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9}),
		])
	}
}