import * as txService from '../services/transactions.service.js';

export async function list(request, reply) {
    const result = await txService.getTransactions(request.server.prisma, request.user.id, request.query);
    reply.send(result);
}

export async function create(request, reply) {
    const tx = await txService.createTransaction(request.server.prisma, request.user.id, request.body);
    reply.status(201).send({ transaction: tx });
}

export async function getCategories(request, reply) {
    const categories = await request.server.prisma.category.findMany({
        orderBy: { name: 'asc' }
    });
    reply.send({ categories });
}

export async function remove(request, reply) {
    await txService.deleteTransaction(request.server.prisma, request.user.id, parseInt(request.params.id));
    reply.send({ message: 'Transacción eliminada' });
}
