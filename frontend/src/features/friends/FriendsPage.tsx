import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFriends, removeFriend } from './friendsService'
import type { Friend } from './types'

const ASSET_URL = ''

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
    return (
        <span className="friend-avatar">
            {avatarUrl
                ? <img src={`${ASSET_URL}${avatarUrl}`} alt={username} />
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
            setFriends(prev => prev.filter(friend => friend.id !== friendId))
        } catch {
            setError('Failed to remove friend')
        }
    }

    if (loading) return <p>Loading friends...</p>

    return (
      <section className="friends-section">
        <h1 className="friends-title">Friends ({friends.length})</h1>

        {error ? <p className="alert alert-danger error-message" role="alert">{error}</p> : null}

        <nav className="friends-nav">
          <Link to="/friends/requests" className="friends-link">Pending Requests</Link>
          <span className="friends-sep">|</span>
          <Link to="/friends/search" className="friends-link">Find Friends</Link>
        </nav>

        <div className="friends-list">
          {friends.length === 0 ? (
            <div className="empty-state">
              <p>No friends yet.</p>
            </div>
          ) : (
            <ul>
              {friends.map((friend) => (
                <li key={friend.id} className="friend-item">
                  <Avatar username={friend.username} avatarUrl={friend.avatarUrl} />
                  <span className={friend.isOnline ? 'status online' : 'status offline'}>●</span>
                  <Link className="friend-name-link" to={`/user/${friend.id}`}>
                    {friend.username}
                  </Link>
                  {!friend.isOnline && friend.lastSeen ? (
                    <small>last seen {new Date(friend.lastSeen).toLocaleString()}</small>
                  ) : null}
                  <button
                    type="button"
                    className="btn item-button item-button--danger"
                    onClick={() => void handleRemove(friend.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    )
}

export default FriendsPage
