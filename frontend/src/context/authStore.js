import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,

        // ── Actions ──────────────────────────────────────────
        register: async (data) => {
          set({ isLoading: true });
          try {
            const res = await authAPI.register(data);
            const { user, accessToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            set({ user, accessToken, isAuthenticated: true, isLoading: false });
            return { success: true };
          } catch (err) {
            set({ isLoading: false });
            throw err;
          }
        },

        login: async (data) => {
          set({ isLoading: true });
          try {
            const res = await authAPI.login(data);
            const { user, accessToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            set({ user, accessToken, isAuthenticated: true, isLoading: false });
            return { success: true };
          } catch (err) {
            set({ isLoading: false });
            throw err;
          }
        },

        googleLogin: async (credential) => {
          set({ isLoading: true });
          try {
            const res = await authAPI.googleAuth(credential);
            const { user, accessToken } = res.data;
            localStorage.setItem('accessToken', accessToken);
            set({ user, accessToken, isAuthenticated: true, isLoading: false });
            return { success: true };
          } catch (err) {
            set({ isLoading: false });
            throw err;
          }
        },

        logout: async () => {
          try {
            await authAPI.logout();
          } finally {
            localStorage.removeItem('accessToken');
            set({ user: null, accessToken: null, isAuthenticated: false });
          }
        },

        fetchMe: async () => {
          try {
            const res = await authAPI.getMe();
            set({ user: res.data.data, isAuthenticated: true });
          } catch {
            set({ user: null, isAuthenticated: false });
          }
        },

        updateUser: (updates) =>
          set((state) => ({ user: { ...state.user, ...updates } })),

        // Helpers
        hasRole: (...roles) => roles.includes(get().user?.role),
        isAdmin: () => get().user?.role === 'admin',
        isAuthor: () => ['author', 'editor', 'admin'].includes(get().user?.role),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
      }
    ),
    { name: 'AuthStore' }
  )
);

export default useAuthStore;
