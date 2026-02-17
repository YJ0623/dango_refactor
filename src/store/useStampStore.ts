import { create } from 'zustand';
import axios from 'axios';
import fetchUserQr from '@/lib/api/user/UserQR';
import type { StampData } from '@/components/StampCard';

const apiUri = process.env.NEXT_PUBLIC_API_URL;

// --- 타입 정의 ---
export interface EventData {
  eventType: string;
  buttonDescription: string;
  startDate: string;
  endDate: string;
  buttonImageUrl: string;
}

interface AccountData {
  email: string;
  loginId: string;
  joinedAt: string;
}

interface StampState {
  // 유저 계정 정보
  userEmail: string;
  userLoginId: string;

  // 스탬프 데이터
  stamps: StampData[];
  isLoadingStamps: boolean;

  // 이벤트 데이터
  events: EventData[];

  // QR 상태
  qrImage: string;
  isLoadingQr: boolean;
  showQrModal: boolean;

  // 액션
  fetchAccountInfo: (token: string) => Promise<void>;
  fetchStamps: (token: string) => Promise<void>;
  fetchEvents: (token: string) => Promise<void>;
  handleQrGenerate: (email: string) => Promise<void>;
  setShowQrModal: (show: boolean) => void;
  resetStampState: () => void;
}

export const useStampStore = create<StampState>((set, get) => ({
  // 초기 상태
  userEmail: '',
  userLoginId: '',
  stamps: [],
  isLoadingStamps: false,
  events: [],
  qrImage: '',
  isLoadingQr: false,
  showQrModal: false,

  // 유저 계정 정보 조회
  fetchAccountInfo: async (token: string) => {
    try {
      const response = await axios.get<{
        code: number;
        message: string;
        data: AccountData;
      }>(`${apiUri}/v1/mypage/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = response.data;
      if (resData.code === 0 || resData.code === 200 || resData.data) {
        set({
          userEmail: resData.data.email,
          userLoginId: resData.data.loginId,
        });
      }
    } catch (error) {
      console.error('계정 정보 조회 실패:', error);
    }
  },

  // 스탬프 데이터 조회
  fetchStamps: async (token: string) => {
    set({ isLoadingStamps: true });
    try {
      const response = await fetch(`${apiUri}/v1/users/stamps`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        set({ stamps: data });
      } else {
        set({ stamps: [] });
      }
    } catch (error) {
      set({ stamps: [] });
    } finally {
      set({ isLoadingStamps: false });
    }
  },

  // 이벤트 데이터 조회
  fetchEvents: async (token: string) => {
    try {
      const response = await fetch(`${apiUri}/v1/events/board`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const json = await response.json();
        if (
          json.code === 0 ||
          json.code === 200 ||
          json.message.includes('정상')
        ) {
          set({ events: json.data });
        }
      }
    } catch (error) {
      console.error(error);
    }
  },

  // QR 생성
  handleQrGenerate: async (email: string) => {
    set({ showQrModal: true, isLoadingQr: true, qrImage: '' });
    try {
      const res = await fetchUserQr(email);
      if (res.code === 100 || res.code === 200) {
        set({ qrImage: res.data, isLoadingQr: false });
      } else {
        alert(res.message || 'QR 생성 실패');
        set({ showQrModal: false, isLoadingQr: false });
      }
    } catch (error) {
      console.error(error);
      alert('QR 생성 에러');
      set({ showQrModal: false, isLoadingQr: false });
    }
  },

  setShowQrModal: (show: boolean) => {
    set({ showQrModal: show });
  },

  // 상태 초기화 (로그아웃 시 등)
  resetStampState: () => {
    set({
      userEmail: '',
      userLoginId: '',
      stamps: [],
      isLoadingStamps: false,
      events: [],
      qrImage: '',
      isLoadingQr: false,
      showQrModal: false,
    });
  },
}));
