import fp from 'fastify-plugin';

async function authMiddleware(fastify) {
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ error: 'No autorizado' });
        }
    });
}

export default fp(authMiddleware);
