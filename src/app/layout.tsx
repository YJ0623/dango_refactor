import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script'; // [추가]

export const metadata: Metadata = {
  title: '당고 (Dango)',
  description: '단골이 되는 즐거움',
};

// .env.local에 저장된 키를 가져옵니다.
const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT_ID}&libraries=services,clusterer`;
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        {/* [추가] 카카오맵 스크립트 로드 */}
        <Script 
          src={KAKAO_SDK_URL} 
          strategy="beforeInteractive" // 페이지 로드 전에 스크립트를 먼저 불러옴
        />
      </body>
    </html>
  );
}