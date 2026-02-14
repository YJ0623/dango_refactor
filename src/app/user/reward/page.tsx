'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import reward_logo from '../../assets/reward_logo.png';
import review_logo from '../../assets/review_theme_icon.png';
import UserBottomBar from '@/components/UserBottomBar';
// --- API 타입 정의 ---
interface StamperInfo {
  nickname: string;
  profileImageUrl: string | null;
  totalStampSum: number;
  representativeBadgeName: string | null; // null 가능성 명시
}

interface RewardDashboardResponse {
  myInfo: {
    nickname: string;
    totalStampSum: number;
    topPercent: string;
    profileImageUrl: string | null;
  };
  topStampers: StamperInfo[];
}

// --- 헬퍼 함수: 프로필 이미지 처리 ---
const getProfileImage = (url: string | null | undefined) => {
  return url ? url : '/assets/question_icon.png';
};

// --- 레벨 혜택 데이터 ---
const LEVEL_BENEFITS = [
  {
    level: 1,
    wallet: '기본 지갑 테마',
    badge: '"원두 탐험가" 뱃지 획득',
    extra: null,
  },
  {
    level: 2,
    wallet: '초급 지갑 테마',
    badge: '"브루 수련생" "카페 수집가" 뱃지 획득',
    extra: null,
  },
  {
    level: 3,
    wallet: '중급 지갑 테마',
    badge: '"라떼 장인" "오늘의 드립러" 뱃지 획득',
    extra: '리뷰 상위권 노출',
  },
  {
    level: 4,
    wallet: '고급 지갑 테마',
    badge: '"로스트 마스터" "커피 연금술사" 뱃지 획득',
    extra: '리뷰 상위권 노출',
  },
  {
    level: 5,
    wallet: '특별 지갑 테마',
    badge: '"전설의 바리스타" "카페 그랜드마스터" 뱃지 획득',
    extra: '리뷰 상위권 노출',
  },
];

// --- 헬퍼 함수 1: 레벨 기반 뱃지 이름 추출 ---
const getBadgeNameByLevel = (level: number) => {
  const benefit = LEVEL_BENEFITS.find((b) => b.level === level);
  if (!benefit) return '원두 탐험가'; // 기본값 설정 (1레벨)
  
  const matches = benefit.badge.match(/"([^"]+)"/);
  return matches ? matches[1] : '원두 탐험가';
};

// --- 헬퍼 함수 2: 스탬프 수 기반 뱃지 표시 로직 통합 ---
const getBadgeDisplay = (stampSum: number, apiBadgeName: string | null) => {
  if (apiBadgeName) return apiBadgeName;

  // 스탬프 수로 레벨 계산 (20개당 1레벨, 최대 5레벨)
  const calculatedLevel = Math.min(Math.floor(stampSum / 20) + 1, 5);
  return getBadgeNameByLevel(calculatedLevel);
};

