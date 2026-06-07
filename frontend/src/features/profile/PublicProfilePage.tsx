import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import httpClient from '../../shared/api/httpClient'
import { useAuth } from '../auth/AuthContext'
import { getFriends, sendFriendRequest } from '../friends/friendsService'
import { ITEM_CATEGORY_LABELS } from '../item/categoryOptions'
import ItemThumbnail from '../item/ItemThumbnail'
import { getOtherUserItems } from '../item/itemService'
import type { ItemSummary } from '../item/types'
import type { PublicUser } from './types'

const ASSET_URL = ''

function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<PublicUser | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [items, setItems] = useState<ItemSummary[]>([])
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFriend, setIsFriend] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [friendError, setFriendError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const profileUserId = userId
    let isCurrent = true

    async function load() {
      try {
        setIsLoading(true)
        setProfileError(null)
        setItemsError(null)

        const [userResponse, itemsResponse, friends] = await Promise.all([
          httpClient.get<PublicUser>(`/user/${profileUserId}`),
          getOtherUserItems(profileUserId),
          getFriends(),
        ])

        if (!isCurrent) return

        setProfile(userResponse.data)
        setItems(itemsResponse.items)
        setIsFriend(friends.some((friend) => friend.id === profileUserId))
      } catch (error) {
        if (!isCurrent) return

        const message = error instanceof Error ? error.message : 'Failed to load profile.'
        setProfileError(message)
        setItemsError(message)
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      isCurrent = false
    }
  }, [userId])

  async function handleSendFriendRequest() {
    if (!userId) return

    setIsSendingRequest(true)
    setFriendError(null)

    try {
      await sendFriendRequest(userId)
      setRequestSent(true)
    } catch (error) {
      setFriendError(error instanceof Error ? error.message : 'Failed to send request.')
    } finally {
      setIsSendingRequest(false)
    }
  }

  if (isLoading) return <p>Loading profile...</p>
  if (profileError) return <p>{profileError}</p>
  if (!profile) return null

  const isOwnProfile = currentUser?.userId === profile.userId

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div>
          <h1>{profile.username}'s profile</h1>
          {profile.avatarUrl ? (
            <img
              src={`${ASSET_URL}${profile.avatarUrl}`}
              alt="Avatar"
              style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#ccc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
              {profile.username[0].toUpperCase()}
            </div>
          )}
          <p>
            <span style={{ color: profile.isOnline ? 'green' : 'gray' }}>●</span>
            {' '}{profile.isOnline ? 'Online' : 'Offline'}
          </p>
          {!isOwnProfile && (
            isFriend ? (
              <p>Already friends</p>
            ) : requestSent ? (
              <p>Friend request sent</p>
            ) : (
              <button
                type="button"
                className="btn item-button item-button--primary"
                onClick={() => void handleSendFriendRequest()}
                disabled={isSendingRequest}
              >
                {isSendingRequest ? 'Sending...' : 'Send friend request'}
              </button>
            )
          )}
          {friendError ? <p className="alert alert-danger error-message" role="alert">{friendError}</p> : null}
        </div>
      </div>

      <div className="profile-section-header">
        <h2>{profile.username}'s listings</h2>
      </div>

      {itemsError ? <p>{itemsError}</p> : null}

      {!itemsError ? (
        items.length > 0 ? (
          <div className="item-grid">
            {items.map((item) => (
              <article key={item.id} className="item-card">
                <Link to={`/item/${item.id}`} className="item-card-thumbnail-link">
                  <ItemThumbnail image={item.images[0]} title={item.title} />
                </Link>
                <div className="item-card-body">
                  <h3><Link to={`/item/${item.id}`}>{item.title}</Link></h3>
                  <p>{item.description}</p>
                </div>
                <div className="item-card-meta">
                  <span>Category: {ITEM_CATEGORY_LABELS[item.category]}</span>
                  <span>Condition: {item.condition}/10</span>
                  {item.auction ? (
                    <>
                      <span>Start price: ${item.auction.startPrice}</span>
                      <span>Current price: ${item.auction.currentPrice}</span>
                      <span>Status: {item.auction.status}</span>
                      <span>Ends: {new Date(item.auction.endDate).toLocaleString()}</span>
                    </>
                  ) : (
                    <span>No auction</span>
                  )}
                </div>
                {item.auction ? (
                  <div className="item-card-actions">
                    <Link className="btn button-secondary" to={`/auction/${item.auction.id}/chat`}>
  						Enter chat room
					</Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p>{profile.username} has no listings yet.</p>
        )
      ) : null}
    </section>
  )
}

export default PublicProfilePage
