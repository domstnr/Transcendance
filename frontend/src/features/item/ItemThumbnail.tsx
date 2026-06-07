import type { ItemImage } from './types'

type ItemThumbnailProps = {
  image?: ItemImage
  title: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function ItemThumbnail({ image, title }: ItemThumbnailProps) {
  if (!image) {
    return (
      <div className="item-card-thumbnail item-card-thumbnail-placeholder" aria-label={`No image available for ${title}`}>
        <span>No image</span>
      </div>
    )
  }

  return (
    <img
      className="item-card-thumbnail"
      src={`${API_URL}${image.url}`}
      alt={title}
      loading="lazy"
    />
  )
}

export default ItemThumbnail
