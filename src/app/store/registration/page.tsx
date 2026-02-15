'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import UserBottomBar from '@/components/UserBottomBar';
import BackButton from '@/components/BackButton';
import { Suspense } from 'react';

// API 기본 주소
const apiUri = process.env.NEXT_PUBLIC_API_URL;

// 1. 매장 상세 정보 타입 (GET /v1/stores/search)
interface StoreDetailData {
  storeId: number;
  storeName: string;
  storeAddress: string;
  category: string;
  phone: string;
  storeUrl: string;
  stampImageUrl: string;
  storeImageUrl: string;
  reward: string;
  stampReward: string;
  sns: string;
}

// 2. 스탬프 등록 응답 타입 (POST /v1/stamps)
interface StampRegistrationResponse {
  userId: number;
  storeId: number;
  stampId: number;
  storeName: string;
  reward: string;
  currentCount: number;
  maxCount: number;
}

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 이전 페이지에서 전달받은 state
  const storeIdParam = searchParams.get('storeId');
  const storeNameParam = searchParams.get('storeName');

  // State 관리
  const [storeInfo, setStoreInfo] = useState<StoreDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // [추가됨] 즐겨찾기 State
  const [isFavorited, setIsFavorited] = useState(false);

  // 스탬프 더미 데이터
  const stamps = Array(10).fill(false);

  // ----------------------------------------------------------------
  // 1. 매장 상세 정보 조회
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!storeNameParam && !storeIdParam) {
      alert('잘못된 접근입니다.');
      router.back();
      return;
    }

    const fetchStoreDetail = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const response = await axios.get(`${apiUri}/v1/stores/search`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { storeName: storeNameParam || '', storeId: storeIdParam || '' },
        });

        const searchResults: StoreDetailData[] = response.data;
        // paramStoreId가 있으면 그것과 일치하는 것, 없으면 이름 검색 결과 중 첫 번째
        const targetStore = storeIdParam
          ? searchResults.find((item) => item.storeId === Number(storeIdParam))
          : searchResults[0];

        if (targetStore) {
          setStoreInfo(targetStore);
        } else {
          console.warn(
            '일치하는 매장을 찾을 수 없어 첫 번째 결과를 표시합니다.'
          );
          setStoreInfo(searchResults[0] || null);
        }
      } catch (error) {
        console.error('매장 상세 정보 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetail();
  }, [storeIdParam, storeNameParam, router]);

  // ----------------------------------------------------------------
  // [추가됨] 2. 즐겨찾기 상태 확인 (storeInfo가 로드된 후 실행)
  // ----------------------------------------------------------------
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      // storeInfo가 없으면 아직 로딩 전이므로 실행하지 않음
      if (!storeInfo) return;

      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        // 즐겨찾기 목록 전체 조회
        const response = await fetch(`${apiUri}/v1/favstores`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            // 현재 보고 있는 매장 ID(storeInfo.storeId)가 즐겨찾기 목록에 있는지 확인
            // *주의: API 응답 구조에 따라 item.storeId 타입(number/string) 확인 필요
            const found = result.data.find(
              (item: any) => Number(item.storeId) === Number(storeInfo.storeId)
            );
            // found가 존재하고 favorite이 true면 true 설정
            setIsFavorited(found ? found.favorite : false);
          }
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavoriteStatus();
  }, [storeInfo]); // storeInfo가 변경(로드)될 때 실행

  // ----------------------------------------------------------------
  // [추가됨] 3. 즐겨찾기 토글 핸들러
  // ----------------------------------------------------------------
  const handleToggleFavorite = async () => {
    if (!storeInfo) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const url = `${apiUri}/v1/favstores/${storeInfo.storeId}`;
    const method = isFavorited ? 'DELETE' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setIsFavorited((prev) => !prev);
        alert(
          isFavorited
            ? '즐겨찾기에서 해제되었습니다.'
            : '즐겨찾기에 추가되었습니다.'
        );
      }
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다.');
    }
  };

  // ----------------------------------------------------------------
  // 4. 스탬프 등록 핸들러 (POST /v1/stamps)
  // ----------------------------------------------------------------
  const handleRegisterStamp = async () => {
    if (!storeInfo) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post<StampRegistrationResponse>(
        `${apiUri}/v1/stamps`,
        { storeId: storeInfo.storeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      alert(
        `[${data.storeName}] 스탬프 카드가 등록되었습니다!\n` +
          `보상: ${data.reward}\n` +
          `현재 스탬프: ${data.currentCount}/${data.maxCount}`
      );
      router.push('/user/stamp');
    } catch (error) {
      console.error('스탬프 등록 실패:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert('이미 등록된 스탬프 카드입니다.');
        router.push('/user/stamp');
      }
    }
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="w-[430px] min-h-screen bg-white flex items-center justify-center mx-auto">
        <p className="text-gray-400">매장 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 데이터가 없을 경우
  if (!storeInfo) {
    return (
      <div className="w-[430px] min-h-screen bg-white flex items-center justify-center mx-auto">
        <div className="text-center">
          <p className="text-gray-800 mb-4">매장 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col mx-auto relative shadow-lg">
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {/* 1. 매장 이미지 헤더 */}
        <div className="relative w-full h-60">
          <Image
            src={storeInfo.storeImageUrl}
            alt={storeInfo.storeName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x400?text=Store+Image';
            }}
            fill
          />
          {/* 헤더 버튼들 */}
          <div className="absolute top-4 left-4">
            <BackButton />
          </div>

          {/* [수정됨] 하트 & 공유 버튼 영역 */}
          <div className="absolute top-4 right-4 flex flex-row justify-center items-center w-20 h-10 bg-white/80 rounded-[20px] opacity-90 p-1">
            <Image
              src={isFavorited ? '/assets/heart_icon.png' : '/assets/heart_empty_icon.png'}
              alt="찜하기"
              className="w-[16px] h-[16px] m-3 cursor-pointer"
              onClick={handleToggleFavorite}
              width={16}
              height={16}
            />
            <Image
              src="/assets/share_icon.png"
              alt="공유하기"
              className="w-[16px] h-[16px] m-3 cursor-pointer"
              width={16}
              height={16}
            />
          </div>
        </div>

        {/* 2. 매장 정보 섹션 */}
        <div className="px-6 pt-6 pb-4 bg-white">
          <div className="flex items-end gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {storeInfo.storeName}
            </h1>
            <span className="text-sm text-gray-400 mb-1">
              {storeInfo.category}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-6">{storeInfo.storeAddress}</p>

          {/* 연락처 정보 */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            {/* 전화번호 */}
            <div className="flex items-center gap-3">
              <Image src='/assets/phone_icon.png' alt="전화" className="w-4 h-4 opacity-60" width={16} height={16} />
              <span className="text-sm text-gray-600">
                {storeInfo.phone || '전화번호 없음'}
              </span>
            </div>

            {/* 웹사이트 (storeUrl) */}
            <div className="flex items-center gap-3">
              <Image
                src='/assets/internet_icon.png'
                alt="웹사이트"
                className="w-4 h-4 opacity-60"
                width={16}
                height={16}
              />
              <a
                href={storeInfo.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-orange-500 truncate max-w-[250px]"
              >
                {storeInfo.storeUrl || '웹사이트 없음'}
              </a>
            </div>

            {/* SNS */}
            <div className="flex items-center gap-3">
              <Image src='/assets/instagram_icon.png' alt="SNS" className="w-4 h-4 opacity-60" width={16} height={16} />
              <span className="text-sm text-gray-600">
                {storeInfo.sns || 'SNS 정보 없음'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. 스탬프 섹션 (회색 배경) */}
        <div className="bg-[#F6F6F6] px-6 py-6 min-h-[300px]">
          <h2 className="text-[#8C7E74] font-bold mb-4 text-lg">Stamp</h2>

        {/* 스탬프 카드 */}
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <Image
            src={storeInfo.stampImageUrl || '/assets/default_stamp_card.png'}
            alt="스탬프 카드"
            width={400}
            height={250}
            className="w-full h-auto object-contain"
          />
            <div className="bg-gray-200 py-2 text-[14px] text-gray-600 font-medium text-center">
              {storeInfo.stampReward || '스탬프를 모아 혜택을 받으세요!'}
            </div>
        </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm font-medium">
            <Image
              src="/assets/gift_icon.png"
              alt="리워드"
              className="w-[18px] h-[18px] object-contain"
              width={18}
              height={18}
            />
            <span>리워드 보상: {storeInfo.reward}</span>
          </div>

          <div className="mt-8 mb-4">
            <button
              className="w-full bg-[#FF6B00] text-white py-4 rounded-full font-bold text-lg shadow-md hover:bg-orange-600 transition-colors"
              onClick={handleRegisterStamp}
            >
              스탬프 등록하기
            </button>
          </div>
        </div>
      </div>

      <UserBottomBar />
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div></div>}>
      <PageContent />
    </Suspense>
  )
};