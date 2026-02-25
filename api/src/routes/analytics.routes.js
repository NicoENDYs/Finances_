import * as analyticsController from '../controllers/analytics.controller.js';

export default async function analyticsRoutes(fastify) {
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/dashboard', analyticsController.dashboard);
    fastify.get('/spending', analyticsController.spending);
    fastify.get('/monthly', analyticsController.monthlySummary);
}
