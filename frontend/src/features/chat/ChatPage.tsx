import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getMessages } from './chatService'
import { useChat } from './useChat'

const ASSET_URL = ''

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
    return (
        <span className="friend-avatar chat-avatar">
            {avatarUrl
                ? <img src={`${ASSET_URL}${avatarUrl}`} alt={username} />
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
        return (
            <section className="chat-section">
                <p className="alert alert-danger error-message" role="alert">{accessError ?? error}</p>
            </section>
        )
    }

    return (
        <section className="chat-section">
            <header className="chat-header">
                <div>
                    <h1 className="chat-title">Auction Chat</h1>
                    <p className="chat-subtitle">Room for this listing auction</p>
                </div>
                <span className={isConnected ? 'chat-status chat-status--online' : 'chat-status'}>
                    <span className={isConnected ? 'status online' : 'status offline'}>●</span>
                    {isConnected ? 'Connected' : 'Connecting...'}
                </span>
            </header>

            <div className="chat-messages" aria-live="polite">
                {isLoadingHistory ? (
                    <p className="empty-state">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <p className="empty-state">No messages yet.</p>
                ) : (
                    messages.map((msg) => {
                        const isOwnMessage = user?.userId === msg.senderId

                        return (
                        <article key={msg.id} className={isOwnMessage ? 'chat-message chat-message--own' : 'chat-message'}>
                            <Avatar username={msg.sender.username} avatarUrl={msg.sender.avatarUrl} />
                            <div className="chat-bubble">
                                <div className="chat-message-meta">
                                    <strong>{msg.sender.username}</strong>
                                    {isOwnMessage ? <span>you</span> : null}
                                </div>
                                <p>{msg.content}</p>
                                <time dateTime={msg.createdAt}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </time>
                            </div>
                        </article>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <form className="chat-form" onSubmit={handleSubmit}>
                <input
                    className="form-control"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                />
                <button className="btn item-button item-button--primary" type="submit" disabled={!isConnected || !input.trim()}>
                    Send
                </button>
            </form>
        </section>
    )
}

export default ChatPage
