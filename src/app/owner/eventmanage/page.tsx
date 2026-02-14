'use client';

import React, { useState, useEffect } from 'react';
import { OwnerBottomBar } from '@/components/OwnerBottomBar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { encode } from 'punycode';

// API 응답 데이터 타입 정의 (카테고리 조회)
interface EventCategory {
  eventType: string;
  available: boolean;
  description: string;
  startDate: string;
  endDate: string;
}

interface CategoriesResponse {
  availableCategories: EventCategory[];
}

export default function EventManage() {
  const router = useRouter();
  // 참여 가능한 이벤트 목록 상태
  const [availableEvents, setAvailableEvents] = useState<EventCategory[]>([]);
  const apiUri = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        // [변경] 참여 가능한 이벤트 카테고리 조회
        const response = await fetch(`${apiUri}/v1/events/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (json.code === 100 && json.data) {
          const data: CategoriesResponse = json.data;
          setAvailableEvents(data.availableCategories || []);
        }
      } catch (error) {
        console.error('이벤트 목록을 불러오는데 실패했습니다:', error);
      }
    };

    fetchCategories();
  }, [apiUri]);

  return (
    <div className="flex flex-col w-full px-6 py-4 min-h-screen bg-white">
      <h1 className="text-[25px] text-(--fill-color6) font-normal mb-[110px] mt-4">
        Event
      </h1>

      <div className="w-full justify-center items-center flex flex-col gap-5">
        {/* 참여 가능한 이벤트 카드 */}
        <div className="w-[340px] min-h-[156px] h-auto bg-(--fill-color1) rounded-[20px] p-2 flex flex-col shadow-sm">
          <div className="flex flex-row w-full p-2 mx-2 justify-between items-center mb-2">
            <p className="text-[14px] text-black font-medium">
              진행중인 이벤트 (참여 가능)
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center px-4 pb-4 gap-3">
            {availableEvents.length > 0 ? (
              availableEvents.map((event, index) => (
                <div
                  key={`${event.eventType}-${index}`}
                  // [변경] 클릭 시 EventCreate 페이지로 이동하며 선택된 이벤트 정보를 state로 전달
                  onClick={() => {
                    const eventData = encodeURIComponent(JSON.stringify(event));
                    router.push(
                      `/owner/eventcreate?event=${eventData}`
                    );
                  }
                  }
                  className="flex flex-col justify-center w-full min-h-[40px] py-2 bg-white rounded-[10px] px-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-row justify-between items-center">
                    <h3 className="text-[12px] font-medium text-(--fill-color7) truncate w-[90%]">
                      {event.description}
                    </h3>
                    {/* 화살표 아이콘 등 추가 가능 */}
                    <Image src='/assets/goto_icon.png' alt="Go" width={14} height={14} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(event.startDate).toLocaleDateString()} ~{' '}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-[13px] text-gray-400 py-4">
                현재 참여 가능한 이벤트가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-[70px] justify-center items-center flex flex-row mt-5">
        <div
          className="w-[340px] h-full bg-(--fill-color1) rounded-[20px] flex flex-row items-center cursor-pointer shadow-sm hover:bg-gray-100 transition-colors"
          onClick={() => router.push('/owner/pastevent')}
        >
          <Image src='/assets/history_icon.png' alt="" width={28} height={28} className="ml-5" />
          <p className="ml-4 text-[14px] text-black font-medium">지난 이벤트</p>
          <div className="flex-grow" />
          <Image src='/assets/goto_icon.png' alt="" width={40} height={40} className="mr-5" />
        </div>
      </div>

      <OwnerBottomBar />
    </div>
  );
};
