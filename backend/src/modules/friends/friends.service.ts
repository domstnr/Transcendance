import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { FriendshipStatus } from '../../generated/prisma/enums';

@Injectable()
export class FriendsService {
    constructor(private readonly prisma: PrismaService) {}

    async sendRequest(senderId: string, receiverId: string) {
        if (senderId === receiverId)
            throw new BadRequestException('Cannot add yourself as a friend');

        const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) throw new NotFoundException('User not found');

        const existing = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
        });

        if (existing) {
            if (existing.status === FriendshipStatus.ACCEPTED)
                throw new ConflictException('Already friends');
            if (existing.status === FriendshipStatus.PENDING)
                throw new ConflictException('Friend request already pending');
        }

        return this.prisma.friendship.create({
            data: { senderId, receiverId, status: FriendshipStatus.PENDING },
        });
    }

    async acceptRequest(currentUserId: string, senderId: string) {
        const request = await this.prisma.friendship.findFirst({
            where: { senderId, receiverId: currentUserId, status: FriendshipStatus.PENDING },
        });

        if (!request) throw new NotFoundException('Friend request not found');

        return this.prisma.friendship.update({
            where: { id: request.id },
            data: { status: FriendshipStatus.ACCEPTED },
        });
    }

    async declineRequest(currentUserId: string, senderId: string) {
        const request = await this.prisma.friendship.findFirst({
            where: { senderId, receiverId: currentUserId, status: FriendshipStatus.PENDING },
        });

        if (!request) throw new NotFoundException('Friend request not found');

        await this.prisma.friendship.delete({ where: { id: request.id } });
        return { message: 'Friend request declined' };
    }

    async removeFriend(currentUserId: string, friendId: string) {
        const friendship = await this.prisma.friendship.findFirst({
            where: {
                status: FriendshipStatus.ACCEPTED,
                OR: [
                    { senderId: currentUserId, receiverId: friendId },
                    { senderId: friendId, receiverId: currentUserId },
                ],
            },
        });

        if (!friendship) throw new NotFoundException('Friendship not found');

        await this.prisma.friendship.delete({ where: { id: friendship.id } });
        return { message: 'Friend removed' };
    }

    async getFriends(userId: string) {
        const friendships = await this.prisma.friendship.findMany({
            where: {
                status: FriendshipStatus.ACCEPTED,
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            include: {
                sender: { select: { id: true, username: true, isOnline: true, lastSeen: true, avatarUrl: true } },
                receiver: { select: { id: true, username: true, isOnline: true, lastSeen: true, avatarUrl: true } },
            },
        });

        return friendships.map((f) => (f.senderId === userId ? f.receiver : f.sender));
    }

    async getPendingRequests(userId: string) {
        const requests = await this.prisma.friendship.findMany({
            where: { receiverId: userId, status: FriendshipStatus.PENDING },
            include: {
                sender: { select: { id: true, username: true } },
            },
        });

        return requests.map((r) => ({
            requestId: r.id,
            from: r.sender,
            createdAt: r.createdAt,
        }));
    }

    async getSentRequests(userId: string) {
        const requests = await this.prisma.friendship.findMany({
            where: { senderId: userId, status: FriendshipStatus.PENDING },
            include: {
                receiver: { select: { id: true, username: true } },
            },
        });

        return requests.map((r) => ({
            requestId: r.id,
            to: r.receiver,
            createdAt: r.createdAt,
        }));
    }
}
