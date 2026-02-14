'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

import BackButton from '@/components/BackButton';
import StampsSection from '@/components/StampSection';
import UserBottomBar from '@/components/UserBottomBar';


const apiUri = process.env.NEXT_PUBLIC_API_URL;

// ==========================================
// 0. 뱃지 데이터 정의
// ==========================================
interface BadgeDef {
  id: number;
  level: number;
  name: string;
  img: string;
}

const BADGE_LIST: BadgeDef[] = [
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

const getBadgeLevel = (name: string) => {
  const badge = BADGE_LIST.find((b) => b.name === name);
  return badge ? badge.level : 1;
};

// ==========================================
// 1. 타입 정의
// ==========================================

interface Stamp {
  storeName: string;
  date: string;
  stampImageUrl: string;
  stampReward: string | null;
}

interface Review {
  storeName: string;
  rate: number;
  content: string;
  reviewDate: string;
  reviewImageUrl: string;
}

interface ProfileData {
  nickname: string;
  totalStampCount: number; // ✅ 수정: 로그 확인 결과 이 이름이 맞습니다.
  couponNum: number;
  reviews: Review[];
  stamps: Stamp[];
}

interface ProfileResponse {
  timestamp?: string;
  code: number;
  message: string;
  data: ProfileData;
}

interface SettingsData {
  profileImageUrl: string;
  representativeBadgeName: string | null;
}

interface SettingsResponse {
  code: number;
  data: SettingsData;
}

interface StampHistoryData {
  totalStampSum: number;
  completedStampNum: number; // 우리가 필요한 데이터
  completedStamps: any[];
}

// ==========================================
// 2. 메인 컴포넌트
// ==========================================
export default function MyPage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [historyData, setHistoryData] = useState<StampHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const results = await Promise.allSettled([
          axios.get<ProfileResponse>(`${apiUri}/v1/mypage/profile`, {
            headers,
          }),
          axios.get<SettingsResponse>(`${apiUri}/v1/mypage/settings`, {
            headers,
          }),
          axios.get<StampHistoryData>(`${apiUri}/v1/users/stamps/history`, {
            headers,
          }),
        ]);

        // 1. 프로필 데이터 처리
        if (results[0].status === 'fulfilled') {
          const res = results[0].value.data;

          // 디버깅 로그 (이제 확인했으므로 주석 처리하거나 지워도 됩니다)
          // console.log('API Data:', res.data);

          if ([100, 200, 0].includes(res.code)) {
            setProfileData(res.data);
          }
        }

        // 2. 설정 데이터 처리
        if (results[1].status === 'fulfilled') {
          const res = results[1].value.data;
          if ([100, 200, 0].includes(res.code)) {
            setSettingsData(res.data);
          }
        }
        if (results[2].status === 'fulfilled') {
          // axios 응답의 .data 안에 실제 스웨거의 JSON 내용이 들어옵니다.
          const resData = results[2].value.data;
          console.log('Stamp History Data:', resData); // 확인용 로그
          setHistoryData(resData);
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        로딩중...
      </div>
    );
  }

  // 데이터 가공
  const nickname = profileData?.nickname || '닉네임';

  // ✅ 수정: API에서 보내주는 이름(totalStampCount)으로 다시 변경
  const stampCount = historyData?.completedStampNum || 0;

  const couponCount = profileData?.couponNum || 0;
  const myReviews = profileData?.reviews || [];

  // 레벨 계산
  const currentLevel = Math.floor(stampCount / 20) + 1;
  const unlockedBadges = BADGE_LIST.filter(
    (badge) => badge.level <= currentLevel
  );

  const representativeBadge = settingsData?.representativeBadgeName
    ? [settingsData.representativeBadgeName]
    : unlockedBadges.length > 0
    ? [unlockedBadges[unlockedBadges.length - 1].name]
    : ['원두 탐험가'];

  return (
    <div className="w-full min-h-screen bg-gray-100 mx-auto border border-gray-300 relative">
      <div className="overflow-y-auto h-[calc(100vh-80px)]">
        <Header />

        <main className="flex flex-col pb-20">
          <ProfileCard
            nickname={nickname}
            stampCount={stampCount}
            profileImageUrl={settingsData?.profileImageUrl || ''}
            badges={representativeBadge}
            badgeCount={unlockedBadges.length}
            couponCount={couponCount}
          />

          <div className="h-2 bg-gray-100"></div>

          <div className="[&_p.text-\[13px\]]:hidden mx-auto">
            <StampsSection />
          </div>

          <div className="h-2 bg-gray-100"></div>

          <BadgesSection badges={unlockedBadges} />

          <div className="h-2 bg-gray-100"></div>

          <ReviewsSection reviews={myReviews} />
        </main>
      </div>
      <div className="absolute bottom-0 w-full z-20">
        <UserBottomBar />
      </div>
    </div>
  );
}

// ==========================================
// 3. 하위 컴포넌트들
// ==========================================

const Header = React.memo(() => (
  <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
    <BackButton />
    <Link href="/user/mypage/setting">
      <Image src='/assets/setting.svg' alt="Setting" width={24} height={24} />
    </Link>
  </header>
));
Header.displayName = 'Header';

