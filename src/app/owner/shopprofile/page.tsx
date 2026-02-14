'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BackButton3 } from '@/components/BackButton3';
import { ChevronDown, Plus, Minus, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const API_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const CATEGORIES = [
  '커피 전문',
  '베이커리',
  '테이크아웃 전문',
  '체험형 카페',
  '테마 카페',
  '기타',
];

const CATEGORY_MAP: { [key: string]: string } = {
  '커피 전문': 'COFFEE',
  베이커리: 'BAKERY',
  '테이크아웃 전문': 'TAKEOUT',
  '체험형 카페': 'EXPERIENCE',
  '테마 카페': 'THEME',
  기타: 'ETC',
};

const REVERSE_CATEGORY_MAP: { [key: string]: string } = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
);

// --- 인터페이스 정의 ---

interface BusinessHourDto {
  id: number | null;
  day: string;
  openTime: string;
  closeTime: string;
  isHoliday: boolean;
  action: string;
}

interface MenuItemState {
  id: number | null;
  name: string;
  price: string;
  content: string;
  imageUrl: string | null;
  imagePreview: string | null;
  imageFile: File | null;
  action: string;
}

interface ShopProfileUpdateRequest {
  store: {
    storeId: number;
    storeName: string;
    category: string;
    phone: string;
    businessHours: BusinessHourDto[];
    requiredAmount: number;
    reward: string;
    maxCount: number;
    menus: {
      id: number | null;
      name: string;
      price: number;
      content: string;
      imageUrl: string | null;
      action: string;
    }[];
    sns: string;
    storeUrl: string;
    verificationCode: string;
  };
}

