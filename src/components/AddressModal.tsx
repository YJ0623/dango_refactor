'use client';

import { useState } from 'react';
import Image from 'next/image';

// 카카오 API 응답 타입 정의
interface KakaoAddressDocument {
  address_name: string;
  y: string; // 위도 (latitude)
  x: string; // 경도 (longitude)
  address_type: string;
  address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
  };
  road_address?: {
    address_name: string;
    building_name: string;
  };
}

type AddressModalProps = {
  onClose: () => void;
  onSelect: (data: { address: string; x: string; y: string }) => void;
};

export const AddressModal = ({ onClose, onSelect }: AddressModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KakaoAddressDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onSearchMap = async () => {
    if (searchQuery.trim() === '') {
      alert('검색어를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // [수정] 우리가 만든 Next.js 내부 API 호출
      const response = await fetch(`/api/kakao/address?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('검색 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      if (data.documents && data.documents.length > 0) {
        setSearchResults(data.documents);
      } else {
        setSearchResults([]);
        alert('검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('주소 검색에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item: KakaoAddressDocument) => {
    // 도로명 주소가 있으면 우선 사용, 없으면 지번 주소 사용
    const addressString = item.road_address?.address_name || item.address_name;
    
    // 건물이름이 있으면 뒤에 붙여줌 (예: 판교역로 166 (카카오 판교아지트))
    const fullAddress = item.road_address?.building_name 
      ? `${addressString} (${item.road_address.building_name})`
      : addressString;

    onSelect({
      address: fullAddress,
      x: item.x,
      y: item.y
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-brightness-75" onClick={onClose}>
      <div
        className="absolute w-screen bottom-0 top-[30%] bg-white p-6 flex flex-col rounded-t-xl h-[70%]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="self-start mb-4 text-lg font-bold">주소검색</h2>

        {/* 검색창 */}
        <div className="flex items-center w-full gap-2 mb-4 text-gray-500">
          <input
            type="text"
            className="pl-5 rounded-[10px] w-full h-10 bg-gray-100"
            placeholder="지번, 도로명, 건물명으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchMap()}
          />
          <button 
            onClick={onSearchMap} 
            className="shrink-0 w-10 h-10 relative bg-[var(--main-color)] rounded-[10px] flex items-center justify-center"
          >
             <Image 
               src="/assets/road_search_button.png" 
               alt="검색" 
               width={24} 
               height={24} 
               className="object-contain" 
             />
          </button>
        </div>

        {/* 검색 결과 목록 */}
        <div className="flex-1 w-full overflow-y-auto">
          {isLoading && <p className="text-center text-gray-500 mt-4">검색 중...</p>}
          
          {!isLoading && searchResults.length > 0 && (
            <ul className="w-full">
              {searchResults.map((addr, idx) => (
                <li
                  key={idx}
                  className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSelect(addr)}
                >
                  <div className="font-bold text-gray-800 text-[15px] mb-1">
                    {addr.road_address?.address_name || addr.address_name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="border border-gray-200 px-1 rounded text-[10px] bg-gray-50">지번</span>
                    {addr.address?.address_name || addr.address_name}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-3 mt-4 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200"
        >
          닫기
        </button>
      </div>
    </div>
  );
};