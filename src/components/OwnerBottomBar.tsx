'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
    {
        id: 'dashboard',
        label: '대시보드',
        path: '/owner/dashboard',
        imgOn: '/assets/dashBoardOn.png',
        imgOff: '/assets/dashBoardOff.png',
    },
    {
        id: 'manage',
        label: '가게 관리',
        path: '/owner/manage',
        imgOn: '/assets/manageOn.png',
        imgOff: '/assets/manageOff.png',
    },
    {
        id: 'event',
        label: '이벤트',
        path: '/owner/eventmanage',
        imgOn: '/assets/eventOn.png',
        imgOff: '/assets/eventOff.png',
    },
    {
        id: 'settings',
        label: '설정',
        path: '/owner/settings',
        imgOn: '/assets/settingOn.png',
        imgOff: '/assets/settingOff.png',
    }
  ];

export const OwnerBottomBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
  <nav className="fixed bottom-3 left-0 right-0 z-50 mx-auto flex h-18 w-90 max-w-125 items-center justify-around bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.08)] rounded-[20px]">
    {navItems.map((item) => {
    const isActive = pathname === item.path;
    const imageSrc = isActive ? item.imgOn : item.imgOff;
    
    return (
      <button
      key={item.id}
      onClick={() => router.push(item.path)}
      className="flex flex-1 items-center justify-center"
      >
      <Image
        src={imageSrc}
        alt={item.label}
        className="object-contain"
        width={62}
        height={62}
      />
      </button>
    );
    })}
  </nav>
  );
};