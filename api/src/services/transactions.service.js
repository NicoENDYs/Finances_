export async function getTransactions(prisma, userId, filters = {}) {
    const { startDate, endDate, categoryId, merchant, type, limit = 50, offset = 0 } = filters;

    const where = {
        account: { userId },
        ...(startDate && endDate && { date: { gte: new Date(startDate), lte: new Date(endDate) } }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(merchant && { merchant: { contains: merchant, mode: 'insensitive' } }),
        ...(type && { type }),
    };

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: { category: true, account: { select: { name: true, type: true } } },
            orderBy: { date: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
        }),
        prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
}

export async function createTransaction(prisma, userId, data) {
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
        where: { id: data.accountId, userId },
    });
    if (!account) {
        const error = new Error('Cuenta no encontrada');
        error.statusCode = 404;
        throw error;
    }

    const tx = await prisma.transaction.create({
        data: { ...data, date: new Date(data.date) },
        include: { category: true },
    });

    // Update account balance
    const balanceChange = data.type === 'income' ? Number(data.amount) : -Number(data.amount);
    await prisma.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: balanceChange } },
    });

    return tx;
}

export async function deleteTransaction(prisma, userId, id) {
    const tx = await prisma.transaction.findFirst({
        where: { id, account: { userId } },
    });
    if (!tx) {
        const error = new Error('Transacción no encontrada');
        error.statusCode = 404;
        throw error;
    }

    // Reverse balance change
    const reversal = tx.type === 'income' ? -Number(tx.amount) : Number(tx.amount);
    await prisma.account.update({
        where: { id: tx.accountId },
        data: { balance: { increment: reversal } },
    });

    return prisma.transaction.delete({ where: { id } });
}
