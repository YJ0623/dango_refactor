'use client';

import React, { useEffect, useState } from 'react';
import { BackButton3 } from '@/components/BackButton3';

// API 응답 데이터 타입 정의
interface EndedEvent {
  eventType: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
}

export default function PastEvent() {
  const [events, setEvents] = useState<EndedEvent[]>([]);
  const apiUri = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchEndedEvents = async () => {
      // 로컬 스토리지 등에서 토큰 가져오기 (저장 위치에 따라 수정 필요)
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('토큰이 없습니다.');
        return;
      }

      try {
        const response = await fetch(`${apiUri}/v1/events/eventstores/ended`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Access Token 추가
          },
        });

        const json = await response.json();

        if (json.code === 100 && Array.isArray(json.data)) {
            setEvents(json.data);
        } else if (Array.isArray(json)) {
            setEvents(json);
        } else {
            console.log("데이터 형식이 다르거나 이벤트가 없습니다.");
            setEvents([]); 
        }

      } catch (error) {
        console.error('지난 이벤트를 불러오는데 실패했습니다:', error);
      }
    };

    fetchEndedEvents();
  }, []);

  // 날짜 포맷팅 함수 (2025-11-24 -> 2025.11.24)
  const formatDate = (dateString: string) => {
    return dateString.replace(/-/g, '.');
  };

  return (
    <div className="w-full p-4">
      <BackButton3 />

      <div className="p-6">
        <h1 className="text-[25px] text-(--fill-color6) font-semibold">
          지난 이벤트
        </h1>
      </div>

      <h1 className="text-[12px] text-(--fill-color6) font-semibold ml-5">
        총 {events.length}건
      </h1>

      <div className="w-full flex flex-col px-9 py-2.5 mt-3">
        <div className="w-full flex flex-row items-center">
          <p className="w-[65%] text-[12px] text-(--fill-color4) pl-2">이벤트명</p>
          <p className="w-[35%] text-[12px] text-(--fill-color4) text-right pr-2">진행일</p>
        </div>
      </div>

      <div className="flex flex-col">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div
              key={index}
              className="w-full flex flex-row px-9 py-3.5 gap-3 items-center border-t border-(--fill-color1)"
            >
              <div className="w-[65%] text-[12px] text-(--fill-color7) font-medium truncate pl-2">
                {event.eventTitle}
              </div>
              
              <div className="w-[35%] flex flex-col items-end justify-center text-[10px] text-(--fill-color7) pr-2">
                <span>{formatDate(event.eventStartDate)}</span>
                <span className="text-[9px] text-gray-400">~ {formatDate(event.eventEndDate)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full py-10 text-center text-[12px] text-gray-400 border-t border-(--fill-color1)">
            지난 이벤트 내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
