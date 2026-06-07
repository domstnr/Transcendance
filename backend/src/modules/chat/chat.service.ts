import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service";

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) {}

    async verifyCanJoinAuction(userId: string, auctionId: string) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
        });

        if (!auction) {
            throw new NotFoundException('this Bid is not opened');
        }

        const isSeller = auction.sellerId === userId;
        if (auction.status === 'CLOSED') {
            const isWinner = auction.highestBidderId === userId;
            if (!isSeller && !isWinner) {
                throw new ForbiddenException('Bid expired, only winner can access');
            }
        } else if (!isSeller) {
            const hasBid = await this.prisma.bid.findFirst({
                where: { auctionId, userId },
            });
            if (!hasBid) {
                throw new ForbiddenException('You must place a bid to join the chat');
            }
        }

        const participation = await this.prisma.chatParticipation.findUnique({
            where: {
                userId_auctionId: { userId, auctionId },
            },
        });

        if (!participation) {
            await this.prisma.chatParticipation.create({
                data: { userId, auctionId },
            });
        }

        return true;
    }

    async getMessages(auctionId: string, cursor?: string, take = 20) {
        const messages = await this.prisma.message.findMany({
            where: { auctionId },
            take: take + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                sender: {
                    select: { username: true, avatarUrl: true },
                },
            },
        });

        let nextCursor: string | null = null;

        if (messages.length > take) {
            const nextItem = messages.pop();
            nextCursor = nextItem?.id ?? null;
        }

        return {
            message: messages,
            nextCursor,
        };
    }

    async saveMessage(senderId: string, auctionId: string, content: string) {
        return this.prisma.message.create({
            data: {
                content,
                auctionId,
                senderId,
            },
            include: {
                sender: {
                    select: {
                        username: true,
                    },
                },
            },
        });
    }
}
