'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import BackButton2 from '@/components/BackButton2';
import Image from 'next/image';
import { type StoreDetail } from '@/type/Store';

import StoreInfoHome from '@/components/StoreInfoHome';
import StoreInfoReview from '@/components/StoreInfoReview';

interface Props {
  initialStore: StoreDetail | null;
  storeId: string;
}

export default function StoreInfoClient({ initialStore, storeId }: Props) {
  const [selectedTab, setSelectedTab] = useState<'home' | 'review'>('home');
  const [isFavorited, setIsFavorited] = useState(false);
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(initialStore);
  const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!storeId) return;

    const fetchStoreDetailWithLocation = async (lat: number, lng: number) => {
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
          // 🌟 [수정 핵심] .data를 제거하고 바로 json() 결과를 넣습니다!
          const data: StoreDetail = await response.json();
          setStoreDetail(data); 
        }
      } catch (error) {
        console.error('Failed to fetch store details', error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchStoreDetailWithLocation(position.coords.latitude, position.coords.longitude),
        () => fetchStoreDetailWithLocation(0.0, 0.0)
      );
    } else {
      fetchStoreDetailWithLocation(0.0, 0.0);
    }
  }, [storeId, apiUri]);

  // 2. 즐겨찾기 상태 확인
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!storeId) return;
      
      const token = localStorage.getItem('accessToken');
      if (!token) return;

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

  // 3. 즐겨찾기 토글 핸들러
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

  // 4. 공유하기 핸들러
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
        const shareUrl = result.data;

        if (navigator.share) {
          try {
            await navigator.share({
              title: storeDetail?.name || '가게 정보 공유',
              text: `${storeDetail?.name} 정보를 확인해보세요!`,
              url: shareUrl,
            });
          } catch (shareError) {
            console.log('Share canceled or failed', shareError);
          }
        } else {
          await navigator.clipboard.writeText(shareUrl);
          alert('공유 링크가 클립보드에 복사되었습니다!');
        }
      } else {
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

      {/* 탭 내용 분기 */}
      {selectedTab === 'home' ? (
        <StoreInfoHome storeDetail={storeDetail} />
      ) : (
        <StoreInfoReview
          storeId={storeId}
          reviewAvailable={storeDetail?.reviewAvailable || false}
        />
      )}
    </div>
  );
}