import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import env from './config/env.js';
import databasePlugin from './config/database.js';
import authMiddleware from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import accountsRoutes from './routes/accounts.routes.js';
import transactionsRoutes from './routes/transactions.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';

const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true },
        },
    },
});

// Plugins
await fastify.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
});

await fastify.register(jwt, { secret: env.JWT_SECRET });
await fastify.register(databasePlugin);
await fastify.register(authMiddleware);
await fastify.register(errorHandler);

// Routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(accountsRoutes, { prefix: '/api/accounts' });
await fastify.register(transactionsRoutes, { prefix: '/api/transactions' });
await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
await fastify.register(aiRoutes, { prefix: '/api/ai' });

// Health check
fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Start
try {
    await fastify.listen({ port: env.PORT, host: env.HOST });
    console.log(`\n🚀 Aurora API corriendo en http://localhost:${env.PORT}\n`);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
