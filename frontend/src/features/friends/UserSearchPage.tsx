import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { searchUsers, sendFriendRequest } from './friendsService'
import type { UserSearchResult } from './types'

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

function UserSearchPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<UserSearchResult[]>([])
    const [sent, setSent] = useState<Set<string>>(new Set())
    const [error, setError] = useState('')
    const [searching, setSearching] = useState(false)

    const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const trimmedQuery = query.trim()

        if (trimmedQuery.length < 2) {
            setError('Enter at least 2 characters.')
            return
        }

        setSearching(true)
        setError('')

        try {
            const data = await searchUsers(trimmedQuery)
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
      <section className="friends-section">
        <h1 className="friends-title">Find Friends</h1>

        <nav className="friends-nav">
          <Link to="/friends" className="friends-link">Back to Friends</Link>
          <span className="friends-sep">|</span>
          <Link to="/friends/requests" className="friends-link">Pending Requests</Link>
        </nav>

        <form className="friend-search-form" onSubmit={handleSearch} noValidate>
          <input
            type="text"
            className="form-control"
            placeholder="Search by username"
            value={query}
            onChange={event => setQuery(event.target.value)}
            minLength={2}
          />
          <button type="submit" className="btn item-button item-button--primary" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error ? <p className="alert alert-danger error-message" role="alert">{error}</p> : null}

        {results.length > 0 ? (
          <div className="friends-list">
            <ul>
              {results.map(user => (
                <li key={user.id} className="friend-item">
                  <Avatar username={user.username} avatarUrl={user.avatarUrl} />
                  <span className={user.isOnline ? 'status online' : 'status offline'}>●</span>
                  <strong>{user.username}</strong>
                  {sent.has(user.id) ? (
                    <small>Request sent</small>
                  ) : null}
                  <button
                    type="button"
                    className="btn item-button item-button--primary"
                    onClick={() => void handleAdd(user.id)}
                    disabled={sent.has(user.id)}
                  >
                    {sent.has(user.id) ? 'Sent' : 'Add Friend'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    )
}

export default UserSearchPage
