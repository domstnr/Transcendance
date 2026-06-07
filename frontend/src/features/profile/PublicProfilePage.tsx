import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ITEM_CATEGORY_LABELS } from '../item/categoryOptions'
import { getOtherUserItems } from '../item/itemService'
import { placeBid } from '../auction/auctionService'
import type { ItemSummary } from '../item/types'
import type { PublicUser } from './types'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const ASSET_URL = ''

function PublicProfilePage() {
	const { userId } = useParams<{ userId: string }>()
	const { user: currentUser } = useAuth()
	const [profile, setProfile] = useState<PublicUser | null>(null)
	const [profileError, setProfileError] = useState<string | null>(null)
	const [items, setItems] = useState<ItemSummary[]>([])
	const [itemsError, setItemsError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [bidModalItem, setBidModalItem] = useState<ItemSummary | null>(null)
	const [bidAmount, setBidAmount] = useState('')
	const [bidError, setBidError] = useState<string | null>(null)
	const [isPlacingBid, setIsPlacingBid] = useState(false)
	const [bidSuccess, setBidSuccess] = useState<string | null>(null)

	useEffect(() => {
		if (!userId) return

		async function load() {
			try {
				const [userRes, itemsRes] = await Promise.all([fetch(`${API_URL}/user/${userId}`, { credentials: 'include' }), 
					getOtherUserItems(userId!),
				])

				if (!userRes.ok) {
					setProfileError('User not found.')
				} else {
					const data = await userRes.json() as PublicUser
					setProfile(data)
				}

				setItems(itemsRes.items)
			} catch {
				setItemsError('Failed to load profile.')
			} finally {
				setIsLoading(false)
			}
		}
		void load()
	}, [userId])

	async function handlePlaceBid() {
		if (!bidModalItem?.auction) return
		setBidError(null)
		setBidSuccess(null)

		const amount = Number(bidAmount)
		if (!Number.isFinite(amount) || amount <= 0) {
			setBidError('Enter a valid amount greater than 0.')
			return
		}
		
		if (amount <= bidModalItem.auction.currentPrice) {
			setBidError(`Your bid must be higher than the current price (${bidModalItem.auction.currentPrice}).`)
			return
		}

		try {
			setIsPlacingBid(true)
			await placeBid(bidModalItem.auction.id, amount)
			setBidSuccess('Bid placed successfully !')
			setBidAmount('')
		} catch (error) {
			setBidError(error instanceof Error ? error.message : 'Failed to place bid.')
		} finally {
			setIsPlacingBid(false)
		}
	}

	function openBidModal(item: ItemSummary) {
		setBidModalItem(item)
		setBidAmount('')
		setBidError(null)
		setBidSuccess(null)
	}

	function closeBidModal() {
		if (isPlacingBid) return
		setBidModalItem(null)
		setBidError(null)
		setBidSuccess(null)
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
					<div className="item-card-body">
					<h3>{item.title}</h3>
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
						{!isOwnProfile && item.auction.status === 'OPEN' ? (
						<button type="button" onClick={() => openBidModal(item)}>
							Place Bid
						</button>
						) : null}
						<Link to={`/auction/${item.auction.id}/chat`}>Enter chat room</Link>
					</div>
					) : null}
				</article>
				))}
			</div>
			) : (
			<p>{profile.username} has no listings yet.</p>
			)
		) : null}

		{bidModalItem ? (
			<div className="modal-backdrop" role="presentation" onClick={closeBidModal}>
			<div
				className="modal-panel"
				role="dialog"
				aria-modal="true"
				aria-labelledby="bid-modal-title"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
				<h2 id="bid-modal-title">Place a bid on "{bidModalItem.title}"</h2>
				<button
					type="button"
					onClick={closeBidModal}
					disabled={isPlacingBid}
					style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
					aria-label="Close"
				>
					×
				</button>
				</div>
				<div className="modal-form">
				<p>Current price: ${bidModalItem.auction?.currentPrice}</p>
				<label>
					Your bid
					<input
					type="number"
					min="0.01"
					step="0.01"
					value={bidAmount}
					onChange={(e) => setBidAmount(e.target.value)}
					disabled={isPlacingBid}
					/>
				</label>
				{bidError ? <p style={{ color: 'red' }}>{bidError}</p> : null}
				{bidSuccess ? <p style={{ color: 'green' }}>{bidSuccess}</p> : null}
				<div className="modal-actions">
					<button type="button" onClick={closeBidModal} disabled={isPlacingBid}>Cancel</button>
					<button type="button" onClick={() => void handlePlaceBid()} disabled={isPlacingBid}>
					{isPlacingBid ? 'Placing...' : 'Confirm bid'}
					</button>
				</div>
				</div>
			</div>
			</div>
		) : null}
		</section>
	)
}
export default PublicProfilePage
