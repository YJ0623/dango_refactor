'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import UserBottomBar from '@/components/UserBottomBar';
import BackButton from '@/components/BackButton';
import Image from 'next/image';

// API 기본 주소
const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// [1] 화면에 표시할 매장 데이터 타입
interface Store {
  id: number;
  name: string;
  category: string;
  address: string;
  isFavorite: boolean;
  image: string;
}

// [2] API: 로컬 매장 조회 응답 데이터 타입
interface LocalApiStoreData {
  storeId: number;
  storeName: string;
  address: string;
  category: string;
  storeImageUrl: string;
  favorite?: boolean;
  isFavorite?: boolean;
}

// [3] API: 검색 조회 응답 데이터 타입
interface SearchApiStoreData {
  storeId: number;
  storeName: string;
  storeAddress: string;
  category: string;
  storeImageUrl: string;
  favorite?: boolean;
  isFavorite?: boolean;
}

// [4] API: 즐겨찾기 매장 조회 응답 데이터 타입
interface FavStoreApiData {
  storeId: number;
  storeName: string;
  storeCategory: string;
  storeAddress: string;
  storeImageUrl: string;
  favorite: boolean;
}

// ★ [수정 1] localStorage를 SSR-safe하게 접근하는 헬퍼
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// ★ [수정 2] next/image의 onError에서 src 직접 조작 불가 → state 기반 fallback 컴포넌트
const FALLBACK_IMAGE = '/assets/no_image_placeholder.png'; // public 폴더 내 로컬 이미지 권장

const StoreImage = ({ src, alt }: { src: string; alt: string }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="96px"
      className="object-cover"
      onError={() => setImgSrc(FALLBACK_IMAGE)}
    />
  );
};

