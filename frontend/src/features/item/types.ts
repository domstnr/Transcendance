import type { ItemCategory } from './categoryOptions'

export type AuctionSummary = {
  id: string
  startPrice: number
  currentPrice: number
  status: string
  endDate: string
} | null

export type ItemImage = {
  id: string
  url: string
  position: number
}

export type ItemSeller = {
  id: string
  username: string
  avatarUrl: string | null
  isOnline: boolean
}

type ItemBase = {
  id: string
  sellerId: string
  title: string
  description: string
  condition: number
  category: ItemCategory
  createdAt: string
  updatedAt: string
}

export type ItemSummary = ItemBase & {
  images: ItemImage[]
  auction: AuctionSummary
}

export type ItemDetails = ItemBase & {
  seller: ItemSeller
  images: ItemImage[]
  auction: AuctionSummary
}

export type GetMyItemsResponse = {
  items: ItemSummary[]
}

export type GetItemResponse = {
  item: ItemDetails
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
  item: ItemSummary
}

export type UpdateItemResponse = {
  message: string
  item: ItemSummary
}

export type DeleteItemResponse = {
  message: string
}

export type UploadItemImagesResponse = {
  message: string
  images: ItemImage[]
}

export type DeleteItemImageResponse = {
  message: string
}
