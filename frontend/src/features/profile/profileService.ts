import api from '../../shared/api/api'
import type { UpdateProfileRequest, UpdateProfileResponse } from './types'

export async function updateCurrentUser(data: UpdateProfileRequest) {
    const response = await api.patch<UpdateProfileResponse>('/user/me', data)
    return response.data
}
