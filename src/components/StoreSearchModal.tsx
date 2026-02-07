'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { type Store } from '@/type/Store'; // 경로 주의

type StoreSearchModalProps = {
  onClose: () => void;
  onSelect: (store: Store) => void;
};

export const StoreSearchModal = ({ onClose, onSelect }: StoreSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const touchStartY = useRef(0);
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setError('검색어를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      // [수정] 환경변수 사용
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/stores/search?storeName=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) throw new Error('가게 검색에 실패했습니다.');

      const result = await response.json();
      
      // API 응답 구조 대응
      if (result.success && Array.isArray(result.data)) {
        setSearchResults(result.data.length === 0 ? [] : result.data);
        if(result.data.length === 0) setError('검색 결과가 없습니다.');
      } else if (Array.isArray(result)) {
        setSearchResults(result.length === 0 ? [] : result);
        if(result.length === 0) setError('검색 결과가 없습니다.');
      } else {
        setSearchResults([]);
        setError('검색 결과가 없습니다.');
      }
    } catch (err: any) {
      setError(err.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 75 && (!scrollableContentRef.current || scrollableContentRef.current.scrollTop === 0)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-brightness-75" onClick={onClose}>
      <div
        className="absolute w-screen bottom-0 top-[30%] bg-white p-6 flex flex-col rounded-t-xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <h2 className="self-start mb-4 text-lg font-bold">단골 가게 검색</h2>
        <div className="flex items-center w-full gap-2 mb-4 text-gray-500">
          <input
            type="text"
            className="pl-5 rounded-[10px] w-full h-10 bg-gray-100"
            placeholder="가게 이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {/* 이미지 경로 public/assets로 가정 */}
          <button onClick={handleSearch} className="shrink-0 w-10 h-10 relative">
             <Image src="/assets/road_search_button.png" alt="검색" fill className="object-contain"/>
          </button>
        </div>

        <div ref={scrollableContentRef} className="flex-1 w-full overflow-y-auto">
          {isLoading && <div className="p-4 text-center text-gray-500">검색 중...</div>}
          {error && <div className="p-4 text-center text-red-500">{error}</div>}
          {searchResults.length > 0 && (
            <ul className="w-full bg-white rounded-[10px] shadow-lg border border-gray-200 overflow-hidden">
              {searchResults.map((store) => (
                <li key={store.storeId} className="p-3 text-sm text-left cursor-pointer hover:bg-gray-100" onClick={() => onSelect(store)}>
                  <div className="font-medium text-gray-800">{store.storeName}</div>
                  <div className="text-xs text-gray-500">{store.address}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={onClose} className="px-4 py-2 mt-4 bg-gray-200 rounded hover:bg-gray-300">닫기</button>
      </div>
    </div>
  );
};