'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navItems = [
    {
        id: 'stamp',
        label: '스탬프',
        path: '/user/stamp',
        imgOn: '/assets/StampOn.png',
        imgOff: '/assets/StampOff.png',
    },
    {
        id: 'map',
        label: '지도',
        path: '/user/map',
        imgOn: '/assets/MapOn.png',
        imgOff: '/assets/MapOff.png',
    },
    {
        id: 'reward',
        label: '리워드',
        path: '/user/reward',
        imgOn: '/assets/RewardOn.png',
        imgOff: '/assets/RewardOff.png',
    },
    {
        id: 'mypage',
        label: '마이페이지',
        path: '/user/mypage',
        imgOn: '/assets/MyPageOn.png',
        imgOff: '/assets/MyPageOff.png',
    }
]

export default function UserBottomBar() {
  const pathname = usePathname();

    return (
    <nav className="fixed bottom-3 left-0 right-0 z-50 mx-auto flex h-[72px] w-[360px] items-center justify-around bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.08)] rounded-[20px]">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.id} href={item.path} className="flex flex-1 items-center justify-center" >
            <Image
              src = {isActive ? item.imgOn : item.imgOff}
              alt={item.label}
              width={62}
              height={62}
              className="object-contain"
              priority
            />
          </Link>
        );
      })}
    </nav>
  );
};