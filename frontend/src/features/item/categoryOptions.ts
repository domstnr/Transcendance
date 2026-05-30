export const ITEM_CATEGORIES = [
  'ELECTRONICS',
  'FASHION',
  'HOME',
  'COLLECTIBLES',
  'GAMING',
  'BOOKS',
  'SPORTS',
  'OTHER',
] as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  ELECTRONICS: 'Electronics',
  FASHION: 'Fashion',
  HOME: 'Home',
  COLLECTIBLES: 'Collectibles',
  GAMING: 'Gaming',
  BOOKS: 'Books',
  SPORTS: 'Sports',
  OTHER: 'Other',
}
