import * as accountsService from '../services/accounts.service.js';

export async function list(request, reply) {
    const accounts = await accountsService.getUserAccounts(request.server.prisma, request.user.id);
    reply.send({ accounts });
}

export async function getOne(request, reply) {
    const account = await accountsService.getAccountById(
        request.server.prisma, parseInt(request.params.id), request.user.id
    );
    reply.send({ account });
}

export async function create(request, reply) {
    const account = await accountsService.createAccount(
        request.server.prisma, request.user.id, request.body
    );
    reply.status(201).send({ account });
}

export async function update(request, reply) {
    const account = await accountsService.updateAccount(
        request.server.prisma, parseInt(request.params.id), request.user.id, request.body
    );
    reply.send({ account });
}

export async function remove(request, reply) {
    await accountsService.deleteAccount(request.server.prisma, parseInt(request.params.id), request.user.id);
    reply.send({ message: 'Cuenta eliminada' });
}

export async function netWorth(request, reply) {
    const data = await accountsService.getNetWorth(request.server.prisma, request.user.id);
    reply.send(data);
}
