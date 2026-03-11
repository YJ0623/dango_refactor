// src/app/oauth/kakao/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function KakaoCallback() {
  const router = useRouter();
  const { setTokens } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        console.error('인가 코드 없음');
        router.push('/');
        return;
      }

      try {
        const apiUri = process.env.NEXT_PUBLIC_API_URL;
        // 핵심: redirectUri를 항상 확실하게 전달
        const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI
          || 'http://localhost:3000/oauth/kakao/callback';

        const url = `${apiUri}/v1/auth/kakao?code=${code}&redirectUri=${encodeURIComponent(redirectUri)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
          throw new Error('백엔드에서 토큰 발급에 실패했습니다.');
        }

        const json = await response.json();
        const { accessToken } = json.data;

        if (accessToken) {
          setTokens(accessToken);
          router.push('/user/stamp');
        } else {
          throw new Error('토큰을 받지 못했습니다.');
        }
      } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [router, setTokens]);

  return (
    <div className="flex justify-center items-center w-full h-screen">
      로그인 처리 중입니다...
    </div>
  );
}
