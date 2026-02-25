import { getDashboardData, getSpendingByCategory, getMonthlySummary } from '../services/analytics.service.js';

export async function dashboard(request, reply) {
    const data = await getDashboardData(request.server.prisma, request.user.id);
    reply.send(data);
}

export async function spending(request, reply) {
    const { startDate, endDate } = request.query;
    const data = await getSpendingByCategory(request.server.prisma, request.user.id, startDate, endDate);
    reply.send({ spending: data });
}

export async function monthlySummary(request, reply) {
    const { year, month } = request.query;
    const data = await getMonthlySummary(request.server.prisma, request.user.id, parseInt(year), parseInt(month));
    reply.send(data);
}
