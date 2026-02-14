import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function BackButton2() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Image
      src='/assets/BackButton2.png'
      className="w-[48px] h-[48px] m-3 cursor-pointer"
      alt="뒤로 가기"
      onClick={handleGoBack}
      width={48}
      height={48}
    />
  )
};
