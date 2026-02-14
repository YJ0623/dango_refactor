'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BackButton2 from '@/components/BackButton2';

// 컴포넌트 & 타입 import
import StoreInfoHome from '@/app/store/info/[storeId]/home/page';
import StoreInfoReview from '@/app/store/info/[storeId]/review/page';
import { type StoreDetail } from '@/type/Store';

import Image from 'next/image';

export default function StoreInfo() {
  const [selectedTab, setSelectedTab] = useState<'home' | 'review'>('home');
  const [isFavorited, setIsFavorited] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  // 가게 상세 정보 State
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);

  const { storeId } = useParams<{ storeId: string }>();
  const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // 1. 가게 상세 정보 조회 (위치 기반)
  useEffect(() => {
    if (!storeId) return;

    const fetchStoreDetail = async (lat: number, lng: number) => {
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(
          `${apiUri}/v1/stores/${storeId}?latitude=${lat}&longitude=${lng}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (response.ok) {
          const data: StoreDetail = await response.json();
          setStoreDetail(data);
        } else {
          console.error('Store Info fetch failed:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch store details', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 위치 정보 가져오기 로직
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchStoreDetail(latitude, longitude);
        },
        (error) => {
          console.warn('Location access denied/error:', error);
          fetchStoreDetail(0.0, 0.0);
        }
      );
    } else {
      fetchStoreDetail(0.0, 0.0);
    }
  }, [storeId, apiUri]);

  // 2. 즐겨찾기 상태 확인
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!storeId) {
        setIsLoading(false);
        return;
      }
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${apiUri}/v1/favstores`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data)) {
            const storeData = result.data.find(
              (item: any) => item.storeId === Number(storeId)
            );
            setIsFavorited(storeData ? storeData.favorite : false);
          }
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };
    checkFavoriteStatus();
  }, [storeId, apiUri]);

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = async () => {
    if (!storeId) return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    const url = `${apiUri}/v1/favstores/${storeId}`;
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
    }
  };

  // --- [추가된 부분] 공유하기 핸들러 ---
  const handleShare = async () => {
    if (!storeId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiUri}/v1/stores/${storeId}/share`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const result = await response.json();
        const shareUrl = result.data; // 예: "https://daango.site/store/1"

        // 1. 모바일 네이티브 공유 (지원하는 브라우저인 경우)
        if (navigator.share) {
          try {
            await navigator.share({
              title: storeDetail?.name || '가게 정보 공유',
              text: `${storeDetail?.name} 정보를 확인해보세요!`,
              url: shareUrl,
            });
            // 공유 성공 시 별도 알림이 필요 없다면 생략 가능
          } catch (shareError) {
            console.log('Share canceled or failed', shareError);
          }
        }
        // 2. 미지원 브라우저(PC 등)는 클립보드 복사
        else {
          await navigator.clipboard.writeText(shareUrl);
          alert('공유 링크가 클립보드에 복사되었습니다!');
        }
      } else {
        console.error('공유 링크 생성 실패:', response.status);
        alert('공유 링크를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Share request failed:', error);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      {/* 상단 이미지 및 헤더 */}
      <div className="w-full h-[220px] bg-amber-100 relative shrink-0">
        {storeDetail?.storeImageUrl && (
          <Image
            src={storeDetail.storeImageUrl}
            alt="가게 전경"
            className="absolute w-full h-full object-cover z-0"
            width={375}
            height={220}
          />
        )}
        <div className="absolute w-full h-full bg-black/10 z-0" />
        <div className="w-full flex justify-between items-start relative z-10 p-4">
          <BackButton2 />
          <div className="flex flex-row justify-center items-center w-20 h-10 bg-[var(--fill-color1)] rounded-[20px] opacity-90 p-1">
            <Image
              src={isFavorited ? '/assets/heart_icon.png' : '/assets/heart_empty_icon.png'}
              alt="찜하기"
              className="m-3 cursor-pointer"
              onClick={handleToggleFavorite}
              width={16}
              height={16}
            />
            {/* onClick 이벤트 추가 */}
            <Image
              src='/assets/share_icon.png'
              alt="공유하기"
              className="m-3 cursor-pointer"
              onClick={handleShare}
              width={16}
              height={16}
            />
          </div>
        </div>
      </div>

      {/* 가게 정보 요약 및 탭 버튼 */}
      <div className="w-full h-[180px] flex flex-col items-center justify-around px-6 shrink-0">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[var(--fill-color7)] font-semibold text-[24px]">
            {storeDetail?.name || '로딩 중...'}
          </p>
          <p className="text-[var(--fill-color6)] font-medium text-[14px]">
            {storeDetail?.category || '카테고리'}
          </p>
        </div>
        <p className="text-[var(--fill-color4)] text-[12px]">
          {storeDetail?.address || '주소 정보 없음'}
        </p>

        <div className="flex flex-row justify-center items-center w-full h-[54px] bg-[var(--fill-color1)] rounded-[50px]">
          <div className="flex w-1/2 justify-center items-center">
            <button
              className={`w-[calc(100%-20px)] transition-all ${
                selectedTab === 'home'
                  ? 'bg-white h-[40px] rounded-[30px] shadow-sm'
                  : 'h-[40px] text-gray-400'
              }`}
              onClick={() => setSelectedTab('home')}
            >
              홈
            </button>
          </div>
          <div className="flex w-1/2 justify-center items-center">
            <button
              className={`w-[calc(100%-20px)] transition-all ${
                selectedTab === 'review'
                  ? 'bg-white h-[40px] rounded-[30px] shadow-sm'
                  : 'h-[40px] text-gray-400'
              }`}
              onClick={() => setSelectedTab('review')}
            >
              리뷰
            </button>
          </div>
        </div>
      </div>

      {/* 탭 내용 */}
      {selectedTab === 'home' ? (
        <StoreInfoHome storeDetail={storeDetail} />
      ) : (
        storeId && (
          <StoreInfoReview
            storeId={storeId}
            reviewAvailable={storeDetail?.reviewAvailable || false}
          />
        )
      )}
    </div>
  );
};
