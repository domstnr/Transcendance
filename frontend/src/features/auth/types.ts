export type AuthUser = {
    userId: string
    username: string
    avatarUrl: string | null
    twoFactorEnabled: boolean
}

export type LoginRequest = {
    email: string
    password: string
}

export type LoginSuccessResponse = {
    status: 'success'
    message: string
    user: AuthUser
}

export type LoginTwoFactorResponse = {
    status: '2fa_required'
    message: string
    tempToken: string
}

export type LoginResponse = LoginSuccessResponse | LoginTwoFactorResponse

export type RegisterRequest = {
    email: string
    username: string
    password: string
}

export type RegisterResponse = {
    message: string
    userId: string
}

export type ChangePasswordRequest = {
    currentPassword: string
    newPassword: string
}

export type ChangePasswordResponse = {
    message: string
}

export interface GitHubCodeRequest {
  code: string;
}

export interface GitHubCodeResponse {
  message: string;
}
