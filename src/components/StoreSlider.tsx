/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useRouter } from 'next/navigation';

export interface Store {
  id: number;
  name: string;
  category: string;
  address: string;
  distance?: number;
  image?: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  description: string;
}

const StoreCard: React.FC<{
  store: Store;
  onStoreSelect: (store: Store) => void;
}> = ({ store, onStoreSelect }) => {
  const router = useRouter();

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/store/info/${store.id}`);
  }; // store.category 추가 요망

  const formatDistance = (meters?: number) => {
    if (typeof meters !== 'number') return '';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${Math.floor(meters)}m`;
  };

  // --- [핵심] 별점 렌더링 함수 ---
  const renderStars = (rating: number) => {
    const stars = [];
    // 5개 별 생성
    for (let i = 1; i <= 5; i++) {
      // 현재 점수보다 i가 작거나 같으면 채워진 별, 아니면 빈 별
      // (소수점 처리가 필요하면 Math.round(rating) 등을 사용)
      const isActive = i <= Math.round(rating);

      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-4 h-4 ${isActive ? 'text-[#FF6B00]' : 'text-gray-200'}`} // 주황색 / 회색
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div
      className="w-[300px] bg-white rounded-[20px] shadow-lg flex-shrink-0 scroll-snap-align-center p-5 cursor-pointer border border-gray-100"
      onClick={() => onStoreSelect(store)}
    >
      {/* 1. 헤더 영역: 이름, 카테고리, 화살표 버튼 */}
      <div className="flex justify-between items-start">
        <div className="flex items-end gap-2 overflow-hidden">
          <h3 className="text-[18px] font-bold text-[#333] truncate leading-tight">
            {store.name}
          </h3>
          <span className="text-[12px] text-gray-400 font-normal shrink-0 mb-[2px]">
            {store.category}
          </span>
        </div>

        {/* 상세 페이지 이동 버튼 */}
        <button
          onClick={handleNavigate}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:bg-gray-50 shrink-0 ml-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      {/* 2. 서브 정보: 거리, 주소 */}
      <div className="flex items-center mt-1 gap-2 text-[12px]">
        {store.distance !== undefined && (
          <span className="font-medium text-gray-500">
            {formatDistance(store.distance)}
          </span>
        )}
        <span className="text-gray-400 truncate max-w-[180px]">
          {store.address}
        </span>
      </div>

      {/* 3. 이미지 영역 (2분할 느낌 혹은 꽉 찬 이미지) */}
      <div className="flex gap-2 mt-4 h-[140px]">
        {/* 메인 이미지 */}
        <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden relative">
          {store.image ? (
            <img
              src={store.image}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* 서브 이미지 (API에 이미지가 1개라면 이 부분은 숨기거나, 동일 이미지를 흐리게 보여주거나, '준비중' 처리) */}
        {/* 예시 사진 느낌을 내기 위해 더미 혹은 복제 사용 */}
        <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden hidden sm:block">
          {/* 실제 데이터가 1개뿐이라도 UI 균형을 위해 표시하고 싶다면 아래 주석 해제 */}
          {store.image ? (
            <img
              src={store.image}
              alt="sub"
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-gray-50" />
          )}
        </div>
      </div>

      {/* 4. 하단 평점 영역 (경계선 추가) */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center">
        {/* 평점 숫자 */}
        <span className="text-[16px] font-bold text-[#333] mr-2">
          {store.rating.toFixed(1)}
        </span>

        {/* 별 아이콘들 */}
        <div className="flex gap-0.5">{renderStars(store.rating)}</div>

        {/* 리뷰 수 */}
        <span className="text-[13px] text-gray-400 ml-2">
          ({store.reviewCount})
        </span>
      </div>
    </div>
  );
};

interface StoreSliderProps {
  stores: Store[];
  selectedStore: Store | null;
  onStoreSelect: (store: Store) => void;
  isOpen: boolean;
}

export const StoreSlider: React.FC<StoreSliderProps> = ({
  stores,
  selectedStore,
  onStoreSelect,
  isOpen,
}) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!selectedStore || !sliderRef.current) return;
    const targetElement = sliderRef.current.querySelector(
      `[data-store-id="${selectedStore.id}"]`
    );
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [selectedStore]);

  if (!stores || stores.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-[100px] left-0 right-0 w-full z-20 pointer-events-none transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-[120%]'
      }`}
    >
      <div
        ref={sliderRef}
        className="flex overflow-x-auto scroll-snap-type-x-mandatory scroll-smooth gap-4 px-[calc(50%-150px)] pointer-events-auto py-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.scroll-snap-type-x-mandatory::-webkit-scrollbar { display: none; }`}</style>

        {stores.map((store) => (
          <div
            key={store.id}
            data-store-id={store.id}
            className="scroll-snap-align-center"
          >
            <StoreCard store={store} onStoreSelect={onStoreSelect} />
          </div>
        ))}
      </div>
    </div>
  );
};
