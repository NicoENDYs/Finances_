export async function getUserAccounts(prisma, userId) {
    return prisma.account.findMany({
        where: { userId, isActive: true },
        orderBy: { type: 'asc' },
    });
}

export async function getAccountById(prisma, id, userId) {
    const account = await prisma.account.findFirst({ where: { id, userId } });
    if (!account) {
        const error = new Error('Cuenta no encontrada');
        error.statusCode = 404;
        throw error;
    }
    return account;
}

export async function createAccount(prisma, userId, data) {
    return prisma.account.create({
        data: { ...data, userId },
    });
}

export async function updateAccount(prisma, id, userId, data) {
    await getAccountById(prisma, id, userId);
    return prisma.account.update({ where: { id }, data });
}

export async function deleteAccount(prisma, id, userId) {
    await getAccountById(prisma, id, userId);
    return prisma.account.update({
        where: { id },
        data: { isActive: false },
    });
}

export async function getNetWorth(prisma, userId) {
    const accounts = await prisma.account.findMany({
        where: { userId, isActive: true },
        select: { type: true, balance: true },
    });

    let assets = 0;
    let liabilities = 0;

    for (const acc of accounts) {
        const bal = Number(acc.balance);
        if (acc.type === 'credit') {
            liabilities += Math.abs(bal);
        } else {
            assets += bal;
        }
    }

    return { assets, liabilities, netWorth: assets - liabilities };
}
