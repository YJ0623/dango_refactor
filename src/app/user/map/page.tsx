'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import React, { useEffect, useState, useRef } from 'react';
import marker_icon from '../../../../public/assets/marker_icon.png';
import UserBottomBar from '@/components/UserBottomBar';
import { StoreSlider, type Store } from '@/components/StoreSlider';
import { SearchModal, type SearchApiResponse } from '@/components/SearchModal';
import { FavoriteBottomSheet } from '@/components/FavoriteBottomSheet';
import { AiRecommendationSheet } from '@/components/AiRecommendationSheet';

// --- [API 응답 타입 정의] ---
interface StoreApiResponse {
  storeId: number;
  storeName: string | null;
  storeAddress: string;
  category: string | null;
  phone: string | null;
  stampImageUrl: string | null;
  storeImageUrl: string | null;
  reward: string | null;
  stampReward: string | null;
  sns: string | null;
  storeUrl: string | null;
  distanceMeters: number | null;
  favorite?: boolean;
}

// --- 필터 탭 ---
type StoreListMode = 'nearby' | 'ai' | 'favorites';

const RadioTab: React.FC<{
  label: string;
  value: StoreListMode;
  currentValue: StoreListMode;
  onClick: () => void;
}> = ({ label, value, currentValue, onClick }) => {
  const isSelected = value === currentValue;
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm
      ${
        isSelected
          ? 'bg-black text-white border-black'
          : 'bg-white text-black border-gray-200 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
};

// --- 거리 계산 함수 ---
const getDistanceFromLatLonInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.floor(d * 1000);
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

// --- MapPage 본문 ---
export default function MapPage() {
  const mapRef = useRef<any | null>(null);
  const geocoderRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [sliderStores, setSliderStores] = useState<Store[]>([]);
  const [mode, setMode] = useState<StoreListMode>('nearby');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(true);

  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 37.5665,
    lng: 126.978,
  });

  const apiUri = process.env.NEXT_PUBLIC_API_URL;

  // --- [핵심 추가] 오프셋을 적용한 지도 이동 함수 ---
  const moveMapToLocation = (lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;

    // 마커 위로 올리기 위한 오프셋 (픽셀 단위)
    // 50px만 올리면 여전히 가려질 수 있어, 바텀 시트 높이를 고려해 150px 정도로 설정
    // 숫자를 키울수록 마커가 화면 더 위쪽에 위치하게 됩니다.
    const offsetY = 70; 

    const projection = map.getProjection();
    if (!projection) {
      // 로드 직후라 투영객체가 없으면 그냥 중심 이동
      const pos = new window.kakao.maps.LatLng(lat, lng);
      map.panTo(pos);
      return;
    }

    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    const markerPoint = projection.containerPointFromCoords(markerPosition);
    
    // 중심점을 마커 좌표보다 아래(Y축 +)로 설정하면, 
    // 결과적으로 마커는 화면 중심보다 위(Y축 -)에 보이게 됨
    const newCenterPoint = new window.kakao.maps.Point(markerPoint.x, markerPoint.y + offsetY);
    const newCenter = projection.coordsFromContainerPoint(newCenterPoint);

    map.panTo(newCenter);
  };

  // --- 유틸 함수 ---
  const getCoordsFromAddress = (
    address: string
  ): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!geocoderRef.current || !window.kakao) {
        resolve(null);
        return;
      }
      geocoderRef.current.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve({ lat: Number(result[0].y), lng: Number(result[0].x) });
        } else {
          resolve(null);
        }
      });
    });
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];
  };

  // --- 마커 그리기 ---
  const drawMarkers = (stores: Store[]) => {
    if (!mapRef.current) return;

    clearMarkers();

    const imageSize = new window.kakao.maps.Size(35, 35);
    const imageOption = { offset: new window.kakao.maps.Point(17.5, 35) };
    const markerImage = new window.kakao.maps.MarkerImage(
      marker_icon.src,
      imageSize,
      imageOption
    );

    stores.forEach((store) => {
      const pos = new window.kakao.maps.LatLng(store.lat, store.lng);

      const marker = new window.kakao.maps.Marker({
        position: pos,
        map: mapRef.current,
        title: store.name,
        image: markerImage,
      });

      const content = `
        <div class="custom-overlay-label" style="padding:2px 5px; background:white; border:1px solid #ccc; border-radius:4px; font-size:11px;">
          ${store.name}
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: content,
        xAnchor: 0.5,
        yAnchor: 2.2,
      });

      overlay.setMap(mapRef.current);

      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedStore(store);
        setIsSliderOpen(true);
        // [수정] 오프셋 적용 이동 함수 사용
        moveMapToLocation(store.lat, store.lng);
      });

      markersRef.current.push(marker);
      overlaysRef.current.push(overlay);
    });
  };

  // --- 단일 검색 결과 업데이트 ---
  const updateMapWithStore = (store: Store) => {
    if (!mapRef.current) return;
    
    // [수정] 오프셋 적용 이동 (검색 결과도 시트 위에 잘 보여야 함)
    moveMapToLocation(store.lat, store.lng);

    clearMarkers();

    const imageSize = new window.kakao.maps.Size(35, 35);
    const imageOption = { offset: new window.kakao.maps.Point(17.5, 35) };
    const markerImage = new window.kakao.maps.MarkerImage(
      marker_icon.src,
      imageSize,
      imageOption
    );

    const moveLatLon = new window.kakao.maps.LatLng(store.lat, store.lng);

    const marker = new window.kakao.maps.Marker({
      position: moveLatLon,
      map: mapRef.current,
      title: store.name,
      image: markerImage,
    });

    const content = `
      <div class="custom-overlay-label" style="padding:2px 5px; background:white; border:1px solid #ccc; border-radius:4px; font-size:11px;">
        ${store.name}
      </div>
    `;

    const overlay = new window.kakao.maps.CustomOverlay({
      position: moveLatLon,
      content: content,
      xAnchor: 0.5,
      yAnchor: 2.2,
    });
    overlay.setMap(mapRef.current);

    window.kakao.maps.event.addListener(marker, 'click', () => {
      setSelectedStore(store);
      setIsSliderOpen(true);
      // [수정] 오프셋 적용 이동
      moveMapToLocation(store.lat, store.lng);
    });

    markersRef.current.push(marker);
    overlaysRef.current.push(overlay);

    setSliderStores([store]);
    setSelectedStore(store);
    setIsSliderOpen(true);
  };

  // --- API 호출: 모든 가게 불러오기 (내 주변) ---
  const fetchAllStores = async (currentLat: number, currentLng: number) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${apiUri}/v1/stores`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stores');

      const jsonResponse = await response.json();
      const storeList: StoreApiResponse[] = jsonResponse.data;

      const mappedStores = await Promise.all(
        storeList.map(async (item) => {
          if (!item.storeName) return null;

          const coords = await getCoordsFromAddress(item.storeAddress);
          const storeLat = coords ? coords.lat : 0;
          const storeLng = coords ? coords.lng : 0;

          let dist = item.distanceMeters;
          if (dist === null && storeLat !== 0 && storeLng !== 0) {
            dist = getDistanceFromLatLonInMeters(
              currentLat,
              currentLng,
              storeLat,
              storeLng
            );
          }

          return {
            id: item.storeId,
            name: item.storeName || '이름 없음',
            category: item.category || '기타',
            address: item.storeAddress,
            lat: storeLat,
            lng: storeLng,
            image: item.storeImageUrl || undefined,
            rating: 0,
            reviewCount: 0,
            description: item.reward || '이벤트 정보 없음',
            distance: dist || 0,
          } as Store;
        })
      );

      const validStores = mappedStores.filter(
        (s: any): s is Store => s !== null && s.lat !== 0
      );

      // 거리순 정렬
      validStores.sort(
        (a: any, b: any) => (a.distance || 0) - (b.distance || 0)
      );

      setSliderStores(validStores);

      if (validStores.length > 0) {
        drawMarkers(validStores);
      } else {
        clearMarkers();
        setSliderStores([]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  // --- 즐겨찾기 목록 API 호출 ---
  const fetchFavorites = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      const response = await fetch(`${apiUri}/v1/favstores`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setSliderStores([]);
          clearMarkers();
          return;
        }
        throw new Error('Failed to fetch favorites');
      }

      const result = await response.json();
      const favList: any[] = Array.isArray(result.data) ? result.data : [];

      const mappedStores = await Promise.all(
        favList.map(async (item) => {
          const address = item.storeAddress || item.address || '';
          const name = item.storeName || item.name || '이름 없음';

          const coords = await getCoordsFromAddress(address);
          const storeLat = coords ? coords.lat : 0;
          const storeLng = coords ? coords.lng : 0;

          const dist = 0; // 즐겨찾기는 거리 계산 생략 가능

          return {
            id: item.storeId,
            name: name,
            category: item.category || '기타',
            address: address,
            lat: storeLat,
            lng: storeLng,
            image: item.storeImageUrl,
            rating: 0,
            reviewCount: 0,
            description: '즐겨찾는 매장',
            distance: dist,
          } as Store;
        })
      );

      const validStores = mappedStores.filter((s: any) => s.lat !== 0);

      setSliderStores(validStores);

      if (validStores.length > 0) {
        drawMarkers(validStores);
        // 목록 첫 번째 가게로 이동 시에도 오프셋 적용
        if (mapRef.current) {
            moveMapToLocation(validStores[0].lat, validStores[0].lng);
        }
      } else {
        clearMarkers();
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setSliderStores([]);
    }
  };

  // --- 즐겨찾기 삭제 처리 ---
  const handleDeleteFavorite = async (storeId: number) => {
    if (!confirm('정말 즐겨찾기를 해제하시겠습니까?')) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인 정보가 없습니다.');
      return;
    }

    try {
      const response = await fetch(`${apiUri}/v1/favstores/${storeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedStores = sliderStores.filter(
          (store) => store.id !== storeId
        );
        setSliderStores(updatedStores);
        drawMarkers(updatedStores);

        if (selectedStore?.id === storeId) {
          setSelectedStore(null);
        }
        alert('즐겨찾기가 해제되었습니다.');
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('즐겨찾기 삭제 중 오류:', error);
      alert('삭제 처리에 실패했습니다.');
    }
  };

  const updateSliderContent = (newMode: StoreListMode) => {
    setMode(newMode);
    setSelectedStore(null); // 기존 선택된 가게 해제
    setIsSliderOpen(true); // 시트는 열어둠 (AI 시트를 보여주기 위함)

    if (newMode === 'ai') {
      // [수정] AI 모드: 지도 마커 제거 + 슬라이더 데이터 초기화
      // 지도는 이동하지 않고, 마커도 찍지 않음 (완전 격리)
      clearMarkers();
      setSliderStores([]);
    } else if (newMode === 'nearby') {
      // 내 주변: 마커 찍고 리스트 채움
      fetchAllStores(center.lat, center.lng);
    } else if (newMode === 'favorites') {
      // 즐겨찾기: 마커 찍고 리스트 채움
      fetchFavorites();
    }
  };

  // --- 검색 결과 처리 ---
  const handleSelectSearchResult = async (searchData: SearchApiResponse) => {
    setIsSearchModalOpen(false);
    const coords = await getCoordsFromAddress(searchData.storeAddress);

    if (!coords) {
      alert('매장의 위치 정보를 찾을 수 없습니다.');
      return;
    }

    const dist = getDistanceFromLatLonInMeters(
      center.lat,
      center.lng,
      coords.lat,
      coords.lng
    );

    const newStore: Store = {
      id: searchData.storeId,
      name: searchData.storeName,
      category: searchData.category,
      address: searchData.storeAddress,
      lat: coords.lat,
      lng: coords.lng,
      image: searchData.storeImageUrl || undefined,
      rating: 0,
      reviewCount: 0,
      description: searchData.reward || '이벤트 정보 없음',
      distance: dist,
    };

    updateMapWithStore(newStore);
  };

  // --- 초기화 ---
  useEffect(() => {
    const initializeMap = (initialPosition: { lat: number; lng: number }) => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => {
          const container = document.getElementById('map');
          if (container && mapRef.current === null) {
            const mapCenter = new window.kakao.maps.LatLng(
              initialPosition.lat,
              initialPosition.lng
            );
            const options = { center: mapCenter, level: 4 };
            const kakaoMap = new window.kakao.maps.Map(container, options);

            // [수정] 지도 드래그 및 줌 활성화 명시적 설정
            kakaoMap.setDraggable(true);
            kakaoMap.setZoomable(true);

            mapRef.current = kakaoMap;
            geocoderRef.current = new window.kakao.maps.services.Geocoder();

            window.kakao.maps.event.addListener(kakaoMap, 'click', () => {
              // 지도 클릭 시 슬라이더 토글 (AI 모드 아닐 때만)
              if (mode !== 'ai') {
                setIsSliderOpen((prev) => !prev);
              }
            });

            // 초기 로딩 시 주변 매장 로드
            fetchAllStores(initialPosition.lat, initialPosition.lng);
          }
        });
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCenter(currentPos);
        initializeMap(currentPos);
      },
      (err) => {
        console.warn('Geolocation Error:', err);
        const defaultPos = { lat: 37.5665, lng: 126.978 };
        setCenter(defaultPos);
        initializeMap(defaultPos);
      },
      { enableHighAccuracy: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 렌더링 ---
  // 하단 컨텐츠(슬라이더) 결정 로직
  const renderBottomContent = () => {
    if (!isSliderOpen) return null;

    switch (mode) {
      case 'ai':
        return <AiRecommendationSheet />;
      case 'favorites':
        return (
          <FavoriteBottomSheet
            stores={sliderStores}
            onStoreClick={(store: Store) => {
              // [수정] 리스트 클릭 시에도 오프셋 적용 이동
              moveMapToLocation(store.lat, store.lng);
            }}
            onDeleteRequest={handleDeleteFavorite}
          />
        );
      case 'nearby':
      default:
        return (
          <StoreSlider
            stores={sliderStores}
            selectedStore={selectedStore}
            isOpen={isSliderOpen}
            onStoreSelect={(store: Store) => {
              setSelectedStore(store);
              setIsSliderOpen(true);
              // [수정] 슬라이더 아이템 선택 시에도 오프셋 적용 이동
              moveMapToLocation(store.lat, store.lng);
            }}
          />
        );
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center relative overflow-hidden bg-white">
      <style>{`
        .custom-overlay-label {
          font-size: 12px;
          font-weight: 600;
          color: #black;
          white-space: nowrap; 
        }
      `}</style>

      {/* Title */}
      <div className="mx-5 my-2 text-[25px] font-semibold flex justify-start items-start">
        Map
      </div>

      {/* 검색창 */}
      <div
        className="w-full justify-center flex flex-row h-11 px-3 gap-3 z-10"
        onClick={() => setIsSearchModalOpen(true)}
      >
        <div className="flex-1 rounded-[10px] h-full bg-gray-100 flex items-center px-4 cursor-pointer">
          <span className="text-gray-400 text-sm">카페 이름 검색</span>
        </div>
        <button className="w-11 h-full flex items-center justify-center rounded-[10px] bg-[#FF6B00] cursor-pointer">
          <Image
            src='/assets/searchIcon.png'
            alt="search"
            className='brightness-0 invert'
            width={20}
            height={20}
          />
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="absolute top-[120px] left-3 z-10 flex gap-2">
        <RadioTab
          label="내 주변"
          value="nearby"
          currentValue={mode}
          onClick={() => updateSliderContent('nearby')}
        />
        <RadioTab
          label="AI 추천"
          value="ai"
          currentValue={mode}
          onClick={() => updateSliderContent('ai')}
        />
        <RadioTab
          label="즐겨찾기"
          value="favorites"
          currentValue={mode}
          onClick={() => updateSliderContent('favorites')}
        />
      </div>

      {/* 지도 영역 */}
      <div className="flex grow w-full mt-3 relative">
        <div id="map" className="w-full h-full touch-none"></div>
      </div>

      {/* 하단 바텀 시트 (모드에 따라 변경됨) */}
      {renderBottomContent()}

      <UserBottomBar />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectStore={handleSelectSearchResult}
      />
    </div>
  );
};