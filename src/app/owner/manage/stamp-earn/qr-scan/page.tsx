'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { BackButton3 } from '@/components/BackButton3';
import { requestStampEarn } from '@/lib/api/owner/OwnerQR';

// --- 내부 컴포넌트: 확인 모달 ---
interface ConfirmModalProps {
  userEmail: string;
  onConfirm: (count: number) => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  userEmail,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const [count, setCount] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white w-full max-w-[320px] rounded-[20px] overflow-hidden p-6">
        <h2 className="text-[16px] font-bold text-center mb-6">
          다음 회원에게 적립하시겠습니까?
        </h2>
        {/* 스캔된 정보 표시 영역 */}
        <div className="flex flex-col gap-1 mb-4 bg-gray-50 p-4 rounded-xl">
          <div className="flex justify-between text-[14px]">
            {/* 현재 API로는 이메일만 알 수 있으므로 이름 대신 이메일 표시 */}
            <span className="text-gray-500">회원정보</span>
            <span className="font-bold truncate max-w-[150px]">
              {userEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 mb-6">
          <span className="text-[14px] font-medium">스탬프 개수</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => count > 1 && setCount((c) => c - 1)}
              className="w-8 h-8 border rounded-full text-gray-500 flex items-center justify-center hover:bg-gray-100"
            >
              -
            </button>
            <span className="text-[20px] font-bold text-[#FF6B00]">
              {count}
            </span>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="w-8 h-8 border rounded-full text-gray-500 flex items-center justify-center hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-600 font-bold"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(count)}
            className="flex-1 py-3 bg-[#FF6B00] rounded-xl text-white font-bold"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 메인 페이지 ---
export default function QRScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] =
    useState<string>('가게 정보를 불러오는 중...');

  const [showModal, setShowModal] = useState(false);
  const [scannedUserEmail, setScannedUserEmail] = useState<string>(''); // 변경: QR 내용이 이메일임
  const [storeId, setStoreId] = useState<number | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // 1. 가게 정보(StoreId) 로드
  useEffect(() => {
    const fetchStoreId = async () => {
      const apiUri = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setStatusMessage('로그인이 필요합니다.');
        return;
      }

      try {
        const response = await fetch(`${apiUri}/v1/managers/profile`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const json = await response.json();
          // 데이터 구조 안전하게 접근
          const id = json.data?.store?.storeId || json.data?.storeId;
          if (id) {
            setStoreId(id);
            setStatusMessage('QR 코드를 스캔해주세요.');
          } else {
            setStatusMessage('가게 ID를 찾을 수 없습니다.');
          }
        } else {
          setStatusMessage('가게 정보를 불러오지 못했습니다.');
        }
      } catch (e) {
        console.error(e);
        setStatusMessage('서버 오류 발생');
      }
    };
    fetchStoreId();
  }, []);

  // 2. 스캔 시작 로직
  const startScanning = async () => {
    if (storeId === null) {
      setStatusMessage('가게 정보 로딩 실패. 다시 시도해주세요.');
      return;
    }
    setScanResult(null);
    setStatusMessage('QR 코드를 사각형 안에 맞춰주세요.');
    setIsScanning(true);

    // 카메라 초기화 지연 (UI 렌더링 확보)
    setTimeout(async () => {
      // 기존 인스턴스 정리
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // ignore error
        }
      }

      const html5QrCode = new Html5Qrcode('reader');
      scannerRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: 'environment' }, // 후면 카메라
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // [스캔 성공 시]
            // decodedText는 유저의 "이메일"이라고 가정
            console.log('QR Scanned (Email):', decodedText);

            setIsScanning(false);
            html5QrCode.stop().then(() => {
              scannerRef.current = null;
            });

            setScannedUserEmail(decodedText); // 이메일 저장
            setShowModal(true); // 모달 오픈
          },
          () => {
            // 스캔 실패/대기 중 (보통 무시)
          }
        );
      } catch (err) {
        console.error('Camera start error:', err);
        setStatusMessage('카메라 실행 실패. 권한을 확인해주세요.');
        setIsScanning(false);
      }
    }, 300);
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        console.error(e);
      }
    }
    setIsScanning(false);
    setStatusMessage('스캔 중지');
  };

  // 3. 모달 확인 -> API 호출
  const handleConfirmEarn = async (count: number) => {
    setShowModal(false);
    setStatusMessage('적립 요청 중...');

    if (!storeId || !scannedUserEmail) {
      setScanResult('정보 누락');
      return;
    }

    try {
      // 변경된 API 호출 (userId 대신 email 전달)
      const res = await requestStampEarn(storeId, scannedUserEmail, count);

      if (res.code === 100 || res.code === 200 || res.code === 0) {
        setScanResult('적립 성공!');
        setStatusMessage(`${count}개 적립 완료!`);
      } else {
        setScanResult('적립 실패');
        setStatusMessage(res.message || '오류 발생');
      }
    } catch (e) {
      console.error(e);
      setScanResult('에러');
      setStatusMessage('통신 오류');
    }
  };

  // 클린업: 컴포넌트 언마운트 시 스캐너 정지
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#222] flex flex-col items-center justify-center relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton3 />
      </div>

      <div className="relative w-[300px] h-[300px] bg-black rounded-2xl overflow-hidden border border-gray-600">
        <style>
          {`
      #reader video {
        object-fit: cover !important;
        width: 100% !important;
        height: 100% !important;
        border-radius: 1rem; /* 부모 rounded-2xl에 맞춤 */
      }
    `}
        </style>
        <div id="reader" className="w-full h-full aspect-square" />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            {scanResult ? '스캔 완료' : '카메라 꺼짐'}
          </div>
        )}
      </div>

      <div className="mt-6 text-center h-[60px]">
        {scanResult ? (
          <p className="text-[#FF6B00] text-xl font-bold">{scanResult}</p>
        ) : (
          <p className="text-white text-sm">{statusMessage}</p>
        )}
      </div>

      <div className="mt-8">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="px-8 py-3 bg-[#FF6B00] rounded-full text-white font-bold"
          >
            스캔 시작
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="px-8 py-3 bg-white rounded-full text-black font-bold"
          >
            중지
          </button>
        )}
      </div>

      {showModal && (
        <ConfirmModal
          userEmail={scannedUserEmail}
          onConfirm={handleConfirmEarn}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
