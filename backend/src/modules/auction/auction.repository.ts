import { Injectable } from "@nestjs/common";
import { AuctionState } from "./auction.state";
import { PrismaService } from "../../shared/prisma/prisma.service";

@Injectable()
export class AuctionRepository
{
    constructor(private prisma: PrismaService) {}
    private readonly cache = new Map<string, AuctionState>();

    evict(id: string) {
        this.cache.delete(id);
    }

    // 1. READ (Cache-Aside Pattern)
    async findById(id:string): Promise<AuctionState | null>{
        const cachedState = this.cache.get(id);
        //is it in cache ?
        if (cachedState)
        {
            console.log(`[Cache] HIT (Trouvé en mémoire) pour ${id}`);
            return cachedState;
        }
        // if not go find in db
        console.log(`[Cache] MISS pour ${id}. Interrogation de PostgreSQL...`);
        const dbState = await this.prisma.auction.findUnique({
            where: { id },
        }) as AuctionState | null;

        //update le cahe
        if (dbState) {
            this.cache.set(id, dbState);
        }
        return dbState;
    }
    

    // 2. WRITE, instead of writing directly in db, we'll put in cache and update async
    async save(state: AuctionState): Promise<void>
    {
        this.cache.set(state.id, state);
        this.prisma.auction.upsert({
            where: {id: state.id },
            update: {
                startPrice: state.startPrice,
                currentPrice: state.currentPrice,
                highestBidderId: state.highestBidderId,
                status: state.status,
                version: state.version,
                endDate: state.endDate,
            },
            
            create: {
                id: state.id,
                itemId: state.itemId,
                sellerId: state.sellerId,
                startPrice: state.startPrice,
                currentPrice: state.currentPrice,
                highestBidderId: state.highestBidderId,
                status: state.status,
                version: state.version,
                endDate: state.endDate,
            },
        })
        .then(() => {
            console.log(`[DB Synchro] ${state.id} save on harddrive`);
        })
        .catch((err) =>{
            console.error(`[DB error] failed to sync for ${state.id}`, err);
        });
        return Promise.resolve();
    }

}

/*
export class AuctionRepository
{
    constructor(private prisma: PrismaService) {}
    private readonly storage = new Map<string, AuctionState>();

    async findById(id:string): Promise<AuctionState | null>{
        return this.prisma.auction.findUnique({
            where: { id },
        }) as Promise<AuctionState | null>;
    }

    async save(state: AuctionState): Promise<void>
    {
        const currentInStorage = this.storage.get(state.id);

        if (currentInStorage)
        {
            if (state.version !== currentInStorage.version + 1)
            {
                throw new Error(
                    `Concurrent update detected. ` + `Current: ${currentInStorage.version}, Attempted: {state.version}`
                );
            }
        }
        this.storage.set(state.id, state);
        return Promise.resolve();
    }
}

*/
