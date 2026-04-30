import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";



@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy
{
    constructor()
    {
        const connectionStr = `${process.env.DATABASE_URL}`;
        
        const adapter = new PrismaBetterSqlite3({ url: connectionStr });
        super({ adapter } );
    }
    async onModuleInit() {
        await this.$connect();
        console.log('prisma connecté à sqlite');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}