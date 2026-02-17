'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type StoreDetail } from '@/type/Store';
import axios from 'axios';

// API 기본 주소 설정
const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface StoreInfoHomeProps {
  storeDetail: StoreDetail | null;
}

export default function StoreInfoHome({ storeDetail }: StoreInfoHomeProps) {
  const router = useRouter();

  const handleRegisterStamp = async () => {
    // 1. 매장 정보나 ID가 없으면 실행 불가
    if (!storeDetail || !storeDetail.storeId) {
      alert('매장 정보를 불러올 수 없습니다.');
      return;
    }

    // 2. 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      // 필요하다면 로그인 페이지로 이동: navigate('/login');
      router.push('/login');
      return;
    }

    try {
      // 3. API 호출 (POST /v1/stamps)
      // storeDetail 타입 안에 storeId가 포함되어 있어야 합니다.
      const response = await axios.post(
        `${apiUri}/v1/stamps`,
        { storeId: storeDetail.storeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;

      // 4. 성공 시 알림 및 이동
      alert(
        `[${data.storeName}] 스탬프 카드가 등록되었습니다!\n` +
          `보상: ${data.reward}\n` +
          `현재 스탬프: ${data.currentCount}/${data.maxCount}`
      );
      router.push('/user/stamp'); // 내 스탬프 목록 페이지로 이동
    } catch (error) {
      console.error('스탬프 등록 실패:', error);

      // 5. 이미 등록된 경우 등 에러 처리
      if (axios.isAxiosError(error) && error.response) {
        // 서버에서 중복 등록 시 에러 코드를 보낸다면 여기서 처리
        alert('이미 등록된 스탬프 카드입니다. 내 스탬프 목록으로 이동합니다.');
        router.push('/user/stamp'); // 이미 있다면 목록으로 이동
      } else {
        alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  return (
    <>
      <div className="flex flex-col w-full h-[120px]">
        {/* 영업 시간 */}
        <div className="flex flex-row w-full h-[40px] items-center gap-3 border-b border-t border-[var(--fill-color1)] px-6 ">
          <Image src='/assets/clock.png' alt="" className="w-[20px] h-[20px]" width={20} height={20} />
          <p className="text-[14px] text-[var(--fill-color7)] font-medium">
            {storeDetail?.status || '영업 정보'}
          </p>
          <p className="text-[14px] text-(--fill-color5) font-medium">
            {storeDetail?.message || ''}
          </p>
        </div>

        {/* 전화번호 */}
        <div className="flex flex-row w-full h-[40px] items-center gap-3 border-b border-[var(--fill-color1)] px-6 ">
          <Image src='/assets/phone_icon.png' alt="" className="w-[20px] h-[20px]" width={20} height={20} />
          <p className="text-[14px] text-[var(--fill-color7)] font-medium">
            {storeDetail?.phone || '정보 없음'}
          </p>
        </div>

        {/* 링크 & SNS */}
        <div className="flex flex-row w-full h-[40px] items-center border-b border-[var(--fill-color1)] px-6 ">
          <div className="w-1/2 flex flex-row items-center gap-3">
            <Image src='/assets/internet_icon.png' alt="" className="w-[20px] h-[20px]" width={20} height={20} />
            <a className="text-[14px] text-[var(--fill-color7)] font-medium truncate">
              {storeDetail?.storeUrl || '정보 없음'}
            </a>
          </div>
          <div className="w-1/2 flex flex-row items-center gap-3">
            <Image src='/assets/instagram_icon.png' alt="" className="w-[20px] h-[20px]" width={20} height={20} />
            <a className="text-[14px] text-[var(--fill-color7)] font-medium truncate">
              {storeDetail?.sns || '정보 없음'}
            </a>
          </div>
        </div>
      </div>

      {/* 스탬프 영역 */}
      <div className="w-full h-[360px] bg-[var(--fill-color1)]">
        <div className="w-full h-[46px] px-6 items-center flex">
          <p className="text-[#72594B] font-semibold text-[18px]">Stamp</p>
        </div>
        <div className="h-px bg-[var(--fill-color2)]" />
        <div className="flex flex-col items-center justify-center w-full">
          <Image
            src={storeDetail?.stampImageUrl || '/assets/store_stamp.png'}
            alt="Store Stamp"
            className="w-[220px] h-[144px] mt-5 object-contain"
            width={220}
            height={144}
          />
          <div className="flex flex-row gap-2 items-center mt-5">
            <Image src='/assets/gift_icon.png' alt="" className="w-[18px] h-[18px]" width={18} height={18} />
            <p className="text-[12px] text-[var(--fill-color6)]">
              리워드 보상:
            </p>
            <p className="text-[12px] text-[var(--fill-color5)]">
              {storeDetail?.reward || '매장 보상 정보'}
            </p>
          </div>

          {/* [수정] onClick에 handleRegisterStamp 연결 */}
          <button
            className="w-[292px] h-[52px] bg-[var(--main-color)] text-[var(--fill-color1)] text-[16px] font-semibold rounded-[30px] mt-6 cursor-pointer hover:bg-orange-600 transition-colors"
            onClick={handleRegisterStamp}
          >
            스탬프 등록하기
          </button>
        </div>
      </div>

      {/* 시그니처 메뉴 */}
      <div className="w-full pb-10">
        <div className="w-full h-[54px] flex items-center px-6">
          <p className="text-[var(--main-color2)] font-semibold text-[18px]">
            Signature Menu
          </p>
        </div>
        <div className="h-px bg-[var(--fill-color2)]" />

        {storeDetail?.signatureMenus &&
        storeDetail.signatureMenus.length > 0 ? (
          storeDetail.signatureMenus.map((menu, index) => (
            <div
              key={index}
              className="w-full h-[160px] justify-center items-center flex border-b border-[var(--fill-color2)] last:border-0"
            >
              <div className="flex flex-row items-center w-[350px] h-[120px]">
                <Image
                  src={menu.menuImageUrl}
                  alt={menu.menuName}
                  className="w-[120px] h-[120px] object-cover rounded-md"
                  width={120}
                  height={120}
                />
                <div className="w-[212px] h-[100px] flex flex-col justify-center ml-5">
                  <p className="text-[var(--main-color2)] font-semibold text-[16px]">
                    {menu.menuName}
                  </p>
                  <p className="text-[var(--fill-color5)] text-[14px]">
                    {menu.content}
                  </p>
                  <p className="text-[var(--fill-color7)] text-[14px] mt-auto">
                    {menu.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-[160px] flex items-center justify-center text-[var(--fill-color5)] text-[14px]">
            등록된 대표 메뉴가 없습니다.
          </div>
        )}
      </div>
    </>
  );
};
