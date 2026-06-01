export type AuthUser = {
    userId: string
    username: string
    avatarUrl: string | null
}

export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    status: string
    message: string
    user: AuthUser
}

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
