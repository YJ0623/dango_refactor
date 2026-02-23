'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loginUser, getKakaoAuthUrl } from '@/lib/api/auth';

export default function HomePage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    loginId: '',
    password: '',
  });

  // 초기화 로직
  useEffect(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 일반 로그인 핸들러
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const result = await loginUser(loginData);

      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);

        // 라우팅 분기 로직
        if (result.userOnboarded) {
          router.push('/user/stamp');
        } else if (result.managerOnboarded) {
          router.push('/owner/dashboard');
        } else if (result.userType === 'USER') {
          router.push('/signup/customer/confirm');
        } else if (result.userType === 'MANAGER') {
          router.push('/signup/owner/profile');
        } else {
          alert('로그인 정보에 오류가 있습니다.');
        }
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      alert(error.message || '로그인 중 오류가 발생했습니다.');
    }
  };

const handleKakaoLogin = () => {
  try {
    const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

    if (!REST_API_KEY || !REDIRECT_URI) {
      throw new Error('카카오 로그인 환경변수가 설정되지 않았습니다.');
    }

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    window.location.href = kakaoAuthUrl;
  } catch (error) {
    console.error('카카오 로그인 연동 에러:', error);
    alert('카카오 로그인 연결에 실패했습니다.');
  }
};

  return (
    <div className="flex flex-col pt-20 items-center min-h-screen bg-white">
      {/* 로고 영역 */}
      <div className="flex flex-col w-[200px] h-[300px] items-center">
        {/* Next.js Image 컴포넌트 사용 */}
        <div className="relative w-[160px] h-[160px] rounded-[50px] overflow-hidden bg-gray-300">
          <Image
            src="/assets/main_logo.png"
            alt="Main Logo"
            fill
            className="object-cover"
            priority
          />
        </div>

        <p className="mt-5 font-bold text-[28px] text-[var(--main-color)]">
          당고
        </p>
        <div className="flex flex-col items-center">
          <p className="text-center mt-1 text-[var(--fill-color6)] text-[12px]">
            소상공인과 고객을 연결하는
            <br />
            스탬프 기반 리워드 플랫폼
          </p>
        </div>
      </div>

      {/* 로그인 폼 */}
      <form className="flex flex-col w-[320px] mt-20" onSubmit={handleLogin}>
        <input
          className="bg-[#F3F3F3] rounded-[40px] h-[50px] pl-5 mb-2 text-black"
          placeholder="아이디"
          value={loginData.loginId}
          name="loginId"
          onChange={handleChange}
        />
        <input
          className="bg-[#F3F3F3] rounded-[40px] h-[50px] pl-5 mb-3 text-black"
          placeholder="비밀번호"
          type="password"
          value={loginData.password}
          name="password"
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-[var(--main-color)] text-white rounded-[40px] h-[50px] font-bold cursor-pointer hover:opacity-90 transition-opacity"
        >
          로그인
        </button>
      </form>

      {/* 소셜 로그인 */}
      <div className="flex flex-row justify-center w-[300px] mt-7 space-x-5 text-sm text-[var(--fill-color7)]">
        <div
          className="flex flex-col items-center justify-center cursor-pointer gap-3"
          onClick={handleKakaoLogin}
        >
          <div className="relative w-[48px] h-[48px] rounded-full overflow-hidden">
            <Image
              src="/assets/kakao_logo.png"
              alt="Kakao Logo"
              fill
              className="object-cover"
            />
          </div>
          <p className="cursor-pointer text-[10px]">카카오톡으로 이용하기</p>
        </div>
      </div>

      {/* 하단 링크 */}
      <div className="flex flex-row justify-between w-[280px] mt-10 text-sm text-[var(--fill-color6)]">
        <p className="cursor-pointer hover:underline" onClick={() => router.push('/find/id')}>
          아이디 찾기
        </p>
        <p className="cursor-pointer hover:underline" onClick={() => router.push('/find/password')}>
          비밀번호 찾기
        </p>
        <p className="cursor-pointer hover:underline" onClick={() => router.push('/signup')}>
          회원가입
        </p>
      </div>
    </div>
  );
}