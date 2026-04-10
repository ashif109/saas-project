import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'SUPER_ADMIN' | 'COLLEGE_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId?: string;
  avatar?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  originalUser: User | null;
  originalToken: string | null;
  login: (user: User, token: string) => void;
  updateUser: (user: User, token?: string) => void;
  impersonate: (user: User, token: string) => void;
  stopImpersonating: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isImpersonating: false,
      originalUser: null,
      originalToken: null,
      login: (user, token) => {
        localStorage.setItem('pulse_token', token);
        set({ user, token, isAuthenticated: true, isImpersonating: false, originalUser: null, originalToken: null });
      },
      updateUser: (user, token) => {
        if (token) {
          localStorage.setItem('pulse_token', token);
          set({ user, token });
        } else {
          set({ user });
        }
      },
      impersonate: (user, token) => {
        const currentUser = get().user;
        const currentToken = get().token;
        
        // Only allow impersonating if not already impersonating
        if (!get().isImpersonating) {
          localStorage.setItem('pulse_token', token);
          set({ 
            user, 
            token, 
            isImpersonating: true, 
            originalUser: currentUser, 
            originalToken: currentToken 
          });
        }
      },
      stopImpersonating: () => {
        const originalUser = get().originalUser;
        const originalToken = get().originalToken;
        
        if (originalUser && originalToken) {
          localStorage.setItem('pulse_token', originalToken);
          set({ 
            user: originalUser, 
            token: originalToken, 
            isImpersonating: false, 
            originalUser: null, 
            originalToken: null 
          });
        }
      },
      logout: () => {
        localStorage.removeItem('pulse_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'pulse-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);