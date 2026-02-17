'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import Wallet1 from '../../public/assets/wallet1.png';
import Wallet2 from '../../public/assets/wallet2.png';
import Wallet3 from '../../public/assets/wallet3.png';
import Wallet4 from '../../public/assets/wallet4.png';
import Wallet5 from '../../public/assets/wallet5.png';
import { useAuthStore } from '@/store/useAuthStore';

// ==========================================
// ✅ 1. StampCard 컴포넌트 (UI 표시용)
// ==========================================

export interface StampData {
  storeName: string;
  currentCount: number;
  maxCount: number;
  stampImageUrl: string;
}

interface StampCardProps {
  data: StampData | null;
  currentIndex?: number;
  totalLength?: number;
}

const StampCard = ({
  data,
  currentIndex = 0,
  totalLength = 0,
}: StampCardProps) => {
  if (!data) {
    return (
      <div className="bg-white rounded-[24px] p-6 shadow-sm h-[100px] flex items-center justify-center text-gray-400 text-sm border border-gray-100">
        적립된 스탬프 정보가 없습니다.
      </div>
    );
  }

  const remaining = Math.max(0, data.maxCount - data.currentCount);

  return (
    <div className="bg-white rounded-3xl px-6 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative border border-gray-100/50">
      <div className="flex justify-center items-center">
        <div>
          <p className="text-black text-[14px] tracking-tight mb-0.5">
            이 카페{' '}
            <span className="font-bold text-gray-900">{remaining}잔 더</span>{' '}
            적립하면 스탬프 완성!
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[#FF6B00] font-bold text-[28px] leading-tight font-sans">
              {data.currentCount}/{data.maxCount}
            </span>
            <span className="text-black text-[14px] font-medium">
              개 현재 적립
            </span>
          </div>
        </div>
      </div>

      {totalLength > 1 && (
        <div className="flex justify-center items-center gap-1.5 absolute bottom-3 left-0 right-0">
          {Array.from({ length: Math.min(5, totalLength) }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex % 5
                  ? 'w-4 h-1.5 bg-gray-800'
                  : 'w-1.5 h-1.5 bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// ✅ 2. StampSection 내부 로직
// ==========================================

interface StampResponse {
  storeName: string;
  currentCount: number;
  maxCount: number;
  stampImageUrl: string;
}

interface DashboardResponse {
  timestamp: string;
  code: number;
  message: string;
  data: {
    myInfo: {
      nickname: string;
      totalStampSum: number;
      topPercent: string;
      profileImageUrl: string;
    };
    topStampers: any[];
  };
}

interface StampCardData {
  id: number;
  name: string;
  currentStamps: number;
  totalStamps: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SWIPE_THRESHOLD = 50;
const DAMPING_FACTOR = 0.7;

const getWalletImage = (totalStampSum: number): StaticImageData => {
  if (totalStampSum < 20) return Wallet1;
  if (totalStampSum < 40) return Wallet2;
  if (totalStampSum < 60) return Wallet3;
  if (totalStampSum < 80) return Wallet4;
  return Wallet5;
};

const StampCardContent = ({
  currentStamps,
  totalStamps,
}: {
  currentStamps: number;
  totalStamps: number;
}) => (
  <div className="w-full h-full px-5 py-4 flex flex-col justify-between bg-white select-none pointer-events-none">
    <div className="flex-1 flex items-center justify-center">
      <div className="grid grid-cols-5 gap-x-4 gap-y-3">
        {Array.from({ length: totalStamps }).map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {i < currentStamps ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-800"
              >
                <path
                  d="M18 8H19C20.1046 8 21 8.89543 21 10V12C21 13.1046 20.1046 14 19 14H18V8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 8H18V15C18 17.2091 16.2091 19 14 19H6C3.79086 19 2 17.2091 2 15V8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 1V4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 1V4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 1V4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-300"
              >
                <path
                  d="M18 8H19C20.1046 8 21 8.89543 21 10V12C21 13.1046 20.1046 14 19 14H18V8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 8H18V15C18 17.2091 16.2091 19 14 19H6C3.79086 19 2 17.2091 2 15V8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 1V4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 1V4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 1V4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
    <div className="flex justify-center mt-2">
      <div className="bg-gray-200 rounded-full px-4 py-1.5 flex items-center justify-center w-full max-w-[90%]">
        <span className="text-[10px] text-gray-600 font-bold tracking-tighter">
          스탬프 {totalStamps}개 모으면 무료 쿠폰!
        </span>
      </div>
    </div>
  </div>
);

const StampSection = () => {
  // --- zustand store ---
  const { accessToken, initializeFromStorage } = useAuthStore();

  // --- 상태 관리 ---
  const [stampCards, setStampCards] = useState<StampCardData[]>([]);
  const [currentWallet, setCurrentWallet] = useState<StaticImageData>(Wallet1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  const totalCardsRef = useRef(0);

  // 토큰 복원
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  // --- 데이터 페칭 ---
  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        };

        const [stampsRes, dashboardRes] = await Promise.all([
          fetch(`${API_BASE_URL}/v1/users/stamps`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/v1/rewards/dashboard`, {
            method: 'GET',
            headers,
          }),
        ]);

        if (!stampsRes.ok) throw new Error(`스탬프 로딩 실패`);
        if (!dashboardRes.ok) throw new Error(`대시보드 로딩 실패`);

        const stampsData: StampResponse[] = await stampsRes.json();
        const dashboardData: DashboardResponse = await dashboardRes.json();

        const formattedData: StampCardData[] = stampsData.map(
          (item, index) => ({
            id: index,
            name: item.storeName,
            currentStamps: item.currentCount,
            totalStamps: item.maxCount,
          })
        );
        setStampCards(formattedData);
        totalCardsRef.current = formattedData.length;

        const totalSum = dashboardData.data.myInfo.totalStampSum || 0;
        setCurrentWallet(getWalletImage(totalSum));
      } catch (error: any) {
        console.error('Failed to fetch data:', error);
        setErrorMsg(error.message);
        setStampCards([]);
        totalCardsRef.current = 0;
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  useEffect(() => {
    totalCardsRef.current = stampCards.length;
  }, [stampCards]);

  // --- 드래그 로직 ---
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setCurrentY(0);

    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleDragEnd);
  }, []);

  const processMove = (y: number) => {
    const total = totalCardsRef.current;
    if (total === 0) return;

    const rawDeltaY = y - startYRef.current;
    const dampedDeltaY = rawDeltaY * DAMPING_FACTOR;

    if (dampedDeltaY < -SWIPE_THRESHOLD) {
      setActiveIndex((prevIndex) => (prevIndex + 1) % total);
      startYRef.current = y;
      setCurrentY(0);
    } else if (dampedDeltaY > SWIPE_THRESHOLD) {
      setActiveIndex((prevIndex) => (prevIndex - 1 + total) % total);
      startYRef.current = y;
      setCurrentY(0);
    } else {
      setCurrentY(dampedDeltaY);
    }
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    processMove(e.clientY);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();
    processMove(e.touches[0].clientY);
  }, []);

  const handleDragStart = (y: number) => {
    if (totalCardsRef.current === 0) return;
    isDraggingRef.current = true;
    startYRef.current = y;
    setCurrentY(0);

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };

  // --- 렌더링 준비 ---
  const currentStampData =
    stampCards.length > 0 ? stampCards[activeIndex] : null;

  const stampCardProps: StampData | null = currentStampData
    ? {
        storeName: currentStampData.name,
        currentCount: currentStampData.currentStamps,
        maxCount: currentStampData.totalStamps,
        stampImageUrl: '',
      }
    : null;

  // --- UI 렌더링 ---
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 h-48 flex items-center justify-center text-gray-400 animate-pulse">
        스탬프 정보를 불러오는 중...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white rounded-lg p-4 h-48 flex flex-col items-center justify-center text-red-400 gap-2">
        <p className="text-sm text-center">{errorMsg}</p>
        <p className="text-xs text-gray-400 text-center">로그인 확인 필요</p>
      </div>
    );
  }

  if (stampCards.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 h-48 flex items-center justify-center text-gray-400">
        진행 중인 스탬프가 없습니다. <br /> 카페를 방문해서 스탬프를 적립해보세요!
      </div>
    );
  }

  return (
    <div className="rounded-lg pb-6 overflow-hidden relative z-0">
      {/* 1. 3D 카드 스택 (드래그 영역) */}
      <div
        className="relative h-70 w-full flex items-center touch-none"
        onMouseDown={(e: React.MouseEvent) => handleDragStart(e.clientY)}
        onTouchStart={(e: React.TouchEvent) =>
          handleDragStart(e.touches[0].clientY)
        }
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-0">
          <Image
            src={currentWallet}
            alt="My Wallet Level"
            className="h-[240px] w-auto object-contain drop-shadow-xl"
          />
        </div>

        <div
          className={`relative w-[250px] h-[160px] ml-[39px] z-10 ${
            isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {stampCards.map((card, index) => {
            const total = stampCards.length;
            let offset = index - activeIndex;
            if (offset > total / 2) offset -= total;
            else if (offset < -total / 2) offset += total;

            let translateY, scale, opacity, zIndex, rotate;
            const animationProgressDenom = SWIPE_THRESHOLD * 2;

            if (offset === 0) {
              translateY = currentY;
              scale = 1;
              opacity = 1;
              zIndex = 10;
              rotate = '0deg';
            } else if (offset > 0) {
              const progress = Math.min(
                1,
                Math.max(0, -currentY / animationProgressDenom)
              );
              translateY = 15 * offset * (1 - progress);
              scale = 1 - 0.05 * offset + 0.05 * offset * progress;
              rotate = `${3 * offset * (1 - progress)}deg`;
              opacity = offset <= 3 ? 1 : 0;
              zIndex = 10 - offset;
            } else {
              const progress = Math.min(
                1,
                Math.max(0, currentY / animationProgressDenom)
              );
              const currentOffset = Math.abs(offset);
              const baseTranslateY = -15 * currentOffset;
              translateY = baseTranslateY + (0 - baseTranslateY) * progress;
              scale =
                1 - 0.05 * currentOffset + 0.05 * currentOffset * progress;
              rotate = `${
                -3 * currentOffset + 3 * currentOffset * progress
              }deg`;
              opacity = currentOffset <= 3 ? 1 : 0;
              zIndex = 5 - currentOffset;
            }

            return (
              <div
                key={card.id}
                className={`absolute w-full h-full flex-shrink-0 rounded-[12px] shadow-[0_4px_10px_rgba(0,0,0,0.15)] overflow-hidden ${
                  isDraggingRef.current
                    ? ''
                    : 'transition-all duration-500 ease-out'
                }`}
                style={{
                  transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate})`,
                  opacity,
                  zIndex,
                  transformOrigin:
                    offset === 0 ? 'center center' : 'left center',
                }}
              >
                <StampCardContent
                  currentStamps={card.currentStamps}
                  totalStamps={card.totalStamps}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ [추가됨] 중앙 정보 섹션 (가게 이름 + 스탬프 개수) */}
      <div className="flex flex-col items-center justify-center py-2 mb-2">
        {currentStampData && (
          <>
            <div className="flex items-center gap-1.5 mb-0.5">
              {/* 커피 아이콘 SVG */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-600"
              >
                <path
                  d="M18 8H19C20.1046 8 21 8.89543 21 10V12C21 13.1046 20.1046 14 19 14H18V8Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 8H18V15C18 17.2091 16.2091 19 14 19H6C3.79086 19 2 17.2091 2 15V8Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* 가게 이름 */}
              <h3 className="text-[19px] font-bold text-gray-900 tracking-tight">
                {currentStampData.name}
              </h3>
            </div>
            {/* 스탬프 개수 */}
            <p className="text-[15px] font-semibold text-gray-500">
              {currentStampData.currentStamps}/{currentStampData.totalStamps}
            </p>
          </>
        )}
      </div>

      {/* 2. 하단 StampCard (현재 활성화된 카드 정보 연동) */}
      <div className="px-1">
        <StampCard
          data={stampCardProps}
          currentIndex={activeIndex}
          totalLength={stampCards.length}
        />
      </div>
    </div>
  );
};

export default StampSection;
