// // import React from 'react';

// export const StampCard = () => {
//   return (
//     <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
//       <div className="flex justify-between items-center pb-4">
//         {/* Left Text Section */}
//         <div>
//           <p className="text-gray-800 text-sm mb-1">
//             이 카페 <span className="font-bold">1잔 더</span> 적립하면 스탬프
//             완성
//           </p>
//           <div className="flex items-end gap-1">
//             <span className="text-[#FF6B00] font-bold text-xl">9/10</span>
//             <span className="text-gray-400 text-xs mb-1">개 현재 적립</span>
//           </div>
//         </div>

//         {/* Right Arrow Button (Inline SVG 사용) */}
//         <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
//           <svg
//             width="6"
//             height="10"
//             viewBox="0 0 6 10"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M1 9L5 5L1 1"
//               stroke="#9CA3AF"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Pagination Dots (하단 점 3개) */}
//       <div className="flex justify-center items-center space-x-1 absolute bottom-2 left-0 right-0">
//         <div className="w-3 h-1 bg-gray-400 rounded-full"></div>
//         <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
//         <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
//       </div>
//     </div>
//   );
// };

import React from 'react';


export interface StampData {
  storeName: string;
  currentCount: number;
  maxCount: number;
  stampImageUrl: string;
}

interface StampCardProps {
  data: StampData | null;
}

export const StampCard = ({ data }: StampCardProps) => {
  // 데이터가 없을 경우
  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm h-[100px] flex items-center justify-center text-gray-400 text-sm">
        적립된 스탬프 정보가 없습니다.
      </div>
    );
  }

  // 남은 개수 계산
  const remaining = data.maxCount - data.currentCount;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-center pb-4">
        {/* Left Text Section */}
        <div>
          <p className="text-gray-800 text-sm mb-1">
            이 카페 <span className="font-bold">{remaining}잔 더</span> 적립하면
            스탬프 완성
          </p>
          <div className="flex items-end gap-1">
            <span className="text-[#FF6B00] font-bold text-xl">
              {data.currentCount}/{data.maxCount}
            </span>
            <span className="text-gray-400 text-xs mb-1">개 현재 적립</span>
          </div>
        </div>

        {/* Right Arrow Button */}
        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 9L5 5L1 1"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center space-x-1 absolute bottom-2 left-0 right-0">
        <div className="w-3 h-1 bg-gray-400 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};
