import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getMessages } from './chatService'
import { useChat } from './useChat'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
    return (
        <span style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#ccc', alignItems: 'center', justifyContent: 'center', fontSize: 13, verticalAlign: 'middle' }}>
            {avatarUrl
                ? <img src={`${API_URL}${avatarUrl}`} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : username[0].toUpperCase()
            }
        </span>
    )
}

function ChatPage() {
    const { auctionId } = useParams<{ auctionId: string }>()
    const { user } = useAuth()
    const [input, setInput] = useState('')
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [accessError, setAccessError] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    const { messages, setMessages, isConnected, error, sendMessage } = useChat(auctionId!)

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await getMessages(auctionId!)
                setMessages(data.message.reverse())
            } catch (err) {
                setAccessError(err instanceof Error ? err.message : 'Access denied')
            } finally {
                setIsLoadingHistory(false)
            }
        }

        void loadHistory()
    }, [auctionId, setMessages])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const trimmed = input.trim()
        if (!trimmed) return
        sendMessage(trimmed)
        setInput('')
    }

    if (accessError ?? error) {
        return <p>{accessError ?? error}</p>
    }

    return (
        <section>
            <h1>Auction chat</h1>
            <p>{isConnected ? 'Connected' : 'Connecting...'}</p>

            <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px' }}>
                {isLoadingHistory ? (
                    <p>Loading messages...</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar username={msg.sender.username} avatarUrl={msg.sender.avatarUrl} />
                            <span>
                                <strong>{msg.sender.username}</strong>
                                {user?.userId === msg.senderId ? ' (you)' : ''}
                                {': '}
                                {msg.content}
                                <span style={{ marginLeft: '8px', fontSize: '0.75em', color: '#888' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                />
                <button type="submit" disabled={!isConnected || !input.trim()}>
                    Send
                </button>
            </form>
        </section>
    )
}

export default ChatPage
