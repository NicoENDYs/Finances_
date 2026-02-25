import { getNetWorth } from './accounts.service.js';

export async function getSpendingByCategory(prisma, userId, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const spending = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
            account: { userId },
            type: 'expense',
            date: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: true,
    });

    // Enrich with category info
    const categoryIds = spending.map((s) => s.categoryId);
    const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
    });
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    return spending
        .map((s) => ({
            category: catMap[s.categoryId],
            total: Number(s._sum.amount),
            count: s._count,
        }))
        .sort((a, b) => b.total - a.total);
}

export async function getMonthlySummary(prisma, userId, year, month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [income, expenses] = await Promise.all([
        prisma.transaction.aggregate({
            where: { account: { userId }, type: 'income', date: { gte: start, lte: end } },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { account: { userId }, type: 'expense', date: { gte: start, lte: end } },
            _sum: { amount: true },
        }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

    return { totalIncome, totalExpenses, savings, savingsRate: Number(savingsRate) };
}

export async function getDashboardData(prisma, userId) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const [netWorthData, monthlySummary, spendingByCategory, recentTransactions, goals] =
        await Promise.all([
            getNetWorth(prisma, userId),
            getMonthlySummary(prisma, userId, year, month),
            getSpendingByCategory(prisma, userId, startOfMonth.toISOString(), endOfMonth.toISOString()),
            prisma.transaction.findMany({
                where: { account: { userId } },
                include: { category: true, account: { select: { name: true } } },
                orderBy: { date: 'desc' },
                take: 10,
            }),
            prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        ]);

    return {
        netWorth: netWorthData,
        monthly: monthlySummary,
        spendingByCategory,
        recentTransactions,
        goals,
    };
}
