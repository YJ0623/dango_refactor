'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackButton from '@/components/BackButton';
import UserBottomBar from '@/components/UserBottomBar';

// API 응답 데이터 타입 정의
interface AccountData {
  email: string;
  loginId: string;
  joinedAt: string;
}

const AccountSetting: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<AccountData | null>(null);

  // [중요] Vite 환경 변수 사용 (없을 경우 로컬 주소 사용)
  const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // 날짜 포맷팅 함수 (ISO String -> YYYY. MM. DD)
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}. ${month}. ${day}`;
  };

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const response = await axios.get(`${apiUri}/v1/mypage/account`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // [디버깅] 서버가 실제 어떤 데이터를 주는지 콘솔에서 확인해보세요
        console.log('API 응답 전체:', response.data);

        // [수정됨] 성공 조건을 0 또는 200으로 넓게 설정
        // code가 0이거나 200이거나, 혹은 data가 존재하면 성공으로 간주
        if (
          response.data.code === 0 ||
          response.data.code === 200 ||
          response.data.data
        ) {
          setUserInfo(response.data.data);
        } else {
          console.error('데이터 조회 실패:', response.data.message);
        }
      } catch (error) {
        console.error('API 호출 중 에러 발생:', error);
      }
    };

    fetchAccountInfo();
  }, [apiUri]);

  // 탈퇴 버튼 클릭 핸들러
  const handleDeleteAccount = () => {
    // 여기에 실제 탈퇴 API 로직을 추가하면 됩니다.
    console.log('탈퇴 처리가 완료되었습니다.');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen max-w-[390px] w-full mx-auto bg-white text-gray-900 flex flex-col relative">
      {/* 1. 헤더 */}
      <header className="w-full relative flex items-center justify-center p-4 border-b border-gray-200 flex-shrink-0">
        <div className="absolute left-4">
          <BackButton />
        </div>
        <h1 className="text-lg font-semibold">계정 관리</h1>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col justify-between p-6">
        <main className="w-full flex flex-col">
          {/* 리스트 아이템: 이메일 */}
          <div className="w-full flex justify-between items-center py-4 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">이메일</span>
            <span className="text-sm text-gray-400">
              {userInfo ? userInfo.email : '-'}
            </span>
          </div>

          {/* 리스트 아이템: 아이디 */}
          <div className="w-full flex justify-between items-center py-4 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">아이디</span>
            <span className="text-sm text-gray-400">
              {userInfo ? userInfo.loginId : '-'}
            </span>
          </div>

          {/* 리스트 아이템: 가입일 */}
          <div className="w-full flex justify-between items-center py-4 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-900">가입일</span>
            <span className="text-sm text-gray-400">
              {userInfo ? formatDate(userInfo.joinedAt) : '-'}
            </span>
          </div>

          {/* 리스트 아이템: 회원 탈퇴 */}
          <button
            className="w-full flex justify-start items-center py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="text-sm font-medium text-gray-900">회원 탈퇴</span>
          </button>
        </main>

        {/* 하단 영역 */}
        <footer className="pb-4">
          <UserBottomBar />
        </footer>
      </div>

      {/* === 모달 창 === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50">
          <div className="w-[300px] bg-white rounded-xl overflow-hidden shadow-lg animate-fade-in-up">
            <div className="p-6 flex flex-col items-center text-center space-y-3">
              <h2 className="text-base font-bold text-gray-800">
                회원을 탈퇴하면 모든 정보가 사라져요.
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed break-keep">
                탈퇴하면 모든 회원 정보와 스탬프 내역이 삭제되어 복구할 수
                없으며, 같은 이메일과 소셜계정으로 30일간 재가입이 불가합니다.
              </p>
            </div>

            <div className="flex h-12">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                탈퇴
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSetting;
