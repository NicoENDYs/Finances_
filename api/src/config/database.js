import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

const prisma = new PrismaClient();

async function databasePlugin(fastify) {
    fastify.decorate('prisma', prisma);

    fastify.addHook('onClose', async () => {
        await prisma.$disconnect();
    });
}

export default fp(databasePlugin);
export { prisma };
