export type UpdateProfileRequest = {
    username?: string
    email?: string
}

export type UpdateProfileResponse = {
    message: string
    user: {
        userId: string
        username: string
        email: string
        createdAt: string
        updatedAt: string
    }
}
