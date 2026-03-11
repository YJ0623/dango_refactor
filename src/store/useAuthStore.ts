import { create } from 'zustand';
import { loginUser, getKakaoAuthUrl } from '@/lib/api/auth';
import type { LoginParams, LoginResponse } from '@/lib/api/auth';

interface AuthState {
  // 상태
  accessToken: string | null;
  refreshToken: string | null;
  userType: 'USER' | 'MANAGER' | null;
  userOnboarded: boolean;
  managerOnboarded: boolean;
  isLoading: boolean;
  error: string | null;

  // 액션
  login: (data: LoginParams) => Promise<LoginResponse>;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  initializeFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  accessToken: null,
  refreshToken: null,
  userType: null,
  userOnboarded: false,
  managerOnboarded: false,
  isLoading: false,
  error: null,

  // 일반 로그인
  login: async (data: LoginParams) => {
    set({ isLoading: true, error: null });
    try {
      const result = await loginUser(data);

      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);

        set({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          userType: result.userType,
          userOnboarded: result.userOnboarded,
          managerOnboarded: result.managerOnboarded,
          isLoading: false,
          error: null,
        });
      }

      return result;
    } catch (error: any) {
      const message = error.message || '로그인 중 오류가 발생했습니다.';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  // 토큰 직접 설정 (OAuth 콜백 등에서 사용)
  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({
      accessToken,
      refreshToken: refreshToken ?? null,
      error: null,
    });
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      accessToken: null,
      refreshToken: null,
      userType: null,
      userOnboarded: false,
      managerOnboarded: false,
      error: null,
    });
  },

  // localStorage에서 토큰 복원 (앱 초기화 시)
  initializeFromStorage: () => {
    if (typeof window === 'undefined') return;
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken) {
      set({ accessToken, refreshToken });
    }
  },
}));
