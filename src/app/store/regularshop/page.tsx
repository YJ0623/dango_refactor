'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import UserBottomBar from '@/components/UserBottomBar';
import BackButton from '../../../components/BackButton';
import Image from 'next/image';

// API 기본 주소
const apiUri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  isFavorite?: boolean; // 혹시 몰라 타입 정의 추가
}

// [3] API: 검색 조회 응답 데이터 타입
interface SearchApiStoreData {
  storeId: number;
  storeName: string;
  storeAddress: string;
  category: string;
  storeImageUrl: string;
  favorite?: boolean;
  isFavorite?: boolean; // 혹시 몰라 타입 정의 추가
}

// [4] API: ★ 즐겨찾기 매장 조회 응답 데이터 타입
interface FavStoreApiData {
  storeId: number;
  storeName: string;
  storeCategory: string;
  storeAddress: string;
  storeImageUrl: string;
  favorite: boolean;
}

export default function RegularShopPage() {
  const router = useRouter();

  // State
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'liked'>('all');
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('accessToken');

  // ----------------------------------------------------------------
  // 1-A. 초기 데이터 로딩 (내 주변 매장 + 찜 목록 크로스 체크)
  // ----------------------------------------------------------------
  const fetchInitialStores = async () => {
    setLoading(true);
    try {
      const token = getToken();

      // [핵심] 두 개의 API를 동시에 호출합니다.
      // 1. 우리 동네 매장 리스트
      // 2. 내가 찜한 매장 리스트 (비교용)
      const [localResponse, favResponse] = await Promise.all([
        axios.get(`${apiUri}/v1/users/stores/local`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUri}/v1/favstores`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const localData = localResponse.data.data; // 로컬 매장 원본
      const favData = favResponse.data.data; // 찜한 매장 원본

      // [핵심] 찜한 매장들의 ID만 뽑아서 Set으로 만듭니다 (검색 속도 향상)
      // favData가 배열인지 확인하고 처리
      const favStoreIds = new Set(
        Array.isArray(favData)
          ? favData.map((f: FavStoreApiData) => f.storeId)
          : []
      );

      // 로컬 매장 데이터를 매핑하면서, ID가 favStoreIds에 있는지 확인합니다.
      const mappedStores: Store[] = localData.map(
        (item: LocalApiStoreData) => ({
          id: item.storeId,
          name: item.storeName,
          category: item.category,
          address: item.address,

          // [수정] API가 주는 favorite 값 대신, 우리가 직접 비교한 결과를 사용합니다.
          // "내 찜 목록에 이 가게 ID가 있는가?" -> true / false
          isFavorite: favStoreIds.has(item.storeId),

          image: item.storeImageUrl,
        })
      );

      setStores(mappedStores);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      // 에러 시 빈 배열 처리 혹은 개별 에러 처리
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // 1-B. ★ 즐겨찾기 매장 로딩
  // ----------------------------------------------------------------
  const fetchFavoriteStores = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${apiUri}/v1/favstores`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiData = response.data.data;

      const mappedStores: Store[] = apiData.map((item: FavStoreApiData) => ({
        id: item.storeId,
        name: item.storeName,
        category: item.storeCategory,
        address: item.storeAddress,
        isFavorite: true, // 즐겨찾기 탭이므로 무조건 true
        image: item.storeImageUrl,
      }));

      setStores(mappedStores);
    } catch (error) {
      console.error('찜한 매장 로딩 실패:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // Effect: 탭(activeTab)이 바뀔 때마다 데이터 다시 불러오기
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!searchTerm) {
      if (activeTab === 'all') {
        fetchInitialStores();
      } else {
        fetchFavoriteStores();
      }
    }
  }, [activeTab]);

  // ----------------------------------------------------------------
  // 2. 검색 기능 - [수정됨]
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

      const searchData = response.data; // 구조에 따라 response.data.data 일수도 있음 확인 필요

      const mappedStores: Store[] = searchData.map(
        (item: SearchApiStoreData) => ({
          id: item.storeId,
          name: item.storeName,
          category: item.category,
          address: item.storeAddress,
          // [핵심 수정] 검색 결과에서도 동일하게 필드명 체크
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

    // 1) UI 선반영
    const previousState = targetStore.isFavorite;
    const newState = !previousState;

    updateStoreFavorite(id, newState);

    // 2) 서버 요청
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
    } catch (error: any) {
      if (error.response && error.response.status === 500) {
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

  const displayStores = stores;

  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-20 mx-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 bg-white z-10">
        <BackButton />
        {/* <h1 className="text-xl font-bold text-gray-800">스탬프 등록</h1> */}
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
            <Image
              src='/assets/searchIcon.png'
              alt="검색"
              className="w-5 h-5 filter invert brightness-0"
              width={20}
              height={20}
            />
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
        ) : displayStores.length > 0 ? (
          displayStores.map((store) => (
            <div
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className="flex items-start w-full border-b border-gray-100 pb-6 last:border-0 cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
            >
              <div className="w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 mr-4 shadow-sm">
                <Image
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/150?text=No+Image';
                  }}
                  width={96}
                  height={80}
                />
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
                    <Image
                      src={store.isFavorite ? '/assets/heart_icon.png' : '/assets/heart_empty_icon.png'}
                      alt={store.isFavorite ? '찜 취소' : '찜하기'}
                      className="w-5 h-5 object-contain"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>
              {activeTab === 'liked'
                ? '찜한 매장이 없습니다.'
                : '표시할 매장이 없습니다.'}
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
