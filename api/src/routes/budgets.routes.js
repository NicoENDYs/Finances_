import fp from 'fastify-plugin';

async function budgetRoutes(fastify) {
    // List budgets with category info + actual spending
    fastify.get('/budgets', { preHandler: [fastify.authenticate] }, async (req) => {
        const budgets = await fastify.prisma.budget.findMany({
            where: { userId: req.user.id },
            include: { category: true },
            orderBy: { category: { name: 'asc' } },
        });

        // Calculate actual spending per category this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const enriched = await Promise.all(budgets.map(async (b) => {
            const spent = await fastify.prisma.transaction.aggregate({
                where: {
                    account: { userId: req.user.id },
                    categoryId: b.categoryId,
                    type: 'expense',
                    date: { gte: startOfMonth, lte: endOfMonth },
                },
                _sum: { amount: true },
            });
            return { ...b, spent: Number(spent._sum.amount || 0) };
        }));

        return { budgets: enriched };
    });

    // Create budget
    fastify.post('/budgets', { preHandler: [fastify.authenticate] }, async (req, reply) => {
        const { categoryId, amount, period } = req.body;
        const budget = await fastify.prisma.budget.create({
            data: { userId: req.user.id, categoryId, amount, period: period || 'monthly' },
            include: { category: true },
        });
        return reply.code(201).send(budget);
    });

    // Update budget
    fastify.put('/budgets/:id', { preHandler: [fastify.authenticate] }, async (req) => {
        const budget = await fastify.prisma.budget.update({
            where: { id: Number(req.params.id) },
            data: { amount: req.body.amount },
            include: { category: true },
        });
        return budget;
    });

    // Delete budget
    fastify.delete('/budgets/:id', { preHandler: [fastify.authenticate] }, async (req, reply) => {
        await fastify.prisma.budget.delete({ where: { id: Number(req.params.id) } });
        return reply.code(204).send();
    });
}

export default fp(async (fastify) => {
    fastify.register(budgetRoutes, { prefix: '/api' });
});
