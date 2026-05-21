import { definePrismaClient } from '@prisma/internals';

export default definePrismaClient({
    adapter: {
        kind: 'postgresql',
        connectionString: process.env.DATABASE_URL,
    },
});
