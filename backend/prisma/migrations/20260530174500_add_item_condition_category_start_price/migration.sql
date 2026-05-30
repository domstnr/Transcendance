-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM (
    'ELECTRONICS',
    'FASHION',
    'HOME',
    'COLLECTIBLES',
    'GAMING',
    'BOOKS',
    'SPORTS',
    'OTHER'
);

-- AlterTable
ALTER TABLE "Item" ADD COLUMN "condition" INTEGER;
ALTER TABLE "Item" ADD COLUMN "category" "ItemCategory";
ALTER TABLE "Auction" ADD COLUMN "startPrice" DOUBLE PRECISION;

-- Backfill existing rows so the new fields can become required.
UPDATE "Auction"
SET "startPrice" = "currentPrice"
WHERE "startPrice" IS NULL;

UPDATE "Item"
SET "condition" = 5
WHERE "condition" IS NULL;

UPDATE "Item"
SET "category" = 'OTHER'
WHERE "category" IS NULL;

-- Make fields required after backfill.
ALTER TABLE "Auction"
ALTER COLUMN "startPrice" SET NOT NULL;

ALTER TABLE "Item"
ALTER COLUMN "condition" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;