// --- 프로그레스 바 컴포넌트 ---
const StampProgress = ({
  current,
  max,
  level,
  profileUrl,
}: {
  current: number;
  max: number;
  level: number;
  profileUrl: string | null;
}) => {
  const size = 260;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const maxAngle = 260;
  const startAngle = 140;

  const safeMax = Number.isFinite(max) && max > 0 ? max : 20;
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safeLevel = Number.isFinite(level) ? level : 1;
  const progress = Math.min(Math.max(safeCurrent / safeMax, 0), 1);

  const rawDashOffset =
    circumference - progress * (maxAngle / 360) * circumference;
  const strokeDashoffset = Number.isFinite(rawDashOffset)
    ? rawDashOffset
    : circumference;
  const backgroundDashOffset = circumference - (maxAngle / 360) * circumference;
  const currentAngle = startAngle + progress * maxAngle;
  const safeCurrentAngle = Number.isFinite(currentAngle)
    ? currentAngle
    : startAngle;
  const knobX =
    size / 2 + radius * Math.cos((safeCurrentAngle * Math.PI) / 180);
  const knobY =
    size / 2 + radius * Math.sin((safeCurrentAngle * Math.PI) / 180);

  return (
    <div
      className="relative flex justify-center items-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform overflow-visible"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9E5E" />
            <stop offset="100%" stopColor="#FF6600" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={backgroundDashOffset}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          className="transition-all duration-500 ease-out"
        />
        {safeCurrent > 0 && (
          <circle
            cx={knobX}
            cy={knobY}
            r={strokeWidth / 1.6}
            fill="var(--main-color)"
            className="drop-shadow-md transition-all duration-500 ease-out"
          />
        )}
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-10">
        <div className="w-[180px] h-[180px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200">
          <Image
            src={getProfileImage(profileUrl)}
            alt="프로필"
            width={180}
            height={180}
            className="object-cover"
          />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 font-bold text-gray-600 text-lg">
        Lv. {safeLevel}
      </div>
      <div className="absolute bottom-4 right-4 font-bold text-gray-400 text-lg">
        {safeLevel >= 5 ? 'MAX' : `Lv. ${safeLevel + 1}`}
      </div>
    </div>
  );
};

