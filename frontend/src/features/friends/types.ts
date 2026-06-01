export type Friend = {
    id: string
    username: string
    isOnline: boolean
    lastSeen: string | null
    avatarUrl: string | null
}

export type FriendRequest = {
    requestId: string
    from: { id: string; username: string }
    createdAt: string
}

export type SentRequest = {
    requestId: string
    to: { id: string; username: string }
    createdAt: string
}

export type UserSearchResult = {
    id: string
    username: string
    isOnline: boolean
    avatarUrl: string | null
}
