// src/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useState } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  // 1. QueryClient 생성 (설정 포함)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // 1분간 데이터를 fresh하게 유지
        refetchOnWindowFocus: false,  // 창 포커스 시 자동 새로고침 끄기
        retry: 1,                     // 실패 시 1번만 재시도
      },
    },
  }))

  // 2. 모든 자식 컴포넌트에게 QueryClient 전달
  return (
    <QueryClientProvider client={queryClient}>
      {children}  {/* 여기 안에 있는 모든 컴포넌트가 useQuery 사용 가능 */}
    </QueryClientProvider>
  )
}