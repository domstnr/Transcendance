import type { ItemCategory } from './categoryOptions'

export type AuctionSummary = {
  id: string
  startPrice: number
  currentPrice: number
  status: string
  endDate: string
} | null

export type ItemSummary = {
  id: string
  sellerId: string
  title: string
  description: string
  condition: number
  category: ItemCategory
  createdAt: string
  updatedAt: string
  auction: AuctionSummary
}

export type GetMyItemsResponse = {
  items: ItemSummary[]
}

export type CreateItemRequest = {
  title: string
  description: string
  condition: number
  category: ItemCategory
  startPrice: number
  endDate: string
}

export type UpdateItemRequest = {
  title?: string
  description?: string
  condition?: number
  category?: ItemCategory
}

export type CreateItemResponse = {
  message: string
  item: {
    id: string
    sellerId: string
    title: string
    description: string
    condition: number
    category: ItemCategory
    createdAt: string
    updatedAt: string
    auction: {
      id: string
      startPrice: number
      currentPrice: number
      status: string
      endDate: string
    }
  }
}

export type UpdateItemResponse = {
  message: string
  item: ItemSummary
}

export type DeleteItemResponse = {
  message: string
}
