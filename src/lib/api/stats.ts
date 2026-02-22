import axios from 'axios';

// 1. API 응답 데이터 타입 정의
export interface ChartItemDto {
  label: string;
  count: number;
}

export interface StatsDataDto {
  type: 'daily' | 'weekly' | 'monthly' | 'weekly_customer' | 'monthly_customer' | string;
  
  periodText: string;
  chartData: ChartItemDto[];
  
  totalOrAvgCount?: number;
  
  avgCount?: number;
  total?: number;
}

export interface StatsResponse {
  timestamp: string;
  code: number;
  message: string;
  data: StatsDataDto;
}

// 2. API 호출 함수
export const fetchDailyStats = async (storeName: string) => {
  const apiUri = process.env.NEXT_PUBLIC_API_URL;

  const { data } = await axios.get<StatsResponse>(
    `${apiUri}/v1/manager/stamps/statics/daily`,
    {
      params: {
        storeName: storeName,
      },
    }
  );

  return data;
}

// 스탬프 적립 통계(주간, 월간) - 기존 유지
export const fetchStats = async (
  storeName: string,
  type: 'weekly' | 'monthly'
) => {
  const apiUri = process.env.NEXT_PUBLIC_API_URL;

  const { data } = await axios.get<StatsResponse>(
    `${apiUri}/v1/manager/stamps/statics`,
    {
      params: {
        storeName: storeName,
        type: type,
      },
    }
  );

  return data;
};

// 스탬프 등록 고객 통계
export const fetchTotals = async (
  storeName: string,
  type: 'weekly' | 'monthly'
) => {
  const apiUri = process.env.NEXT_PUBLIC_API_URL;

  const { data } = await axios.get<StatsResponse>(
    `${apiUri}/v1/manager/customers/statics`,
    {
      params: {
        storeName: storeName,
        type: type,
      },
    }
  );
  
  return data;
};

export const fetchStoreName = async (): Promise<string | null> => {
  const API_URI = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  if (!token) return null;

  try {
    const response = await axios.get(`${API_URI}/v1/managers/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.code === 100 && response.data.data?.store) {
      return response.data.data.store.storeName;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching store name:', error);
    return null;
  }
};

export const fetchGenderStats = async (storeName: string, baseDate: string) => {
  const apiUri = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.get(`${apiUri}/v1/manager/gender/weekly`, {
    params: {
      storeName,
      baseDate,
    },
  });
  return response.data;
};

export const fetchTodayReward = async (storeName: string) => {
  const apiUri = process.env.NEXT_PUBLIC_API_URL;
  const { data } = await axios.get(
    `${apiUri}/v1/manager/reward`,
    {
      params: { storeName },
    }
  );
  
  return data.data; 
};