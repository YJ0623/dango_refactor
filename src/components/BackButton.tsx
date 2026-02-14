'use client'; // 1. 중요: 훅(useRouter)을 쓰므로 클라이언트 컴포넌트 선언

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BackButtonProps {
  className?: string; // 위치 조정을 위한 className prop 추가
  onClick?: () => void; // 기본 뒤로가기 대신 다른 동작을 하고 싶을 때를 대비
}

export default function BackButton({ className, onClick }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`cursor-pointer ${className || ''}`}
    >
      <Image
        src="/assets/BackButton.png"
        alt="뒤로가기"
        width={12}
        height={12}
        className="object-contain h-auto"
      />
    </button>
  );
}