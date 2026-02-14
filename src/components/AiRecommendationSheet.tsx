import React, { useEffect, useState } from 'react';

// --- 타입 정의 (UI에서 사용하는 타입 유지) ---
interface StoreInfo {
  name: string;
  address: string;
}

// 목 데이터 정의
const MOCK_DATA = [
  {
    storeId: 1,
    storeName: 'Cafe de Gattou',
    storeAddress: '서울특별시 마포구 홍익로2길 37',
  },
  {
    storeId: 2,
    storeName: '스타스타 카페',
    storeAddress: '서울특별시 마포구 와우산로 64',
  },
  {
    storeId: 3,
    storeName: '테스트 매장4',
    storeAddress: '서울특별시 마포구 독막로19길 32',
  },
  {
    storeId: 4,
    storeName: '태양커피 3호점',
    storeAddress: '서울특별시 마포구 홍익로3길',
  },
  {
    storeId: 5,
    storeName: '잇츠커피',
    storeAddress: '서울특별시 마포구 와우산로11길 9 (상수동 1층일부)',
  },
];

export const AiRecommendationSheet = () => {
  const [recommendations, setRecommendations] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // API 호출 대신 목 데이터를 매핑하여 상태에 저장
  useEffect(() => {
    const loadMockData = () => {
      // UI가 name, address를 쓰므로 목데이터의 storeName, storeAddress를 매핑
      const formattedData = MOCK_DATA.map((item) => ({
        name: item.storeName,
        address: item.storeAddress,
      }));

      setRecommendations(formattedData);
      setLoading(false);
    };

    loadMockData();
  }, []);

  return (
    <div
      className={`
        absolute left-0 right-0 bg-white rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-30 
        transition-transform duration-300 ease-in-out
        ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'} 
      `}
      style={{ bottom: 0 }}
    >
      <div
        className="w-full flex justify-center pt-3 pb-2 cursor-pointer touch-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-[40px] h-[4px] bg-gray-200 rounded-full" />
      </div>

      <div className="px-6 pb-8 pt-2 max-h-[60vh] overflow-y-auto mb-20 scrollbar-hide">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">
            AI가 당신의 위치와 취향을 분석해
          </p>
          <h2 className="text-[16px] font-bold text-gray-800">
            맞춤형 가게를 추천해드려요
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            * AI 추천 결과는 참고용이며, <br />
            실제 등록이 안 된 가게도 노출될 수 있어요.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-0">
            {recommendations.length > 0 ? (
              recommendations.map((store, idx) => (
                <div
                  key={idx}
                  // [수정] onClick 제거 및 커서 스타일 변경 (클릭 불가 느낌)
                  // cursor-default로 설정하여 클릭해도 반응 없음을 시각적으로 전달
                  className="flex items-center py-4 border-b border-gray-100 last:border-0 cursor-default"
                >
                  <div className="w-[44px] h-[44px] bg-[#FFF0E6] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="#FF6B00"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className="text-[15px] font-bold text-gray-800 mb-[2px]">
                      {store.name}
                    </span>
                    <span className="text-[13px] text-gray-400 truncate max-w-[250px]">
                      {store.address}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">
                추천할 가게가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};