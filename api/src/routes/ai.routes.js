import * as aiController from '../controllers/ai.controller.js';

export default async function aiRoutes(fastify) {
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.post('/chat', aiController.chat);
}
