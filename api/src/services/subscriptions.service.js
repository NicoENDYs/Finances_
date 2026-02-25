export async function getUserSubscriptions(prisma, userId) {
    return prisma.subscription.findMany({
        where: { userId },
        orderBy: { nextBillingDate: 'asc' },
    });
}

export async function createSubscription(prisma, userId, data) {
    return prisma.subscription.create({
        data: {
            ...data,
            userId,
            nextBillingDate: new Date(data.nextBillingDate),
        },
    });
}

export async function updateSubscription(prisma, id, userId, data) {
    if (data.nextBillingDate) {
        data.nextBillingDate = new Date(data.nextBillingDate);
    }
    return prisma.subscription.update({
        where: { id, userId },
        data,
    });
}

export async function deleteSubscription(prisma, id, userId) {
    return prisma.subscription.delete({
        where: { id, userId },
    });
}
