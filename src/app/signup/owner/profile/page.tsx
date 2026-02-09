'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// UI용 요일 배열
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// API 전송용 요일 배열
const API_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// 카테고리 목록 상수
const CATEGORIES = [
  '커피 전문',
  '베이커리',
  '디저트 전문',
  '테이크아웃 전문',
  '기타',
];

/**
 * COFFEE,//커피 전문
    BAKERY,//베이커리
    DESSERT,//디저트 전문
    TAKEOUT,//테이크아웃 전문
    ETC//기타
 */

const CATEGORY_MAP: { [key: string]: string } = {
  '커피 전문': 'COFFEE',
  '베이커리': 'BAKERY',
  '디저트 전문': 'DESSERT',
  '테이크아웃 전문': 'TAKEOUT',
  '기타': 'ETC',
};

interface DailyHour {
  day: string;
  start: string;
  end: string;
}

interface BusinessHourDto {
  day: string;
  openTime: string;
  closeTime: string;
  isHoliday: boolean;
}

interface ShopProfileRequest {
  storeName: string;
  category: string;
  phone: string;
  businessHours: BusinessHourDto[];
  maxCount: number; // 스탬프 최대 적립 개수
  requiredAmount: number;
  reward: string;
}

export default function Page() {
  return <ShopProfile />;
}

