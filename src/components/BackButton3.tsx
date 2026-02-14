'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const BackButton3 = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Image
      src='/assets/backbutton3_icon.png'
      className="m-3 cursor-pointer"
      alt="뒤로 가기"
      onClick={handleGoBack}
      width={12}
      height={20}
    />
  )
};
