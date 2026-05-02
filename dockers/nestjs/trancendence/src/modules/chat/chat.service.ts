import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";


@Injectable()
export class ChatService {
   constructor( private readonly prisma: PrismaService ) {}

   /* -------------------------------------------------------------------------- */
   /*               verifications, token, database, if auction open              */
   /* -------------------------------------------------------------------------- */
   async verifyCanJoinAuction(userId: string, auctionId: string) {
        //TODO check if bid exists & if user has token
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
        });

        if (!auction) {
            throw new NotFoundException("this Bid is not opened");
        }

        //TODO implement permissions, seller, bidder, active, closed
        const isSeller = auction.sellerId === userId;
        if (auction.status === 'CLOSED') {
            const isWinner = auction.highestBidderId === userId;
            if (!isSeller && !isWinner) {
                throw new ForbiddenException ("Bid expired, only winner can access");
            }
        }
        //we a participation table, to track last_read, if received
        const participation = await this.prisma.chatParticipation.findUnique({
            where: {
                userId_auctionId: { userId, auctionId }
            }
        });

        if (!participation) {
            await this.prisma.chatParticipation.create({
                data: { userId, auctionId }
            });
        }
        return true;
    }

    /* -------------------------------------------------------------------------- */
    /*                           get message, set cursor                          */
    /* -------------------------------------------------------------------------- */
    async getMessages(auctionId: string, cursor?: string, take: number = 20) {
        const messages = await this.prisma.message.findMany({
            where: {auctionId: auctionId},
            take: take + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                sender: {
                    select: { username: true },
                },
            },
        });

        let nextCursor: string | null = null;

        //if more messages than limit === next page
        if (messages.length > take) {
            const nextItem = messages.pop(); //take out the offset messages
            nextCursor = nextItem!.id;
        }
        return {
            message: messages,
            nextCursor,
        };
    }

    /* -------------------------------------------------------------------------- */
    /*                                send messges                                */
    /* -------------------------------------------------------------------------- */
    async saveMessage(senderId: string, auctionId: string, content: string) {
        //TODO return content message, userid & auctionId & name for view
        const savedMessage = await this.prisma.message.create({
            data: {
                content,
                auctionId,
                senderId,
            },
            include: {
                sender: {
                    select: {
                        username: true,
                    }
                }
            }
        });
        return savedMessage;
    }
}