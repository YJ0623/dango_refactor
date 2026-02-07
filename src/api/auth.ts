// src/api/auth.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginParams {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userOnboarded: boolean;
  managerOnboarded: boolean;
  userType: 'USER' | 'MANAGER';
}

// 일반 로그인 API
export async function loginUser(data: LoginParams): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
  }

  const responseData = await response.json();
  return responseData.data || responseData;
}

// 카카오 로그인 URL 가져오기 API
export async function getKakaoAuthUrl(redirectUri: string): Promise<string> {
  const response = await fetch(
    `${API_URL}/v1/auth/login?redirectUri=${encodeURIComponent(redirectUri)}`
  );

  if (!response.ok) {
    throw new Error('백엔드에서 카카오 URL을 가져오는데 실패했습니다.');
  }

  const json = await response.json();
  return json.data;
}