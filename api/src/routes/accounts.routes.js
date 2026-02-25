import * as accountsController from '../controllers/accounts.controller.js';

export default async function accountsRoutes(fastify) {
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/', accountsController.list);
    fastify.get('/net-worth', accountsController.netWorth);
    fastify.get('/:id', accountsController.getOne);
    fastify.post('/', accountsController.create);
    fastify.put('/:id', accountsController.update);
    fastify.delete('/:id', accountsController.remove);
}
