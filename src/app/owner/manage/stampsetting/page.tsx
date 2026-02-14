'use client';

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { BackButton3 } from '@/components/BackButton3';
import { useRouter } from 'next/navigation';

// 서버로부터 받아올 데이터 타입 정의
interface StampSettingsResponse {
  storeName: string;
  requiredAmount: number;
  reward: string;
  maxCnt: number;
  imgurl: string | null;
}

export default function OwnerStampSetting() {
  const router = useRouter();

  // --- 상태 관리 ---
  const [storeName, setStoreName] = useState('');
  const [stampImagePreview, setStampImagePreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 실제 파일 전송을 위해 파일 객체 상태 추가
  const [stampFile, setStampFile] = useState<File | null>(null);

  // 적립 조건 및 리워드
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [rewardType, setRewardType] = useState<'beverage' | 'other'>(
    'beverage'
  );
  const [stampCount, setStampCount] = useState('10');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStampFile(file); // 전송할 파일 객체 저장
      const previewUrl = URL.createObjectURL(file);
      setStampImagePreview(previewUrl);
    }
  };

  const onIncrease = () => {
    const currentCount = parseInt(stampCount) || 0;
    setStampCount((currentCount + 1).toString());
  };

  const onDecrease = () => {
    const currentCount = parseInt(stampCount) || 0;
    if (currentCount > 0) {
      setStampCount((currentCount - 1).toString());
    }
  };

  // --- 1. 초기 데이터 로드 (프로필 조회 -> 스탬프 설정 조회) ---
  useEffect(() => {
    const apiUri = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // [Step 1] 관리자 프로필에서 가게 이름(storeName) 가져오기
        const profileResponse = await fetch(`${apiUri}/v1/managers/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const profileJson = await profileResponse.json();
        let currentStoreName = '';

        if (profileJson.code === 100 && profileJson.data?.store) {
          currentStoreName = profileJson.data.store.storeName;
          setStoreName(currentStoreName);
        } else {
            console.error('Failed to fetch store profile');
            return;
        }

        // [Step 2] 가져온 가게 이름을 기반으로 스탬프 설정 조회하기
        if (currentStoreName) {
            const settingsResponse = await fetch(
                `${apiUri}/v1/manager/settings?storeName=${encodeURIComponent(currentStoreName)}`, 
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (settingsResponse.ok) {
                const settingsData: StampSettingsResponse = await settingsResponse.json();
                
                // 받아온 데이터로 State 업데이트
                if (settingsData) {
                    // 1. 적립 금액
                    setMinOrderAmount(settingsData.requiredAmount.toString());
                    
                    // 2. 스탬프 개수
                    setStampCount(settingsData.maxCnt.toString());
                    
                    // 3. 이미지 URL
                    if (settingsData.imgurl) {
                        setStampImagePreview(settingsData.imgurl);
                    }

                    // 4. 리워드 타입 매핑
                    // 서버 데이터가 "매장 음료 1잔" 등의 텍스트로 온다고 가정하고 매핑
                    if (settingsData.reward === '매장 음료 1잔') {
                        setRewardType('beverage');
                    } else {
                        setRewardType('other');
                    }
                }
            } else {
                console.log('기존 스탬프 설정이 없거나 불러오지 못했습니다.');
            }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [router]);

  // --- 2. POST 요청: 설정 저장하기 ---
  const handleSubmit = async () => {
    const apiUri = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem('accessToken');

    if (!storeName) {
        alert('가게 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    try {
      const formData = new FormData();

      // (1) image: Binary File
      if (stampFile) {
        formData.append('image', stampFile);
      }

      // (2) data: JSON String
      // 요청 스펙: storeName, requiredAmount, reward, maxCnt
      const requestData = {
        storeName: storeName, // useEffect에서 세팅된 가게 이름
        requiredAmount: parseInt(minOrderAmount) || 0,
        reward: rewardType === 'beverage' ? '매장 음료 1잔' : '기타 아이템', // 라디오 버튼 값을 텍스트로 변환
        maxCnt: parseInt(stampCount) || 0,
      };

      // "data" 키에 JSON 문자열을 담습니다.
      formData.append('data', JSON.stringify(requestData));
      
      // 만약 백엔드(Spring 등)에서 @RequestPart("data")의 Content-Type을 application/json으로 강제한다면 아래 코드를 사용하세요.
      // formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

      const response = await fetch(`${apiUri}/v1/manager/settings`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`, 
            // 주의: FormData 전송 시 'Content-Type': 'multipart/form-data' 헤더를 직접 설정하면 안 됩니다.
            // 브라우저가 자동으로 boundary를 포함하여 설정합니다.
        },
        body: formData,
      });

      if (response.ok) {
        alert('저장되었습니다.');
        router.back();
      } else {
        const errorText = await response.text();
        console.error('Failed to save settings:', errorText);
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col p-4">
      <BackButton3 />
      <div className="p-6">
        <h1 className="text-[25px] text-(--fill-color6) font-semibold">
          스탬프 설정
        </h1>
      </div>

      <div className="w-full flex flex-col items-center justify-center">
        {' '}
        <div className="w-[330px] flex flex-col items-center mt-12">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <Image
            src='/assets/stamp_inform.png'
            alt="Stamp Information"
            className="w-[330px] h-[57px]"
            width={330}
            height={57}
          />

          <div className="w-full flex flex-row items-center justify-between mt-5">
            <p className="text-[14px] text-[#5B5B5B]">
              스탬프
              <br />
              디자인
            </p>
            <div
              className="w-[70%] h-[160px] bg-white rounded-lg border border-dashed border-gray-400 flex items-center justify-center overflow-hidden relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {stampImagePreview ? (
                <Image
                  src={stampImagePreview}
                  alt="Stamp Preview"
                  className="w-full h-full object-contain"
                  width={280}
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
        {/* 5. 적립 금액 조건 */}
        <div className="w-full mt-9 flex flex-row items-center justify-between px-4">
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
      </div>

      {/* 6. 리워드 보상 선택 */}
      <div className="w-full flex flex-col px-4">
        <div className="w-full mt-9 flex flex-row items-center justify-between">
          <p className="text-[15px] text-[#5B5B5B] font-medium">리워드 보상</p>
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
      </div>

      <div className="w-full mt-9 flex flex-row items-center px-4">
        <p className="text-[14px] text-[#5B5B5B] font-medium mr-8">
          스탬프판 내<br /> 스탬프 개수
        </p>
        <button onClick={onDecrease}>-</button>
        <input
          type="number"
          value={stampCount}
          onChange={(e) => setStampCount(e.target.value)}
          placeholder="10"
          className="h-full p-2 focus:outline-none text-center w-16 mx-2 border-b border-gray-300"
        />
        <button onClick={onIncrease}>+</button>
      </div>

      <button
        className="bg-(--main-color) text-white rounded-[40px] w-[316px] h-[50px] font-bold self-center mt-16"
        onClick={handleSubmit}
      >
        저장
      </button>
    </div>
  );
};