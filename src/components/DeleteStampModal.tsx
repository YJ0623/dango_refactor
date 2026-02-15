import React from 'react';

interface DeleteStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteStampModal({ isOpen, onClose, onConfirm }: DeleteStampModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    // 배경 (Backdrop) - 은은한 검정 배경 + 블러 효과
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      {/* 모달 박스 */}
      <div className="bg-white w-[280px] rounded-[14px] overflow-hidden shadow-xl transform transition-all">
        {/* 1. 메시지 영역 */}
        <div className="px-6 py-6 text-center">
          <p className="text-[13px] leading-relaxed text-gray-800 font-medium whitespace-pre-wrap">
            해당 스탬프판에 적립된 스탬프들이
            <br />
            모두 사라집니다. 삭제하시겠습니까?
          </p>
        </div>

        {/* 2. 버튼 영역 (가로 분할) */}
        <div className="flex border-t border-gray-200">
          {/* 취소 버튼 */}
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[15px] text-blue-600 font-normal hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            취소
          </button>

          {/* 세로 구분선 */}
          <div className="w-[1px] bg-gray-200"></div>

          {/* 확인 버튼 */}
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-[15px] text-blue-600 font-normal hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
