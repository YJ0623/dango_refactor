'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import {
  sendEmailVerificationCode,
  verifyEmailCode,
} from '@/lib/api/EmailVerify';
import { useState } from 'react';

interface EmailVerificationInputsProps {
  email: string;
  setEmail: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  isVerified: boolean;
  handleSendCode: () => void;
  handleVerifyCode: () => void;
}

const EmailVerificationInputs = ({
  email,
  setEmail,
  code,
  setCode,
  isVerified,
  handleSendCode,
  handleVerifyCode,
}: EmailVerificationInputsProps) => {
  return (
    <>
      <div className="flex flex-row gap-4 mt-2 w-full">
        <input
          type="email"
          placeholder="이메일 주소 입력"
          className="w-full h-[48px] border-(--fill-color3) rounded-[10px] border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isVerified}
        />
        <button
          className="w-[72px] h-[48px] p-2 rounded-[10px] bg-gray-200 text-[12px] text-[#5B5B5B] cursor-pointer"
          onClick={handleSendCode}
          disabled={isVerified}
        >
          인증번호 전송
        </button>
      </div>

      <div className="flex flex-row gap-4 mt-2 w-full">
        <input
          type="text"
          placeholder="인증번호 입력"
          className="w-full h-[48px] border-(--fill-color3) rounded-[10px] border p-3"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isVerified}
        />
        <button
          className="w-[72px] h-[48px] p-2 rounded-[10px] bg-gray-200 text-[12px] text-[#5B5B5B] cursor-pointer"
          onClick={handleVerifyCode}
          disabled={isVerified}
        >
          확인
        </button>
      </div>
    </>
  );
};

export default function FindPassword() {
  const router = useRouter();

  const [userType, setUserType] = useState('customer');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerifyCode = async () => {
    try {
      await verifyEmailCode(email, code);
      setIsVerified(true);
    } catch (error) {
      console.error('Email verification error:', error);
      alert('인증번호가 일치하지 않거나 오류가 발생했습니다.');
      setIsVerified(false);
    }
  };

  const handleSendCode = () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    sendEmailVerificationCode(email);
  };

  const handleNextClick = async () => {
    if (!isVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }
    if (!id) {
      alert('아이디를 입력해주세요.');
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const apiUri = process.env.NEXT_PUBLIC_API_URL;
      const url =
        userType === 'customer'
          ? `${apiUri}/v1/auth/user/findPassword`
          : `${apiUri}/v1/auth/manager/findPassword`;
      
      const body = { 
        loginId: id, 
        email: email 
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || '회원 정보를 찾을 수 없습니다.');
      }

      const responseData = await response.json();
      
      // 응답 구조: { data: { resetToken: "..." }, ... }
      // 만약 data가 없으면 responseData 자체가 data일 수 있으므로 안전하게 처리
      const resultData = responseData.data || responseData;
      const resetToken = resultData.resetToken;

      if (!resetToken) {
        throw new Error('비밀번호 재설정 토큰을 받아오지 못했습니다.');
      }

      // 토큰을 가지고 재설정 페이지로 이동
      router.push(`/find/reset-password?token=${resetToken}`);
    } catch (error: any) {
      console.error('Find Password error:', error);
      alert(error.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-row items-center self-start mt-3 gap-4 px-6">
        <BackButton />
        <p className="text-[16px]">비밀번호 찾기</p>
      </div>

      {/* 구분선 */}
      <div className="w-screen h-px mt-3 bg-gray-200" />

      <div className="flex flex-row w-full justify-center items-center h-[60px] text-[12px]">
        <div
          className={`flex h-full items-center justify-center w-1/2 cursor-pointer ${
            userType === 'customer'
              ? 'border-b-2 border-black font-semibold'
              : 'border-b border-gray-500 text-gray-500'
          }`}
          onClick={() => setUserType('customer')}
        >
          개인회원
        </div>
        <div
          className={`flex h-full items-center justify-center w-1/2 cursor-pointer ${
            userType === 'owner'
              ? 'border-b-2 border-black font-semibold'
              : 'border-b border-gray-500 text-gray-500'
          }`}
          onClick={() => setUserType('owner')}
        >
          점주회원
        </div>
      </div>

      <div className="w-full h-auto px-6">
        <p className="self-start mt-10 text-[20px]">
          아이디, 이메일을 입력해주세요.
        </p>

        <div className="flex flex-col mt-10 w-full items-center">
          <div className="flex flex-col items-center w-full text-[12px]">
            <input
              type="text"
              placeholder="아이디 입력"
              className="w-full border border-(--fill-color3) rounded-[10px] p-3 mt-2"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <EmailVerificationInputs
              email={email}
              setEmail={setEmail}
              code={code}
              setCode={setCode}
              isVerified={isVerified}
              handleSendCode={handleSendCode}
              handleVerifyCode={handleVerifyCode}
            />
          </div>
        </div>
      </div>

      <div className="fixed w-full h-[56px] text-[20px] font-semibold px-6 bottom-10">
        <button
          className={`w-full rounded-[40px] text-white p-3 ${
            !isVerified || isSubmitting
              ? 'bg-gray-400'
              : 'bg-(--main-color) cursor-pointer'
          }`}
          onClick={handleNextClick}
          disabled={!isVerified || isSubmitting}
        >
          {isSubmitting ? '확인 중...' : '다음'}
        </button>
      </div>
    </div>
  );
};