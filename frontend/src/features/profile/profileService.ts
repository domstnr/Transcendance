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

export async function uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    try {
        const response = await httpClient.patch<{ message: string; avatarUrl: string }>(
            '/user/me/avatar',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: upload failed')
    }
}

export async function setupTwoFactor() {
    try {
        const response = await httpClient.post<{ qrCodeDataUrl: string }>('/auth/2fa/setup')
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: 2FA setup failed')
    }
}

export async function enableTwoFactor(code: string) {
    try {
        const response = await httpClient.post<{ message: string }>('/auth/2fa/enable', { code })
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: 2FA activation failed')
    }
}

export async function disableTwoFactor() {
    try {
        const response = await httpClient.post<{ message: string }>('/auth/2fa/disable')
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: 2FA disable failed')
    }
}
