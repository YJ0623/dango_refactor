'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import BackButton from '@/components/BackButton';
import UserBottomBar from '@/components/UserBottomBar';

interface Coupon {
  userId: number;
  storeId: number;
  couponId: number;
  couponName: string;
  expiredDate: string;
  used: boolean;
}

// 환경변수가 없으면 로컬 주소 사용
const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const CouponBox: React.FC = () => {
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 3. API 데이터 가져오기 (GET)
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`${apiUri}/v1/users/coupons`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('쿠폰 목록을 불러오는데 실패했습니다.');
        }

        const jsonResponse = await response.json();
        console.log('API 응답 데이터:', jsonResponse);

        // [수정됨] 서버 응답 구조(couponLists)에 맞춰서 배열 추출
        if (
          jsonResponse.couponLists &&
          Array.isArray(jsonResponse.couponLists)
        ) {
          // 정답: couponLists 안에 배열이 있음
          setCoupons(jsonResponse.couponLists);
        } else if (Array.isArray(jsonResponse)) {
          setCoupons(jsonResponse);
        } else if (jsonResponse.data && Array.isArray(jsonResponse.data)) {
          setCoupons(jsonResponse.data);
        } else {
          console.error('응답에서 배열을 찾을 수 없습니다.', jsonResponse);
          setCoupons([]);
        }
      } catch (error) {
        console.error('API Error:', error);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // --- (아래부터는 기존 UI 렌더링 로직과 동일) ---

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}까지`;
  };

  const getDaysLeft = (isoString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(isoString);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '만료됨';
    if (diffDays === 0) return '오늘 만료';
    return `${diffDays}일 남음`;
  };

  const handleCouponClick = (couponId: number) => {
    if (couponId !== undefined && couponId !== null) {
      router.push(`/user/coupon/${couponId}`);
    } else {
      console.error('클릭된 쿠폰의 ID가 유효하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <header className="flex items-center p-4 border-b border-gray-100">
        <BackButton />
      </header>

      <div className="flex-1 flex flex-col justify-between">
        <main>
          <h1 className="text-2xl font-bold p-6">쿠폰함</h1>

          <div className="border-t border-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-500">로딩 중...</div>
            ) : coupons.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                보유한 쿠폰이 없습니다.
              </div>
            ) : (
              coupons.map((coupon) => (
                <div
                  key={coupon.couponId}
                  className={`flex items-center p-6 border-b border-gray-100 cursor-pointer transition-colors ${
                    coupon.used ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleCouponClick(coupon.couponId)}
                >
                  <Image
                    src='/assets/reward.png'
                    alt="쿠폰 이미지"
                    className="w-16 h-16 rounded-lg flex-shrink-0 object-cover"
                    width={64}
                    height={64}
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="font-semibold text-base">
                        {coupon.couponName}
                      </h2>
                      {coupon.used && (
                        <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded-full ml-2">
                          사용완료
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>{formatDate(coupon.expiredDate)}</span>
                      {!coupon.used && (
                        <span
                          className={`font-medium ml-3 ${
                            getDaysLeft(coupon.expiredDate) === '만료됨'
                              ? 'text-red-500'
                              : 'text-blue-600'
                          }`}
                        >
                          {getDaysLeft(coupon.expiredDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <footer className="p-6 pb-10">
          <h3 className="text-sm font-medium text-gray-600 mb-3">유의사항</h3>
          <ul className="space-y-1.5 text-xs text-gray-500 list-disc list-inside">
            <li>쿠폰은 중복사용이 불가능 합니다.</li>
            <li>결제 이후 취소되면, 쿠폰은 복구 됩니다.</li>
            <li>
              취소를 통해 복구된 쿠폰은 유효기간이 지날시 사용이 불가능합니다.
            </li>
          </ul>
          <div className="pt-15"></div>
        </footer>
      </div>
      <UserBottomBar />
    </div>
  );
};

export default CouponBox;
