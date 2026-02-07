// src/api/email.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface EmailVerifyResponse {
  timestamp: string;
  code: number;
  message: string;
  data?: {
    emailVerificationToken?: string;
  };
}

// 1. 인증번호 전송 API
export async function sendEmailVerificationCode(email: string): Promise<void> {
  if (!email) throw new Error('이메일을 입력해주세요.');

  const response = await fetch(`${API_URL}/v1/auth/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('인증번호 전송에 실패했습니다. 다시 시도해주세요.');
  }
}

// 2. 인증번호 검증 API
export async function verifyEmailCode(email: string, code: string): Promise<string> {
  if (!email || !code) throw new Error('이메일과 인증번호를 모두 입력해주세요.');

  const response = await fetch(`${API_URL}/v1/auth/email/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '인증번호가 일치하지 않습니다.');
  }

  const result = await response.json();
  const token = result?.data?.emailVerificationToken;

  if (!token) {
    throw new Error('인증 토큰을 받지 못했습니다.');
  }

  return token;
}