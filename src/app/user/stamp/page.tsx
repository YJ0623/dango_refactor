'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StampSection from '@/components/StampSection';
import UserBottomBar from '@/components/UserBottomBar';
import Window from '@/components/Window';
import { useAuthStore } from '@/store/useAuthStore';
import { useStampStore } from '@/store/useStampStore';

const StampPage = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // zustand stores
  const { accessToken, initializeFromStorage } = useAuthStore();
  const {
    userEmail,
    userLoginId,
    stamps,
    isLoadingStamps,
    events,
    qrImage,
    isLoadingQr,
    showQrModal,
    fetchAccountInfo,
    fetchStamps,
    fetchEvents,
    handleQrGenerate,
    setShowQrModal,
  } = useStampStore();

  // 앱 진입 시 토큰 복원
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  // 토큰이 있으면 데이터 로드
  useEffect(() => {
    if (!accessToken) return;
    fetchAccountInfo(accessToken);
    fetchStamps(accessToken);
    fetchEvents(accessToken);
  }, [accessToken, fetchAccountInfo, fetchStamps, fetchEvents]);

  // QR 버튼 클릭
  const handleQrClick = () => {
    if (!userEmail) {
      alert('유저 정보를 불러오는 중입니다. 잠시 후 시도해주세요.');
      return;
    }
    handleQrGenerate(userEmail);
  };

  return (
    <div className="relative w-full h-full bg-gray-50 pb-[80px]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-gray-50 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">My Stamp</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/user/stamp/registration')}
            className="p-1"
          >
            <Image src='/assets/plus.svg' alt="Plus" width={24} height={24} className="object-contain" />
          </button>
          <button onClick={() => router.push('/user/stamp/setting')} className="p-1">
            <Image src='/assets/threedots.svg' alt="Settings" width={24} height={24} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="px-5">
        {/* 뷰 모드 토글 */}
        <div className="flex justify-center mb-4">
          <div className="flex bg-black rounded-full p-1 w-[80px] relative">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 flex justify-center py-1 rounded-full transition-all ${
                viewMode === 'list' ? 'bg-[#FF6B00]' : 'bg-transparent'
              }`}
            >
              <Image src='/assets/hamburger.svg' alt="List" width={16} height={16} className="object-contain" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 flex justify-center py-1 rounded-full transition-all ${
                viewMode === 'grid' ? 'bg-[#FF6B00]' : 'bg-transparent'
              }`}
            >
              <Image src='/assets/threedots.svg' alt="Grid" width={20} height={20} className="object-contain" />
            </button>
          </div>
        </div>

        {/* 리스트/그리드 */}
        {viewMode === 'list' ? (
          <div className="mb-6 flex justify-center">
            <StampSection />
          </div>
        ) : (
          <div className="mb-6 min-h-40">
            <Window data={stamps} loading={isLoadingStamps} />
          </div>
        )}

        {/* 버튼들 */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => router.push('/user/coupon/box')}
            className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Image src='/assets/ticket_icon.png' alt="coupon" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              쿠폰함 보기
            </span>
          </button>

          <button
            onClick={handleQrClick}
            className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Image src='/assets/makeStamp_icon.png' alt="Make Stamp" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              스탬프 찍기
            </span>
          </button>
        </div>

        {/* 이벤트 리스트 */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Event</h2>
          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event, i) => (
                <div
                  key={i}
                  onClick={() => router.push('/event/' + event.eventType)}
                  className="bg-gray-100 rounded-2xl p-5 flex justify-between items-center cursor-pointer"
                >
                  <div className="flex-1 pr-4">
                  <h3 className="text-[#FF6B00] font-bold text-sm mb-1">
                    {event.eventType.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {event.buttonDescription}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {event.startDate || '기간 미정'} ~{' '}
                    {event.endDate || '기간 미정'}
                  </p>
                  </div>
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden">
                  {event.buttonImageUrl ? (
                    <Image
                    src={event.buttonImageUrl}
                    alt="Event"
                    width={80}
                    height={80}
                    className="object-cover"
                    />
                  ) : (
                    <span className="text-xs">IMG</span>
                  )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">
                진행 중인 이벤트가 없습니다.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
            onClick={() => setShowQrModal(false)}
          ></div>
          <div className="relative z-10 w-[393px] flex flex-col items-center pointer-events-none">
            <button
              className="absolute top-[-60px] right-6 z-50 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center pointer-events-auto"
              onClick={() => setShowQrModal(false)}
            >
              <span className="text-white font-bold text-lg">X</span>
            </button>
            <div className="pointer-events-auto flex flex-col items-center w-full">
              <div className="bg-white p-5 rounded-2xl shadow-2xl mb-6 w-[240px] h-[240px] flex items-center justify-center">
                {isLoadingQr ? (
                  <span className="text-gray-400 text-sm">QR 생성 중...</span>
                ) : qrImage ? (
                  <Image
                    src={qrImage}
                    alt="QR"
                    width={240}
                    height={240}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-red-400 text-sm">이미지 없음</span>
                )}
              </div>
              <div className="text-center space-y-1">
                {/* [UI] 유저는 자신의 LoginID를 확인 */}
                <p className="text-white text-base font-medium">
                  회원ID: {userLoginId}
                </p>
                <p className="text-gray-300 text-xs">QR코드 유효시간 01:00</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <UserBottomBar />
      </div>
    </div>
  );
};

export default StampPage;
