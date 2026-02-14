'use client';

import React, { useState, useRef, type ChangeEvent, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BackButton from '@/components/BackButton';
import Image from 'next/image';

// .env 환경변수 사용 (Vite 기준)
const API_URI = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function StoreReview() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;

  // 1. 별점 상태 관리
  const [score, setScore] = useState<number>(0);
  const [hoverScore, setHoverScore] = useState<number>(0);

  // 2. 리뷰 텍스트 상태 관리
  const [content, setContent] = useState<string>('');

  // 3. 이미지 상태 관리 (단일 파일)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 별점 클릭 핸들러
  const handleStarClick = (idx: number) => {
    setScore(idx + 1);
  };

  // 이미지 업로드 핸들러 (단일 파일)
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];

    // 상태 업데이트 (기존 파일 덮어쓰기)
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // input 초기화 (같은 파일 다시 선택 가능하게)
    e.target.value = '';
  };

  // 박스 클릭 시 파일 선택 트리거
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // API 전송 핸들러
  const handleSubmit = async () => {
    // 1. 유효성 검사
    if (!storeId) {
      alert('가게 정보를 찾을 수 없습니다.');
      return;
    }
    if (score === 0) {
      alert('별점을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('후기 내용을 입력해주세요.');
      return;
    }

    // 2. FormData 생성
    const formData = new FormData();

    // [수정된 부분] ---------------------------------------------------
    // 개별 append가 아니라, 하나의 객체로 묶어서 'data' 키에 넣어야 합니다.

    const requestData = {
      storeId: Number(storeId), // 숫자로 변환 (서버 스펙에 맞춤)
      rate: score,
      content: content,
    };

    formData.append('data', JSON.stringify(requestData));
    
    if (imageFile) {
      formData.append('reviewImage', imageFile);
    }

    try {
      const response = await fetch(`${API_URI}/v1/reviews`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('리뷰가 성공적으로 등록되었습니다!');
        router.back(); // 이전 페이지로 이동
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* 헤더 영역 */}
      <header className="relative flex items-center justify-center p-4 border-b border-gray-200 flex-shrink-0">
        <div className="absolute left-4">
          <BackButton />
        </div>
        <h1 className="text-[16px] font-semibold">Store Review</h1>
      </header>

      <div className="flex flex-col items-center justify-center mt-[60px] px-4">
        {/* 1. 별점 섹션 */}
        <p className="font-medium text-[color:var(--fill-color7)] text-[20px]">
          후기를 작성해보세요!
        </p>
        <div className="flex flex-row w-[200px] h-[40px] items-center justify-between mt-4">
          {[0, 1, 2, 3, 4].map((idx) => (
            <Image
              key={idx}
              src={idx < (hoverScore || score) ? '/assets/star_full_icon.png' : '/assets/emptystar.svg'}
              alt={`star-${idx + 1}`}
              className="w-[35px] h-[35px] cursor-pointer transition-transform hover:scale-110"
              onMouseEnter={() => setHoverScore(idx + 1)}
              onMouseLeave={() => setHoverScore(0)}
              onClick={() => handleStarClick(idx)}
              width={35}
              height={35}
            />
          ))}
        </div>

        {/* 2. 사진 업로드 섹션 (단일 이미지 수정됨) */}
        <div className="flex flex-row items-center justify-center mt-10">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* 이미지가 없으면: 사진 추가 아이콘
            이미지가 있으면: 해당 이미지 미리보기 
            클릭 시 파일 변경 가능
          */}
          <div
            onClick={triggerFileInput}
            className="w-[100px] h-[100px] rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform border border-gray-200 flex items-center justify-center bg-gray-50"
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="review-preview"
                className="w-full h-full object-cover"
                width={100}
                height={100}
              />
            ) : (
              <Image
                src='/assets/insert_photo_icon.png'
                alt="Add photo"
                className="opacity-80"
                width={70}
                height={70}
              />
            )}
          </div>
        </div>

        {/* 3. 텍스트 입력 섹션 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-[340px] h-[168px] border border-[var(--fill-color3)] rounded-[20px] p-4 mt-8 text-[13px] text-[var(--fill-color7)] placeholder:text-[var(--fill-color3)] focus:outline-none resize-none"
          placeholder={`유용한 후기를 알려주세요!\n작성 내용은 마이페이지와 가게 리뷰탭에 노출됩니다.`}
        />

        {/* 4. 등록 버튼 */}
        <button
          onClick={handleSubmit}
          className="mt-10 w-full max-w-[320px] h-[48px] bg-[var(--main-color)] text-white py-3 rounded-[40px] font-bold transition-colors cursor-pointer hover:opacity-90"
        >
          등록하기
        </button>
      </div>
    </div>
  );
};
