// // import React from 'react';

// // 간단한 커피잔 아이콘 (Inline SVG)
// const CoffeeIcon = ({
//   className,
//   color = 'currentColor',
// }: {
//   className?: string;
//   color?: string;
// }) => (
//   <svg
//     className={className}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke={color}
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
//     <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
//     <line x1="6" y1="1" x2="6" y2="4" />
//     <line x1="10" y1="1" x2="10" y2="4" />
//     <line x1="14" y1="1" x2="14" y2="4" />
//   </svg>
// );

// // 카드 데이터 타입
// interface CardData {
//   id: number;
//   name: string;
//   count: string;
//   theme: 'standard' | 'text' | 'grey' | 'icons';
// }

// const Window = () => {
//   const cards: CardData[] = [
//     { id: 1, name: '카페나무', count: '2/10', theme: 'standard' },
//     { id: 2, name: '열공커피 홍대입구역점', count: '2/10', theme: 'text' },
//     { id: 3, name: '스탠스커피', count: '2/10', theme: 'grey' },
//     { id: 4, name: '카페드림', count: '2/10', theme: 'icons' },
//   ];

//   // 각 테마별 카드 내부 디자인 렌더링 함수
//   const renderCardContent = (theme: string) => {
//     switch (theme) {
//       case 'standard':
//         return (
//           <div className="w-full h-full flex flex-col justify-center items-center p-2">
//             <div className="grid grid-cols-5 gap-1 mb-2">
//               {[...Array(10)].map((_, i) => (
//                 <CoffeeIcon key={i} className="w-3 h-3" color="#555" />
//               ))}
//             </div>
//             <div className="w-full bg-gray-100 rounded-full py-1 px-2 text-[6px] text-center text-gray-500">
//               스탬프 10개 아메리카노 1잔 무료
//             </div>
//           </div>
//         );
//       case 'text':
//         return (
//           <div className="w-full h-full flex flex-col justify-center items-center p-2 relative">
//             {/* 장식용 점들 */}
//             <div className="absolute top-2 right-2 flex flex-col gap-1">
//               <div className="w-1 h-1 bg-green-700 rounded-full"></div>
//               <div className="w-1 h-1 bg-green-700 rounded-full"></div>
//             </div>
//             <h4 className="text-[10px] font-bold text-green-800 mb-1">
//               Your Cafe
//             </h4>
//             <p className="text-[6px] text-gray-400 text-center">
//               자연과 만나는 아름다운 커피 세상
//               <br />
//               서울시 마포구 서교동
//               <br />
//               TEL: 02-123-4567
//             </p>
//           </div>
//         );
//       case 'grey':
//         return (
//           <div className="w-full h-full bg-gray-300 flex flex-col justify-center items-center p-2">
//             <div className="text-[8px] font-bold text-gray-600 mb-1 tracking-tighter">
//               COFFEE SHOP
//             </div>
//             <div className="grid grid-cols-5 gap-1">
//               {[...Array(10)].map((_, i) => (
//                 <div
//                   key={i}
//                   className="w-3 h-3 bg-white rounded-full flex items-center justify-center"
//                 >
//                   <CoffeeIcon className="w-2 h-2" color="#ccc" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       case 'icons':
//         return (
//           <div className="w-full h-full flex flex-col justify-center items-center p-2">
//             <div className="grid grid-cols-5 gap-1 mb-2 opacity-70">
//               {/* 다양한 아이콘 흉내 (단순화) */}
//               {[...Array(5)].map((_, i) => (
//                 <CoffeeIcon key={i} className="w-3 h-3" color="#8B4513" />
//               ))}
//               {[...Array(5)].map((_, i) => (
//                 <div
//                   key={i}
//                   className="w-3 h-3 border border-[#8B4513] rounded-sm"
//                 ></div>
//               ))}
//             </div>
//             <div className="w-3/4 h-1 bg-gray-100 rounded-full"></div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     // 전체 주황색 배경 컨테이너
//     <div className="bg-[#FF6B00] p-5 rounded-[30px]">
//       <div className="grid grid-cols-2 gap-4">
//         {cards.map((card) => (
//           <div key={card.id} className="flex flex-col items-center">
//             {/* 카드 영역 (흰색 둥근 사각형) */}
//             <div className="bg-white w-full aspect-[4/3] rounded-xl mb-2 overflow-hidden shadow-sm relative">
//               {renderCardContent(card.theme)}
//             </div>

//             {/* 카드 하단 텍스트 (카페명, 적립수) */}
//             <div className="text-center">
//               <p className="font-bold text-white text-sm flex items-center justify-center gap-1 truncate w-full">
//                 <CoffeeIcon className="w-3 h-3" color="white" />
//                 {card.name}
//               </p>
//               <p className="text-xs text-white/80">{card.count}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Window;

// src/components/Window.tsx
import React from 'react';

// StampPage에 정의된 것과 같은 형태의 타입
interface StampData {
  storeName: string;
  currentCount: number;
  maxCount: number;
  stampImageUrl: string;
}

interface WindowProps {
  data: StampData[];
  loading: boolean;
}

const Window: React.FC<WindowProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">불러오는 중...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-40 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm">적립된 스탬프가 없어요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-between h-[160px]"
        >
          {/* 스탬프 이미지 */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 mb-3 border border-gray-100">
            {item.stampImageUrl ? (
              <img
                src={item.stampImageUrl}
                alt={item.storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
                No Img
              </div>
            )}
          </div>

          {/* 가게명 */}
          <h3 className="text-gray-800 font-bold text-sm text-center truncate w-full mb-1">
            {item.storeName}
          </h3>

          {/* 진행바 */}
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
              <span>적립현황</span>
              <span className="text-[#FF6B00] font-bold">
                {item.currentCount}/{item.maxCount}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#FF6B00] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.currentCount / item.maxCount) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Window;
