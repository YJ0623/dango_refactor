'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SignupInput from '@/components/SignupInput';
import { AddressModal } from '@/components/AddressModal';

type UserProfileProps = {
  nickname: string;
  gender: 'male' | 'female';
  favStoreId?: number[];
  address: string;
  latitude: number;
  longitude: number;
};

export default function CustomerConfirmPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('/assets/addProfile.png');

  const [profileData, setProfileData] = useState<UserProfileProps>({
    nickname: '',
    gender: 'male',
    favStoreId: [],
    address: '',
    latitude: 0,
    longitude: 0,
  });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenderClick = (gender: 'male' | 'female') => {
    setProfileData((prev) => ({ ...prev, gender }));
  };

  const handleConfirmClick = async () => {
    if (!profileData.address || profileData.latitude === 0) {
      return alert('주소를 입력해주세요.');
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인 정보가 없습니다.');
      return router.push('/');
    }

    try {
      const formData = new FormData();
      const jsonPayload = {
        address: profileData.address,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        gender: profileData.gender === 'male' ? 'MALE' : 'FEMALE',
        favStoreId: [],
      };

      formData.append('data', new Blob([JSON.stringify(jsonPayload)], { type: 'application/json' }));
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/user/onboarding`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '프로필 저장 실패');
      }

      alert('프로필 저장이 완료되었습니다!');
      router.push('/stamp'); 

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSelect = (data: { address: string; x: string; y: string }) => {
    setProfileData((prev) => ({
      ...prev,
      address: data.address,
      longitude: parseFloat(data.x),
      latitude: parseFloat(data.y),
    }));
    setIsAddressModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center pb-24 min-h-screen bg-white">
      <div className="flex flex-row items-center self-start mt-3 gap-4 px-6 w-full">
        <p className="font-semibold">프로필 채우기</p>
        <p className="ml-auto text-gray-400 cursor-pointer" onClick={() => router.push('/stamp')}>건너뛰기</p>
      </div>
      <div className="w-full h-px mt-3 bg-gray-200" />

      <div className="w-full max-w-md px-10 flex flex-col items-start">
        <p className="text-[30px] mt-12 text-gray-700 font-semibold">회원가입을 환영합니다!</p>
        <p className="text-[20px] mt-2 text-gray-700">내 프로필 채우기를 시작하세요.</p>

        {/* 프로필 이미지 */}
        <div className="w-[120px] h-[120px] rounded-full mt-12 mx-auto cursor-pointer relative overflow-hidden bg-gray-100" onClick={() => fileInputRef.current?.click()}>
          <Image src={previewUrl} alt="프로필" fill className="object-cover" />
        </div>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

        {/* 성별 선택 */}
        <p className="mt-[18px] font-semibold">성별</p>
        <div className="flex flex-row mt-2.5 space-x-4 w-full">
          <button
            className={`flex-1 h-[48px] border rounded-lg transition-all ${
              profileData.gender === 'male' ? 'border-blue-500 text-blue-500 font-semibold' : 'border-gray-300 text-gray-500'
            }`}
            onClick={() => handleGenderClick('male')}
          >
            남
          </button>
          <button
            className={`flex-1 h-[48px] border rounded-lg transition-all ${
              profileData.gender === 'female' ? 'border-blue-500 text-blue-500 font-semibold' : 'border-gray-300 text-gray-500'
            }`}
            onClick={() => handleGenderClick('female')}
          >
            여
          </button>
        </div>

        {/* 주소 검색 */}
        <div className="w-full mt-6">
            <SignupInput
                label="주소지"
                name="address"
                type="text"
                value={profileData.address}
                readOnly={true}
                variant="address"
                onButtonClick={() => setIsAddressModalOpen(true)}
                placeholder="지번, 도로명으로 검색"
            />
        </div>

        {/* [수정] 단골 가게 등록 UI 제거됨 */}

        <button className="w-full h-[56px] bg-[var(--main-color)] text-white font-bold rounded-[40px] mt-12" onClick={handleConfirmClick} disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '확인'}
        </button>
      </div>

      {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} onSelect={handleAddressSelect} />}
    </div>
  );
}