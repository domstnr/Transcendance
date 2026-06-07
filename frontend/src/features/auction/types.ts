export type AuctionStatus = 'OPEN' | 'CLOSED'

export type PublicBidder = {
  id: string
  username: string
  avatarUrl: string | null
}

export type AuctionState = {
  id: string
  itemId: string
  startPrice: number
  currentPrice: number
  status: AuctionStatus
  version: number
  endDate: string
  highestBidder: PublicBidder | null
}

export type GetAuctionResponse = {
  auction: AuctionState
}

export type BidHistoryEntry = {
  id: string
  amount: number
  createdAt: string
  bidder: PublicBidder
}

export type GetBidHistoryResponse = {
  auctionId: string
  totalBids: number
  bids: BidHistoryEntry[]
}

export type PlaceBidRequest = {
  amount: number
}

export type PlaceBidResponse = {
  status: 'success'
  message: string
  auction: AuctionState
  bid: BidHistoryEntry
}

export type BidUpdatedEvent = {
  newPrice: number
  bidderId: string | null
  bidderName: string
  status: AuctionStatus
  version: number
  endDate: string
  timestamp: string
}
