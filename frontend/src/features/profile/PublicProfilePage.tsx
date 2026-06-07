import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ITEM_CATEGORY_LABELS } from '../item/categoryOptions'
import ItemThumbnail from '../item/ItemThumbnail'
import { getOtherUserItems } from '../item/itemService'
import type { ItemSummary } from '../item/types'
import type { PublicUser } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function PublicProfilePage() {
	const { userId } = useParams<{ userId: string }>()
	const [profile, setProfile] = useState<PublicUser | null>(null)
	const [profileError, setProfileError] = useState<string | null>(null)
	const [items, setItems] = useState<ItemSummary[]>([])
	const [itemsError, setItemsError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)

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

	if (isLoading) return <p>Loading profile...</p>
	if (profileError) return <p>{profileError}</p>
	if (!profile) return null

	return (
		<section className="profile-page">
		<div className="profile-header">
			<div>
			<h1>{profile.username}'s profile</h1>
			{profile.avatarUrl ? (
				<img
				src={`${API_URL}${profile.avatarUrl}`}
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
