'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SignupInput from '@/components/SignupInput';
import { AddressModal } from '@/components/AddressModal';
import { StoreSearchModal } from '@/components/StoreSearchModal';
import { type Store } from '@/type/Store';

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
  // [수정] 기본 이미지는 public/assets 경로 사용
  const [previewUrl, setPreviewUrl] = useState<string>('/assets/addProfile.png');

  const [profileData, setProfileData] = useState<UserProfileProps>({
    nickname: '',
    gender: 'male',
    favStoreId: [],
    address: '',
    latitude: 0,
    longitude: 0,
  });

  const [favoriteStores, setFavoriteStores] = useState<(Store | null)[]>([null, null, null]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isStoreSearchModalOpen, setIsStoreSearchModalOpen] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
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
        favStoreId: profileData.favStoreId,
      };

      formData.append('data', new Blob([JSON.stringify(jsonPayload)], { type: 'application/json' }));
      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      // [수정] 환경변수 사용
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
      // TODO: 온보딩 완료 후 이동할 페이지 (예: 메인)
      router.push('/stamp'); 

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... (나머지 핸들러 함수들은 기존과 동일, 생략) ...
  // 기존 handleAddressSelect, handleStoreSelect 등 그대로 복사해서 넣으세요.
  
  const handleAddressSelect = (data: { address: string; x: string; y: string }) => {
    setProfileData((prev) => ({
      ...prev,
      address: data.address,
      longitude: parseFloat(data.x),
      latitude: parseFloat(data.y),
    }));
    setIsAddressModalOpen(false);
  };

  const handleStoreSelect = (store: Store) => {
    const newFavoriteStores = [...favoriteStores];
    newFavoriteStores[selectedSlotIndex] = store;
    setFavoriteStores(newFavoriteStores);
    setProfileData(prev => ({
        ...prev,
        favStoreId: newFavoriteStores.filter((s): s is Store => s !== null).map(s => s.storeId)
    }));
    setIsStoreSearchModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center pb-24 min-h-screen bg-white">
      {/* 상단 네비게이션 등 UI 구현 (기존 JSX 복사) */}
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

        {/* ... 성별 선택, 주소 입력(SignupInput), 단골 가게 등록 UI ... */}
        {/* 기존 JSX를 붙여넣되, <SignupInput> 등에 넘기는 props 잘 확인하세요 */}
        
        <div className="w-full mt-6">
            <SignupInput
                label="주소지"
                name="address" // SignupInput props 타입과 일치해야 함 (CustomerSignupFormData 키값 중 하나여야 에러 안남. 필요시 타입 수정)
                type="text"
                value={profileData.address}
                readOnly={true}
                variant="address"
                onButtonClick={() => setIsAddressModalOpen(true)}
                placeholder="지번, 도로명으로 검색"
            />
        </div>

        {/* 단골 가게 목록 UI */}
        <p className="mt-8 font-semibold">단골 가게 등록</p>
        <div className="w-full mt-2.5 space-y-3">
            {favoriteStores.map((store, index) => (
                <div key={index} className="w-full h-[48px] border border-gray-300 rounded-lg p-4 flex items-center justify-between" onClick={() => { if(!store) { setSelectedSlotIndex(index); setIsStoreSearchModalOpen(true); } }}>
                    {store ? (
                        <>
                            <div>
                                <p className="font-semibold text-sm">{store.storeName}</p>
                                <p className="text-gray-500 text-xs">{store.address}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); /* 삭제 로직 */ }} className="text-gray-400">...</button>
                        </>
                    ) : (
                        <span className="w-full text-center text-gray-400 text-2xl">+</span>
                    )}
                </div>
            ))}
        </div>

        <button className="w-full h-[56px] bg-[var(--main-color)] text-white font-bold rounded-[40px] mt-12" onClick={handleConfirmClick} disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '확인'}
        </button>
      </div>

      {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} onSelect={handleAddressSelect} />}
      {isStoreSearchModalOpen && <StoreSearchModal onClose={() => setIsStoreSearchModalOpen(false)} onSelect={handleStoreSelect} />}
    </div>
  );
}