import httpClient, { extractHttpErrorMessage } from '../../shared/api/httpClient'
import type {
  CreateItemRequest,
  CreateItemResponse,
  DeleteItemImageResponse,
  DeleteItemResponse,
  GetItemResponse,
  GetMyItemsResponse,
  UploadItemImagesResponse,
  UpdateItemRequest,
  UpdateItemResponse,
} from './types'

export async function getItem(itemId: string) {
  try {
    const response = await httpClient.get<GetItemResponse>(`/item/${itemId}`)
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to load item.')
  }
}

export async function getAllItems() {
  try {
    const response = await httpClient.get<GetMyItemsResponse>('/item')
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to load items.')
  }
}

export async function getCurrentUserItems() {
  try {
    const response = await httpClient.get<GetMyItemsResponse>('/item/me')
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to load your items.')
  }
}

export async function getOtherUserItems(userId: string) {
  try {
    const response = await httpClient.get<GetMyItemsResponse>(`/item/seller/${userId}`)
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to load items.')
  }
}

export async function createItem(data: CreateItemRequest) {
  try {
    const response = await httpClient.post<CreateItemResponse>('/item', data)
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to create item.')
  }
}

export async function updateItem(itemId: string, data: UpdateItemRequest) {
  try {
    const response = await httpClient.patch<UpdateItemResponse>(`/item/${itemId}`, data)
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to update item.')
  }
}

export async function deleteItem(itemId: string) {
  try {
    const response = await httpClient.delete<DeleteItemResponse>(`/item/${itemId}`)
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to delete item.')
  }
}

export async function uploadItemImages(itemId: string, files: File[]) {
  const formData = new FormData()

  for (const file of files) {
    formData.append('images', file)
  }

  try {
    const response = await httpClient.post<UploadItemImagesResponse>(
      `/item/${itemId}/images`,
      formData,
    )
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to upload item images.')
  }
}

export async function deleteItemImage(itemId: string, imageId: string) {
  try {
    const response = await httpClient.delete<DeleteItemImageResponse>(
      `/item/${itemId}/images/${imageId}`,
    )
    return response.data
  } catch (error) {
    throw new Error(extractHttpErrorMessage(error) ?? 'Failed to delete item image.')
  }
}