export const StampRegistration1 = () => {
  const router = useRouter();

  // State
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------------
  // 1-A. 초기 데이터 로딩 (내 주변 매장 + 찜 목록 크로스 체크)
  // ----------------------------------------------------------------
  // ★ [수정 4] useCallback으로 감싸서 useEffect 의존성 안정화
  const fetchInitialStores = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setStores([]);
        return;
      }

      const [localResponse, favResponse] = await Promise.all([
        axios.get(`${apiUri}/v1/users/stores/local`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUri}/v1/favstores`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const localData = localResponse.data.data;
      const favData = favResponse.data.data;

      const favStoreIds = new Set(
        Array.isArray(favData)
          ? favData.map((f: FavStoreApiData) => f.storeId)
          : []
      );

      const mappedStores: Store[] = localData.map(
        (item: LocalApiStoreData) => ({
          id: item.storeId,
          name: item.storeName,
          category: item.category,
          address: item.address,
          isFavorite: favStoreIds.has(item.storeId),
          image: item.storeImageUrl,
        })
      );

      setStores(mappedStores);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------------------------------------
  // 1-B. 즐겨찾기 매장 로딩
  // ----------------------------------------------------------------
  const fetchFavoriteStores = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setStores([]);
        return;
      }

      const response = await axios.get(`${apiUri}/v1/favstores`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiData = response.data.data;

      const mappedStores: Store[] = apiData.map((item: FavStoreApiData) => ({
        id: item.storeId,
        name: item.storeName,
        category: item.storeCategory,
        address: item.storeAddress,
        isFavorite: true,
        image: item.storeImageUrl,
      }));

      setStores(mappedStores);
    } catch (error) {
      console.error('찜한 매장 로딩 실패:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------------------------------------
  // Effect: 탭(activeTab)이 바뀔 때마다 데이터 다시 불러오기
  // ----------------------------------------------------------------
  // ★ [수정 4] 의존성 배열에 필요한 값 모두 포함
  useEffect(() => {
    if (!searchTerm) {
      if (activeTab === 'all') {
        fetchInitialStores();
      } else {
        fetchFavoriteStores();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, fetchInitialStores, fetchFavoriteStores]);

  // ----------------------------------------------------------------
  // 2. 검색 기능
  // ----------------------------------------------------------------
  const searchStores = async () => {
    if (!searchTerm.trim()) {
      if (activeTab === 'all') fetchInitialStores();
      else fetchFavoriteStores();
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${apiUri}/v1/stores/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { storeName: searchTerm },
      });

      const searchData = response.data;

      const mappedStores: Store[] = searchData.map(
        (item: SearchApiStoreData) => ({
          id: item.storeId,
          name: item.storeName,
          category: item.category,
          address: item.storeAddress,
          isFavorite: item.favorite === true || item.isFavorite === true,
          image: item.storeImageUrl,
        })
      );

      setStores(mappedStores);
    } catch (error) {
      console.error('매장 검색 실패:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') searchStores();
  };

  // ----------------------------------------------------------------
  // 3. 찜하기 (Heart) 토글 기능
  // ----------------------------------------------------------------
  const toggleHeart = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    const targetStore = stores.find((s) => s.id === id);
    if (!targetStore) return;

    const previousState = targetStore.isFavorite;
    const newState = !previousState;

    updateStoreFavorite(id, newState);

    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (newState) {
        const res = await axios.post(
          `${apiUri}/v1/favstores/${id}`,
          {},
          { headers }
        );
        if (res.data.code !== 100) throw new Error('찜 등록 실패');
      } else {
        const res = await axios.delete(`${apiUri}/v1/favstores/${id}`, {
          headers,
        });
        if (res.data.code !== 100) throw new Error('찜 취소 실패');
      }
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 500
      ) {
        console.warn('서버 500 에러 (중복/처리됨) 감지 -> UI 유지');
        return;
      }
      console.error('찜 변경 통신 에러:', error);
      updateStoreFavorite(id, previousState);
      alert('요청 처리 중 오류가 발생했습니다.');
    }
  };

  const updateStoreFavorite = (id: number, isFav: boolean) => {
    setStores((prev) =>
      prev.map((store) =>
        store.id === id ? { ...store, isFavorite: isFav } : store
      )
    );
  };

  // ----------------------------------------------------------------
  // 4. 렌더링
  // ----------------------------------------------------------------
  const handleStoreClick = (storeId: number) => {
    const selectedStore = stores.find((s) => s.id === storeId);
    if (selectedStore) {
      router.push(`/store/registration?storeId=${selectedStore.id}&storeName=${encodeURIComponent(selectedStore.name)}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col relative pb-20 mx-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-white z-10">
        <BackButton />
        <h1 className="text-xl font-bold text-gray-800">스탬프 등록</h1>
        <div className="w-6" />
      </div>

      {/* Search Bar */}
      <div className="px-5 mt-2">
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="스탬프를 등록할 가게명 검색"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-100 text-sm text-gray-700 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
          />
          <button
            onClick={searchStores}
            className="absolute right-0 top-0 h-full w-12 bg-orange-500 rounded-r-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
          >
            {/* ★ [수정 3] 검색 아이콘도 fill 패턴 적용 */}
            <div className="relative w-5 h-5">
              <Image
                src="/assets/searchIcon.png"
                alt="검색"
                fill
                sizes="20px"
                className="object-contain filter invert brightness-0"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-5 mt-6 mb-4 text-sm">
        <button
          onClick={() => {
            setActiveTab('all');
            setSearchTerm('');
          }}
          className={`font-bold cursor-pointer ${
            activeTab === 'all'
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {searchTerm ? '검색 결과' : '우리 동네 매장'}
        </button>
        <span className="mx-3 text-gray-300">|</span>
        <button
          onClick={() => {
            setActiveTab('liked');
            setSearchTerm('');
          }}
          className={`font-bold cursor-pointer ${
            activeTab === 'liked'
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          찜한 매장
        </button>
      </div>

      {/* Store List */}
      <div className="flex-1 overflow-y-auto px-5 space-y-6 pb-4">
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400 text-sm">
            데이터를 불러오는 중입니다...
          </div>
        ) : stores.length > 0 ? (
          stores.map((store) => (
            <div
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className="flex items-start w-full border-b border-gray-100 pb-6 last:border-0 cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
            >
              {/* ★ [수정 3] next/image fill 패턴: 부모에 relative + 고정 크기 */}
              <div className="relative w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 mr-4 shadow-sm">
                <StoreImage src={store.image} alt={store.name} />
              </div>

              <div className="flex-1 flex flex-col justify-between h-20 py-1">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-end gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-base leading-none">
                        {store.name}
                      </h3>
                      <span className="text-xs text-gray-400 font-light leading-none transform translate-y-[1px]">
                        {store.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-light mt-1">
                      {store.address}
                    </p>
                  </div>

                  <button
                    onClick={(e) => toggleHeart(e, store.id)}
                    className="ml-2 p-1 transition-transform active:scale-90 focus:outline-none z-10"
                  >
                    {/* ★ [수정 3] 하트 아이콘도 fill 패턴 적용 */}
                    <div className="relative w-5 h-5">
                      <Image
                        src={
                          store.isFavorite
                            ? '/assets/heart_icon.png'
                            : '/assets/heart_empty.png'
                        }
                        alt={store.isFavorite ? '찜 취소' : '찜하기'}
                        fill
                        sizes="20px"
                        className="object-contain"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-center">
              {activeTab === 'liked' ? (
                '찜한 매장이 없습니다.'
              ) : (
                <>
                  아직 매장이 등록되지 않은 동네에요.
                  <br />
                  입점을 기다려주세요!
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-[430px] z-30 bg-white border-t border-gray-100">
        <UserBottomBar />
      </div>
    </div>
  );
};

export default StampRegistration1;
