import httpClient, { extractHttpErrorMessage } from '../../shared/api/httpClient'
import type { 
    ChangePasswordRequest,
    ChangePasswordResponse,
    LoginRequest,
    LoginResponse,
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