const ShopProfile = () => {
  const router = useRouter();

  // 1. 기본 정보
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // 2. 영업 시간
  const [weeklyHours, setWeeklyHours] = useState<DailyHour[]>(
    DAYS.map((day) => ({ day, start: '', end: '' }))
  );

  // 3. 이미지 상태 관리
  const [storeImagePreview, setStoreImagePreview] = useState<string | null>(null);
  const storeFileInputRef = useRef<HTMLInputElement>(null);
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);

  const [stampImagePreview, setStampImagePreview] = useState<string | null>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const [stampImageFile, setStampImageFile] = useState<File | null>(null);

  // 4. 적립 조건 및 리워드
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [rewardType, setRewardType] = useState<'beverage' | 'other'>('beverage');

  // [추가] 5. 스탬프 개수 (maxCount) 상태 관리 (기본값 10)
  const [maxCount, setMaxCount] = useState(10);

  // --- Handlers ---

  // [추가] 스탬프 개수 증가/감소 핸들러
  const handleDecreaseCount = () => {
    if (maxCount > 1) setMaxCount(maxCount - 1);
  };
  const handleIncreaseCount = () => {
    setMaxCount(maxCount + 1);
  };

  const handleTimeChange = (index: number, field: 'start' | 'end', value: string) => {
    const newHours = [...weeklyHours];
    newHours[index][field] = value;
    setWeeklyHours(newHours);
  };

  const handleCopyMondayTime = () => {
    const monday = weeklyHours[0];
    if (!monday.start || !monday.end) {
      alert('월요일 시간을 먼저 입력해주세요.');
      return;
    }
    const newHours = weeklyHours.map((dayInfo) => ({
      ...dayInfo,
      start: monday.start,
      end: monday.end,
    }));
    setWeeklyHours(newHours);
  };

  const handleStoreImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoreImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setStoreImagePreview(previewUrl);
    }
  };

  const handleStampImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStampImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setStampImagePreview(previewUrl);
    }
  };

  const handleSubmit = async () => {
    if (!storeName) return alert('매장명을 입력해주세요.');
    if (!category) return alert('카테고리를 선택해주세요.');
    if (!storeImageFile) return alert('매장 대표 이미지를 등록해주세요.');
    if (!stampImageFile) return alert('스탬프 도장 이미지를 등록해주세요.');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인 정보가 없습니다.');
      return;
    }

    const businessHoursPayload: BusinessHourDto[] = weeklyHours.map((item, index) => {
      const isHoliday = !item.start || !item.end;
      return {
        day: API_DAYS[index],
        openTime: item.start || '00:00',
        closeTime: item.end || '00:00',
        isHoliday: isHoliday,
      };
    });

    const rewardString = rewardType === 'beverage' ? '매장음료 1잔' : '기타 아이템';

    // [수정] maxCount 상태값 적용
    const jsonPayload: ShopProfileRequest = {
      storeName: storeName,
      category: CATEGORY_MAP[category] || 'ETC',
      phone: phoneNumber,
      businessHours: businessHoursPayload,
      maxCount: maxCount, 
      requiredAmount: Number(minOrderAmount.replace(/,/g, '')) || 0,
      reward: rewardString
    };

    try {
      const formData = new FormData();
      formData.append(
        'data', 
        new Blob([JSON.stringify(jsonPayload)], { type: 'application/json' })
      );
      formData.append('storeImage', storeImageFile);
      formData.append('stampImage', stampImageFile);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/v1/auth/manager/onboarding`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '저장에 실패했습니다.');
      }

      console.log('사장님 온보딩 성공');
      alert('매장 등록이 완료되었습니다!');
      router.push('/owner/dashboard'); 

    } catch (error: any) {
      console.error('온보딩 실패:', error);
      alert(`오류 발생: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-125 mx-auto pb-20">
      <div className="mt-10 h-px bg-gray-100" />
      <div className="flex flex-col px-7 items-start mt-12">
        <div className="flex flex-col h-[82px]">
          <p className="text-[34px] font-semibold">심사가 완료됐어요!</p>
          <p className="text-[20px] mt-4">매장 프로필 설정을 시작하세요.</p>
        </div>
      </div>
      <div className="mt-10 h-px bg-gray-100" />

      <div className="w-full px-7 flex flex-col items-start mt-4">
        <p className="h-[42px] text-orange-500 text-[18px] font-semibold">
          매장 설정
        </p>

        {/* --- 대표 이미지 --- */}
        <div className="w-full mt-6 flex flex-col items-center">
          <p className="text-[15px] font-medium self-start mb-3">대표 이미지</p>
          
          <div 
            className="w-full h-[200px] bg-white border border-dashed border-gray-400 rounded-[20px] flex items-center justify-center cursor-pointer overflow-hidden relative"
            onClick={() => storeFileInputRef.current?.click()}
          >
            {storeImagePreview ? (
              <Image
                src={storeImagePreview}
                alt="Store Profile"
                className="w-full h-full object-cover"
                width={800}
                height={600}
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs">이미지를 첨부해주세요</span>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              ref={storeFileInputRef}
              onChange={handleStoreImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* 매장명 */}
        <div className="w-full mt-9">
          <p className="text-[15px] font-medium">매장명</p>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full border-b border-gray-300 mt-2 p-2 focus:outline-none"
          />
        </div>

        {/* 매장 카테고리 */}
        <div className="w-full mt-9 relative">
          <p className="text-[15px] font-medium">매장 카테고리</p>
          <div
            className="w-full h-[50px] border border-gray-300 mt-2 p-4 flex justify-between items-center cursor-pointer rounded-[10px]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={category ? 'text-black' : 'text-gray-400'}>
              {category || '카테고리 선택'}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-[200px] overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => {
                    setCategory(cat);
                    setIsDropdownOpen(false);
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 대표 번호 */}
        <div className="w-full mt-9">
          <p className="text-[15px] font-medium">대표 번호</p>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full h-[50px] rounded-[10px] border border-gray-300 mt-2 p-4 focus:outline-none"
          />
        </div>

        {/* 영업 시간 */}
        <div className="w-full mt-9">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[15px] font-medium">영업 시간</p>
            <button
              onClick={handleCopyMondayTime}
              className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-300 transition-colors"
            >
              월요일과 모두 동일
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {weeklyHours.map((item, index) => (
              <div key={item.day} className="flex items-center justify-between">
                <span className="w-8 text-sm font-medium text-gray-600">
                  {item.day}
                </span>
                <div className="flex items-center gap-2 w-[calc(100%-40px)]">
                  <input
                    type="time"
                    value={item.start}
                    onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="time"
                    value={item.end}
                    onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 스탬프 설정 */}
        <div className="w-full flex flex-col items-center mt-12">
          <p className="text-[18px] text-orange-500 font-semibold self-start">
            스탬프 설정
          </p>
          <input
            type="file"
            accept="image/*"
            ref={stampFileInputRef}
            onChange={handleStampImageUpload}
            className="hidden"
          />
          <Image
            src="/assets/stamp_inform.png"
            alt="Stamp Information"
            className="w-[330px] h-[57px]"
            width={330}
            height={57}
          />
          <div className="w-full flex flex-row items-center justify-between">
            <p className="text-[14px] text-[#5B5B5B]">
              스탬프
              <br />
              디자인
            </p>
            <div
              className="w-[70%] h-[160px] bg-white rounded-lg border border-dashed border-gray-400 flex items-center justify-center overflow-hidden relative cursor-pointer"
              onClick={() => stampFileInputRef.current?.click()}
            >
              {stampImagePreview ? (
                <Image
                  src={stampImagePreview}
                  alt="Stamp Preview"
                  className="w-full h-full object-cover"
                  width={330}
                  height={160}
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <span className="text-2xl mb-1">+</span>
                  <span className="text-xs">이미지를 첨부해주세요</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 적립 금액 조건 */}
        <div className="w-full mt-9 flex flex-row items-center justify-between">
          <p className="text-[14px] text-[#5B5B5B] font-medium">
            적립 금액 조건
          </p>
          <div className="flex items-center border-b border-gray-300 mt-2 flex-grow justify-end ml-4">
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="5000"
              className="w-24 h-full p-2 focus:outline-none text-right"
            />
            <span className="text-gray-600 text-sm ml-1">원 이상</span>
          </div>
        </div>

        {/* 리워드 보상 선택 */}
        <div className="w-full mt-9 flex flex-row items-center justify-between">
          <p className="text-[15px] font-medium">리워드 보상</p>
          <div className="flex flex-row gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reward"
                value="beverage"
                checked={rewardType === 'beverage'}
                onChange={() => setRewardType('beverage')}
                className="w-5 h-5 accent-black"
              />
              <span className="text-sm">매장 음료 1잔</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reward"
                value="other"
                checked={rewardType === 'other'}
                onChange={() => setRewardType('other')}
                className="w-5 h-5 accent-black"
              />
              <span className="text-sm">기타 아이템</span>
            </label>
          </div>
        </div>

        {/* [추가] 스탬프판 내 스탬프 개수 설정 UI (이미지 반영) */}
        <div className="w-full mt-9 flex flex-row items-center justify-between">
          <p className="text-[14px] text-[#5B5B5B] font-medium leading-tight">
            스탬프판 내<br />
            스탬프 개수
          </p>
          <div className="flex items-center gap-3 mr-1">
            {/* 마이너스 버튼 */}
            <button
              onClick={handleDecreaseCount}
              className="w-[20px] h-[20px] rounded-full border border-gray-300 flex items-center justify-center text-gray-400 pb-0.5 hover:bg-gray-100"
            >
              -
            </button>
            
            {/* 숫자 표시 (밑줄) */}
            <div className="w-[50px] border-b border-gray-300 text-center pb-1">
              <span className="text-[20px] font-medium">{maxCount}</span>
            </div>

            {/* 플러스 버튼 */}
            <button
              onClick={handleIncreaseCount}
              className="w-[20px] h-[20px] rounded-full border border-gray-300 flex items-center justify-center text-gray-400 pb-0.5 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* 저장 버튼 */}
        <button 
          onClick={handleSubmit}
          className="w-full h-[56px] mt-12 bg-orange-500 text-white rounded-[40px] font-bold text-lg cursor-pointer hover:bg-orange-600 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};