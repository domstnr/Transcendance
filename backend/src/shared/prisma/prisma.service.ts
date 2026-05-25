import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const connectionStr = `${process.env.DATABASE_URL}`;
        const adapter = new PrismaPg({ connectionString: connectionStr });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('prisma connecté à postgresql');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
