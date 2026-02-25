import { create } from 'zustand';
import { authApi } from '../api';

interface User {
    id: number;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, name: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('aurora_token'),
    isLoading: true,

    login: async (email, password) => {
        const { data } = await authApi.login(email, password);
        localStorage.setItem('aurora_token', data.token);
        set({ user: data.user, token: data.token });
    },

    register: async (email, name, password) => {
        const { data } = await authApi.register(email, name, password);
        localStorage.setItem('aurora_token', data.token);
        set({ user: data.user, token: data.token });
    },

    logout: () => {
        localStorage.removeItem('aurora_token');
        set({ user: null, token: null });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('aurora_token');
        if (!token) {
            set({ isLoading: false });
            return;
        }
        try {
            const { data } = await authApi.me();
            set({ user: data.user, token, isLoading: false });
        } catch {
            localStorage.removeItem('aurora_token');
            set({ user: null, token: null, isLoading: false });
        }
    },
}));
