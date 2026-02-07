'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackButton from '@/components/BackButton';

// 상수 데이터 (요일, 카테고리 등)
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const API_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const CATEGORIES = ['커피 전문', '베이커리', '테이크아웃 전문', '디저트 전문', '기타'];
const CATEGORY_MAP: { [key: string]: string } = {
  '커피 전문': 'COFFEE', '베이커리': 'BAKERY', '테이크아웃 전문': 'TAKEOUT',
  '디저트 전문' : 'DESSERT', '기타': 'ETC',
};
const PHONE_PREFIXES = ['010', '02', '031', '032', '0507', '직접 입력'];

export default function ShopProfilePage() {
  const router = useRouter();

  // 토큰 검사 (없으면 로그인 페이지로)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인 정보가 없습니다. 처음부터 다시 진행해주세요.');
      router.replace('/signup/owner');
    }
  }, [router]);

  // 입력 상태 관리
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState('010');
  const [phoneMiddle, setPhoneMiddle] = useState('');
  const [phoneLast, setPhoneLast] = useState('');
  const [isCustomPrefix, setIsCustomPrefix] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState(DAYS.map((day) => ({ day, start: '', end: '' })));
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [rewardType, setRewardType] = useState<'beverage' | 'other'>('beverage');
  const [maxCount, setMaxCount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미지 상태
  const [storeImagePreview, setStoreImagePreview] = useState<string | null>(null);
  const storeFileInputRef = useRef<HTMLInputElement>(null);
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);

  const [stampImagePreview, setStampImagePreview] = useState<string | null>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const [stampImageFile, setStampImageFile] = useState<File | null>(null);

  // --- 핸들러 함수들 ---
  const handlePrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIsCustomPrefix(value === '직접 입력');
    setPhonePrefix(value === '직접 입력' ? '' : value);
  };

  const handleNumberInput = (setter: (val: string) => void, maxLength: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= maxLength) setter(val);
  };

  const handleTimeChange = (index: number, field: 'start' | 'end', value: string) => {
    const newHours = [...weeklyHours];
    newHours[index][field] = value;
    setWeeklyHours(newHours);
  };

  const handleCopyMondayTime = () => {
    const monday = weeklyHours[0];
    if (!monday.start || !monday.end) return alert('월요일 시간을 먼저 입력해주세요.');
    setWeeklyHours(weeklyHours.map(d => ({ ...d, start: monday.start, end: monday.end })));
  };

  const handleImageUpload = (setterFile: any, setterPreview: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setterFile(file);
      setterPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('로그인 세션이 만료되었습니다.');

    if (!storeName || !category || !phonePrefix || !phoneMiddle || !phoneLast || !storeImageFile || !stampImageFile) {
      return alert('필수 정보를 모두 입력해주세요.');
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const finalPhoneNumber = `${phonePrefix}-${phoneMiddle}-${phoneLast}`;
    const rewardString = rewardType === 'beverage' ? '매장음료 1잔' : '기타 아이템';

    // DTO 생성
    const shopProfilePayload = {
      storeName,
      category: CATEGORY_MAP[category] || 'ETC',
      phone: finalPhoneNumber,
      businessHours: weeklyHours.map((item, index) => ({
        day: API_DAYS[index],
        openTime: item.start || '00:00',
        closeTime: item.end || '00:00',
        isHoliday: !item.start || !item.end,
      })),
      maxCount,
      requiredAmount: Number(minOrderAmount.replace(/,/g, '')) || 0,
      reward: rewardString,
    };

    try {
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(shopProfilePayload)], { type: 'application/json' }));
      formData.append('storeImage', storeImageFile);
      formData.append('stampImage', stampImageFile);

      const response = await fetch(`${apiUrl}/v1/auth/manager/onboarding`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // 토큰 사용
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 413) throw new Error('이미지 용량이 너무 큽니다 (20MB 제한)');
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '매장 등록 실패');
      }

      alert('매장 등록이 완료되었습니다!');
      router.push('/'); 
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 items-center bg-white min-h-screen">
      <div className="w-full max-w-[375px]">
        {/* 헤더 */}
        <div className="flex flex-row items-center self-start mt-3 gap-4 px-6 w-full">
          <BackButton />
        </div>
        <div className="mt-3 h-px bg-gray-100" />
        
        <div className="flex flex-col px-7 items-start mt-12">
          <div className="flex flex-col h-[82px]">
            <p className="text-[34px] font-semibold">심사가 완료됐어요!</p>
            <p className="text-[20px] mt-4">매장 프로필 설정을 시작하세요.</p>
          </div>
        </div>
        <div className="mt-10 h-px bg-gray-100" />

        <div className="w-full px-7 flex flex-col items-start mt-4">
          <p className="h-[42px] text-orange-500 text-[18px] font-semibold">매장 설정</p>

          {/* 대표 이미지 */}
          <div className="w-full mt-6 flex flex-col items-center">
            <p className="text-[15px] font-medium self-start mb-3">대표 이미지</p>
            <div className="w-full h-[200px] bg-white border border-dashed border-gray-400 rounded-[20px] flex items-center justify-center cursor-pointer overflow-hidden relative" onClick={() => storeFileInputRef.current?.click()}>
              {storeImagePreview ? <img src={storeImagePreview} alt="Profile" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-400"><span className="text-2xl mb-1">+</span><span className="text-xs">이미지를 첨부해주세요</span></div>}
              <input type="file" accept="image/*" ref={storeFileInputRef} onChange={handleImageUpload(setStoreImageFile, setStoreImagePreview)} className="hidden" />
            </div>
          </div>

          {/* 매장명 */}
          <div className="w-full mt-9">
            <p className="text-[15px] font-medium">매장명</p>
            <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full border-b border-gray-300 mt-2 p-2 focus:outline-none" />
          </div>

          {/* 카테고리 */}
          <div className="w-full mt-9 relative">
            <p className="text-[15px] font-medium">매장 카테고리</p>
            <div className="w-full h-[50px] border border-gray-300 mt-2 p-4 flex justify-between items-center cursor-pointer rounded-[10px]" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <span className={category ? 'text-black' : 'text-gray-400'}>{category || '카테고리 선택'}</span>
              <Image src="/assets/downbutton.svg" width={20} height={20} alt="down" className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {isDropdownOpen && <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-[200px] overflow-y-auto">
              {CATEGORIES.map(cat => <div key={cat} className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setCategory(cat); setIsDropdownOpen(false); }}>{cat}</div>)}
            </div>}
          </div>

          {/* 전화번호 */}
          <div className="w-full mt-9">
            <p className="text-[15px] font-medium">대표 번호</p>
            <div className="flex items-center gap-2 mt-2 w-full">
              <div className="relative w-[30%]">
                {isCustomPrefix ? 
                  <div className="relative w-full">
                    <input type="text" value={phonePrefix} onChange={(e) => setPhonePrefix(e.target.value.replace(/[^0-9]/g, ''))} placeholder="입력" className="w-full h-[50px] rounded-[10px] border border-gray-300 px-2 focus:outline-none text-center" maxLength={4} autoFocus />
                    <button onClick={() => { setIsCustomPrefix(false); setPhonePrefix('010'); }} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400">✕</button>
                  </div> : 
                  <select value={phonePrefix} onChange={handlePrefixChange} className="w-full h-[50px] rounded-[10px] border border-gray-300 px-3 appearance-none focus:outline-none bg-white text-center">
                    {PHONE_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                }
                {!isCustomPrefix && <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"><Image src="/assets/downbutton.svg" width={12} height={12} alt="arrow" /></div>}
              </div>
              <span className="text-gray-400">-</span>
              <input type="tel" value={phoneMiddle} onChange={handleNumberInput(setPhoneMiddle, 4)} className="w-[32%] h-[50px] rounded-[10px] border border-gray-300 px-3 focus:outline-none text-center" maxLength={4} />
              <span className="text-gray-400">-</span>
              <input type="tel" value={phoneLast} onChange={handleNumberInput(setPhoneLast, 4)} className="w-[32%] h-[50px] rounded-[10px] border border-gray-300 px-3 focus:outline-none text-center" maxLength={4} />
            </div>
          </div>

          {/* 영업 시간 */}
          <div className="w-full mt-9">
            <div className="flex justify-between items-center mb-4"><p className="text-[15px] font-medium">영업 시간</p><button onClick={handleCopyMondayTime} className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-300">모두 동일</button></div>
            <div className="flex flex-col gap-3">
              {weeklyHours.map((item, index) => (
                <div key={item.day} className="flex items-center justify-between">
                  <span className="w-8 text-sm font-medium text-gray-600">{item.day}</span>
                  <div className="flex items-center gap-2 w-[calc(100%-40px)]">
                    <input type="time" value={item.start} onChange={(e) => handleTimeChange(index, 'start', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
                    <span className="text-gray-400">~</span>
                    <input type="time" value={item.end} onChange={(e) => handleTimeChange(index, 'end', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 스탬프 설정 */}
          <div className="w-full flex flex-col items-center mt-12">
            <p className="text-[18px] text-orange-500 font-semibold mb-3 self-start">스탬프 설정</p>
            <input type="file" accept="image/*" ref={stampFileInputRef} onChange={handleImageUpload(setStampImageFile, setStampImagePreview)} className="hidden" />
            <img src="/assets/stamp_inform.png" alt="Info" className="w-[330px] h-[57px]" />
            <div className="w-full flex flex-row items-center justify-between mt-5">
              <p className="text-[14px] text-[#5B5B5B]">스탬프<br />디자인</p>
              <div className="w-[70%] h-[160px] bg-white rounded-lg border border-dashed border-gray-400 flex items-center justify-center overflow-hidden relative cursor-pointer" onClick={() => stampFileInputRef.current?.click()}>
                {stampImagePreview ? <img src={stampImagePreview} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-400"><span className="text-2xl mb-1">+</span><span className="text-xs">이미지를 첨부해주세요</span></div>}
              </div>
            </div>
          </div>

          <div className="w-full mt-9 flex flex-row items-center justify-between">
            <p className="text-[14px] text-[#5B5B5B] font-medium">적립 금액 조건</p>
            <div className="flex items-center border-b border-gray-300 mt-2 flex-grow justify-end ml-4">
              <input type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} placeholder="5000" className="w-24 h-full p-2 focus:outline-none text-right" />
              <span className="text-gray-600 text-sm ml-1">원 이상</span>
            </div>
          </div>

          <div className="w-full mt-9 flex flex-row items-center justify-between">
            <p className="text-[15px] font-medium">리워드 보상</p>
            <div className="flex flex-row gap-3">
              <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="reward" value="beverage" checked={rewardType === 'beverage'} onChange={() => setRewardType('beverage')} className="w-5 h-5 accent-black" /><span className="text-sm">매장 음료 1잔</span></label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name="reward" value="other" checked={rewardType === 'other'} onChange={() => setRewardType('other')} className="w-5 h-5 accent-black" /><span className="text-sm">기타 아이템</span></label>
            </div>
          </div>

          <div className="w-full mt-9 flex flex-row items-center justify-between">
            <p className="text-[14px] text-[#5B5B5B] font-medium leading-tight">스탬프판 내<br />스탬프 개수</p>
            <div className="flex items-center gap-3 mr-1">
              <button onClick={() => maxCount > 1 && setMaxCount(c => c - 1)} className="w-[20px] h-[20px] rounded-full border border-gray-300 flex items-center justify-center text-gray-400 pb-0.5 hover:bg-gray-100">-</button>
              <div className="w-[50px] border-b border-gray-300 text-center pb-1"><span className="text-[20px] font-medium">{maxCount}</span></div>
              <button onClick={() => setMaxCount(c => c + 1)} className="w-[20px] h-[20px] rounded-full border border-gray-300 flex items-center justify-center text-gray-400 pb-0.5 hover:bg-gray-100">+</button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-[56px] mt-12 bg-orange-500 text-white rounded-[40px] font-bold text-lg cursor-pointer hover:bg-orange-600 transition-colors disabled:opacity-50">
            {isSubmitting ? '처리 중...' : '확인'}
          </button>
        </div>
      </div>
    </div>
  );
}