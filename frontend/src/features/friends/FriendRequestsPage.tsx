import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPendingRequests, acceptFriendRequest, declineFriendRequest } from './friendsService'
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
            setRequests(prev => prev.filter(r => r.from.id !== senderId))
        } catch {
            setError('Failed to accept request')
        }
    }

    const handleDecline = async (senderId: string) => {
        try {
            await declineFriendRequest(senderId)
            setRequests(prev => prev.filter(r => r.from.id !== senderId))
        } catch {
            setError('Failed to decline request')
        }
    }

    if (loading) return <p>Loading requests...</p>

    return (
        <section>
            <h1>Friend Requests</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <Link to="/friends">← Back to Friends</Link>
            {requests.length === 0 ? (
                <p>No pending friend requests.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {requests.map(req => (
                        <li key={req.requestId}>
                            <strong>{req.from.username}</strong>
                            {' wants to be your friend '}
                            <button type="button" onClick={() => void handleAccept(req.from.id)}>
                                Accept
                            </button>
                            {' '}
                            <button type="button" onClick={() => void handleDecline(req.from.id)}>
                                Decline
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default FriendRequestsPage
