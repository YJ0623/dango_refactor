'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { OwnerBottomBar } from '@/components/OwnerBottomBar';
import {
  fetchDailyStats,
  fetchStats,
  fetchStoreName,
  fetchTotals,
  fetchGenderStats,
} from '@/lib/api/stats';

// 날짜 포맷팅 유틸 (YYYY-MM-DD)
const getTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

export default function Dashboard() {
  const router = useRouter();

  // 1. 적립 통계 탭
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // 2. 등록 고객 수 통계 탭
  const [customerActiveTab, setCustomerActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  const { data: storeName } = useQuery({ queryKey: ['storeName'], queryFn: fetchStoreName });

  const { data: todayStats } = useQuery({
    queryKey: ['stats', storeName, 'daily-fixed'],
    queryFn: () => fetchDailyStats(storeName!),
    enabled: !!storeName,
  });

  const { data: currentStats } = useQuery({
    queryKey: ['dashboard-stats', storeName, activeTab],
    queryFn: () => {
      if (!storeName) return Promise.reject('No store name');
      if (activeTab === 'daily') {
        return fetchDailyStats(storeName);
      } else {
        return fetchStats(storeName, activeTab);
      }
    },
    enabled: !!storeName,
  });

  const { data: customerStats } = useQuery({
    queryKey: ['dashboard-customers', storeName, customerActiveTab],
    queryFn: () => {
      if (!storeName) return Promise.reject('No store name');
      return fetchTotals(storeName, customerActiveTab);
    },
    enabled: !!storeName,
  });

  const { data: genderStats } = useQuery({
    queryKey: ['dashboard-gender', storeName],
    queryFn: () => {
      if (!storeName) return Promise.reject('No store name');
      return fetchGenderStats(storeName, getTodayDate());
    },
    enabled: !!storeName,
  });

  // ----------------------------------------------------
  // [Variable] 데이터 가공 (수정된 부분)
  // ----------------------------------------------------
  const todayCount = todayStats?.data?.totalOrAvgCount ?? 0;

  const currentCount = currentStats?.data?.totalOrAvgCount ?? 0;
  const currentDateText = currentStats?.data?.periodText ?? '';

  const customerCount = customerStats?.data?.totalOrAvgCount ?? 0;
  const customerDateText = customerStats?.data?.periodText ?? '';

  // [수정 1] 적립 통계용 라벨 (activeTab 기준)
  const accumulationLabel = activeTab === 'daily' ? '총' : '평균';

  // [수정 2] 등록 고객 수 통계용 라벨 (customerActiveTab 기준)
  // 주간/월간만 존재하므로 무조건 '평균' (혹은 나중에 daily가 추가될 경우를 대비해 로직 분리 가능)
  const customerLabel = '평균'; 

  // 성별 데이터 가공
  const womanRatio = genderStats?.data?.womanRatio ?? 0;
  const manRatio = genderStats?.data?.manRatio ?? 0;
  const totalGenderCount = genderStats?.data?.total ?? 0;

  // ... (Chart Utils 부분 그대로 유지) ...
  const size = 120;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const womanStrokeDashoffset = circumference - (womanRatio / 100) * circumference;
  const manStrokeDashoffset = circumference - (manRatio / 100) * circumference;
  const womanRotation = -90;
  const manRotation = -90 + (womanRatio / 100) * 360;

  return (
    <div className="flex flex-col w-full px-6 py-4 min-h-screen pb-[80px] bg-white mb-10">
      <h1 className="text-[25px] text-(--fill-color6) font-normal">Dashboard</h1>
      <p className="mt-10 text-[18px] text-(--main-color) font-semibold">오늘의 요약 카드</p>

      <div className="flex flex-col w-full gap-3">
        {/* --- [Section 1] 상단 요약 카드들 (생략 - 그대로 유지) --- */}
        <div className="flex flex-row w-full justify-between mt-5 gap-3">
          <div className="w-1/2 h-[140px] bg-(--fill-color1) text-(--fill-color7) rounded-[20px] p-4 flex flex-col justify-between shadow-sm">
            <p className="font-semibold text-[14px] text-gray-800">오늘 적립</p>
            <div className="flex flex-row self-end items-center text-center">
              <p className="text-[34px] font-semibold text-(--fill-color7)">{todayCount}</p>
              <p className="text-[14px] font-medium mx-1 text-[#5B5B5B]">건</p>
            </div>
          </div>
          <div className="w-1/2 h-[140px] bg-(--fill-color1) text-(--fill-color7) rounded-[20px] p-4 flex flex-col justify-between shadow-sm">
            <p className="font-semibold text-[14px] text-gray-800">오늘 교환된 리워드</p>
            <div className="flex flex-row self-end items-center text-center">
              <p className="text-[34px] font-semibold text-(--fill-color7)">0</p>
              <p className="text-[14px] font-medium mx-1 text-[#5B5B5B]">건</p>
            </div>
          </div>
        </div>

        {/* --- [Section 2] 적립 통계 카드 --- */}
        <div className="w-full h-[170px] flex flex-col p-5 bg-(--fill-color1) rounded-[20px] shadow-sm relative">
          <div className="flex flex-row justify-between items-start">
            <p className="text-[16px] text-(--fill-color7) font-bold">적립 통계</p>
            <div className="flex flex-row gap-1 bg-white p-1 rounded-full shadow-sm">
              {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-[12px] rounded-full transition-all ${
                    activeTab === tab
                      ? 'border border-gray-400 font-semibold text-gray-800'
                      : 'text-(--fill-color7) hover:text-gray-600'
                  }`}
                >
                  {tab === 'daily' ? '일간' : tab === 'weekly' ? '주간' : '월간'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            {/* [수정 적용] accumulationLabel 사용 */}
            <p className="text-[12px] text-(--fill-color7) mb-1">{accumulationLabel}</p>
            <div className="flex flex-row items-baseline gap-1">
              <p className="text-[36px] font-bold text-(--fill-color7) leading-none">{currentCount}</p>
              <p className="text-[16px] font-medium text-[#5B5B5B]">건</p>
            </div>
            <p className="text-[12px] text-(--fill-color5) mt-1">{currentDateText || '-'}</p>
          </div>
          <div
            className="absolute bottom-5 right-5 flex items-center gap-2 cursor-pointer mb-10"
            onClick={() => router.push('/owner/statistics')}
          >
            <span className="text-[12px] font-medium text-[#5B5B5B]">그래프 보러가기</span>
            <Image
            src="/assets/goto_icon.png"
            alt=""
            width={40}
            height={40}
          />
          </div>
        </div>

        <p className="mt-10 text-[18px] text-(--main-color) font-semibold">단골 현황</p>

        {/* --- [Section 3] 등록 고객 수 통계 카드 --- */}
        <div className="w-full h-[170px] flex flex-col p-5 bg-(--fill-color1) rounded-[24px] shadow-sm relative">
          <div className="flex flex-row justify-between items-start">
            <p className="text-[16px] text-(--fill-color7) font-bold">등록 고객 수 통계</p>
            <div className="flex flex-row gap-1 bg-white p-1 rounded-full shadow-sm">
              {(['weekly', 'monthly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCustomerActiveTab(tab)}
                  className={`px-3 py-1 text-[12px] rounded-full transition-all ${
                    customerActiveTab === tab
                      ? 'border border-gray-400 font-semibold text-gray-800'
                      : 'text-(--fill-color7) hover:text-gray-600'
                  }`}
                >
                  {tab === 'weekly' ? '주간' : '월간'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
             {/* [수정 적용] customerLabel 사용 */}
            <p className="text-[12px] text-(--fill-color7) mb-1">{customerLabel}</p>
            <div className="flex flex-row items-baseline gap-1">
              <p className="text-[36px] font-bold text-(--fill-color7) leading-none">{customerCount}</p>
              <p className="text-[16px] font-medium text-[#5B5B5B]">명</p>
            </div>
            <p className="text-[12px] text-(--fill-color5) mt-1">{customerDateText || '-'}</p>
          </div>
          <div
            className="absolute bottom-5 right-5 flex items-center gap-2 cursor-pointer mb-10"
            onClick={() => router.push('/owner/statistics')}
          >
            <span className="text-[12px] font-medium text-[#5B5B5B]">그래프 보러가기</span>
            <Image
              src="/assets/goto_icon.png"
              alt=""
              width={40}
              height={40}
            />
          </div>
        </div>
        
        {/* --- [Section 4] 주간 고객 성별 평균 (그대로 유지) --- */}
        <div className="w-full h-[170px] flex flex-row items-center justify-between p-6 bg-(--fill-color1) rounded-[20px] shadow-sm">
           {/* ... (생략) ... */}
           {/* 기존 코드 유지 */}
           <div className="relative w-[120px] h-[120px] flex items-center justify-center">
             <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
               <defs>
                 <linearGradient id="womanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#EB4F8D" />
                   <stop offset="100%" stopColor="#FFBBD6" />
                 </linearGradient>
                 <linearGradient id="manGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#1417B9" />
                   <stop offset="100%" stopColor="#9091CD" />
                 </linearGradient>
               </defs>
               <circle cx={center} cy={center} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
               {totalGenderCount > 0 && (
                 <>
                   <circle cx={center} cy={center} r={radius} fill="none" stroke="url(#womanGradient)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={womanStrokeDashoffset} strokeLinecap="round" transform={`rotate(${womanRotation} ${center} ${center})`} className="transition-all duration-500 ease-out" />
                   <circle cx={center} cy={center} r={radius} fill="none" stroke="url(#manGradient)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={manStrokeDashoffset} strokeLinecap="round" transform={`rotate(${manRotation} ${center} ${center})`} className="transition-all duration-500 ease-out" />
                 </>
               )}
             </svg>
           </div>
           <div className="flex flex-col justify-center flex-1 ml-6 h-full">
             <p className="text-[16px] text-(--fill-color7) font-bold mb-4">주간 고객 성별 평균</p>
             <div className="flex flex-col gap-2">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#EB4F8D]" />
                   <span className="text-[14px] font-bold text-[#EB4F8D]">여자</span>
                 </div>
                 <div className="flex items-baseline">
                   <span className="text-[20px] font-bold text-[#EB4F8D]">{womanRatio}</span>
                   <span className="text-[12px] text-[#EB4F8D] ml-0.5">%</span>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#1417B9]" />
                   <span className="text-[14px] font-bold text-[#1417B9]">남자</span>
                 </div>
                 <div className="flex items-baseline">
                   <span className="text-[20px] font-bold text-[#1417B9]">{manRatio}</span>
                   <span className="text-[12px] text-[#1417B9] ml-0.5">%</span>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>
      <OwnerBottomBar />
    </div>
  );
};