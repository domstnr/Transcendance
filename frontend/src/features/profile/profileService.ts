import httpClient, { extractHttpErrorMessage } from '../../shared/api/httpClient'
import type { UpdateProfileRequest, UpdateProfileResponse } from './types'

export async function updateCurrentUser(data: UpdateProfileRequest) {
    try {
        const response = await httpClient.patch<UpdateProfileResponse>('/user/me', data)
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: request failed')
    }
}
