import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  sessionError: string | null;
  revision: number;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSessionError: (message: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  sessionError: null,
  revision: 0,
  // Each explicit session change invalidates responses from an older session.
  setUser: (user) => set((state) => ({ user, isAuthenticated: !!user, isLoading: false, isInitialized: true, sessionError: null, revision: state.revision + 1 })),
  setLoading: (isLoading) => set({ isLoading, sessionError: null }),
  setSessionError: (sessionError) => set({ sessionError, isLoading: false, isInitialized: true }),
  logout: () => set((state) => ({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, sessionError: null, revision: state.revision + 1 })),
}));
