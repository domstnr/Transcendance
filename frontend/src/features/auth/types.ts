export type AuthUser = {
    id: string
    username: string
}

export type TokenPair = {
    accessToken: string
    refreshToken: string
}

export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    status: string
    message: string
    user: AuthUser
    tokens: TokenPair
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

export type RefreshTokenRequest = {
    refreshToken: string
}

export type RefreshTokenResponse = {
    status: string
    message: string
    tokens: TokenPair
}
