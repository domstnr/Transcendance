import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async checkUserExists(email: string, username: string) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }
    }

    async checkUserExistsExact(email: string, username: string): Promise<boolean> {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                AND: [{ email }, { username }],
            },
        });
        return !existingUser;
    }
    
    async updateTwoFactorSecret(userId: string, secret: string) {
        return this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret },
        });
    }

    async enableTwoFactor(userId: string) {
        return this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
        });
    }

    async disableTwoFactor(userId: string) {
        return this.prisma.user.update({
        where: { id: userId },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null,
        },
    });
    }

    async createUser(email: string, username: string, passwordHash: string) {
        return this.prisma.user.create({
            data: {
                email,
                username,
                password: passwordHash,
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto) {
        const username = updateUserDto.username?.trim();

        if (!username) {
            throw new BadRequestException('No profile field provided for update.');
        }
        if (username) {
            const existingUsername = await this.prisma.user.findFirst({
                where: {
                    username,
                    id: { not: userId },
                },
            });
            if (existingUsername) {
                throw new ConflictException('Username already in use.');
            }
        }

        try {
            return await this.prisma.user.update({
                where: { id: userId },
                data: {
                    username,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        } catch (error) {
            console.error('check for this', error);
            throw new NotFoundException('User not found.');
        }
    }

    async deleteUser(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found.');
        return this.prisma.user.delete({ where: { id } });
    }

    async getAllUsers() {
        return this.prisma.user.findMany({
            select: { id: true, username: true, email: true, isOnline: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findFirst({
            where: { id },
        });
    }

    async findByIdWithPassword(id: string) {
        return this.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
            },
        });
    }

    async updatePassword(id: string, passwordHash: string) {
        return this.prisma.user.update({
            where: { id },
            data: {
                password: passwordHash,
            },
            select: {
                id: true,
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findFirst({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
                avatarUrl: true,
                twoFactorEnabled: true,
                twoFactorSecret: true,
            },
        });
    }

    async findByIdWithTwoFactor(id: string) {
        return this.prisma.user.findFirst({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                twoFactorEnabled: true,
                twoFactorSecret: true,
            },
        });
    }

    async searchUsers(query: string, excludeUserId: string) {
        return this.prisma.user.findMany({
            where: {
                username: { contains: query, mode: 'insensitive' },
                id: { not: excludeUserId },
            },
            select: { id: true, username: true, isOnline: true, avatarUrl: true },
            take: 20,
        });
    }

    async findPublicProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, avatarUrl: true, isOnline: true},
        });

        if (!user) {
            throw new NotFoundException('User not found.');
        }
        
        return user;
    }

    async updateAvatar(userId: string, avatarUrl: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl },
            select: { id: true, avatarUrl: true },
        });
    }

    async setOnlineStatus(userId: string, isOnline: boolean) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isOnline, lastSeen: new Date() },
        });
    }
}

