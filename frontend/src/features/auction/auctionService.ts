import httpClient, { extractHttpErrorMessage } from '../../shared/api/httpClient'

export async function placeBid(auctionId: string, amount: number) {
	try {
		const response = await httpClient.post<{ status: string; message: string }>(`/auctions/${auctionId}/bids`, { amount },)
		return response.data
	} catch (error) {
		throw new Error(extractHttpErrorMessage(error) ?? 'Failed to place bid.')
	}
}