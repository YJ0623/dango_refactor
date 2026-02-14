'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { OwnerBottomBar } from '@/components/OwnerBottomBar';

// 서버로부터 받아올 데이터 타입 정의
export interface StampSettingsResponse {
  storeName: string;
  requiredAmount: number;
  reward: string;
  maxCnt: number;
  imgurl: string | null;
}

// 고객 데이터 타입 (카운트용)
interface CustomerData {
  userId: number;
  nickname: string;
  createdAt: string;
  level: string | null;
}

export default function Manage() {
  const router = useRouter();

  // --- 상태 관리 ---
  const [stampSettings, setStampSettings] =
    useState<StampSettingsResponse | null>(null);
  const [customerCount, setCustomerCount] = useState<number>(0); // 고객 수 상태 추가
  const [isLoading, setIsLoading] = useState(true);

  // --- 네비게이션 핸들러 ---
  const handleGotoStampEarn = () => router.push('/owner/manage/stamp-earn');
  const handleGotoStampSetting = () => router.push('/owner/manage/stampsetting');
  const handleGotoQRGenerate = () => router.push('/owner/manage/qr-generate');
  const handleGoToQRScan = () => router.push('/owner/manage/stamp-earn/qr-scan');
  const handleGoToIdInput = () => router.push('/owner/manage/stamp-earn/id-input');
  const handleGoToCustomerList = () => router.push('/owner/manage/customerlist');

  // --- 데이터 불러오기 ---
  useEffect(() => {
    const apiUri = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem('accessToken');

    if (!token) return;

    const fetchData = async () => {
      try {
        // [Step 1] 가게 이름 가져오기
        const profileResponse = await fetch(`${apiUri}/v1/managers/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const profileJson = await profileResponse.json();
        let currentStoreName = '';

        if (profileJson.code === 100 && profileJson.data?.store) {
          currentStoreName = profileJson.data.store.storeName;
        } else {
          return;
        }

        if (currentStoreName) {
          // [Step 2] 스탬프 설정 조회하기
          const settingsPromise = fetch(
            `${apiUri}/v1/manager/settings?storeName=${encodeURIComponent(
              currentStoreName
            )}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          ).then((res) => res.json());

          // [Step 3] 고객 리스트 조회하기 (총 인원수 파악용)
          const customersPromise = fetch(
            `${apiUri}/v1/manager/customers?storeName=${encodeURIComponent(
              currentStoreName
            )}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          ).then((res) => res.json());

          // 병렬 처리
          const [settingsJson, customersJson] = await Promise.all([
            settingsPromise,
            customersPromise,
          ]);

          if (settingsJson.code === 100 || settingsJson.data) {
            // API 응답 코드 확인 필요 (보통 100 or 200)
            // settingsResponse.ok 체크 대신 json 결과로 확인
            setStampSettings(settingsJson); // settingsJson 구조에 맞게 수정 필요할 수 있음 (data 필드 등)
          } else if (settingsJson.storeName) {
            // 만약 바로 객체가 온다면
            setStampSettings(settingsJson);
          }

          if (customersJson.code === 100 && customersJson.data) {
            setCustomerCount(customersJson.data.length);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full px-6 py-4 mb-30">
      <h1 className="text-[25px] text-(--fill-color6) font-normal">
        Management
      </h1>

      <p className="mt-10 text-[18px] text-(--main-color) font-semibold">
        스탬프 관리
      </p>

      <div className="flex flex-col w-full gap-3">
        {/* ... (QR 코드, ID 입력 버튼 등 기존 코드 유지) ... */}
        <div className="w-full flex flex-row mt-5 gap-5 justify-center">
          <div
            onClick={handleGoToQRScan}
            className="w-1/2 h-[170px] rounded-[20px] flex flex-col items-center justify-center bg-(--fill-color1) text-(--fill-color7) p-5 cursor-pointer"
          >
            <Image src='/assets/qr_scan.png' width={90} height={90} alt="QR 스캔" />
            <p className="text-[14px] text-black font-medium mt-2">
              유저 QR코드 인식
            </p>
          </div>
          <div
            onClick={handleGoToIdInput}
            className="w-1/2 h-[170px] rounded-[20px] flex flex-col items-center justify-center bg-(--fill-color1) text-(--fill-color7) p-5 cursor-pointer"
          >
            <Image src='/assets/check_id.png' width={90} height={90} alt="ID 입력" />
            <p className="text-[14px] text-black font-medium mt-2">
              유저 ID 직접 입력
            </p>
          </div>
        </div>

        {/* 스탬프 설정 박스 */}
        <div className="w-full h-[240px] flex flex-col p-4 px-5 bg-(--fill-color1) text-(--fill-color7) rounded-[20px] justify-between">
          <div className="w-full flex flex-row justify-between">
            <p className="text-[14px] text-(--fill-color7) font-semibold">
              스탬프 설정
            </p>
            <Image src='/assets/logo_gt.png' width={9} height={14} alt="Go"  onClick={handleGotoStampSetting} />
          </div>

          <div className="w-[140px] h-[90px] self-center flex items-center justify-center rounded-[10px] overflow-hidden bg-gray-100 mt-2 border border-gray-200">
            {isLoading ? (
              <p className="text-[12px] text-(--fill-color6)">로딩중...</p>
            ) : stampSettings?.imgurl ? (
              <Image src={stampSettings.imgurl} width={140} height={90} alt="스탬프 디자인" className="w-full h-full object-cover" />
            ) : (
              <p className="text-[12px] text-(--fill-color6)">기본 디자인</p>
            )}
          </div>

          <div className="flex flex-row items-center justify-center gap-6">
            {/* ... (기존 설정 정보 표시) ... */}
            <div className="flex flex-col mt-5">
              <p className="text-[12px] text-(--fill-color7) font-semibold">
                적립금액 기준
              </p>
              <p className="text-[12px] text-(--fill-color6) mt-4">
                {isLoading
                  ? '로딩중...'
                  : stampSettings
                  ? `${stampSettings.requiredAmount.toLocaleString()}원 이상`
                  : '설정 필요'}
              </p>
            </div>
            <div className="w-px h-20 bg-(--fill-color2) mt-4" />
            <div className="flex flex-col mt-5">
              <p className="text-[12px] text-(--fill-color7) font-semibold">
                리워드 보상
              </p>
              <p className="text-[12px] text-(--fill-color6) mt-4">
                {isLoading
                  ? '로딩중...'
                  : stampSettings
                  ? stampSettings.reward
                  : '설정 필요'}
              </p>
            </div>
            <div className="w-px h-20 bg-(--fill-color2) mt-4" />
            <div className="flex flex-col mt-5">
              <p className="text-[12px] text-(--fill-color7) font-semibold">
                스탬프 개수
              </p>
              <p className="text-[12px] text-(--fill-color6) mt-4">
                {isLoading
                  ? '로딩중...'
                  : stampSettings?.maxCnt
                  ? `${stampSettings.maxCnt}개`
                  : '설정 필요'}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-[18px] text-(--main-color) font-semibold">
          고객 관리
        </p>

        {/* --- 수정된 부분: 고객 수 표시 및 이동 --- */}
        <div className="flex w-full h-[60px] bg-(--fill-color1) rounded-[20px] px-7 items-center flex-row justify-between mb-10">
          <p className="text-[14px] text-black font-medium">스탬프 등록 고객</p>
          <div className="flex flex-row items-center gap-3">
            <span className="text-[20px] font-bold text-black">
              {customerCount} 명
            </span>
            <Image src='/assets/goto_icon2.png' width={24} height={24} alt="Go" onClick={handleGoToCustomerList} />
          </div>
        </div>
      </div>
      <OwnerBottomBar />
    </div>
  );
};
