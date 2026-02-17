import { Metadata } from 'next';
import StoreInfoClient from './StoreInfoClient';

type Props = {
  params: Promise<{ storeId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { 
    title: '가게 정보 | 당고(Dango)',
    description: '당고에서 단골 카페 스탬프를 모아보세요!',
  };
}

export default async function StoreInfoPage({ params }: Props) {
  const { storeId } = await params;
  
  return <StoreInfoClient initialStore={null} storeId={storeId} />;
}