// src/components/store/StoreHome.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // react-router-dom -> next/navigation
import { StoreDetail } from '@/types/store'; // 경로 별칭(@) 사용 권장

// 정적 이미지 import (Next.js 방식)
// *실제 프로젝트에서는 public 폴더에 넣고 경로 문자열로 쓰는 것을 추천합니다.*
import clockIcon from '@/assets/clock.png';
import phoneIcon from '@/assets/phone_icon.png';
import internetIcon from '@/assets/internet_icon.png';
import instagramIcon from '@/assets/instagram_icon.png';
import defaultStoreStamp from '@/assets/store_stamp.png';
import giftIcon from '@/assets/gift_icon.png';

interface StoreHomeProps {
  store: StoreDetail; // null 체크는 상위(Server Component)에서 처리
}

export default function StoreHome({ store }: StoreHomeProps) {
  const router = useRouter();

  // 스탬프 등록 핸들러
  const handleRegisterStamp = async () => {
    // 일본 취업 Tip: try-catch 구문에서 사용자 경험(UX)을 고려한 에러 처리를 보여주세요.
    if (!store.storeId) {
      alert('매장 정보를 찾을 수 없습니다.');
      return;
    }

    // *추후 백엔드 연동 시 Supabase Auth나 Server Action으로 교체 권장*
    // 현재는 기존 로직 유지 (LocalStorage 사용)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      const confirmLogin = confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?');
      if (confirmLogin) router.push('/login');
      return;
    }

    try {
      // API 호출 로직은 별도 서비스 함수로 분리하는 것이 좋습니다 (Clean Code)
      // 예: await registerStamp(store.storeId, token);
      alert('스탬프 등록 기능은 백엔드 연결 후 활성화됩니다.');
      router.push('/stamp');
    } catch (error) {
      console.error('스탬프 등록 실패:', error);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <article className="w-full max-w-md mx-auto bg-white pb-20">
      {/* 1. 영업 정보 섹션 */}
      <section className="flex flex-col w-full text-sm">
        {/* 영업 시간 */}
        <div className="flex items-center gap-3 px-6 py-3 border-y border-gray-100">
          <Image src={clockIcon} alt="영업시간" width={20} height={20} />
          <span className="text-gray-700 font-medium">{store.status || '영업 정보'}</span>
          <span className="text-gray-500">{store.message}</span>
        </div>

        {/* 전화번호 */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
          <Image src={phoneIcon} alt="전화번호" width={20} height={20} />
          <span className="text-gray-700 font-medium">{store.phone || '정보 없음'}</span>
        </div>

        {/* SNS 링크 */}
        <div className="flex items-center px-6 py-3 border-b border-gray-100">
          <div className="flex items-center w-1/2 gap-3">
            <Image src={internetIcon} alt="웹사이트" width={20} height={20} />
            <a href={store.storeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-700 font-medium truncate hover:text-orange-500">
              {store.storeUrl || '정보 없음'}
            </a>
          </div>
          <div className="flex items-center w-1/2 gap-3 pl-2">
            <Image src={instagramIcon} alt="인스타그램" width={20} height={20} />
            <span className="text-gray-700 font-medium truncate">
              {store.sns || '정보 없음'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. 스탬프 카드 섹션 */}
      <section className="w-full bg-gray-50 py-6 mt-2">
        <div className="px-6 mb-4">
          <h2 className="text-[#72594B] font-semibold text-lg">Stamp</h2>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-[220px] h-[144px]">
             {/* next/image의 fill 속성을 사용하여 반응형 대응 */}
            <Image
              src={store.stampImageUrl || defaultStoreStamp}
              alt="Store Stamp"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 220px"
            />
          </div>
          
          <div className="flex items-center gap-2 mt-5">
            <Image src={giftIcon} alt="선물" width={18} height={18} />
            <span className="text-xs text-gray-500">리워드 보상:</span>
            <span className="text-xs text-gray-800 font-medium">{store.reward || '매장 보상 정보'}</span>
          </div>

          <button
            onClick={handleRegisterStamp}
            className="w-[292px] h-[52px] bg-orange-500 text-white text-base font-semibold rounded-full mt-6 hover:bg-orange-600 transition-colors shadow-md active:scale-95 duration-200"
          >
            스탬프 등록하기
          </button>
        </div>
      </section>

      {/* 3. 시그니처 메뉴 섹션 */}
      <section className="w-full py-6">
        <div className="px-6 mb-4 border-b border-gray-100 pb-2">
          <h2 className="text-orange-600 font-semibold text-lg">Signature Menu</h2>
        </div>

        {store.signatureMenus?.length > 0 ? (
          store.signatureMenus.map((menu, index) => (
            <div key={index} className="flex px-6 py-4 border-b border-gray-100 last:border-0">
              <div className="relative w-[120px] h-[120px] flex-shrink-0">
                <Image
                  src={menu.menuImageUrl}
                  alt={menu.menuName}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col justify-center ml-5 flex-1">
                <h3 className="text-gray-800 font-semibold text-base mb-1">{menu.menuName}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-auto">{menu.content}</p>
                <p className="text-gray-900 font-bold text-sm mt-2">
                  {menu.price.toLocaleString()}원
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm">
            등록된 대표 메뉴가 없습니다.
          </div>
        )}
      </section>
    </article>
  );
}