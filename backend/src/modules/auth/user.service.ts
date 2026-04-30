import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";


@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async checkUserExists(email: string, username: string) {
/*exist?*/const existingUser = await this.prisma.user.findFirst({
            where: { 
                OR: [{email}, { username}]
              },
            });
        if (existingUser) {
            throw new ConflictException(`User already exists`);
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

    async deleteUser(id: string) {
        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        } catch (error) {
            console.error(`check for this`, error);
            throw new NotFoundException(`Delete action impossible: User Unfound.`);
        }
    }

    async findByEmail(email: string) {
        return this.prisma.user.findFirst({
            where: { email },
        });
    }
}