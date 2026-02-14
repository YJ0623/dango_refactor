'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserBottomBar from '@/components/UserBottomBar';

interface CouponData {
  userId: number;
  storeId: number;
  couponId: number;
  couponName: string;
  expiredDate: string;
  used: boolean;
}

const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const Coupon: React.FC = () => {
  const { couponId } = useParams<{ couponId: string }>();
  const router = useRouter();
  const [code, setCode] = useState<string>('');
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}까지`;
  };

  useEffect(() => {
    if (!couponId) {
      setLoading(false);
      return;
    }

    const fetchCouponDetail = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${apiUri}/v1/coupons/${couponId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('쿠폰 상세 정보를 불러오는데 실패했습니다.');
        }

        const jsonResponse = await response.json();
        if (jsonResponse.data) {
          setCouponData(jsonResponse.data);
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCouponDetail();
  }, [couponId]);

  // ✅ [NEW] 로딩 완료 시 자동으로 입력창에 포커스 주기
  useEffect(() => {
    // 로딩이 끝났고, 데이터가 있으며, 아직 사용 안 된 쿠폰일 때
    if (!loading && couponData && !couponData.used) {
      // DOM 렌더링 안정성을 위해 약간의 지연 후 포커스
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading, couponData]);

  // ✅ [NEW] 화면의 빈 공간을 클릭해도 입력창에 포커스 유지 (UX 개선)
  const handleWrapperClick = () => {
    if (!loading && couponData && !couponData.used && !isConfirming) {
      inputRef.current?.focus();
    }
  };

  const handleCouponConfirm = async (verificationCode: string) => {
    if (isConfirming || !couponId || couponData?.used) return;

    setIsConfirming(true);
    setConfirmMessage(null);

    const urlWithQuery = `${apiUri}/v1/coupons/${couponId}/confirm?verificationCode=${verificationCode}`;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(urlWithQuery, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const textResponse = await response.text();
      const jsonResponse = textResponse ? JSON.parse(textResponse) : {};

      if (!response.ok || jsonResponse.code !== 100) {
        const errorMessage =
          jsonResponse.message ||
          `오류가 발생했습니다. (HTTP ${response.status})`;
        setConfirmMessage(`❌ 오류: ${errorMessage}`);
        setCode('');
        return;
      }

      setCouponData((prev) => (prev ? { ...prev, used: true } : null));
      setCode('');
    } catch (error) {
      console.error('Coupon Confirm API Error:', error);
      setConfirmMessage('❌ 네트워크 오류가 발생했습니다.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleGoBackToCouponBox = () => {
    router.push('/user/coupon/box');
  };

  const handleHeaderBackClick = () => {
    if (couponData?.used) {
      router.push('/user/mypage');
    } else {
      router.back();
    }
  };

  // 기존 handleContainerClick (박스 클릭용)
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 상위 전파 방지
    if (couponData?.used || isConfirming) return;
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (couponData?.used || isConfirming) return;

    if (value.length <= 4) {
      setCode(value);
      if (value.length === 4) {
        handleCouponConfirm(value);
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  if (!couponData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        정보 없음
      </div>
    );

  const SuccessUI = (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          쿠폰 사용 성공!
        </h2>
        <p className="text-sm text-gray-500 mb-10">
          달성한 스탬프판은 자동삭제되고
          <br />
          히스토리 기록에서 볼 수 있어요.
        </p>
        <div className="w-full mr-2 ml-2 max-w-xs bg-white rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.05)] p-8 mb-12 border border-gray-50 flex items-center justify-center h-32">
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-gray-800 font-bold text-base">
            {couponData.couponName}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            스탬프를 다 채워 달성한
            <br />
            리워드 쿠폰입니다.
          </p>
          <p className="text-sm text-blue-500 font-semibold pt-1">
            기한: **{formatDate(couponData.expiredDate)}**
          </p>
        </div>
      </div>
      <footer className="p-6">
        <button
          onClick={handleGoBackToCouponBox}
          className="w-full py-4 text-white font-bold rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors"
        >
          쿠폰함 돌아가기
        </button>
      </footer>
    </>
  );

  const InputUI = (
    <>
      <h2 className="text-xl font-bold text-gray-800 mb-10 leading-snug">
        {isConfirming ? (
          <span className="text-orange-500">사용 처리 중입니다...</span>
        ) : (
          <>
            매장 직원이 **확인코드를**
            <br />
            누르게 해주세요.
          </>
        )}
      </h2>
      {confirmMessage && (
        <p
          className={`mb-4 text-sm font-semibold ${
            confirmMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {confirmMessage}
        </p>
      )}

      {/* 숨겨진 Input 
         autoFocus 속성 추가 + useEffect로 포커스 강제
      */}
      <input
        ref={inputRef}
        type="tel"
        value={code}
        onChange={handleChange}
        autoFocus // ✅ 자동 포커스 속성 추가
        className={`absolute opacity-0 w-1 h-1 ${
          isConfirming ? 'pointer-events-none' : ''
        }`}
        maxLength={4}
        disabled={isConfirming}
      />

      <div
        onClick={handleContainerClick}
        className={`w-full mr-2 ml-2 max-w-xs bg-white rounded-3xl shadow-[0_0_20px_rgba(0,0,0,0.05)] p-8 mb-12 border border-gray-50 cursor-pointer ${
          isConfirming ? 'animate-pulse' : ''
        }`}
      >
        <div className="flex justify-between items-center">
          {[0, 1, 2, 3].map((index) => {
            const isFocused = index === code.length && !isConfirming;
            return (
              <div
                key={index}
                className={`w-12 h-16 rounded-lg flex items-center justify-center text-2xl transition-all duration-200 ${
                  isFocused
                    ? 'border-2 border-orange-400 bg-white'
                    : 'border border-gray-300 bg-white'
                }`}
              >
                {index < code.length ? (
                  <span className="text-gray-400 text-3xl pt-2">*</span>
                ) : (
                  ''
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-gray-800 font-bold text-base">
          {couponData.couponName}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          스탬프를 다 채워 달성한
          <br />
          리워드 쿠폰입니다.
        </p>
        <p className="text-sm text-blue-500 font-semibold pt-1">
          기한: **{formatDate(couponData.expiredDate)}**
        </p>
      </div>
    </>
  );

  return (
    <div
      // ✅ [NEW] 전체 배경 클릭 시에도 input 포커스 (빈 곳 눌러도 키패드 유지)
      onClick={handleWrapperClick}
      className="min-h-screen w-full bg-white text-gray-900 flex flex-col"
    >
      {/* 헤더 */}
      <header
        className={`flex items-center p-4 h-14 ${
          couponData.used ? '' : 'border-b border-gray-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation(); // 상위 포커스 이벤트 방지
            handleHeaderBackClick();
          }}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
          aria-label="뒤로 가기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-between">
        {couponData.used ? (
          SuccessUI
        ) : (
          <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
            {InputUI}
          </main>
        )}
      </div>

      {!couponData.used && <UserBottomBar />}
    </div>
  );
};

export default Coupon;
