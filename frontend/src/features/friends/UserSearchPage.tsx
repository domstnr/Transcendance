import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { searchUsers, sendFriendRequest } from './friendsService'
import type { UserSearchResult } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
    return (
        <span style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#ccc', alignItems: 'center', justifyContent: 'center', fontSize: 14, verticalAlign: 'middle' }}>
            {avatarUrl
                ? <img src={`${API_URL}${avatarUrl}`} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : username[0].toUpperCase()
            }
        </span>
    )
}

function UserSearchPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<UserSearchResult[]>([])
    const [sent, setSent] = useState<Set<string>>(new Set())
    const [error, setError] = useState('')
    const [searching, setSearching] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim().length < 2) return
        setSearching(true)
        setError('')
        try {
            const data = await searchUsers(query.trim())
            setResults(data)
        } catch {
            setError('Search failed')
        } finally {
            setSearching(false)
        }
    }

    const handleAdd = async (userId: string) => {
        try {
            await sendFriendRequest(userId)
            setSent(prev => new Set(prev).add(userId))
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status === 409) {
                const backendMsg = err.response.data?.message
                setError(backendMsg === 'Friend request already pending'
                    ? 'You already sent a request to this user.'
                    : 'You are already friends with this user.')
            } else {
                setError('Failed to send request')
            }
        }
    }

    return (
        <section>
            <h1>Find Friends</h1>
            <Link to="/friends">← Back to Friends</Link>
            <form onSubmit={e => void handleSearch(e)}>
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    minLength={2}
                />
                <button type="submit" disabled={searching}>
                    {searching ? 'Searching...' : 'Search'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {results.length > 0 && (
                <div style={{ display: 'inline-block', textAlign: 'left' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {results.map(user => (
                        <li key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Avatar username={user.username} avatarUrl={user.avatarUrl} />
                            <span style={{ color: user.isOnline ? 'green' : 'gray' }}>●</span>
                            <strong>{user.username}</strong>
                            {' '}
                            {sent.has(user.id) ? (
                                <span>Request sent ✓</span>
                            ) : (
                                <button type="button" onClick={() => void handleAdd(user.id)}>
                                    Add Friend
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                </div>
            )}
        </section>
    )
}

export default UserSearchPage
