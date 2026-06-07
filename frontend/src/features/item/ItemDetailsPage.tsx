import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ITEM_CATEGORY_LABELS } from './categoryOptions'
import { getItem } from './itemService'
import type { ItemDetails } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function ItemDetailsPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const [item, setItem] = useState<ItemDetails | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) {
      setError('Invalid item.')
      setIsLoading(false)
      return
    }

    let isCurrent = true

    async function loadItem() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await getItem(itemId!)

        if (isCurrent) {
          setItem(response.item)
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
            src={`${API_URL}${selectedImage.url}`}
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
                <img src={`${API_URL}${image.url}`} alt="" />
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
            <img src={`${API_URL}${item.seller.avatarUrl}`} alt="" />
          ) : (
            <span aria-hidden="true">{item.seller.username[0].toUpperCase()}</span>
          )}
          <div>
            <small>Seller</small>
            <Link to={`/user/${item.seller.id}`}>{item.seller.username}</Link>
            <small>{item.seller.isOnline ? 'Online' : 'Offline'}</small>
          </div>
        </div>

        {item.auction ? (
          <dl className="item-details-auction">
            <div>
              <dt>Starting price</dt>
              <dd>${item.auction.startPrice}</dd>
            </div>
            <div>
              <dt>Current price</dt>
              <dd>${item.auction.currentPrice}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{item.auction.status}</dd>
            </div>
            <div>
              <dt>Ends</dt>
              <dd>{new Date(item.auction.endDate).toLocaleString()}</dd>
            </div>
          </dl>
        ) : (
          <p>This item has no auction.</p>
        )}

        <section className="item-details-bidding" aria-labelledby="bidding-title">
          <h2 id="bidding-title">Bidding</h2>
          <p>The bidding controls and live auction updates will be added here.</p>
        </section>
      </section>
    </main>
  )
}

export default ItemDetailsPage
