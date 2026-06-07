import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { acceptFriendRequest, declineFriendRequest, getPendingRequests } from './friendsService'
import type { FriendRequest } from './types'

function FriendRequestsPage() {
    const [requests, setRequests] = useState<FriendRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getPendingRequests()
            .then(setRequests)
            .catch(() => setError('Failed to load requests'))
            .finally(() => setLoading(false))
    }, [])

    const handleAccept = async (senderId: string) => {
        try {
            await acceptFriendRequest(senderId)
            setRequests(prev => prev.filter(request => request.from.id !== senderId))
        } catch {
            setError('Failed to accept request')
        }
    }

    const handleDecline = async (senderId: string) => {
        try {
            await declineFriendRequest(senderId)
            setRequests(prev => prev.filter(request => request.from.id !== senderId))
        } catch {
            setError('Failed to decline request')
        }
    }

    if (loading) return <p>Loading requests...</p>

    return (
      <section className="friends-section">
        <h1 className="friends-title">Friend Requests</h1>

        <nav className="friends-nav">
          <Link to="/friends" className="friends-link">Back to Friends</Link>
          <span className="friends-sep">|</span>
          <Link to="/friends/search" className="friends-link">Find Friends</Link>
        </nav>

        {error ? <p className="alert alert-danger error-message" role="alert">{error}</p> : null}

        {requests.length === 0 ? (
          <div className="empty-state">
            <p>No pending friend requests.</p>
          </div>
        ) : (
          <div className="friends-list">
            <ul>
              {requests.map(request => (
                <li key={request.requestId} className="friend-item">
                  <strong>{request.from.username}</strong>
                  <small>sent you a friend request</small>
                  <div className="friend-actions">
                    <button
                      type="button"
                      className="btn item-button item-button--primary"
                      onClick={() => void handleAccept(request.from.id)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="btn item-button item-button--danger"
                      onClick={() => void handleDecline(request.from.id)}
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    )
}

export default FriendRequestsPage
