import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAuction, getBidHistory, placeBid } from '../auction/auctionService'
import type { AuctionState, BidHistoryEntry, BidUpdatedEvent } from '../auction/types'
import { useAuctionUpdates } from '../auction/useAuctionUpdates'
import { useAuth } from '../auth/AuthContext'
import { ITEM_CATEGORY_LABELS } from './categoryOptions'
import { getItem } from './itemService'
import type { ItemDetails } from './types'

const ASSET_URL = ''

function formatCountdown(endDate: string, now: number) {
  const remainingSeconds = Math.max(0, Math.floor((new Date(endDate).getTime() - now) / 1000))
  const days = Math.floor(remainingSeconds / 86400)
  const hours = Math.floor((remainingSeconds % 86400) / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60

  if (remainingSeconds === 0) return 'Ended'
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

function ItemDetailsPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const { user } = useAuth()
  const [item, setItem] = useState<ItemDetails | null>(null)
  const [auction, setAuction] = useState<AuctionState | null>(null)
  const [bidHistory, setBidHistory] = useState<BidHistoryEntry[]>([])
  const [bidAmount, setBidAmount] = useState('')
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)
  const [bidSuccess, setBidSuccess] = useState<string | null>(null)
  const [historyRefreshError, setHistoryRefreshError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const historyReloadSequence = useRef(0)

  useEffect(() => {
    if (!itemId) {
      setError('Invalid item.')
      setIsLoading(false)
      return
    }

    let isCurrent = true
    historyReloadSequence.current += 1

    async function loadItem() {
      try {
        setIsLoading(true)
        setError(null)
        const itemResponse = await getItem(itemId!)
        const auctionId = itemResponse.item.auction?.id
        const [auctionResponse, historyResponse] = auctionId
          ? await Promise.all([getAuction(auctionId), getBidHistory(auctionId)])
          : [null, null]

        if (isCurrent) {
          setItem(itemResponse.item)
          setAuction(auctionResponse?.auction ?? null)
          setBidHistory(historyResponse?.bids ?? [])
          setHistoryRefreshError(null)
          setSelectedImageIndex(0)
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load item.')
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadItem()

    return () => {
      isCurrent = false
    }
  }, [itemId])

  useEffect(() => {
    if (!auction || auction.status !== 'OPEN') return

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [auction])

  const bidValue = Number(bidAmount)
  const isSeller = Boolean(item && user?.userId === item.seller.id)
  const isExpired = Boolean(auction && new Date(auction.endDate).getTime() <= now)
  const isBidAmountValid = Boolean(
    auction &&
    bidAmount.trim() !== '' &&
    Number.isFinite(bidValue) &&
    bidValue > auction.currentPrice,
  )

  let biddingUnavailableReason: string | null = null
  if (isSeller) {
    biddingUnavailableReason = 'You cannot bid on your own listing.'
  } else if (auction?.status !== 'OPEN') {
    biddingUnavailableReason = 'This auction is closed.'
  } else if (isExpired) {
    biddingUnavailableReason = 'This auction has ended.'
  }

  const biddingDisabled = Boolean(biddingUnavailableReason) || isPlacingBid
  const submitDisabled = biddingDisabled || !isBidAmountValid

  async function handleAuctionUpdate(update: BidUpdatedEvent) {
    const auctionId = auction?.id
    if (!auctionId) return

    setAuction((current) => {
      if (!current || update.version <= current.version) {
        return current
      }

      const highestBidder = update.bidderId
        ? {
            id: update.bidderId,
            username: update.bidderName,
            avatarUrl:
              current.highestBidder?.id === update.bidderId
                ? current.highestBidder.avatarUrl
                : null,
          }
        : null

      return {
        ...current,
        currentPrice: update.newPrice,
        highestBidder,
        status: update.status,
        version: update.version,
        endDate: update.endDate,
      }
    })
    setNow(Date.now())

    const requestSequence = ++historyReloadSequence.current

    try {
      const response = await getBidHistory(auctionId)
      if (requestSequence === historyReloadSequence.current) {
        setBidHistory(response.bids)
        setHistoryRefreshError(null)
      }
    } catch {
      if (requestSequence === historyReloadSequence.current) {
        setHistoryRefreshError('The latest bid history could not be refreshed.')
      }
    }
  }

  const {
    error: liveUpdateError,
  } = useAuctionUpdates(auction?.id ?? null, handleAuctionUpdate)

  async function handlePlaceBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!auction) return

    setBidError(null)
    setBidSuccess(null)

    if (biddingUnavailableReason) {
      setBidError(biddingUnavailableReason)
      return
    }

    if (!isBidAmountValid) {
      setBidError(`Enter an amount greater than $${auction.currentPrice.toFixed(2)}.`)
      return
    }

    try {
      setIsPlacingBid(true)
      const response = await placeBid(auction.id, bidValue)
      setAuction(response.auction)
      setBidHistory((current) => [
        response.bid,
        ...current.filter((bid) => bid.id !== response.bid.id),
      ])
      setBidAmount('')
      setBidSuccess(response.message)
      setNow(Date.now())
    } catch (submitError) {
      setBidError(
        submitError instanceof Error ? submitError.message : 'Failed to place bid.',
      )
    } finally {
      setIsPlacingBid(false)
    }
  }

  if (isLoading) {
    return <p>Loading item...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!item) {
    return <p>Item not found.</p>
  }

  const selectedImage = item.images[selectedImageIndex]

  return (
    <main className="item-details-page">
      <section className="item-details-gallery" aria-label={`${item.title} images`}>
        {selectedImage ? (
          <img
            className="item-details-main-image"
            src={`${ASSET_URL}${selectedImage.url}`}
            alt={`${item.title}, image ${selectedImageIndex + 1}`}
          />
        ) : (
          <div className="item-details-main-image item-details-image-placeholder">
            No image available
          </div>
        )}

        {item.images.length > 1 ? (
          <div className="item-details-thumbnails">
            {item.images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                className={index === selectedImageIndex ? 'is-selected' : undefined}
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === selectedImageIndex}
              >
                <img src={`${ASSET_URL}${image.url}`} alt="" />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="item-details-content">
        <div>
          <p className="item-details-category">{ITEM_CATEGORY_LABELS[item.category]}</p>
          <h1>{item.title}</h1>
          <p className="item-details-description">{item.description}</p>
          <p>Condition: {item.condition}/10</p>
        </div>

        <div className="item-details-seller">
          {item.seller.avatarUrl ? (
            <img src={`${ASSET_URL}${item.seller.avatarUrl}`} alt="" />
          ) : (
            <span aria-hidden="true">{item.seller.username[0].toUpperCase()}</span>
          )}
          <div>
            <small>Seller</small>
            <Link to={`/user/${item.seller.id}`}>{item.seller.username}</Link>
            <small>{item.seller.isOnline ? 'Online' : 'Offline'}</small>
          </div>
        </div>

        {auction ? (
          <dl className="item-details-auction">
            <div>
              <dt>Starting price</dt>
              <dd>${auction.startPrice.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Current price</dt>
              <dd>${auction.currentPrice.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{auction.status}</dd>
            </div>
            <div>
              <dt>Ends</dt>
              <dd>{new Date(auction.endDate).toLocaleString()}</dd>
            </div>
          </dl>
        ) : (
          <p>This item has no auction.</p>
        )}

        <section className="item-details-bidding" aria-labelledby="bidding-title">
          <div className="bidding-header">
            <div>
              <p className="bidding-eyebrow">Live auction</p>
              <h2 id="bidding-title">Place your bid</h2>
            </div>
            {auction ? (
              <div className="bidding-statuses">
                <span className={`auction-status auction-status-${auction.status.toLowerCase()}`}>
                  {auction.status}
                </span>
              </div>
            ) : null}
          </div>

          {auction ? (
            <>
              <div className="bidding-price">
                <span>Current price</span>
                <strong>${auction.currentPrice.toFixed(2)}</strong>
                <small>
                  {auction.status === 'OPEN'
                    ? `${formatCountdown(auction.endDate, now)} remaining`
                    : 'Auction ended'}
                </small>
              </div>

              <Link className="btn button-secondary item-details-chat-link" to={`/auction/${auction.id}/chat`}>
                Enter chat room
              </Link>

              <form className="bid-form" onSubmit={(event) => void handlePlaceBid(event)}>
                <label htmlFor="bid-amount">Your bid</label>
                <div className="bid-input-row">
                  <span aria-hidden="true">$</span>
                  <input
                    id="bid-amount"
                    type="number"
                    min={auction.currentPrice + 0.01}
                    step="0.01"
                    value={bidAmount}
                    onChange={(event) => setBidAmount(event.target.value)}
                    disabled={biddingDisabled}
                    placeholder={(auction.currentPrice + 0.01).toFixed(2)}
                  />
                  <button type="submit" disabled={submitDisabled}>
                    {isPlacingBid ? 'Placing bid...' : 'Place bid'}
                  </button>
                </div>
              </form>

              {biddingUnavailableReason ? (
                <p className="bid-unavailable">{biddingUnavailableReason}</p>
              ) : null}
              {liveUpdateError ? (
                <p className="bid-feedback bid-feedback-warning">{liveUpdateError}</p>
              ) : null}
              {bidError ? <p className="bid-feedback bid-feedback-error">{bidError}</p> : null}
              {bidSuccess ? (
                <p className="bid-feedback bid-feedback-success">{bidSuccess}</p>
              ) : null}

              <div className="bid-history">
                <div className="bid-history-heading">
                  <h3>Bid history</h3>
                  <span>{bidHistory.length} bids</span>
                </div>
                {historyRefreshError ? (
                  <p className="bid-feedback bid-feedback-warning">{historyRefreshError}</p>
                ) : null}

                {bidHistory.length > 0 ? (
                  <ol>
                    {bidHistory.map((bid) => (
                      <li key={bid.id}>
                        <div className="bidder">
                          {bid.bidder.avatarUrl ? (
                            <img src={`${ASSET_URL}${bid.bidder.avatarUrl}`} alt="" />
                          ) : (
                            <span aria-hidden="true">
                              {bid.bidder.username[0].toUpperCase()}
                            </span>
                          )}
                          <div>
                            <Link to={`/user/${bid.bidder.id}`}>{bid.bidder.username}</Link>
                            <small>{new Date(bid.createdAt).toLocaleString()}</small>
                          </div>
                        </div>
                        <strong>${bid.amount.toFixed(2)}</strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="bid-history-empty">No bids yet. Be the first bidder.</p>
                )}
              </div>
            </>
          ) : (
            <p>This listing does not have an active auction.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default ItemDetailsPage