interface ProfileCardProps {
  nickname: string;
  stampCount: number;
  profileImageUrl: string;
  badges: string[];
  badgeCount: number;
  couponCount: number;
}

const ProfileCard = ({
  nickname,
  stampCount,
  profileImageUrl,
  badges,
  badgeCount,
  couponCount,
}: ProfileCardProps) => (
  <div className="bg-white p-6 flex flex-col items-center">
    {profileImageUrl && profileImageUrl !== 'string' ? (
      <Image
        src={profileImageUrl}
        alt="Profile"
        width={96}
        height={96}
        className="w-24 h-24 rounded-full mb-4 object-cover border border-gray-200"
      />
    ) : (
      <div className="w-24 h-24 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-xs">
        No Image
      </div>
    )}

    <h1 className="text-2xl font-bold mb-2">{nickname}</h1>

    <div className="flex gap-2 my-2 flex-wrap justify-center items-center">
      {badges.map((badgeName, index) => {
        const level = getBadgeLevel(badgeName);
        return (
          <div key={index} className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-500">Lv{level}</span>
            <span className="text-xs text-white bg-[#7B5C48] px-3 py-1.5 rounded-full font-medium">
              {badgeName}
            </span>
          </div>
        );
      })}
    </div>

    <div className="grid grid-cols-3 items-center justify-center w-full mx-auto max-w-140 mt-6">
      <StatItem count={stampCount} label="완료 스탬프" />
      <StatItem count={badgeCount} label="뱃지" />
      <Link href="/user/stamp/history">
      <div className="flex flex-col items-center mt-2 cursor-pointer">
        <Image src='/assets/history_icon.png' alt="StampHistory" width={20} height={20}  className='mb-1.75'/>
        <div className="text-sm text-gray-500 mx-auto">스탬프 히스토리</div>
      </div>
      </Link>
    </div>
  </div>
);

const StatItem = ({ count, label }: { count: number; label: string }) => (
  <div className="text-center">
    <span className="text-2xl font-bold block">{count}</span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

const BadgesSection = ({ badges }: { badges: BadgeDef[] }) => (
  <div className="bg-white rounded-lg p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="font-bold text-lg">보유 뱃지 ({badges.length})</h2>
      <Image src='/assets/downbutton.svg' alt="DownButton" className="w-6 h-6 opacity-40" width={24} height={24}/>
    </div>
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {badges.length > 0 ? (
        badges.map((badge) => (
          <BadgeItem
            key={badge.id}
            name={badge.name}
            imgUrl={badge.img}
            level={badge.level}
          />
        ))
      ) : (
        <div className="text-sm text-gray-400 py-4 w-full text-center">
          획득한 뱃지가 없습니다.
        </div>
      )}
    </div>
  </div>
);

const BadgeItem = ({
  name,
  imgUrl,
  level,
}: {
  name: string;
  imgUrl: string;
  level: number;
}) => (
  <div className="flex flex-col items-center gap-1 min-w-[80px]">
    <div className="w-20 h-20 rounded-full border border-gray-100 bg-white flex items-center justify-center overflow-hidden mb-1">
      <Image src={imgUrl} alt={name} width={80} height={80} className="w-full h-full object-cover" />
    </div>
    <span className="text-[10px] text-gray-500 font-bold">Lv. {level}</span>
    <span className="text-sm text-gray-700 text-center break-keep w-20 leading-tight">
      {name}
    </span>
  </div>
);

const ReviewsSection = ({ reviews }: { reviews: Review[] }) => (
  <div className="bg-white rounded-lg p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="font-bold text-lg">리뷰 ({reviews.length})</h2>
      <Image src='/assets/downbutton.svg' alt="DownButton" width={24} height={24} className="w-6 h-6 opacity-40" />
    </div>
    <div className="flex flex-col gap-8">
      {reviews.length > 0 ? (
        reviews.map((review, index) => <ReviewItem key={index} data={review} />)
      ) : (
        <div className="text-gray-400 text-sm text-center py-4">
          작성한 리뷰가 없습니다.
        </div>
      )}
    </div>
  </div>
);

const ReviewItem = ({ data }: { data: Review }) => {
  let formattedDate = data.reviewDate;
  try {
    formattedDate = new Date(data.reviewDate).toLocaleDateString('ko-KR');
  } catch (e) {
    console.error('Date formatting error:', e);
  }

  return (
    <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-0">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[#333]">{data.storeName}</h3>
        <span className="text-xs text-[#9CA3AF]">{formattedDate}</span>
      </div>

      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Image
            key={star}
            src={star <= data.rate ? '/assets/star_full_icon.png' : '/assets/emptystar.svg'}
            alt="star"
            className="w-[14px] h-[14px]"
            width={14}
            height={14}
          />
        ))}
      </div>

      {data.reviewImageUrl && data.reviewImageUrl !== 'string' && (
        <Image
          src={data.reviewImageUrl}
          alt="review"
          className="w-full h-[180px] object-cover rounded-[12px] mt-2 bg-gray-100 border border-gray-100"
        />
      )}

      <p className="text-sm text-[#555] mt-2 whitespace-pre-wrap leading-relaxed">
        {data.content}
      </p>
    </div>
  );
};
