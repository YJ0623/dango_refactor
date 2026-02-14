'use client';

import Image from 'next/image';
import { OwnerBottomBar } from '@/components/OwnerBottomBar';
import { useRouter } from 'next/navigation';

export default function OwnerSettings(){
    const router = useRouter();
  const handleLogout = async () => {
    if (!window.confirm('정말 로그아웃 하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        router.push('/');
        return;
      }

      // 3. API 요청
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/mypage/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: null,
      });

      if (response.ok) {
        console.log('서버 로그아웃 성공');
      } else {
        console.warn('서버 로그아웃 실패 (토큰 만료 등). 클라이언트 로그아웃을 진행합니다.');
      }

    } catch (error) {
      console.error('로그아웃 요청 중 에러 발생:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      alert('로그아웃 되었습니다.');
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-6 py-4">
      <h1 className="text-[25px] text-(--fill-color6) font-normal mb-[160px]">
        Settings
      </h1>

      <div className='w-[340px] h-[128px] flex flex-col items-center justify-between mb-10'>
        <div className='w-full h-[60px] bg-(--fill-color1) rounded-[20px] flex flex-row items-center px-6' onClick={() => router.push('/owner/shopprofile')}>
          <Image src='/assets/profile_icon.png' alt="Profile Icon" className='mr-4' width={22} height={22} />
          <p className='text-[13px] text-(--fill-color7) font-medium'>매장 프로필</p>
        </div>

        <div className='w-full h-[60px] bg-(--fill-color1) rounded-[20px] flex flex-row items-center px-6' onClick={() => router.push('/owner/accountinfo')}>
          <Image src='/assets/setting_icon.png' alt="Setting Icon" className='mr-4' width={22} height={22} />
          <p className='text-[13px] text-(--fill-color7) font-medium'>계정 정보</p>
        </div>
      </div>

      <div className='w-[340px] h-[128px] flex flex-col items-center justify-between mb-10'>
        {/* 로그아웃 버튼: onClick 연결 및 cursor-pointer 추가 */}
        <div 
          onClick={handleLogout}
          className='w-full h-[60px] bg-[#FFF6F6] rounded-[20px] flex flex-row items-center justify-center px-6 cursor-pointer active:bg-gray-100 transition-colors'
        >
          <p className='text-[13px] text-[#A62F2F] font-medium'>로그아웃</p>
        </div>
      </div>
      <OwnerBottomBar />
    </div>
  );
};