import httpClient, { extractHttpErrorMessage } from '../../shared/api/httpClient'

export type AuctionState = {
	id: string
	itemId: string
	sellerId: string
	startPrice: number
	currentPrice: number
	highestBidderId: string | null
	highestBidderName: string | null
	status: 'OPEN' | 'CLOSED'
	version: number
	endDate: string
}

export async function getAuction(auctionId: string): Promise<AuctionState | null> {
	try {
		const response = await httpClient.get<AuctionState | null>(`/auctions/${auctionId}`)
		return response.data
	} catch (error) {
		throw new Error(extractHttpErrorMessage(error) ?? 'Failed to load auction.')
	}
}

export async function placeBid(auctionId: string, amount: number) {
	try {
		const response = await httpClient.post<{ status: string; message: string }>(`/auctions/${auctionId}/bids`, { amount },)
		return response.data
	} catch (error) {
		throw new Error(extractHttpErrorMessage(error) ?? 'Failed to place bid.')
	}
}
