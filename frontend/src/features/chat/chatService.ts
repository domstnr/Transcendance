import httpClient, { extractHttpErrorMessage } from '../../shared/api/httpClient'
import type { GetMessagesResponse } from './types'

export async function getMessages(auctionId: string, cursor?: string): Promise<GetMessagesResponse> {
    try {
        const params = cursor ? { cursor } : {}
        const response = await httpClient.get<GetMessagesResponse>(`/chat/${auctionId}/messages`, { params })
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'Failed to load messages')
    }
}
