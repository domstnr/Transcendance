-- DropForeignKey
ALTER TABLE "Auction" DROP CONSTRAINT "Auction_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Auction" DROP CONSTRAINT "Auction_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_auctionId_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatParticipation" DROP CONSTRAINT "ChatParticipation_auctionId_fkey";

-- DropForeignKey
ALTER TABLE "ChatParticipation" DROP CONSTRAINT "ChatParticipation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_auctionId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipation" ADD CONSTRAINT "ChatParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipation" ADD CONSTRAINT "ChatParticipation_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
