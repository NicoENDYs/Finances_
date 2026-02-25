import * as txController from '../controllers/transactions.controller.js';

export default async function transactionsRoutes(fastify) {
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/categories', txController.getCategories);
    fastify.get('/', txController.list);
    fastify.post('/', txController.create);
    fastify.delete('/:id', txController.remove);
}
