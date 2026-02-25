import * as subService from '../services/subscriptions.service.js';

export async function list(request, reply) {
    const subscriptions = await subService.getUserSubscriptions(request.server.prisma, request.user.id);
    reply.send({ subscriptions });
}

export async function create(request, reply) {
    const sub = await subService.createSubscription(request.server.prisma, request.user.id, request.body);
    reply.status(201).send({ subscription: sub });
}

export async function update(request, reply) {
    const sub = await subService.updateSubscription(request.server.prisma, parseInt(request.params.id), request.user.id, request.body);
    reply.send({ subscription: sub });
}

export async function remove(request, reply) {
    await subService.deleteSubscription(request.server.prisma, parseInt(request.params.id), request.user.id);
    reply.send({ message: 'Suscripción eliminada' });
}
