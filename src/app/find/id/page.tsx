
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
          className="w-[72px] h-[48px] p-2 rounded-[10px] bg-gray-200 text-[12px] text-[#5B5B5B] items-center cursor-pointer"
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

export default function FindId() {
  const router = useRouter();

  const [userType, setUserType] = useState('customer');
  // [추가] 사업자등록번호 상태
  const [businessNum, setBusinessNum] = useState('');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 3. EmailVerificationInputs에 props로 전달할 핸들러들 ---
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
    // 이메일 유효성 검사 등 필요시 추가
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

    // [추가] 점주회원일 경우 사업자번호 입력 체크
    if (userType === 'owner' && !businessNum) {
      alert('사업자등록번호를 입력해주세요.');
      return;
    }

    if (isSubmitting) return; // 중복 제출 방지

    setIsSubmitting(true);

    try {
      const apiUri = process.env.NEXT_PUBLIC_API_URL;
      const url =
        userType === 'customer'
          ? `${apiUri}/v1/auth/user/findId`
          : `${apiUri}/v1/auth/manager/findId`;

      // [수정] body 구성 로직 변경 (점주면 businessNum 포함)
      const body =
        userType === 'customer'
          ? { email: email }
          : { businessNum: businessNum, email: email };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('일치하는 회원 정보를 찾을 수 없습니다.');
        }
        throw new Error('아이디 찾기 중 오류가 발생했습니다.');
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);

      const resultData = responseData.data || responseData;

      if (userType === 'customer') {
        router.push(`/find/id/customer?loginId=${encodeURIComponent(resultData.loginId)}&createdAt=${encodeURIComponent(resultData.createdAt)}`);
      } else {
        router.push(`/find/id/owner?loginId=${encodeURIComponent(resultData.loginId)}&createdAt=${encodeURIComponent(resultData.createdAt)}`);

      }
    } catch (error: any) {
      console.error('Find ID error:', error);
      alert(error.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-row items-center self-start mt-3 gap-4 px-6">
        <BackButton />
        <p className="text-[16px]">아이디 찾기</p>
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
          onClick={() => {
            setUserType('customer');
            setBusinessNum(''); // 탭 전환시 초기화
            setIsVerified(false); // 탭 전환시 인증 초기화 권장
          }}
        >
          개인회원
        </div>
        <div
          className={`flex h-full items-center justify-center w-1/2 cursor-pointer ${
            userType === 'owner'
              ? 'border-b-2 border-black font-semibold'
              : 'border-b border-gray-500 text-gray-500'
          }`}
          onClick={() => {
            setUserType('owner');
            setIsVerified(false); // 탭 전환시 인증 초기화 권장
          }}
        >
          점주회원
        </div>
      </div>

      <div className="w-full h-auto px-6">
        <p className="self-start mt-10 text-[20px]">
          본인확인을 위해
          <br />
          {userType === 'owner' ? '사업자 정보와 ' : ''}이메일 인증을 완료해
          주세요.
        </p>

        <div className="flex flex-col mt-10 w-full items-center">
          <div className="flex flex-col items-center w-full text-[12px]">
            {/* [추가] 점주회원일 때만 보이는 사업자등록번호 입력창 */}
            {userType === 'owner' && (
              <div className="flex flex-row gap-4 mt-2 w-full mb-2">
                <input
                  type="text"
                  placeholder="사업자등록번호 (꼭 하이픈('-')을 빼고 입력해주세요)"
                  className="w-full h-[48px] border-(--fill-color3) rounded-[10px] border p-3"
                  value={businessNum}
                  onChange={(e) => setBusinessNum(e.target.value)}
                />
              </div>
            )}

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
