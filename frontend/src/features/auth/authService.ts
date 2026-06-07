import httpClient, { extractHttpErrorMessage } from '../../shared/api/httpClient'
import type { 
    ChangePasswordRequest,
    ChangePasswordResponse,
    LoginRequest,
    LoginResponse,
    LoginSuccessResponse,
    RegisterRequest,
    RegisterResponse 
} from './types'

export async function login(data: LoginRequest): Promise<LoginResponse> {
    try {
        const response = await httpClient.post<LoginResponse>('/auth/login', data)
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: request failed')
    }
}

export async function verifyTwoFactorLogin(tempToken: string, code: string): Promise<LoginSuccessResponse> {
    try {
        const response = await httpClient.post<LoginSuccessResponse>('/auth/2fa/verify-login', {
            tempToken,
            code,
        })
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: 2FA verification failed')
    }
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
        const response = await httpClient.post<RegisterResponse>('/auth/register', data)
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: request failed')
    }
}

export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
        const response = await httpClient.patch<ChangePasswordResponse>('/auth/password', data)
        return response.data
    } catch (error) {
        throw new Error(extractHttpErrorMessage(error) ?? 'error: request failed')
    }
}
