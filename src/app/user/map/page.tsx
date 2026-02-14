'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import marker_icon from '../../../../public/assets/marker_icon.png';
import UserBottomBar from '@/components/UserBottomBar';
import { StoreSlider, type Store } from '@/components/StoreSlider';
import { SearchModal, type SearchApiResponse } from '@/components/SearchModal';
import { FavoriteBottomSheet } from '@/components/FavoriteBottomSheet';
import { useRouter } from 'next/navigation';

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

// --- 뷰 모드 & 필터 모드 ---
type ViewMode = 'list' | 'map';
type StoreListMode = 'nearby' | 'favorites';

// --- 거리 계산 함수 ---
const getDistanceFromLatLonInMeters = (
  lat1: number, lon1: number, lat2: number, lon2: number
) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.floor(R * c * 1000);
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

// --- 거리 포맷 헬퍼 ---
const formatDistance = (meters: number) => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
  return `${meters}m`;
};

// ============================================================
// 메인 컴포넌트
// ============================================================
export default function MapPage() {
  const router = useRouter();

  // --- 뷰 모드 ---
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<StoreListMode>('nearby');

  // --- 공통 데이터 ---
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [favoriteStores, setFavoriteStores] = useState<Store[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [isLocationReady, setIsLocationReady] = useState(false);

  // --- 무한 스크롤 (가게 목록 모드) ---
  const [displayCount, setDisplayCount] = useState(5);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // --- 지도 모드 전용 ---
  const mapRef = useRef<any | null>(null);
  const geocoderRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState(true);
  const mapInitializedRef = useRef(false);

  const apiUri = process.env.NEXT_PUBLIC_API_URL;

  // ============================================================
  // 유틸 함수
  // ============================================================
  const getCoordsFromAddress = useCallback(
    (address: string): Promise<{ lat: number; lng: number } | null> => {
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
    },
    []
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
  }, []);

  // --- 오프셋 적용 지도 이동 ---
  const moveMapToLocation = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;
    const offsetY = 70;
    const projection = map.getProjection();
    if (!projection) {
      map.panTo(new window.kakao.maps.LatLng(lat, lng));
      return;
    }
    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    const markerPoint = projection.containerPointFromCoords(markerPosition);
    const newCenterPoint = new window.kakao.maps.Point(markerPoint.x, markerPoint.y + offsetY);
    const newCenter = projection.coordsFromContainerPoint(newCenterPoint);
    map.panTo(newCenter);
  }, []);

  // ============================================================
  // API 호출
  // ============================================================

  // --- 내 주변 가게 ---
  const fetchAllStores = useCallback(
    async (currentLat: number, currentLng: number) => {
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

        // Geocoder가 아직 없을 수 있으므로 대기
        const waitForGeocoder = () =>
          new Promise<void>((resolve) => {
            const check = () => {
              if (geocoderRef.current) resolve();
              else setTimeout(check, 100);
            };
            check();
          });
        await waitForGeocoder();

        const mappedStores = await Promise.all(
          storeList.map(async (item) => {
            if (!item.storeName) return null;
            const coords = await getCoordsFromAddress(item.storeAddress);
            const storeLat = coords ? coords.lat : 0;
            const storeLng = coords ? coords.lng : 0;

            let dist = item.distanceMeters;
            if (dist === null && storeLat !== 0 && storeLng !== 0) {
              dist = getDistanceFromLatLonInMeters(currentLat, currentLng, storeLat, storeLng);
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

        const validStores = mappedStores
          .filter((s): s is Store => s !== null && s.lat !== 0)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setAllStores(validStores);
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    },
    [apiUri, getCoordsFromAddress]
  );

  // --- 즐겨찾기 목록 ---
  const fetchFavorites = useCallback(async () => {
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
          setFavoriteStores([]);
          return;
        }
        throw new Error('Failed to fetch favorites');
      }

      const result = await response.json();
      const favList: any[] = Array.isArray(result.data) ? result.data : [];

      const waitForGeocoder = () =>
        new Promise<void>((resolve) => {
          const check = () => {
            if (geocoderRef.current) resolve();
            else setTimeout(check, 100);
          };
          check();
        });
      await waitForGeocoder();

      const mappedStores = await Promise.all(
        favList.map(async (item) => {
          const address = item.storeAddress || item.address || '';
          const name = item.storeName || item.name || '이름 없음';
          const coords = await getCoordsFromAddress(address);
          return {
            id: item.storeId,
            name,
            category: item.category || '기타',
            address,
            lat: coords ? coords.lat : 0,
            lng: coords ? coords.lng : 0,
            image: item.storeImageUrl,
            rating: 0,
            reviewCount: 0,
            description: '즐겨찾는 매장',
            distance: 0,
          } as Store;
        })
      );

      setFavoriteStores(mappedStores.filter((s) => s.lat !== 0));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavoriteStores([]);
    }
  }, [apiUri, getCoordsFromAddress]);

  // --- 즐겨찾기 삭제 ---
  const handleDeleteFavorite = async (storeId: number) => {
    if (!confirm('정말 즐겨찾기를 해제하시겠습니까?')) return;
    const token = localStorage.getItem('accessToken');
    if (!token) { alert('로그인 정보가 없습니다.'); return; }

    try {
      const response = await fetch(`${apiUri}/v1/favstores/${storeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setFavoriteStores((prev) => prev.filter((s) => s.id !== storeId));
        if (selectedStore?.id === storeId) setSelectedStore(null);
        alert('즐겨찾기가 해제되었습니다.');
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('즐겨찾기 삭제 중 오류:', error);
      alert('삭제 처리에 실패했습니다.');
    }
  };

  // ============================================================
  // 지도 마커 관련
  // ============================================================
  const drawMarkers = useCallback(
    (stores: Store[]) => {
      if (!mapRef.current) return;
      clearMarkers();

      const imageSize = new window.kakao.maps.Size(35, 35);
      const imageOption = { offset: new window.kakao.maps.Point(17.5, 35) };
      const markerImage = new window.kakao.maps.MarkerImage(marker_icon.src, imageSize, imageOption);

      stores.forEach((store) => {
        const pos = new window.kakao.maps.LatLng(store.lat, store.lng);
        const marker = new window.kakao.maps.Marker({
          position: pos, map: mapRef.current, title: store.name, image: markerImage,
        });

        const content = `<div class="custom-overlay-label" style="padding:2px 5px;background:white;border:1px solid #ccc;border-radius:4px;font-size:11px;">${store.name}</div>`;
        const overlay = new window.kakao.maps.CustomOverlay({
          position: pos, content, xAnchor: 0.5, yAnchor: 2.2,
        });
        overlay.setMap(mapRef.current);

        window.kakao.maps.event.addListener(marker, 'click', () => {
          setSelectedStore(store);
          setIsSliderOpen(true);
          moveMapToLocation(store.lat, store.lng);
        });

        markersRef.current.push(marker);
        overlaysRef.current.push(overlay);
      });
    },
    [clearMarkers, moveMapToLocation]
  );

  // ============================================================
  // 초기화: 위치 + 카카오맵 로드
  // ============================================================
  useEffect(() => {
    const initializeMap = (pos: { lat: number; lng: number }) => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => {
          geocoderRef.current = new window.kakao.maps.services.Geocoder();

          // 지도 컨테이너가 있을 때만 초기화 (map 모드 전환 시 별도 처리)
          const container = document.getElementById('map');
          if (container && !mapInitializedRef.current) {
            const mapCenter = new window.kakao.maps.LatLng(pos.lat, pos.lng);
            const kakaoMap = new window.kakao.maps.Map(container, { center: mapCenter, level: 4 });
            kakaoMap.setDraggable(true);
            kakaoMap.setZoomable(true);
            mapRef.current = kakaoMap;
            mapInitializedRef.current = true;

            window.kakao.maps.event.addListener(kakaoMap, 'click', () => {
              setIsSliderOpen((prev) => !prev);
            });
          }

          setIsLocationReady(true);
        });
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(currentPos);
        initializeMap(currentPos);
      },
      () => {
        const defaultPos = { lat: 37.5665, lng: 126.978 };
        setCenter(defaultPos);
        initializeMap(defaultPos);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // --- 위치 준비 후 데이터 로드 ---
  useEffect(() => {
    if (!isLocationReady) return;
    fetchAllStores(center.lat, center.lng);
    fetchFavorites();
  }, [isLocationReady, center, fetchAllStores, fetchFavorites]);

  // --- 지도 모드 진입 시 마커 그리기 ---
  useEffect(() => {
    if (viewMode !== 'map' || !mapRef.current) return;

    const stores = filterMode === 'favorites' ? favoriteStores : allStores;
    drawMarkers(stores);

    if (stores.length > 0) {
      moveMapToLocation(stores[0].lat, stores[0].lng);
    }
  }, [viewMode, filterMode, allStores, favoriteStores, drawMarkers, moveMapToLocation]);

  // --- 지도 모드 전환 시 맵 컨테이너가 새로 생기면 초기화 ---
  useEffect(() => {
    if (viewMode !== 'map') return;

    const tryInitMap = () => {
      const container = document.getElementById('map');
      if (!container || mapInitializedRef.current) return;

      if (window.kakao && window.kakao.maps) {
        const mapCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
        const kakaoMap = new window.kakao.maps.Map(container, { center: mapCenter, level: 4 });
        kakaoMap.setDraggable(true);
        kakaoMap.setZoomable(true);
        mapRef.current = kakaoMap;
        mapInitializedRef.current = true;

        window.kakao.maps.event.addListener(kakaoMap, 'click', () => {
          setIsSliderOpen((prev) => !prev);
        });

        const stores = filterMode === 'favorites' ? favoriteStores : allStores;
        drawMarkers(stores);
      }
    };

    // DOM 렌더 후 약간의 딜레이
    const timer = setTimeout(tryInitMap, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // --- 뷰 모드 전환 시 맵 ref 리셋 ---
  useEffect(() => {
    if (viewMode === 'list') {
      mapRef.current = null;
      mapInitializedRef.current = false;
    }
  }, [viewMode]);

  // ============================================================
  // 무한 스크롤 (가게 목록 모드)
  // ============================================================
  const currentStores = filterMode === 'favorites' ? favoriteStores : allStores;
  const displayedStores = currentStores.slice(0, displayCount);
  const hasMore = displayCount < currentStores.length;

  // 필터 변경 시 스크롤 리셋
  useEffect(() => {
    setDisplayCount(5);
  }, [filterMode]);

  useEffect(() => {
    if (viewMode !== 'list') return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => prev + 5);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [viewMode, hasMore]);

  // ============================================================
  // 검색 결과 처리
  // ============================================================
  const handleSelectSearchResult = async (searchData: SearchApiResponse) => {
    setIsSearchModalOpen(false);

    const coords = await getCoordsFromAddress(searchData.storeAddress);
    if (!coords) {
      alert('매장의 위치 정보를 찾을 수 없습니다.');
      return;
    }

    const dist = getDistanceFromLatLonInMeters(center.lat, center.lng, coords.lat, coords.lng);

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

    // 검색 시 지도 모드로 전환하여 해당 매장 표시
    setViewMode('map');
    setSelectedStore(newStore);
    setIsSliderOpen(true);

    // 약간 딜레이 후 마커 그리기 (맵 초기화 대기)
    setTimeout(() => {
      if (mapRef.current) {
        clearMarkers();

        const imageSize = new window.kakao.maps.Size(35, 35);
        const imageOption = { offset: new window.kakao.maps.Point(17.5, 35) };
        const markerImage = new window.kakao.maps.MarkerImage(marker_icon.src, imageSize, imageOption);

        const pos = new window.kakao.maps.LatLng(newStore.lat, newStore.lng);
        const marker = new window.kakao.maps.Marker({ position: pos, map: mapRef.current, title: newStore.name, image: markerImage });

        const content = `<div class="custom-overlay-label" style="padding:2px 5px;background:white;border:1px solid #ccc;border-radius:4px;font-size:11px;">${newStore.name}</div>`;
        const overlay = new window.kakao.maps.CustomOverlay({ position: pos, content, xAnchor: 0.5, yAnchor: 2.2 });
        overlay.setMap(mapRef.current);

        window.kakao.maps.event.addListener(marker, 'click', () => {
          setSelectedStore(newStore);
          setIsSliderOpen(true);
          moveMapToLocation(newStore.lat, newStore.lng);
        });

        markersRef.current.push(marker);
        overlaysRef.current.push(overlay);

        moveMapToLocation(newStore.lat, newStore.lng);
      }
    }, 200);
  };

  // ============================================================
  // 렌더링
  // ============================================================
  return (
    <div className="w-full h-screen flex flex-col relative overflow-hidden bg-white">
      <style>{`
        .custom-overlay-label {
          font-size: 12px;
          font-weight: 600;
          color: black;
          white-space: nowrap;
        }
      `}</style>

      {/* ===== 헤더 영역 ===== */}
      <div className="shrink-0 px-5 pt-4 pb-2">
        {/* 타이틀 + 검색 아이콘 */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-[25px] font-semibold">Map</h1>
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF6B00] cursor-pointer"
          >
            <Image
              src="/assets/searchIcon.png"
              alt="검색"
              className="brightness-0 invert"
              width={18}
              height={18}
            />
          </button>
        </div>

        {/* 가게 목록 / 지도 라디오탭 */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-3">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
              viewMode === 'list'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-400'
            }`}
          >
            가게 목록
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
              viewMode === 'map'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-400'
            }`}
          >
            지도
          </button>
        </div>

        {/* 내 주변 / 즐겨찾기 필터탭 */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterMode('nearby')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm ${
              filterMode === 'nearby'
                ? 'bg-(--main-color) text-white'
                : 'bg-white text-black border-gray-200 hover:bg-gray-100'
            }`}
          >
            내 주변
          </button>
          <button
            onClick={() => setFilterMode('favorites')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm ${
              filterMode === 'favorites'
                ? 'bg-(--main-color) text-white'
                : 'bg-white text-black border-gray-200 hover:bg-gray-100'
            }`}
          >
            즐겨찾기
          </button>
        </div>
      </div>

      {/* ===== 메인 콘텐츠 영역 ===== */}
      <div className="flex-1 overflow-hidden relative">
        {/* ---------- 가게 목록 모드 ---------- */}
        {viewMode === 'list' && (
          <div className="h-full overflow-y-auto pb-24 px-5">
            {currentStores.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-sm">
                  {filterMode === 'favorites'
                    ? '즐겨찾기한 매장이 없습니다.'
                    : '주변에 매장이 없습니다.'}
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 mt-2 mb-3">
                  총 {currentStores.length}개 매장
                </p>

                {displayedStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center gap-3 py-3 border-b border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/store/${store.id}`)}
                  >
                    {/* 매장 이미지 */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {store.image ? (
                        <Image
                          src={store.image}
                          alt={store.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          No IMG
                        </div>
                      )}
                    </div>

                    {/* 매장 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[15px] text-gray-900 truncate">
                          {store.name}
                        </h3>
                        <span className="text-xs text-gray-400 shrink-0">
                          {store.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {store.address}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {(store.distance ?? 0) > 0 && (
                          <span className="text-xs text-[#FF6B00] font-medium">
                            {formatDistance(store.distance ?? 0)}
                          </span>
                        )}
                        {store.description && store.description !== '이벤트 정보 없음' && (
                          <span className="text-xs text-gray-400 truncate">
                            {store.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 화살표 */}
                    <div className="shrink-0 text-gray-300">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                ))}

                {/* 무한 스크롤 트리거 */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FF6B00] rounded-full animate-spin" />
                  </div>
                )}

                {!hasMore && currentStores.length > 5 && (
                  <p className="text-center text-xs text-gray-300 py-4">
                    모든 매장을 불러왔습니다
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ---------- 지도 모드 ---------- */}
        {viewMode === 'map' && (
          <>
            <div id="map" className="w-full h-full touch-none" />

            {/* 바텀 시트 */}
            {isSliderOpen && filterMode === 'favorites' && (
              <FavoriteBottomSheet
                stores={favoriteStores}
                onStoreClick={(store: Store) => moveMapToLocation(store.lat, store.lng)}
                onDeleteRequest={handleDeleteFavorite}
              />
            )}

            {isSliderOpen && filterMode === 'nearby' && (
              <StoreSlider
                stores={allStores}
                selectedStore={selectedStore}
                isOpen={isSliderOpen}
                onStoreSelect={(store: Store) => {
                  setSelectedStore(store);
                  setIsSliderOpen(true);
                  moveMapToLocation(store.lat, store.lng);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* ===== 하단 네비게이션 ===== */}
      <UserBottomBar />

      {/* ===== 검색 모달 ===== */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectStore={handleSelectSearchResult}
      />
    </div>
  );
}