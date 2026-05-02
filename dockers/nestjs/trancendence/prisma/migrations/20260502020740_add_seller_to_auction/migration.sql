/*
  Warnings:

  - Added the required column `sellerId` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Auction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "currentPrice" REAL NOT NULL,
    "highestBidderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "version" INTEGER NOT NULL DEFAULT 0,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Auction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Auction" ("createdAt", "currentPrice", "endDate", "highestBidderId", "id", "status", "updatedAt", "version") SELECT "createdAt", "currentPrice", "endDate", "highestBidderId", "id", "status", "updatedAt", "version" FROM "Auction";
DROP TABLE "Auction";
ALTER TABLE "new_Auction" RENAME TO "Auction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
