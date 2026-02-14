'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

import BackButton from '@/components/BackButton';
import UserBottomBar from '@/components/UserBottomBar';

// --------------------------------------------------------------------------
// 뱃지 데이터
// --------------------------------------------------------------------------
const BADGE_LIST = [
  { id: 1, level: 1, name: '원두 탐험가', img: '/assets/badge1.png' },
  { id: 2, level: 2, name: '브루 수련생', img: '/assets/badge21.png' },
  { id: 3, level: 2, name: '카페 수집가', img: '/assets/badge22.png' },
  { id: 4, level: 3, name: '라떼 장인', img: '/assets/badge31.png' },
  { id: 5, level: 3, name: '오늘의 드립러', img: '/assets/badge32.png' },
  { id: 6, level: 4, name: '로스트 마스터', img: '/assets/badge41.png' },
  { id: 7, level: 4, name: '커피 연금술사', img: '/assets/badge42.png' },
  { id: 8, level: 5, name: '전설의 바리스타', img: '/assets/badge51.png' },
  { id: 9, level: 5, name: '카페 그랜드마스터', img: '/assets/badge52.png' },
];

// 레벨에 따른 뱃지 필터링 함수
const getUnlockedBadges = (stampCount: number) => {
  const currentLevel = Math.floor(stampCount / 20) + 1;
  return BADGE_LIST.filter((badge) => badge.level <= currentLevel);
};

// 대표 뱃지(가장 높은 레벨의 뱃지) 가져오기
const getRepresentativeBadge = (stampCount: number) => {
  const unlocked = getUnlockedBadges(stampCount);
  if (unlocked.length === 0) return BADGE_LIST[0];
  return unlocked[unlocked.length - 1];
};

// --------------------------------------------------------------------------
// 1. 타입 정의 (API 명세 기반)
// --------------------------------------------------------------------------
interface StampInfo {
  storeName: string;
  date: string;
  stampImageUrl: string;
  stampReward: string;
}

interface ReviewInfo {
  storeName: string;
  rate: string | number; // API 명세엔 string이지만 실제론 number일 수 있음
  content: string;
  reviewDate: string;
  reviewImageUrl: string;
}

interface ReviewerProfileData {
  nickname: string;
  totalStampCount: number;
  reviewCount: number;
  stamps: StampInfo[];
  reviews: ReviewInfo[];
  profileImageUrl?: string; // API 명세엔 없지만, 프로필 이미지가 있다면 사용
}

interface ApiResponse {
  timestamp: string;
  code: number;
  message: string;
  data: ReviewerProfileData;
}