export default function OwnerShopProfile() {
  const router = useRouter();
  const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // --- 상태 관리 ---
  const [storeId, setStoreId] = useState<number>(0);
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [storeImagePreview, setStoreImagePreview] = useState<string | null>(
    null
  );
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);
  const storeFileInputRef = useRef<HTMLInputElement>(null);

  const [weeklyHours, setWeeklyHours] = useState<BusinessHourDto[]>(
    API_DAYS.map((day) => ({
      id: null,
      day,
      openTime: '00:00:00',
      closeTime: '00:00:00',
      isHoliday: false,
      action: 'CREATE',
    }))
  );

  const [snsUrl, setSnsUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');

  const [menus, setMenus] = useState<MenuItemState[]>([]);
  const [couponCode, setCouponCode] = useState('');

  const [stampImagePreview, setStampImagePreview] = useState<string | null>(
    null
  );
  const [stampImageFile, setStampImageFile] = useState<File | null>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);

  const [requiredAmount, setRequiredAmount] = useState('');
  const [rewardType, setRewardType] = useState<'매장음료 1잔' | '기타 아이템'>(
    '매장음료 1잔'
  );
  const [maxStampCount, setMaxStampCount] = useState(10);

  // --- GET: 데이터 불러오기 ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const response = await fetch(`${apiUri}/v1/managers/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (json.code === 100 && json.data?.store) {
          const data = json.data.store;

          setStoreId(data.storeId);
          setStoreName(data.storeName || '');
          setPhoneNumber(data.phone || '');
          setCategory(REVERSE_CATEGORY_MAP[data.category] || '기타');
          setStoreImagePreview(data.storeImageUrl);
          setStampImagePreview(data.stampImageUrl);
          setSnsUrl(data.sns || '');
          setSiteUrl(data.storeUrl || '');
          setCouponCode(data.verificationCode || '');
          setRequiredAmount(String(data.requiredAmount || ''));
          setRewardType(
            data.reward === '매장음료 1잔' ? '매장음료 1잔' : '기타 아이템'
          );
          setMaxStampCount(data.maxCount || 10);

          if (Array.isArray(data.menus)) {
            const mappedMenus = data.menus.map((m: any) => ({
              id: m.id,
              name: m.name || '',
              price: String(m.price || ''),
              content: m.content || '',
              imageUrl: m.imageUrl || null,
              imagePreview: m.imageUrl || null,
              imageFile: null,
              action: 'UPDATE',
            }));
            setMenus(mappedMenus);
          }

          if (data.businessHours && data.businessHours.length > 0) {
            const mappedHours = API_DAYS.map((dayFull) => {
              const found =
                data.businessHours.find((h: any) => h.day === dayFull) ||
                data.businessHours.find(
                  (h: any) => h.day === dayFull.substring(0, 3)
                );

              if (found) {
                let start = found.openTime || '00:00:00';
                let end = found.closeTime || '00:00:00';
                if (typeof start === 'string' && start.length === 5)
                  start += ':00';
                if (typeof end === 'string' && end.length === 5) end += ':00';

                return {
                  id: found.id,
                  day: dayFull,
                  openTime: start,
                  closeTime: end,
                  isHoliday: found.isHoliday,
                  action: 'UPDATE',
                };
              }
              return {
                id: null,
                day: dayFull,
                openTime: '00:00:00',
                closeTime: '00:00:00',
                isHoliday: false,
                action: 'CREATE',
              };
            });
            setWeeklyHours(mappedHours);
          }
        }
      } catch (error) {
        console.error('매장 프로필 조회 실패:', error);
      }
    };

    fetchProfile();
  }, []);

  // --- Handlers ---

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleTimeChange = (
    index: number,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    const newHours = [...weeklyHours];
    const timeWithSec = value.length === 5 ? value + ':00' : value;
    newHours[index] = { ...newHours[index], [field]: timeWithSec };
    if (newHours[index].id !== null) newHours[index].action = 'UPDATE';
    setWeeklyHours(newHours);
  };

  const handleCopyTime = () => {
    const monday = weeklyHours[0];
    const newHours = weeklyHours.map((h) => ({
      ...h,
      openTime: monday.openTime,
      closeTime: monday.closeTime,
      isHoliday: monday.isHoliday,
      action: h.id !== null ? 'UPDATE' : 'CREATE',
    }));
    setWeeklyHours(newHours);
  };

  const addMenu = () => {
    if (menus.length >= 10) return;
    setMenus([
      ...menus,
      {
        id: null,
        name: '',
        price: '',
        content: '',
        imageUrl: null,
        imagePreview: null,
        imageFile: null,
        action: 'CREATE',
      },
    ]);
  };

  const removeMenu = (index: number) => {
    setMenus(menus.filter((_, i) => i !== index));
  };

  const changeMenuField = (
    index: number,
    field: keyof MenuItemState,
    value: string
  ) => {
    const newMenus = [...menus];
    (newMenus[index] as any)[field] = value;
    if (newMenus[index].id !== null) newMenus[index].action = 'UPDATE';
    setMenus(newMenus);
  };

  const changeMenuImage = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMenus = [...menus];
      newMenus[index].imageFile = file;
      newMenus[index].imagePreview = URL.createObjectURL(file);
      if (newMenus[index].id !== null) newMenus[index].action = 'UPDATE';
      setMenus(newMenus);
    }
  };

  // --- PATCH: 저장 핸들러 ---
  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('로그인이 필요합니다.');

    if (!storeName || !category)
      return alert('매장명과 카테고리는 필수입니다.');

    const jsonData: ShopProfileUpdateRequest = {
      store: {
        storeId: storeId, // [중요] 받아온 storeId 전송
        storeName,
        category: CATEGORY_MAP[category] || 'ETC',
        phone: phoneNumber,
        businessHours: weeklyHours,
        requiredAmount: Number(requiredAmount) || 0,
        reward: rewardType,
        maxCount: maxStampCount,
        menus: menus.map((m) => ({
          id: m.id,
          name: m.name,
          price: Number(m.price.replace(/,/g, '')) || 0,
          content: m.content,
          imageUrl: m.imageUrl,
          action: m.action,
        })),
        sns: snsUrl,
        storeUrl: siteUrl,
        verificationCode: couponCode,
      },
    };

    // 2. FormData 생성
    const formData = new FormData();
    formData.append('data', JSON.stringify(jsonData));

    if (storeImageFile) {
      formData.append('storeImage', storeImageFile);
    }
    if (stampImageFile) {
      formData.append('stampImage', stampImageFile);
    }

    menus.forEach((menu) => {
      if (menu.imageFile) {
        formData.append('menuImages', menu.imageFile);
      } else {
        formData.append(
          'menuImages',
          new Blob([], { type: 'application/octet-stream' }),
          ''
        );
      }
    });

    try {
      const response = await fetch(`${apiUri}/v1/managers/profile`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON Parse Error:', responseText);
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }

      if (
        response.ok &&
        (responseData.code === 100 || responseData.code === 0)
      ) {
        alert('저장이 완료되었습니다.');
        window.location.reload();
        router.back();
      } else {
        alert(`저장 실패: ${responseData.message || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('저장 중 오류 발생:', error);
      alert(`오류 발생: ${error.message}`);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center p-4">
        <BackButton3 />
      </div>
      <div className="px-6 mb-8">
        <h1 className="text-[25px] font-bold">매장 프로필</h1>
      </div>

      <div className="w-full h-px bg-gray-100 mb-8" />

      {/* --- 매장 설정 섹션 --- */}
      <div className="px-6">
        <h2 className="text-[18px] font-bold text-orange-500 mb-6">
          매장 설정
        </h2>

        {/* 대표 이미지 */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <label className="text-[15px] font-medium text-[#333]">
              대표 이미지
            </label>
            <span className="text-[12px] text-gray-400">
              최대 1개까지 추가 가능
            </span>
          </div>
          <div
            className="w-full h-[200px] bg-[#F5F5F5] rounded-[20px] flex items-center justify-center cursor-pointer overflow-hidden relative border border-gray-200"
            onClick={() => storeFileInputRef.current?.click()}
          >
            {storeImagePreview ? (
              <Image
                src={storeImagePreview}
                alt="매장 대표"
                className="w-full h-full object-cover"
                fill
              />
            ) : (
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white">
                <Plus className="w-6 h-6" />
              </div>
            )}
            <input
              type="file"
              ref={storeFileInputRef}
              onChange={(e) =>
                handleImageUpload(e, setStoreImageFile, setStoreImagePreview)
              }
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>

        {/* 매장명 */}
        <div className="mb-8">
          <div className="flex justify-between mb-1">
            <label className="text-[15px] font-medium text-[#333]">
              매장명
            </label>
            <span className="text-[12px] text-gray-400">
              {storeName.length}/20
            </span>
          </div>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full border-b border-gray-300 py-2 outline-none"
            maxLength={20}
          />
        </div>

        {/* 매장 카테고리 */}
        <div className="mb-8 relative">
          <label className="text-[15px] font-medium text-[#333] mb-2 block">
            매장 카테고리
          </label>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full h-[50px] border border-gray-300 rounded-[10px] px-4 flex justify-between items-center bg-white"
          >
            <span className={category ? 'text-black' : 'text-gray-400'}>
              {category || '선택해주세요'}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-[200px] overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
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
        <div className="mb-8">
          <label className="text-[15px] font-medium text-[#333] mb-2 block">
            대표 번호
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full h-[50px] border border-gray-300 rounded-[10px] px-4 outline-none focus:border-orange-500"
          />
        </div>

        {/* 영업시간 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[15px] font-medium text-[#333]">
              영업시간
            </label>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleCopyTime}
            >
              <div className="w-4 h-4 rounded-full border border-gray-400" />
              <span className="text-[13px] text-gray-600">모두 동일</span>
            </div>
          </div>
          <div className="space-y-3">
            {weeklyHours.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="w-8 text-[15px] text-gray-600 shrink-0">
                  {DAYS[index]}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={item.openTime?.substring(0, 5) || '00:00'}
                    onChange={(e) =>
                      handleTimeChange(index, 'openTime', e.target.value)
                    }
                    className="bg-[#F5F5F5] rounded-[5px] px-2 py-2 text-sm outline-none flex-1 min-w-[80px] text-center"
                  />
                  <span className="shrink-0">-</span>
                  <input
                    type="time"
                    value={item.closeTime?.substring(0, 5) || '00:00'}
                    onChange={(e) =>
                      handleTimeChange(index, 'closeTime', e.target.value)
                    }
                    className="bg-[#F5F5F5] rounded-[5px] px-2 py-2 text-sm outline-none flex-1 min-w-[80px] text-center"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 링크 */}
        <div className="mb-8">
          <label className="text-[15px] font-medium text-[#333] mb-4 block">
            링크
          </label>
          <div className="flex items-center mb-4">
            <span className="w-20 text-[14px] text-gray-600">인스타그램</span>
            <span className="mr-2 text-gray-400">@</span>
            <input
              type="text"
              value={snsUrl}
              onChange={(e) => setSnsUrl(e.target.value)}
              className="flex-1 border-b border-gray-300 py-1 outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex items-center">
            <span className="w-20 text-[14px] text-gray-600">사이트</span>
            <input
              type="text"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="flex-1 border-b border-gray-300 py-1 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* 대표메뉴 (min-w-0 적용) */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <label className="text-[15px] font-bold text-[#333]">
              대표메뉴
            </label>
            <span className="text-[12px] text-gray-400">
              최대 10개까지 추가 가능
            </span>
          </div>

          <div className="border border-gray-200 rounded-[20px] p-5">
            <div className="space-y-8">
              {menus.map((menu, index) => (
                <div
                  key={index}
                  className="relative flex items-start gap-5 border-b border-gray-100 pb-8 last:border-0 last:pb-0"
                >
                  <button
                    onClick={() => removeMenu(index)}
                    className="absolute top-0 right-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {/* 좌측 이미지 */}
                  <div className="shrink-0">
                    <label
                      htmlFor={`menu-image-${index}`}
                      className="w-[120px] h-[120px] bg-[#F5F5F5] rounded-[20px] flex items-center justify-center cursor-pointer overflow-hidden relative"
                    >
                      {menu.imagePreview ? (
                        <Image
                          src={menu.imagePreview}
                          alt="메뉴"
                          className="w-full h-full object-cover"
                          fill
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white">
                          <Plus className="w-6 h-6" />
                        </div>
                      )}
                      <input
                        id={`menu-image-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => changeMenuImage(index, e)}
                      />
                    </label>
                  </div>
                  {/* 우측 입력 필드 (min-w-0 적용) */}
                  <div className="flex-1 flex flex-col gap-4 mt-1 min-w-0">
                    <div className="flex items-center">
                      <span className="w-14 text-[13px] text-[#333] font-medium shrink-0">
                        메뉴명:
                      </span>
                      <input
                        type="text"
                        value={menu.name}
                        onChange={(e) =>
                          changeMenuField(index, 'name', e.target.value)
                        }
                        className="flex-1 border-b border-gray-200 py-1 outline-none focus:border-orange-500 text-[14px] min-w-0"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="w-14 text-[13px] text-[#333] font-medium shrink-0">
                        설명:
                      </span>
                      <input
                        type="text"
                        value={menu.content}
                        onChange={(e) =>
                          changeMenuField(index, 'content', e.target.value)
                        }
                        className="flex-1 border-b border-gray-200 py-1 outline-none focus:border-orange-500 text-[14px] min-w-0"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="w-14 text-[13px] text-[#333] font-medium shrink-0">
                        가격:
                      </span>
                      <div className="flex-1 flex items-center border-b border-gray-200 focus-within:border-orange-500 min-w-0">
                        <input
                          type="text"
                          value={menu.price}
                          onChange={(e) =>
                            changeMenuField(index, 'price', e.target.value)
                          }
                          className="flex-1 py-1 outline-none text-right pr-2 text-[14px] min-w-0"
                        />
                        <span className="text-[13px] text-[#333] shrink-0">
                          원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {menus.length < 10 && (
            <button
              onClick={addMenu}
              className="w-full h-[60px] mt-4 border border-gray-200 rounded-[20px] flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-6 h-6 border border-gray-400 rounded-full p-1" />
            </button>
          )}
        </div>

        {/* 쿠폰 코드 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-[15px] font-bold text-[#333]">
              쿠폰 코드
            </label>
            <span className="text-[15px] font-medium text-gray-500">
              {couponCode}
            </span>
          </div>
          <div className="w-full bg-[#FFF0F0] rounded-[5px] py-2 px-4 text-center">
            <p className="text-[11px] text-[#FF5B5B]">
              매장 쿠폰 사용시 입력해야하는 고유 번호입니다. 타인에게 공유 금지
            </p>
          </div>
        </div>

        {/* 스탬프 설정 */}
        <div>
          <h2 className="text-[18px] font-bold text-orange-500 mb-4">
            스탬프 설정
          </h2>
          <div className="bg-[#F5F5F5] p-4 rounded-[10px] mb-8 text-[12px] text-gray-500 leading-relaxed">
            jpeg, png 파일만 업로드 가능합니다. 이미지 규격은 85 x 55mm 입니다.
            스탬프 이미지 미설정시 어플에서 제공하는 기본 이미지가 자동
            설정됩니다.
          </div>
          {/* 스탬프 디자인 */}
          <div className="flex gap-4 mb-8">
            <div className="w-20 pt-2">
              <span className="text-[14px] text-gray-600 font-medium">
                스탬프
                <br />
                디자인
              </span>
            </div>
            <div
              className="flex-1 h-[160px] border border-gray-300 rounded-[10px] flex items-center justify-center cursor-pointer overflow-hidden relative"
              onClick={() => stampFileInputRef.current?.click()}
            >
              {stampImagePreview ? (
                <Image
                  src={stampImagePreview}
                  alt="스탬프"
                  className="w-full h-full object-cover"
                  fill
                />
              ) : (
                <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white">
                  <Plus className="w-6 h-6" />
                </div>
              )}
              <input
                type="file"
                ref={stampFileInputRef}
                onChange={(e) =>
                  handleImageUpload(e, setStampImageFile, setStampImagePreview)
                }
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
          {/* 적립 금액조건 */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-2">
            <span className="text-[14px] text-gray-600 font-medium">
              적립 금액조건
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={requiredAmount}
                onChange={(e) => setRequiredAmount(e.target.value)}
                className="text-right w-20 outline-none text-[16px]"
              />
              <span className="text-[14px] text-[#333]">원 이상</span>
            </div>
          </div>
          {/* 리워드 보상 */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-[14px] text-gray-600 font-medium">
              리워드 보상
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    rewardType === '매장음료 1잔'
                      ? 'border-gray-800'
                      : 'border-gray-300'
                  }`}
                >
                  {rewardType === '매장음료 1잔' && (
                    <div className="w-2.5 h-2.5 bg-gray-800 rounded-full" />
                  )}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={rewardType === '매장음료 1잔'}
                  onChange={() => setRewardType('매장음료 1잔')}
                />
                <span className="text-[13px]">매장음료 1잔</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    rewardType === '기타 아이템'
                      ? 'border-gray-800'
                      : 'border-gray-300'
                  }`}
                >
                  {rewardType === '기타 아이템' && (
                    <div className="w-2.5 h-2.5 bg-gray-800 rounded-full" />
                  )}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  checked={rewardType === '기타 아이템'}
                  onChange={() => setRewardType('기타 아이템')}
                />
                <span className="text-[13px]">기타 아이템</span>
              </label>
            </div>
          </div>
          {/* 스탬프 개수 */}
          <div className="flex justify-between items-center mb-12">
            <span className="text-[14px] text-gray-600 font-medium">
              스탬프판 내<br />
              스탬프 개수
            </span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMaxStampCount(Math.max(1, maxStampCount - 1))}
                className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[16px] font-bold w-6 text-center">
                {maxStampCount}
              </span>
              <button
                onClick={() => setMaxStampCount(maxStampCount + 1)}
                className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="px-6 mt-4">
          <button
            onClick={handleSubmit}
            className="w-full h-[55px] bg-orange-500 text-white rounded-[30px] text-[18px] font-bold"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
