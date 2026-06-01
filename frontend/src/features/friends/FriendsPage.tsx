import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFriends, removeFriend } from './friendsService'
import type { Friend } from './types'

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

function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getFriends()
            .then(setFriends)
            .catch(() => setError('Failed to load friends'))
            .finally(() => setLoading(false))
    }, [])

    const handleRemove = async (friendId: string) => {
        try {
            await removeFriend(friendId)
            setFriends(prev => prev.filter(f => f.id !== friendId))
        } catch {
            setError('Failed to remove friend')
        }
    }

    if (loading) return <p>Loading friends...</p>

    return (
        <section>
            <h1>Friends ({friends.length})</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <nav>
                <Link to="/friends/requests">Pending Requests</Link>
                {' | '}
                <Link to="/friends/search">Find Friends</Link>
            </nav>
            {friends.length === 0 ? (
                <p>No friends yet. <Link to="/friends/search">Find people to add!</Link></p>
            ) : (
                <div style={{ display: 'inline-block', textAlign: 'left' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {friends.map(friend => (
                        <li key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Avatar username={friend.username} avatarUrl={friend.avatarUrl} />
                            <span style={{ color: friend.isOnline ? 'green' : 'gray' }}>●</span>
                            <strong>{friend.username}</strong>
                            {' '}
                            {!friend.isOnline && friend.lastSeen && (
                                <small>last seen {new Date(friend.lastSeen).toLocaleString()}</small>
                            )}
                            {' '}
                            <button type="button" onClick={() => void handleRemove(friend.id)}>
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
                </div>
            )}
        </section>
    )
}

export default FriendsPage
