'use client';

import BackButton from '@/components/BackButton';
import React, { useMemo } from 'react';
import Image from 'next/image';

const LEVEL_BENEFITS = [
  {
    level: 1,
    stampRequirement: 20,
    walletTheme: '기본 지갑 테마',
    badges: ['원두 탐험가'],
    additionalBenefits: [],
    description: '커피의 세계에 첫 발을 내딛는 시작 단계',
  },
  {
    level: 2,
    stampRequirement: 40,
    walletTheme: '초급 지갑 테마',
    badges: ['브루 수련생', '카페 수집가'],
    additionalBenefits: [],
    description: '다양한 카페를 다니며 나만의 맛을 찾아가는 수련 단계',
  },
  {
    level: 3,
    stampRequirement: 60,
    walletTheme: '중급 지갑 테마',
    badges: ['라떼 장인', '오늘의 드립러'],
    additionalBenefits: ['리뷰 상위권 노출'],
    description: '원두의 차이를 이해하고 즐길 줄 아는 단계',
  },
  {
    level: 4,
    stampRequirement: 80,
    walletTheme: '고급 지갑 테마',
    badges: ['로스트 마스터', '커피 연금술사'],
    additionalBenefits: ['리뷰 상위권 노출'],
    description: '커피에 대한 깊은 조예를 가진 마스터 단계',
  },
  {
    level: 5,
    stampRequirement: 100,
    walletTheme: '특별 지갑 테마',
    badges: ['전설의 바리스타', '카페 그랜드마스터'],
    additionalBenefits: ['리뷰 상위권 노출'],
    description: '모든 카페를 섭렵한 최고의 경지',
  },
];


export default function RewardInfo() {
  const [selectedLevel, setSelectedLevel] = React.useState<number>(1);

  // 선택된 레벨의 데이터를 찾음
  const currentLevelData = useMemo(
    () => LEVEL_BENEFITS.find((l) => l.level === selectedLevel),
    [selectedLevel]
  );

  return (
    <div className="w-screen p-5 flex flex-col items-center pb-20">
      {/* 상단 네비게이션 */}
      <div className="w-full flex justify-between items-center">
        <BackButton />
        <div className="w-[24px]"></div>{' '}{/* 오른쪽 공간 맞춤용 빈 div */}
      </div>

      {/* 타이틀 영역 */}
      <div className="w-full ml-3 flex flex-col">
        <p className="text-[25px] text-(--fill-color6) font-semibold mt-7">
          Stamp Rewards
        </p>
        <p className="text-(--fill-color7) font-medium text-[13px] mt-1.5">
          레벨을 올리면서 다양한 혜택을 만나보세요!
        </p>
      </div>

      {/* 레벨업 방법 안내 패널 */}
      <div className="w-full flex flex-col justify-start mt-7">
        <p className="text-(--fill-color5) text-[14px] font-semibold ml-3">
          How to level up?
        </p>
        <Image
          src='/assets/reward_info_panel.png'
          alt="Reward Info Panel"
          className="w-full h-50 object-contain"
          width={500}
          height={200}
        />
      </div>

      {/* 레벨 혜택 영역 */}
      <div className="w-full flex flex-col justify-start items-center mt-8">
        <div className="w-full flex justify-start ml-6 mb-4">
          <p className="text-[#8B8B8B] text-[16px] font-bold">Level benefit</p>
        </div>

        {/* 1. 레벨 선택 탭 버튼 */}
        <div className="w-full flex flex-row justify-between gap-2 px-1">
          {LEVEL_BENEFITS.map((level) => {
            const isSelected = selectedLevel === level.level;
            return (
              <button
                key={level.level}
                onClick={() => setSelectedLevel(level.level)}
                className={`
                  flex-1 w-[65px] h-[30px] rounded-[20px] border flex justify-center items-center transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? 'border-(--main-color) bg-white' // 선택됨: 주황 테두리
                      : 'border-(--fill-color4) bg-white' // 미선택: 회색 테두리
                  }
                `}
              >
                <span
                  className={`text-[12px] font-medium ${
                    isSelected ? 'text-orange-500 font-bold' : 'text-gray-400'
                  }`}
                >
                  Lv.{level.level}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. 선택된 레벨 상세 정보 표시 */}
        {currentLevelData && (
          <div className="w-full mt-6 px-1">
            {/* 레벨 타이틀 및 조건 */}
            <div className="flex items-center mb-2">
              <span className="text-[26px] font-semibold text-(--fill-color6)">
                Lv.{currentLevelData.level}
              </span>
              <span className="ml-3 px-3 py-1 bg-[#6D5649] text-white text-[10px] font-medium rounded-full">
                조건: {currentLevelData.stampRequirement}스탬프 적립
              </span>
            </div>

            {/* 설명 텍스트 */}
            <p className="text-(--fill-color6) text-[13px] font-medium mb-6">
              {currentLevelData.description}
            </p>

            {/* 혜택 리스트 (Cards) */}
            <div className="flex flex-col gap-3">
              {/* 지갑 테마 혜택 */}
              <div className="flex items-center bg-(--fill-color1) rounded-[50px] p-5 h-[64px]">
                <Image
                  src='/assets/wallet_theme_icon.png'
                  alt="icon"
                  className="w-[27px] h-[27px] mr-4"
                  width={27}
                  height={27}
                />
                <span className="text-(--fill-color6) text-[14px] font-semibold">
                  {currentLevelData.walletTheme}
                </span>
              </div>

              {/* 뱃지 획득 혜택 (뱃지가 있을 경우에만 표시) */}
              {currentLevelData.badges.length > 0 && (
                <div className="flex items-center bg-(--fill-color1) rounded-[50px] p-5 h-[64px]">
                  <Image
                    src='/assets/badge_theme_icon.png'
                    alt="icon"
                    className="w-[27px] h-[27px] mr-4"
                    width={27}
                    height={27}
                  />
                  <span className="text-(--fill-color6) text-[14px] font-semibold">
                    {currentLevelData.badges
                      .map((b) => `"${b}"`)
                      .join(' ')}{' '}
                    뱃지 획득
                  </span>
                </div>
              )}

              {/* 추가 혜택 (있을 경우에만 표시) */}
              {currentLevelData.additionalBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center bg-(--fill-color1) rounded-[50px] p-5 h-[64px]"
                >
                  <Image
                    src='/assets/review_theme_icon.png'
                    alt="icon"
                    className="w-[27px] h-[27px] mr-4"
                    width={27}
                    height={27}
                  />
                  <span className="text-(--fill-color6) text-[14px] font-semibold">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
