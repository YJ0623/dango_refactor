import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Providers } from './providers';


export const metadata: Metadata = {
  title: '당고 (Dango)',
  description: '단골이 되는 즐거움',
};

const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT_ID}&libraries=services,clusterer&autoload=false`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
        </Providers>
        <Script 
          src={KAKAO_SDK_URL} 
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}