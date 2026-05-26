export type ChatMessage = {
    id: string
    content: string
    auctionId: string
    senderId: string
    createdAt: string
    sender: {
        username: string
    }
}

export type GetMessagesResponse = {
    message: ChatMessage[]
    nextCursor: string | null
}
