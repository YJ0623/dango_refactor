'use client';

import React, { useEffect, useState } from 'react';
import { BackButton3 } from '@/components/BackButton3';

// API 응답 데이터 타입 정의
interface AccountData {
  email: string;
  loginId: string;
  joinedAt: string;
}

const deleteAccountModal = () => {
  if (typeof window !== 'undefined') {
    return window.confirm('정말로 탈퇴하시겠습니까?');
  }
  return false;
}

export default function OwnerAccountInfo() {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const apiUri = process.env.NEXT_PUBLIC_API_URL;
  
  useEffect(() => {
    const fetchAccountInfo = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('토큰이 없습니다.');
        return;
      }

      try {
        const response = await fetch(`${apiUri}/v1/managers/account`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (json.code === 100) {
          setAccountData(json.data);
        } else {
          console.error('데이터 조회 실패:', json.message);
        }
      } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
      }
    };

    fetchAccountInfo();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}`;
  };

  const handleDeleteAccount = () => {
    if (deleteAccountModal()) {
      console.log('회원 탈퇴 요청');
    }
  };

  return (
    <div className="w-full flex flex-col p-4 bg-white min-h-screen">
      <BackButton3 />

      {/* Title */}
      <div className="px-6 mt-6 mb-10">
        <h1 className="text-[25px] font-bold text-(--fill-color7)">
          계정 정보
        </h1>
      </div>

      {/* List Container */}
      <div className="flex flex-col px-6">
        
        {/* 이메일 */}
        <div className="flex flex-row justify-between items-center py-5 border-b border-gray-100">
          <span className="text-[15px] text-(--fill-color7) font-medium">이메일</span>
          <span className="text-[15px] text-(--fill-color5)">
            {accountData?.email || '-'}
          </span>
        </div>

        {/* 아이디 */}
        <div className="flex flex-row justify-between items-center py-5 border-b border-gray-100">
          <span className="text-[15px] text-(--fill-color7) font-medium">아이디</span>
          <span className="text-[15px] text-(--fill-color5)">
            {accountData?.loginId || '-'}
          </span>
        </div>

        {/* 가입일 */}
        <div className="flex flex-row justify-between items-center py-5 border-b border-gray-100">
          <span className="text-[15px] text-(--fill-color7) font-medium">가입일</span>
          <span className="text-[15px] text-(--fill-color5)">
            {accountData ? formatDate(accountData.joinedAt) : '-'}
          </span>
        </div>

        {/* 회원 탈퇴 */}
        <button
          onClick={handleDeleteAccount}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 max-w-md w-30 h-10 rounded-[10px] bg-red-600 cursor-pointer"
        >
          <span className="text-[15px] font-medium text-white">회원 탈퇴</span>
          {/* 탈퇴 기능 구현 필요 */}
        </button>

      </div>
    </div>
  );
};