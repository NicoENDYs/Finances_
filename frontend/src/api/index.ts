import client from './client';

export const authApi = {
    login: (email: string, password: string) =>
        client.post('/auth/login', { email, password }),

    register: (email: string, name: string, password: string) =>
        client.post('/auth/register', { email, name, password }),

    me: () => client.get('/auth/me'),
};

export const accountsApi = {
    list: () => client.get('/accounts'),
    netWorth: () => client.get('/accounts/net-worth'),
    create: (data: any) => client.post('/accounts', data),
    update: (id: number, data: any) => client.put(`/accounts/${id}`, data),
    remove: (id: number) => client.delete(`/accounts/${id}`),
};

export const transactionsApi = {
    list: (params?: Record<string, string>) => client.get('/transactions', { params }),
    create: (data: any) => client.post('/transactions', data),
    remove: (id: number) => client.delete(`/transactions/${id}`),
};

export const analyticsApi = {
    dashboard: () => client.get('/analytics/dashboard'),
    spending: (startDate: string, endDate: string) =>
        client.get('/analytics/spending', { params: { startDate, endDate } }),
    monthly: (year: number, month: number) =>
        client.get('/analytics/monthly', { params: { year, month } }),
};

export const budgetsApi = {
    list: () => client.get('/budgets'),
    create: (data: any) => client.post('/budgets', data),
    update: (id: number, data: any) => client.put(`/budgets/${id}`, data),
    remove: (id: number) => client.delete(`/budgets/${id}`),
};

export const goalsApi = {
    list: () => client.get('/goals'),
    create: (data: any) => client.post('/goals', data),
    update: (id: number, data: any) => client.put(`/goals/${id}`, data),
    remove: (id: number) => client.delete(`/goals/${id}`),
};

export const aiApi = {
    chat: (message: string) => client.post('/ai/chat', { message }),
};
