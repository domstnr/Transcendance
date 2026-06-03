export const ITEM_CATEGORIES = [
    'ELECTRONICS',
    'FASHION',
    'HOME',
    'COLLECTIBLES',
    'GAMING',
    'BOOKS',
    'SPORTS',
    'OTHER',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
