'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { Suspense } from 'react';

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 이전 페이지(FindPassword)에서 전달받은 토큰
  const resetToken = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 토큰이 없으면 접근 불가 처리
  useEffect(() => {
    if (!resetToken) {
      alert('잘못된 접근입니다. 처음부터 다시 시도해주세요.');
      router.push('/find/password');
    }
  }, [resetToken, router]);

  const handleSubmit = async () => {
    // 1. 기본 입력 확인
    if (!newPassword || !confirmPassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    // 2. 비밀번호 일치 확인
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 3. 비밀번호 유효성 검사 (8자 이상);
    if (newPassword.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const url = `${apiUri}/v1/auth/resetPassword`;

      const body = {
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'resetToken': resetToken || '' 
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMessage = errData.message || `오류가 발생했습니다. (상태코드: ${response.status})`;
        throw new Error(errorMessage);
      }

      alert('비밀번호가 성공적으로 재설정되었습니다. 첫 화면으로 이동합니다.');
      router.push('/');

    } catch (error: any) {
      console.error('Reset Password Error:', error);
      alert(error.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resetToken) return null;

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-row items-center self-start mt-3 gap-4 px-6">
        <BackButton />
        <p className="text-[16px]">비밀번호 재설정</p>
      </div>

      {/* 구분선 */}
      <div className="w-screen h-px mt-3 bg-gray-200" />

      <div className="w-full px-6 flex flex-col justify-start">
        <p className="self-start mt-10 text-[20px]">
          비밀번호 재설정
        </p>
        <p className="text-[16px] text-(--fill-color4) mt-[42px]">
          새 비밀번호를 설정해주세요. <br />비밀번호는 10-20자의 영문, 숫자를 포함해야 합니다.
        </p>
      </div>

      <div className="w-full px-6 mt-13 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="새 비밀번호 입력"
            className="w-full h-[50px] border border-(--fill-color3) rounded-[10px] p-3 focus:outline-none"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            className="w-full h-[50px] border border-(--fill-color3) rounded-[10px] p-3 focus:outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="fixed w-full px-6 bottom-10">
        <button
          className={`w-full h-[56px] rounded-[40px] text-white text-[20px] font-semibold ${
            isSubmitting 
              ? 'bg-gray-400' 
              : 'bg-(--main-color) cursor-pointer'
          }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '완료'}
        </button>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div></div>}>
      <PageContent />
    </Suspense>
  );
}