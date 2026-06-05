export type ServiceStatus = {
	status: 'up' | 'down'
}

export type HealthResponse = {
	status: 'ok' | 'error'
	info: Record<string, ServiceStatus>
	error: Record<string, ServiceStatus>
}