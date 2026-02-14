'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export interface SearchApiResponse {
  storeId: number;
  storeName: string;
  storeAddress: string;
  category: string;
  phone: string;
  storeUrl: string | null;
  stampImageUrl: string | null;
  storeImageUrl: string | null;
  reward: string | null;
  stampReward: string | null;
  sns: string | null;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStore: (storeData: SearchApiResponse) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStore,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchApiResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const apiUri = process.env.NEXT_PUBLIC_API_URL;


  
  // 검색어 변경 시 디바운스 처리 및 API 호출
  useEffect(() => {
    // 1. 검색어가 없으면 결과 초기화
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    // 2. 0.2초 딜레이 후 API 호출
    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        
        // [중요] 400 에러 방지: 파라미터 이름을 keyword로 통일하고 인코딩 적용
        // 만약 백엔드가 storeName을 강제한다면 ?storeName=${encodeURIComponent(query)} 로 변경하세요.
        const response = await fetch(
          `${apiUri}/v1/stores/search?storeName=${encodeURIComponent(query)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token || ''}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : data.data || [];
          setResults(list);
        } else {
          setResults([]);
        }
      } catch (e) {
        console.error('검색 실패:', e);
        setResults([]);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 200); // 200ms 딜레이

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // 검색어 하이라이팅 함수
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-(--main-color) font-bold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full">
      {/* 검색창을 헤더에 포함시켜 스크롤되지 않도록 변경 */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-100 shrink-0">
        {/* 뒤로가기 버튼 */}
        <button onClick={onClose} className="p-2 -ml-2">
          <Image src="/assets/backbutton3_icon.png" alt="Back" width={11} height={20} />
        </button>

        {/* 검색 입력창 */}
        <div className="flex-1 flex items-center bg-gray-100 rounded-[8px] h-[40px] px-3">
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder-gray-400 text-black"
            placeholder="지역, 건물, 주소 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {/* 입력 내용이 있을 때 X 버튼 (선택사항) */}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* 검색 버튼 (장식용 또는 강제 검색용) */}
        <button
          className="w-[40px] h-[40px] bg-[#FF6B00] rounded-[8px] flex items-center justify-center flex-shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {/* --- 컨텐츠 영역 (스크롤 가능) --- */}
      <div className="flex-1 overflow-y-auto bg-white">
        
        {/* 로딩 중 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400 text-sm">
            검색중...
          </div>
        )}

        {/* Case 1: 검색 전 */}
        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 text-sm">
            검색어를 입력해주세요.
          </div>
        )}

        {/* Case 2: 검색 결과 리스트 */}
        {!isLoading && hasSearched && results.length > 0 && (
          <ul>
            {results.map((store) => (
              <li
                key={store.storeId}
                className="flex items-start gap-3 p-5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onSelectStore(store)}
              >
                <div className="w-5 h-5 flex-shrink-0 mt-1">
                  <Image
                    src="/assets/pinIcon.png"
                    alt="location"
                    width={20}
                    height={20}
                    className="opacity-70"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="text-[16px] font-medium text-gray-900 leading-tight mb-1">
                    {highlightText(store.storeName, query)}
                  </div>
                  <div className="text-[13px] text-gray-400 font-light">
                    {store.storeAddress}
                  </div>
                  <div className="mt-1">
                    <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {store.category || '기타'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Case 3: 결과 없음 */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
            <div className="text-[18px] font-medium text-gray-800 mb-2">
              검색 결과가 없습니다.
            </div>
            <div className="text-[14px] text-gray-500 leading-relaxed">
              검색어가 올바르지 않거나,<br />
              해당 매장이 제휴매장이 아닐 수도 있어요!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};