import httpClient, { extractHttpErrorMessage } from '../../shared/api/httpClient'
import type {
	GetAuctionResponse,
	GetBidHistoryResponse,
	PlaceBidRequest,
	PlaceBidResponse,
} from './types'

export async function getAuction(auctionId: string) {
	try {
		const response = await httpClient.get<GetAuctionResponse>(`/auctions/${auctionId}`)
		return response.data
	} catch (error) {
		throw new Error(extractHttpErrorMessage(error) ?? 'Failed to load auction.')
	}
}

export async function getBidHistory(auctionId: string) {
	try {
		const response = await httpClient.get<GetBidHistoryResponse>(
			`/auctions/${auctionId}/history`,
		)
		return response.data
	} catch (error) {
		throw new Error(extractHttpErrorMessage(error) ?? 'Failed to load bid history.')
	}
}

export async function placeBid(auctionId: string, amount: number) {
	try {
		const payload: PlaceBidRequest = { amount }
		const response = await httpClient.post<PlaceBidResponse>(
			`/auctions/${auctionId}/bids`,
			payload,
		)
		return response.data
	} catch (error) {
		throw new Error(extractHttpErrorMessage(error) ?? 'Failed to place bid.')
	}
}