import fp from 'fastify-plugin';

async function goalRoutes(fastify) {
    // List goals
    fastify.get('/goals', { preHandler: [fastify.authenticate] }, async (req) => {
        const goals = await fastify.prisma.goal.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        return { goals };
    });

    // Create goal
    fastify.post('/goals', { preHandler: [fastify.authenticate] }, async (req, reply) => {
        const { name, targetAmount, currentAmount, deadline, color } = req.body;
        const goal = await fastify.prisma.goal.create({
            data: {
                userId: req.user.id, name, targetAmount,
                currentAmount: currentAmount || 0,
                deadline: deadline ? new Date(deadline) : null,
                color: color || '#06d6a0',
            },
        });
        return reply.code(201).send(goal);
    });

    // Update goal (amount or details)
    fastify.put('/goals/:id', { preHandler: [fastify.authenticate] }, async (req) => {
        const { name, targetAmount, currentAmount, deadline, color } = req.body;
        const data = {};
        if (name !== undefined) data.name = name;
        if (targetAmount !== undefined) data.targetAmount = targetAmount;
        if (currentAmount !== undefined) data.currentAmount = currentAmount;
        if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
        if (color !== undefined) data.color = color;

        const goal = await fastify.prisma.goal.update({
            where: { id: Number(req.params.id) },
            data,
        });
        return goal;
    });

    // Delete goal
    fastify.delete('/goals/:id', { preHandler: [fastify.authenticate] }, async (req, reply) => {
        await fastify.prisma.goal.delete({ where: { id: Number(req.params.id) } });
        return reply.code(204).send();
    });
}

export default fp(async (fastify) => {
    fastify.register(goalRoutes, { prefix: '/api' });
});
