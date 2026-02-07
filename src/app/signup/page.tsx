'use client';

import BackButton from '@/components/BackButton';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const router = useRouter();

    const handleCustomerSignUpClick = () => {
        router.push('/signup/customer');
    }

    const handleOwnerSignUpClick = () => {
        router.push('/signup/owner');
    }

  return (
    <div className="flex flex-col items-center h-screen">
      {/* 상단바 */}
      <div className="flex flex-row items-center self-start mt-3 gap-4 px-6">
        <BackButton />
        <p>회원 가입</p>
      </div>

      {/* 구분선 */}
      <div className='w-screen h-px mt-3 bg-gray-200'/>

      {/* 회원가입 선택지 */}
      <div className="flex flex-col mt-32 gap-6">
        <div>
          <button
            className="w-[344px] h-[200px] bg-[#F3F3F3] rounded-[10px] text-black font-medium text-[20px] cursor-pointer"
            onClick={handleCustomerSignUpClick}
          >
            <div className='flex flex-row items-center justify-center'>
                <p className=''>개인 회원</p>
                <Image src="/assets/logo_gt.png" alt=">" width={8} height={8} className='absolute ml-65 mt-4'/>
            </div>
            <p className="text-[12px] text-(--fill-color5) font-semibold">
              손님으로 이용하려면
            </p>
          </button>
        </div>
        <div>
          <button
            className="w-[344px] h-[200px] bg-[#5B5B5B] rounded-[10px] text-white font-medium text-[20px] cursor-pointer"
            onClick={handleOwnerSignUpClick}
          >
            <div className='flex flex-row items-center justify-center'>
                <p className=''>점주 회원</p>
                <Image src="/assets/logo_gt.png" alt=">" width={8} height={8} className='absolute ml-65 mt-4'/>
            </div>
            <p className="text-[12px] text-(--fill-color2) font-semibold">
              내 가게를 등록하려면
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