// --------------------------------------------------------------------------
// 2. 메인 컴포넌트
// --------------------------------------------------------------------------
export default function ReviewerProfile() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<ReviewerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewerProfile = async () => {
      if (!userId) return;
      const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('accessToken');

      try {
        const response = await axios.get<ApiResponse>(
          `${apiUri}/v1/reviews/profile/${userId}`,
          {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (
          response.data.code === 100 ||
          response.data.code === 200 ||
          response.data.code === 0
        ) {
          setProfile(response.data.data);
        }
      } catch (error) {
        console.error('리뷰어 프로필 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewerProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        로딩중...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-gray-500 mb-4">사용자를 찾을 수 없습니다.</p>
        <BackButton />
      </div>
    );
  }

  // 데이터 가공
  const currentLevel = Math.floor(profile.totalStampCount / 20) + 1;
  const unlockedBadges = getUnlockedBadges(profile.totalStampCount);
  const repBadge = getRepresentativeBadge(profile.totalStampCount);

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] flex flex-col relative pb-20">
      {/* 헤더 */}
      <header className="w-full bg-white px-4 py-3 sticky top-0 z-10 flex items-center border-b border-gray-100">
        <BackButton />
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* 1. 프로필 카드 섹션 */}
        <section className="bg-white pb-8 pt-6 px-6 flex flex-col items-center mb-2">
          {/* 프로필 이미지 */}
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-100 mb-4 border border-gray-100">
            <Image
              src={profile.profileImageUrl || '/assets/photo_empty_icon.png'}
              alt="profile"
              className="w-full h-full object-cover"
              width={100}
              height={100}
            />
          </div>

          {/* 닉네임 */}
          <h1 className="text-[22px] font-bold text-[#333] mb-2">
            {profile.nickname}
          </h1>

          {/* 레벨 & 칭호 뱃지 */}
          <div className="flex items-center gap-1.5 mb-6">
            <span className="text-[13px] font-bold text-[#555]">
              Lv.{currentLevel}
            </span>
            <span className="px-3 py-1 bg-[#8B6E60] text-white text-[12px] font-medium rounded-full">
              {repBadge.name}
            </span>
          </div>

          {/* 통계 (스탬프, 뱃지, 리뷰) */}
          <div className="w-full flex justify-around items-center px-4">
            {/* 완료 스탬프 */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[12px] font-medium text-[#888] bg-[#F5F5F5] px-3 py-1 rounded-full">
                완료 스탬프
              </span>
              <span className="text-[24px] font-bold text-[#333]">
                {profile.totalStampCount}
              </span>
            </div>
            {/* 뱃지 */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[12px] font-medium text-[#888] bg-[#F5F5F5] px-3 py-1 rounded-full">
                뱃지
              </span>
              <span className="text-[24px] font-bold text-[#333]">
                {unlockedBadges.length}
              </span>
            </div>
            {/* 리뷰 */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[12px] font-medium text-[#888] bg-[#F5F5F5] px-3 py-1 rounded-full">
                리뷰
              </span>
              <span className="text-[24px] font-bold text-[#333]">
                {profile.reviewCount}
              </span>
            </div>
          </div>
        </section>

        {/* 2. 완료 스탬프 섹션 */}
        <section className="bg-white p-5 mb-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-bold text-[#333]">
              완료 스탬프({profile.stamps.length})
            </h2>
            <Image src='/assets/downbutton.svg' alt="more" width={20} height={20} className="opacity-40" />
          </div>

          {profile.stamps.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {profile.stamps.map((stamp, idx) => (
                <div
                  key={idx}
                  className="min-w-[160px] h-[100px] bg-[#333] rounded-[12px] relative overflow-hidden flex-shrink-0 shadow-md"
                >
                  {/* 스탬프 배경 이미지 (없으면 검은 배경) */}
                  {stamp.stampImageUrl && stamp.stampImageUrl !== 'string' && (
                    <Image
                      src={stamp.stampImageUrl}
                      alt="stamp-bg"
                      width={160}
                      height={100}
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />
                  )}
                  {/* 텍스트 정보 */}
                  <div className="absolute bottom-3 right-3 text-right z-10">
                    <p className="text-[10px] text-white opacity-80">
                      {new Date(stamp.date).toLocaleDateString()}
                    </p>
                    <p className="text-[14px] font-bold text-white">
                      {stamp.storeName}
                    </p>
                  </div>
                  {/* 왼쪽 장식 (다이어리 느낌) */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-[#222] z-10 flex flex-col justify-center items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-[#555]" />
                    <div className="w-1 h-1 rounded-full bg-[#555]" />
                    <div className="w-1 h-1 rounded-full bg-[#555]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-gray-400 text-[13px]">
              완료한 스탬프가 없습니다.
            </div>
          )}
        </section>

        {/* 3. 뱃지 섹션 */}
        <section className="bg-white p-5 mb-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-bold text-[#333]">
              뱃지({unlockedBadges.length})
            </h2>
            <Image src='/assets/downbutton.svg' alt="more" width={20} height={20} className="opacity-40" />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {unlockedBadges.length > 0 ? (
              unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center min-w-[70px]"
                >
                  <div className="w-[70px] h-[70px] rounded-full border border-gray-100 flex items-center justify-center mb-2">
                    <Image
                      src={badge.img}
                      alt={badge.name}
                      width={70}
                      height={70}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <span className="text-[12px] font-bold text-[#333]">
                    {badge.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-gray-400 text-[13px] w-full">
                획득한 뱃지가 없습니다.
              </div>
            )}
          </div>
        </section>

        {/* 4. 리뷰 리스트 섹션 */}
        <section className="bg-white p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-bold text-[#333]">
              리뷰({profile.reviews.length})
            </h2>
            <Image src='/assets/downbutton.svg' alt="more" width={20} height={20} className="opacity-40" />
          </div>

          <div className="flex flex-col gap-6">
            {profile.reviews.length > 0 ? (
              profile.reviews.map((review, idx) => (
                <div
                  key={idx}
                  className="flex flex-col border-b border-gray-100 pb-6 last:border-0"
                >
                  {/* 가게명 & 날짜 */}
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[14px] font-bold text-[#333]">
                      {review.storeName}
                    </h3>
                    <span className="text-[12px] text-[#999]">
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* 별점 */}
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Image
                        key={i}
                        src={
                          i < (parseFloat(review.rate as string) || 0)
                            ? '/assets/star_full_icon.png'
                            : '/assets/emptystar.svg'
                        }
                        alt="star"
                        width={14}
                        height={14}
                      />
                    ))}
                  </div>

                  {/* 리뷰 이미지 */}
                  {review.reviewImageUrl &&
                    review.reviewImageUrl !== 'string' && (
                      <div className="w-full h-[180px] rounded-[12px] overflow-hidden mb-3 bg-gray-100">
                        <Image
                          src={review.reviewImageUrl}
                          alt="review"
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                  {/* 내용 */}
                  <p className="text-[14px] text-[#555] leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400 text-[13px]">
                작성한 리뷰가 없습니다.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 하단 네비게이션 바 */}
      <div className="absolute bottom-0 w-full z-20">
        <UserBottomBar />
      </div>
    </div>
  );
};