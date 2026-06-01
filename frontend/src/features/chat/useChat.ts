import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ChatMessage } from './types'

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function useChat(auctionId: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        const socket = io(`${SOCKET_URL}/chat`, {
            withCredentials: true,
        })

        socketRef.current = socket

        socket.on('connect', () => {
            setError(null)
            setIsConnected(true)
            socket.emit('join_auction', { auctionId }, (response: { event: string; data: { message?: string } }) => {
                if (response.event === 'exception') {
                    setError(response.data.message ?? 'Could not join auction chat')
                }
            })
        })

        socket.on('new_message', (message: ChatMessage) => {
            setMessages((prev) => [...prev, message])
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
        })

        socket.on('connect_error', () => {
            setError('Connection failed. Are you logged in?')
        })

        return () => {
            socket.disconnect()
        }
    }, [auctionId])

    function sendMessage(content: string) {
        if (!socketRef.current || !isConnected) return
        socketRef.current.emit('send_message', { auctionId, content })
    }

    return { messages, setMessages, isConnected, error, sendMessage }
}
