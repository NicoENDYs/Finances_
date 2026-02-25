import * as subController from '../controllers/subscriptions.controller.js';

export default async function subscriptionsRoutes(fastify, options) {
    fastify.addHook('preValidation', fastify.authenticate);

    fastify.get('/', subController.list);
    fastify.post('/', subController.create);
    fastify.put('/:id', subController.update);
    fastify.delete('/:id', subController.remove);
}
