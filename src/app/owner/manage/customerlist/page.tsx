'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { BackButton3 } from '@/components/BackButton3';

// API 응답 데이터 타입
interface Customer {
  userId: number;
  nickname: string;
  createdAt: string; // "2025-11-25T15:23:04..."
  level: string | null;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 날짜 포맷팅 함수 (YYYY-MM-DD -> YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // "2025-11-25T..." 형식에서 앞의 10자리만 잘라내어 .으로 치환
    return dateString.substring(0, 10).replace(/-/g, '.');
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      const apiUri = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('accessToken');

      if (!token) return;

      try {
        // 1. 가게 이름 먼저 조회
        const profileResponse = await fetch(`${apiUri}/v1/managers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileJson = await profileResponse.json();
        
        if (profileJson.code === 100 && profileJson.data?.store) {
          const storeName = profileJson.data.store.storeName;

          // 2. 고객 리스트 조회
          const listResponse = await fetch(
            `${apiUri}/v1/manager/customers?storeName=${encodeURIComponent(storeName)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const listJson = await listResponse.json();

          if (listJson.code === 100 && listJson.data) {
            setCustomers(listJson.data);
          }
        }
      } catch (error) {
        console.error('고객 리스트 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // 검색어 필터링 (닉네임 기준)
  const filteredCustomers = customers.filter((customer) =>
    customer.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full h-screen bg-white p-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-2 mb-6">
        <BackButton3 />
        <h1 className="text-[25px] font-semibold text-(--fill-color6) mt-7">스탬프 등록 고객</h1>
      </div>

      {/* 검색창 */}
      <div className="flex items-center w-full h-[50px] bg-[#F5F5F5] rounded-[12px] px-4 mb-6">
        <input
          type="text"
          placeholder="닉네임 검색"
          className="flex-1 bg-transparent text-[14px] outline-none placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* 돋보기 아이콘 (이미지가 없으면 텍스트나 SVG로 대체 가능) */}
        <Image src='/assets/road_search_button.png' alt="검색" className="opacity-50" width={20} height={20} />
        <svg 
            width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="opacity-50"
        >
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* 총 인원수 */}
      <div className="text-[14px] text-gray-500 mb-4">
        총 <span className="font-bold text-black">{customers.length}</span>명
      </div>

      {/* 리스트 헤더 */}
      <div className="flex flex-row w-full py-3 border-b border-gray-100 text-[12px] text-gray-400 text-center">
        <div className="w-[20%]">ID</div>
        <div className="flex-1 text-left pl-4">닉네임(본명)</div>
        <div className="w-[25%]">가입일</div>
      </div>

      {/* 리스트 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="w-full h-40 flex items-center justify-center text-gray-400">
            로딩중...
          </div>
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div
              key={customer.userId}
              className="flex flex-row w-full py-4 border-b border-gray-50 text-[14px] text-gray-800 items-center text-center"
            >
              {/* API에서 ID(String)를 주지 않고 userId(Int)만 줘서 userId 표시. 
                  디자인처럼 긴 ID가 필요하다면 백엔드 수정 필요 */}
              <div className="w-[20%] text-gray-500 text-[12px] truncate px-1">
                {customer.userId}
              </div>
              
              <div className="flex-1 text-left pl-4 font-medium truncate">
                {customer.nickname}
              </div>
              
              <div className="w-[25%] text-gray-400 text-[12px]">
                {formatDate(customer.createdAt)}
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-40 flex items-center justify-center text-gray-400">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};