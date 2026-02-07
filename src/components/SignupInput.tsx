'use client';

import React from 'react';
import { sendEmailVerificationCode, verifyEmailCode } from '@/app/api/email';

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
  variant?: 'default' | 'address' | 'email' | 'emailConfirm' | 'business' | 'idCheck';
  onButtonClick?: () => void;
  readOnly?: boolean;
  emailForVerification?: string;
  onVerifySuccess?: (token: string) => void;
  buttonDisabled?: boolean; // [추가] 버튼 비활성화 제어용 Prop
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
  buttonDisabled = false, // [추가] 기본값 false
}: SignupInputProps) => {

  const handleButtonClick = async () => {
    if (buttonDisabled) return; // [추가] 비활성화 시 클릭 방지

    try {
      if (variant === 'email') {
        await sendEmailVerificationCode(value);
        alert('인증번호가 전송되었습니다!');
      } else if (variant === 'idCheck') { // [추가] 아이디 중복 확인 로직 연결
        if (onButtonClick) onButtonClick();
      }
      else if (variant === 'emailConfirm') {
        if (emailForVerification) {
          const token = await verifyEmailCode(emailForVerification, value);
          alert('이메일 인증이 완료되었습니다!');
          
          if (token && onVerifySuccess) {
            onVerifySuccess(token);
          }
        } else {
          alert('이메일을 먼저 입력해주세요.');
        }
      } else if (onButtonClick) {
        onButtonClick();
      }
    } catch (error: any) {
      console.error('인증 오류:', error);
      alert(error.message);
    }
  };

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
              readOnly={readOnly || (buttonDisabled && variant !== 'email')} // 인증 완료되면 입력창도 잠그고 싶다면 사용 (선택사항)
              className={`text-[14px] border border-gray-300 pl-3 rounded-[10px] w-full h-[48px] transition-all ${
                readOnly || buttonDisabled ? 'bg-gray-100 text-gray-500' : 'bg-[var(--fill-color1)]'
              }`}
            />
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={buttonDisabled} // [추가] 버튼 기능 비활성화
              className={`w-[68px] h-[48px] rounded-[10px] text-[12px] shrink-0 transition-colors flex items-center justify-center text-center
                ${buttonDisabled 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70' // [추가] 비활성화 스타일
                  : 'bg-[var(--fill-color1)] text-[#5B5B5B] cursor-pointer hover:bg-gray-300 active:bg-[var(--fill-color3)]' // 활성화 스타일
                }`}
            >
              {variant === 'email' && (buttonDisabled ? '전송완료' : <>인증번호<br/>전송</>)}
              {variant === 'emailConfirm' && (buttonDisabled ? '인증됨' : '확인')}
              {variant === 'address' && '주소 찾기'}
              {variant === 'business' && (buttonDisabled ? '인증됨' : '조회')}
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