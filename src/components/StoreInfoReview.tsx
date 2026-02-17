'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ReviewResponse } from '@/type/Store';

import Image from 'next/image';

interface StoreInfoReviewProps {
  storeId: string;
  reviewAvailable: boolean;
}

interface ReviewSummaryGraphProps {
  reviewData: ReviewResponse;
}

// [NEW] 그래프 렌더링 컴포넌트
const ReviewSummaryGraph: React.FC<ReviewSummaryGraphProps> = ({ reviewData }) => {
  const { averageRating, totalReviewCount, ratingDistribution } = reviewData;
  const starLevels = ['5', '4', '3', '2', '1']; // 위에서부터 5점

  return (
    <div className="w-full flex items-center justify-center gap-6 mt-4 mb-8">
      {/* 왼쪽: 평점 점수 */}
      <div className="flex flex-col items-center justify-center">
        {/* 사진처럼 큰 별 아이콘과 점수 배치 */}
        <div className="flex items-center gap-2">
          <Image
            src='/assets/star_full_icon.png'
            alt="score-star"
            width={36}              
            height={36}
          />
          <span className="text-[32px] font-bold text-[#FF7F23]">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-[16px] text-[var(--fill-color5)] mt-2">
            /5.0
          </span>
        </div>
      </div>

      {/* 오른쪽: 막대 그래프 */}
      <div className="flex flex-col gap-1.5 w-[180px]">
        {starLevels.map((score) => {
          // 해당 점수의 개수 (데이터가 없으면 0)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const count = (ratingDistribution as any)[score] || 0;
          // 퍼센트 계산
          const percent =
            totalReviewCount > 0 ? (count / totalReviewCount) * 100 : 0;

          return (
            <div
              key={score}
              className="flex items-center text-[12px] h-[10px]"
            >
              {/* 점수 라벨 (5, 4...) */}
              <span className="w-4 font-bold text-[#FF7F23] mr-2 text-right">
                {score}
              </span>

              {/* 막대 배경 */}
              <div className="flex-1 h-[8px] bg-[var(--fill-color2)] rounded-full overflow-hidden">
                {/* 채워지는 막대 (width로 제어) */}
                <div
                  className="h-full bg-[#FF7F23] rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function StoreInfoReview({ storeId, reviewAvailable }: StoreInfoReviewProps) {
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const router = useRouter();
  const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // 리뷰 데이터 조회
  useEffect(() => {
    if (!storeId) return;
    const fetchReviews = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch(`${apiUri}/v1/stores/${storeId}/reviews`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setReviewData(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, [storeId, apiUri]);

  // 페이지 이동
  const handleGoToReview = () => {
    router.push(`/store/info/${storeId}/review/write`);
  };

  // 날짜 포맷 헬퍼
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 별점 렌더링 헬퍼
  const renderStars = (rate: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Image
        key={i}
        src={i < rate ? '/assets/star_full_icon.png' : '/assets/star_empty_icon.png'}
        alt="star"
        className="w-[14px] h-[14px]"
        width={14}
        height={14}
      />
    ));
  };

  return (
    <div className="w-full flex flex-col items-center pb-10">
      {/* 1. 리뷰 헤더 및 그래프 영역 */}
      <div className="w-full px-6 pt-6">
        {/* 제목: 리뷰 (개수) */}
        <p className="font-bold text-[18px] text-[#333]">
          리뷰 ({reviewData?.totalReviewCount || 0})
        </p>

        {reviewData && <ReviewSummaryGraph reviewData={reviewData} />}
      </div>

      {/* 2. 작성 권한 안내 (사진의 회색 박스) */}
      <div className="w-full px-6 mb-8">
        {reviewAvailable ? (
          // 리뷰 작성이 가능한 경우 -> 버튼이나 UI 표시 (필요시 디자인 수정 가능)
          <button
            onClick={handleGoToReview}
            className="w-full h-[48px] bg-[#FF7F23] text-white font-bold rounded-[12px] text-[15px]"
          >
            리뷰 작성하기
          </button>
        ) : (
          // 리뷰 작성이 불가능한 경우 -> 회색 안내 박스
          <div className="w-full h-[52px] bg-[#F5F5F5] flex items-center justify-center text-[#999] text-[13px] rounded-[12px] text-center leading-tight">
            해당 가게의 스탬프를 완성하지 못하셨거나 <br />
            이미 리뷰를 작성하셨어요!
          </div>
        )}
      </div>

      {/* 구분선 (필요 없다면 제거 가능) */}
      {/* <div className="w-full h-px bg-[var(--fill-color2)] mb-4" /> */}

      {/* 3. 리뷰 리스트 */}
      <div className="w-full px-6">
        {reviewData?.reviews && reviewData.reviews.length > 0 ? (
          <div className="flex flex-col gap-6">
            {/* 정렬 옵션 등은 여기에 추가 가능 (레벨 순 v) */}

            {reviewData.reviews.map((review) => (
              <div key={review.reviewId} className="w-full flex flex-col border-b border-[var(--fill-color2)] pb-6 last:border-0" onClick={() => router.push(`/reviewer/${review.reviewerId}`)}>
                {/* 유저 정보 헤더 */}
                <div className="flex flex-row justify-between items-start mb-2">
                  <div
                    className="flex flex-row gap-3 items-center cursor-pointer" // 커서 포인터 추가
                    // [추가] 클릭 시 해당 유저 프로필로 이동
                    onClick={() => router.push(`/reviewer/${review.reviewerId}`)} // API에 review.userId가 포함되어 있어야 합니다.
                  >
                    <Image
                      src={review.profileImageUrl || '/assets/photo_empty_icon.png'}
                      alt="profile"
                      className="rounded-full object-cover border border-gray-100"
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#333]">
                          {review.reviewerNickname}
                        </span>
                        {/* 레벨 뱃지 (API에 있다면 추가) */}
                        <span className="text-[10px] text-[#999] bg-[#f0f0f0] px-1.5 py-0.5 rounded">
                          {review.representativeBadgeName || 'Lv.1'}
                        </span>
                      </div>
                      {/* 칭호 뱃지 예시 */}
                      {/* <span className="text-[10px] text-white bg-[#8B6E60] px-2 py-0.5 rounded-full w-fit mt-1">카페 그랜드마스터</span> */}

                      <div className="flex gap-0.5 mt-1">
                        {renderStars(Number(review.rate))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[12px] text-[#999]">
                    {formatDate(review.reviewDate)}
                  </span>
                </div>

                {/* 리뷰 내용 */}
                <p className="text-[14px] text-[#555] leading-relaxed text-left whitespace-pre-wrap mt-2">
                  {review.reviewContent}
                </p>

                {/* 첨부 이미지 */}
                {review.reviewImageUrl && (
                  <div className="w-full h-[200px] rounded-[12px] overflow-hidden mt-3" >
                    <Image
                      src={review.reviewImageUrl}
                      alt="review-img"
                      className="w-full h-full object-cover"
                      width={320}
                      height={200}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full py-10 text-center text-[var(--fill-color5)] text-[14px]">
            아직 작성된 리뷰가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
