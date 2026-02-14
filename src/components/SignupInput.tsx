'use client';

import React from 'react';
import { sendEmailVerificationCode, verifyEmailCode } from '@/lib/api/email';

export interface OwnerSignupFormData {
  loginId: string;
  password: string;
  passwordConfirm: string;
  email: string;
  emailConfirm: string;
  businessNumber: string;
  location: string;
  latitude: number;
  longitude: number;
  emailVerificationToken: string;
}

export interface CustomerSignupFormData {
  loginId: string;
  password: string;
  passwordConfirm: string;
  email: string;
  emailConfirm: string;
  nickname: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  emailVerificationToken: string;
}

interface SignupInputProps {
  label: string;
  name: keyof OwnerSignupFormData | keyof CustomerSignupFormData | 'storeName';
  type: 'text' | 'password' | 'email';
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  // [수정] idCheck 타입 포함
  variant?: 'default' | 'address' | 'email' | 'emailConfirm' | 'business' | 'idCheck';
  onButtonClick?: () => void;
  readOnly?: boolean;
  emailForVerification?: string;
  onVerifySuccess?: (token: string) => void;
  buttonDisabled?: boolean;
  onCheckDuplicate?: () => void; // 아이디 중복 확인 콜백
}

const SignupInput = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  error,
  variant = 'default',
  onButtonClick,
  readOnly,
  emailForVerification,
  onVerifySuccess,
  buttonDisabled = false,
  onCheckDuplicate,
}: SignupInputProps) => {

  const handleButtonClick = async () => {
    if (buttonDisabled) return;

    try {
      if (variant === 'email') {
        await sendEmailVerificationCode(value);
        alert('인증번호가 전송되었습니다!');
      } else if (variant === 'emailConfirm') {
        if (emailForVerification) {
          const token = await verifyEmailCode(emailForVerification, value);
          alert('이메일 인증이 완료되었습니다!');
          
          if (token && onVerifySuccess) {
            onVerifySuccess(token);
          }
        } else {
          alert('이메일을 먼저 입력해주세요.');
        }
      } else if (variant === 'idCheck') {
        // [수정] idCheck일 경우 중복 확인 함수 실행
        if (onCheckDuplicate) onCheckDuplicate();
      } else if (onButtonClick) {
        // address, business 등 나머지 경우
        onButtonClick();
      }
    } catch (error: any) {
      console.error('인증 오류:', error);
      alert(error.message);
    }
  };

  // 버튼이 필요한 타입인지 확인
  const hasButton =
    variant === 'address' || 
    variant === 'email' || 
    variant === 'emailConfirm' || 
    variant === 'business' ||
    variant === 'idCheck';

  return (
    <div className="flex flex-col w-full">
      <label htmlFor={name} className="mb-2 text-[15px] text-[#5B5B5B]">
        {label}
      </label>
      
      {hasButton ? (
        <div className="flex flex-col">
          <div className="flex flex-row gap-5">
            <input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              // [수정] idCheck는 입력이 가능해야 하므로 readOnly 조건에서 제외하거나 필요시 조정
              readOnly={readOnly || (buttonDisabled && variant !== 'email' && variant !== 'idCheck')}
              className={`text-[14px] border border-gray-300 pl-3 rounded-[10px] w-full h-[48px] transition-all ${
                readOnly || (buttonDisabled && variant !== 'idCheck') 
                  ? 'bg-gray-100 text-gray-500' 
                  : 'bg-[var(--fill-color1)]'
              }`}
            />
            
            {/* 통합된 버튼 */}
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={buttonDisabled}
              // [수정] variant가 idCheck일 때 너비(w)와 색상을 다르게 적용
              className={`h-[48px] rounded-[10px] text-[12px] shrink-0 transition-colors flex items-center justify-center text-center
                ${variant === 'idCheck' ? 'w-[80px]' : 'w-[68px]'} 
                ${
                  buttonDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                    : variant === 'idCheck'
                      ? 'bg-[var(--main-color)] text-white hover:opacity-90' // 아이디 확인은 메인 컬러
                      : 'bg-[var(--fill-color1)] text-[#5B5B5B] hover:bg-gray-300 active:bg-[var(--fill-color3)]' // 나머지는 회색톤
                }
              `}
            >
              {variant === 'email' && (buttonDisabled ? '전송완료' : <>인증번호<br/>전송</>)}
              {variant === 'emailConfirm' && (buttonDisabled ? '인증됨' : '확인')}
              {variant === 'address' && '주소 찾기'}
              {variant === 'business' && (buttonDisabled ? '인증됨' : '조회')}
              {variant === 'idCheck' && (buttonDisabled ? '확인완료' : '중복확인')}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      ) : (
        <div>
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className="border-none pl-4 bg-[var(--fill-color1)] rounded-[10px] w-full h-[48px] transition-all mb-4 text-[14px]"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default SignupInput;