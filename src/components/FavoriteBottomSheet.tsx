import React, { useState } from 'react';
import { type Store } from './StoreSlider';

interface FavoriteBottomSheetProps {
  stores: Store[];
  onStoreClick: (store: Store) => void;
  onDeleteRequest: (storeId: number) => void; // 삭제 버튼 클릭 시 핸들러
}

export const FavoriteBottomSheet: React.FC<FavoriteBottomSheetProps> = ({
  stores,
  onStoreClick,
  onDeleteRequest,
}) => {
  // 각 아이템별 드롭다운(삭제 버튼 등) 열림 상태 관리
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const toggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 부모 클릭 방지
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="absolute bottom-0 w-full z-20 bg-white rounded-t-[24px] shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 max-h-[60vh]">
      {/* 핸들바 (디자인 포인트) */}
      <div className="w-full flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-gray-200 rounded-full" />
      </div>

      {/* 리스트 영역 (스크롤 가능) */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-2">
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            즐겨찾기한 매장이 없습니다.
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              onClick={() => onStoreClick(store)}
              className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 cursor-pointer"
            >
              {/* 왼쪽: 아이콘 + 텍스트 */}
              <div className="flex items-center gap-3">
                {/* 하트 아이콘 배경 */}
                <div className="w-10 h-10 rounded-full bg-[#FFF0EB] flex items-center justify-center flex-shrink-0">
                  {/* 하트 아이콘 (SVG) */}
                  <svg
                    width="20"
                    height="18"
                    viewBox="0 0 20 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 17.25L8.775 16.134C4.425 12.1915 1.55 9.5915 1.55 6.404C1.55 3.804 3.5875 1.7665 6.1875 1.7665C7.65 1.7665 9.0625 2.454 10 3.554C10.9375 2.454 12.35 1.7665 13.8125 1.7665C16.4125 1.7665 18.45 3.804 18.45 6.404C18.45 9.5915 15.575 12.1915 11.225 16.1465L10 17.25Z"
                      fill="#FF7A2E" // 주황색 하트
                    />
                  </svg>
                </div>

                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-gray-900">
                    {store.name}
                  </span>
                  <span className="text-[12px] text-gray-400 mt-0.5 line-clamp-1">
                    {store.address}
                  </span>
                </div>
              </div>

              {/* 오른쪽: 메뉴 버튼 (점 세개) */}
              <div className="relative">
                <button
                  onClick={(e) => toggleMenu(e, store.id)}
                  className="p-2 text-gray-300 hover:text-gray-500"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                  </svg>
                </button>

                {/* 삭제 팝업 메뉴 (이미지 참고) */}
                {openMenuId === store.id && (
                  <div className="absolute right-0 top-8 w-20 bg-white shadow-lg rounded-lg border border-gray-100 z-50 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRequest(store.id);
                        setOpenMenuId(null);
                      }}
                      className="w-full py-2 text-xs text-red-500 hover:bg-gray-50 text-center font-medium"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};