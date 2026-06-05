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
    <section className="friends-section">
      <h1 className="friends-title">Friends (3)</h1>

      <p className="error-message">Error message here</p>

      <nav className="friends-nav">
        <a href="#" className="friends-link">Pending Requests</a>
        <span className="friends-sep">|</span>
        <a href="#" className="friends-link">Find Friends</a>
      </nav>

      <div className="friends-list">
        <ul>
          <li className="friend-item">
            <img src="https://via.placeholder.com/40" className="friend-avatar" />
            <span className="status online">●</span>
            <strong>JohnDoe</strong>
            <button className="item-button item-button--danger">Remove</button>
          </li>

          <li className="friend-item">
            <img src="https://via.placeholder.com/40" className="friend-avatar" />
            <span className="status offline">●</span>
            <strong>JaneSmith</strong>
            <small>last seen 07/08/2025 18:45</small>
            <button className="item-button item-button--danger">Remove</button>
          </li>

          <li className="friend-item">
            <img src="https://via.placeholder.com/40" className="friend-avatar" />
            <span className="status online">●</span>
            <strong>Mike42</strong>
            <button className="item-button item-button--danger">Remove</button>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default FriendsPage
