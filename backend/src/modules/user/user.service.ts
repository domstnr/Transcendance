import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
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
        const email = updateUserDto.email?.trim().toLowerCase();

        if (!username && !email) {
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
        if (email) {
            const existingEmail = await this.prisma.user.findFirst({
                where: {
                    email,
                    id: { not: userId },
                },
            });
            if (existingEmail) {
                throw new ConflictException('Email already in use.');
            }
        }

        try {
            return await this.prisma.user.update({
                where: { id: userId },
                data: {
                    ...(username ? { username } : {}),
                    ...(email ? { email } : {}),
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
        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        } catch (error) {
            console.error('check for this', error);
            throw new NotFoundException('Delete action impossible: User Unfound.');
        }
    }

    async findById(id: string) {
        return this.prisma.user.findFirst({
            where: { id },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findFirst({
            where: { email },
        });
    }
}