export default function Reward() {
  const router = useRouter();

  const [myInfo, setMyInfo] = useState<RewardDashboardResponse['myInfo'] | null>(null);
  const [topStampers, setTopStampers] = useState<StamperInfo[]>([]);
  const [isNextBenefit, setIsNextBenefit] = useState<boolean>(false);

  useEffect(() => {
    const fetchRewardData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${apiUrl}/v1/rewards/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const res = await response.json();
          const data: RewardDashboardResponse = res.data;
          setMyInfo(data.myInfo);
          setTopStampers(data.topStampers || []);
        } else {
          console.error('리워드 데이터 조회 실패');
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchRewardData();
  }, []);

  const { userLevel, currentLevelStamp, nextLevelTarget } = useMemo(() => {
    const safeTotal = myInfo?.totalStampSum || 0;
    const calculatedLevel = Math.min(Math.floor(safeTotal / 20) + 1, 5);

    let currentProgress;
    if (calculatedLevel < 5) {
      currentProgress = safeTotal % 20;
    } else {
      currentProgress = safeTotal - 80;
    }

    return {
      userLevel: calculatedLevel,
      currentLevelStamp: currentProgress,
      nextLevelTarget: 20,
    };
  }, [myInfo]);

  const displayLevel = isNextBenefit ? userLevel + 1 : userLevel;
  const targetLevelData =
    LEVEL_BENEFITS.find((d) => d.level === Math.min(displayLevel, 5)) ||
    LEVEL_BENEFITS[0];

  const handleToggleBenefit = () => {
    if (userLevel >= 5) return;
    setIsNextBenefit((prev) => !prev);
  };

  const rank1 = topStampers[0];
  const rank2 = topStampers[1];
  const rank3 = topStampers[2];
  const rankOthers = topStampers.slice(3);

  return (
    <div className="flex flex-col justify-center items-center w-full px-5 pb-24 bg-white">
      {/* --- Header --- */}
      <div className="self-start mt-4">
        <h1 className="font-semibold text-[25px] text-(--fill-color6)">
          Reward
        </h1>
      </div>

      {/* --- User Level Info --- */}
      <div className="flex mt-10 text-[22px]">
        <p className="mr-0.5 font-bold text-(--main-color2)">
          {myInfo?.nickname || '회원'}
        </p>
        님은&nbsp;
        <p className="mr-0.5 font-bold text-(--main-color2)">{userLevel}레벨</p>
        이에요.
      </div>

      {/* --- Current Level Stamp Info --- */}
      <div className="flex flex-col items-center justify-center w-auto px-4 h-[50px] shadow-xl rounded-[15px] bg-white mt-7 z-20 mb-10">
        {userLevel >= 5 ? (
          <p className="font-bold text-[14px] text-[var(--main-color2)]">
        최고 레벨에 도달했어요. 이제 상위 랭킹을 노려보세요!
          </p>
        ) : (
          <>
        <p className="text-[10px] text-[var(--main-color2)]">
          이번 레벨 스탬프
        </p>
        <div className="flex flex-row justify-center items-baseline">
          <p className="font-bold text-[20px] text-[var(--main-color2)]">
            {currentLevelStamp} / {nextLevelTarget}
          </p>
          <p className="font-medium text-[10px] ml-1 text-gray-500">
            Stamp
          </p>
        </div>
          </>
        )}
      </div>

      {/* --- Circular Progress --- */}
      <div className="mt-[-20px]">
        <StampProgress
          current={currentLevelStamp}
          max={nextLevelTarget}
          level={userLevel}
          profileUrl={myInfo?.profileImageUrl || null}
        />
      </div>

      <div className="flex flex-row mt-2 font-medium text-gray-600">
        {userLevel >= 5 ? (
          <p className="text-[var(--main-color)] font-bold">
            최고 레벨 마스터!
          </p>
        ) : (
          <>
            <p>다음 레벨까지&nbsp;</p>
            <p className="text-[var(--main-color)] font-bold">
              {Math.max(nextLevelTarget - currentLevelStamp, 0)}스탬프&nbsp;
            </p>
            <p>남았어요!</p>
          </>
        )}
      </div>

      {/* --- Benefit Card --- */}
      <div
        className={`relative flex flex-col items-center justify-center w-full max-w-[360px] py-6 px-5 rounded-[20px] mt-10 transition-colors duration-300 ${
          isNextBenefit ? 'bg-[#8E7B6D]' : 'bg-[#F4EBE6]'
        }`}
      >
        {userLevel < 5 && (
          <Image
            src='/assets/goto_icon.png'
            alt="benefit toggle"
            onClick={handleToggleBenefit}
            className={`absolute top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center transition-all duration-300 ${
              isNextBenefit ? '-left-3.75 ml-6 mt-6' : '-right-3.75 mr-6 mt-6'
            }`}
            width={40}
            height={40}
          />
        )}

        <div className="flex flex-row items-center gap-2.5 self-start mb-2">
          <p
            className={`font-bold text-[20px] transition-colors duration-300 ${
              isNextBenefit ? 'text-white' : 'text-[#5A3A28]'
            }`}
          >
            {isNextBenefit ? 'Next Benefit' : 'Current Benefit'}
          </p>
          <Image
          src='/assets/question_icon.png'
          alt='info'
          priority
          className='flex cursor-pointer'
          onClick={() => router.push('/user/reward/info')}
          style={isNextBenefit ? { filter : 'brightness(0) invert(1)'} : {}}
          width={16}
          height={16}
        />
        </div>

        <div className="flex flex-row items-center w-full bg-white rounded-[50px] mt-2 p-3 shadow-sm min-h-[64px]">
          <Image src='/assets/wallet_logo.png' alt='지갑' width={40} height={40} />
          <p className="ml-3 text-[14px] font-medium text-gray-700 break-keep">
            {targetLevelData.wallet}
          </p>
        </div>

        <div className="flex flex-row items-center w-full bg-white rounded-[50px] mt-2 p-3 shadow-sm min-h-[64px]">
          <Image src='/assets/reward_logo.png' alt='뱃지' width={40} height={40} />
          <p className="ml-3 text-[14px] font-medium text-gray-700 break-keep">
            {targetLevelData.badge}
          </p>
        </div>

        {targetLevelData.extra && (
          <div className="flex flex-row items-center w-full bg-white rounded-[50px] mt-2 p-3 shadow-sm min-h-[64px]">
            <Image
              src='/assets/reward_logo.png'
              alt="기타"
              width={40}
              height={40}
            />
            <p className="ml-3 text-[14px] font-medium text-gray-700 break-keep">
              {targetLevelData.extra}
            </p>
          </div>
        )}
      </div>

      {/* --- Top Stamper (Podium) --- */}
      <div className="flex flex-col w-full mt-12 mb-5">
        <h2 className="font-semibold text-[22px] text-[#5A3A28]">
          Top Stamper
        </h2>

        {/* Podium Layout */}
        <div className="flex flex-row items-end justify-center w-full mt-8 gap-2">
          {/* 2nd Place */}
          <div className="flex flex-col items-center w-1/3">
            {rank2 && (
              <>
                <div className="relative mb-2 flex flex-col items-center">
                  <Image
                    src={getProfileImage(rank2.profileImageUrl)}
                    alt="2nd"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md z-10"
                    width={64}
                    height={64}
                  />
                  <p className="mt-1 text-sm font-bold text-gray-700 truncate max-w-[80px]">
                    {rank2.nickname}
                  </p>
                  {/* [수정] 하드코딩 제거하고 getBadgeDisplay 함수 사용 */}
                  <span className="bg-[#8B6E5B] text-white text-[10px] px-2 py-0.5 rounded-full mt-1 truncate max-w-[80px]">
                    {getBadgeDisplay(rank2.totalStampSum, rank2.representativeBadgeName)}
                  </span>
                </div>
                <div className="w-full h-[140px] bg-gradient-to-b from-[#FF8C42] to-[#FF7F2A] rounded-t-lg flex flex-col items-center pt-2 text-white shadow-md relative z-0">
                  <div className="absolute top-[10px] w-full h-full bg-black/10 rounded-t-lg -z-10 transform scale-[0.98]"></div>
                  <span className="text-3xl font-bold mt-2">2</span>
                  <div className="flex items-center gap-1 mt-auto mb-4">
                    <Image src='/assets/stamp_icon.png' alt="Trophy" width={24} height={24} />
                    <span className="font-bold">{rank2.totalStampSum}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-1/3 -mx-1 z-10">
            {rank1 && (
              <>
                <div className="relative mb-2 flex flex-col items-center">
                  <Image
                    src={getProfileImage(rank1.profileImageUrl)}
                    alt="1st"
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-4 border-[#FFD700] shadow-lg z-10"
                  />
                  <p className="mt-1 text-sm font-bold text-gray-800 truncate max-w-[90px]">
                    {rank1.nickname}
                  </p>
                  {/* [수정] 하드코딩 제거하고 getBadgeDisplay 함수 사용 */}
                  <span className="bg-[#A68A64] text-white text-[10px] px-2 py-0.5 rounded-full mt-1 truncate max-w-[90px]">
                    {getBadgeDisplay(rank1.totalStampSum, rank1.representativeBadgeName)}
                  </span>
                </div>
                <div className="w-full h-[170px] bg-gradient-to-b from-[#FF7A1A] to-[#E65C00] rounded-t-lg flex flex-col items-center pt-2 text-white shadow-lg relative">
                  <span className="text-4xl font-bold mt-2">1</span>
                  <div className="flex items-center gap-1 mt-auto mb-6">
                    <Image src='/assets/stamp_icon.png' alt="Trophy" width={24} height={24} />
                    <span className="font-bold">{rank1.totalStampSum}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-1/3">
            {rank3 && (
              <>
                <div className="relative mb-2 flex flex-col items-center">
                  <Image
                    src={getProfileImage(rank3.profileImageUrl)}
                    alt="3rd"
                    width={64}
                    height={64}
                    className="rounded-full object-cover border-2 border-white shadow-md z-10"
                  />
                  <p className="mt-1 text-sm font-bold text-gray-700 truncate max-w-[80px]">
                    {rank3.nickname}
                  </p>
                  {/* [수정] 하드코딩 제거하고 getBadgeDisplay 함수 사용 */}
                  <span className="bg-[#8B6E5B] text-white text-[10px] px-2 py-0.5 rounded-full mt-1 truncate max-w-[80px]">
                    {getBadgeDisplay(rank3.totalStampSum, rank3.representativeBadgeName)}
                  </span>
                </div>
                <div className="w-full h-[110px] bg-gradient-to-b from-[#FF9E5E] to-[#FF8C42] rounded-t-lg flex flex-col items-center pt-2 text-white shadow-md">
                  <span className="text-3xl font-bold mt-2">3</span>
                  <div className="flex items-center gap-1 mt-auto mb-3">
                    <Image src='/assets/stamp_icon.png' alt="Trophy" width={24} height={24} />
                    <span className="font-bold">{rank3.totalStampSum}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Ranking List (4th ~ ) --- */}
      <div className="flex flex-col w-full bg-[#F4EBE6] rounded-[20px] px-4 py-2">
        {rankOthers.length > 0 ? (
          rankOthers.map((stamper, index) => (
            <div
              key={index}
              className="flex items-center w-full py-4 border-b border-[#E5D7D0] last:border-0"
            >
              <span className="text-xl font-bold text-[#6B5143] w-8 text-center">
                {index + 4}
              </span>
              <Image
                src={getProfileImage(stamper.profileImageUrl)}
                alt="user"
                width={48}
                height={48}
                className="rounded-full object-cover ml-2 border border-white"
              />
              <div className="flex flex-col ml-3 flex-1">
                <span className="text-sm font-bold text-[#4A3A30]">
                  {stamper.nickname}
                </span>
                {/* [수정] 하드코딩 제거하고 getBadgeDisplay 함수 사용 */}
                <span className="text-[10px] text-white bg-[#8B6E5B] px-2 py-0.5 rounded-full self-start mt-1">
                  {getBadgeDisplay(stamper.totalStampSum, stamper.representativeBadgeName)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Image src='/assets/stamp_icon.png' alt="Trophy" width={24} height={24} />
                <span className="text-[#FF6600] font-bold text-lg">
                  {stamper.totalStampSum}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-gray-500 text-sm">
            추가 랭킹 정보가 없습니다.
          </div>
        )}
      </div>

      {/* --- My Rank Section --- */}
      <div className="self-start mt-10 mb-4">
        <h2 className="font-semibold text-[22px] text-[#5A3A28]">My Rank</h2>
      </div>

      <div className="w-full bg-[#F4EBE6] rounded-[20px] p-6 flex items-center justify-between shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <span className="text-sm text-[#8B6E5B] font-medium mb-1">상위</span>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-[#5A3A28]">
              {myInfo?.topPercent || '0'}
            </span>
          </div>
        </div>

        <div className="h-12 w-px bg-[#D6C5BC] mx-2"></div>

        <div className="flex flex-1 items-center justify-center">
          <Image
            src={getProfileImage(myInfo?.profileImageUrl)}
            alt="me"
            width={56}
            height={56}
            className="rounded-full object-cover border-2 border-white"
          />
          <div className="flex flex-col ml-3">
            <span className="font-bold text-[#4A3A30]">
              {myInfo?.nickname || '나'}
            </span>
            {/* My Rank는 이미 userLevel을 구했으므로 기존 로직 유지해도 무방 (또는 getBadgeNameByLevel 재사용) */}
            <span className="text-[10px] text-white bg-[#8B6E5B] px-2 py-0.5 rounded-full mt-1 self-start">
              {getBadgeNameByLevel(userLevel)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Image src='/assets/stamp_icon.png' alt="Trophy" width={24} height={24} />
          <span className="text-[#FF6600] font-bold text-xl">
            {myInfo?.totalStampSum || 0}
          </span>
        </div>
      </div>

      <div className="mt-10 w-full">
        <UserBottomBar />
      </div>
    </div>
  );
};