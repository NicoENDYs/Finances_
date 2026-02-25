import { create } from 'zustand';
import { analyticsApi, accountsApi } from '../api';

interface DashboardState {
    data: any | null;
    accounts: any[];
    isLoading: boolean;
    error: string | null;
    fetchDashboard: () => Promise<void>;
    fetchAccounts: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    data: null,
    accounts: [],
    isLoading: false,
    error: null,

    fetchDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await analyticsApi.dashboard();
            set({ data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchAccounts: async () => {
        try {
            const { data } = await accountsApi.list();
            set({ accounts: data.accounts });
        } catch (err: any) {
            set({ error: err.message });
        }
    },
}));
