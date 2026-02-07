'use client';

import React from 'react';
import { sendEmailVerificationCode, verifyEmailCode } from '@/api/email'; // 분리한 API 사용

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
  name: keyof OwnerSignupFormData | keyof CustomerSignupFormData;
  type: 'text' | 'password' | 'email';
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  variant?: 'default' | 'address' | 'email' | 'emailConfirm';
  onButtonClick?: () => void;
  readOnly?: boolean;
  emailForVerification?: string;
  /** 이메일 인증 성공 시 emailVerificationToken을 부모에게 전달 */
  onVerifySuccess?: (token: string) => void;
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
}: SignupInputProps) => {
  
  const handleButtonClick = async () => {
    try {
      if (variant === 'email') {
        // [리팩토링] 분리된 API 함수 사용
        await sendEmailVerificationCode(value);
        alert('인증번호가 전송되었습니다!');
      } else if (variant === 'emailConfirm') {
        if (emailForVerification) {
          // [리팩토링] 분리된 API 함수 사용
          const token = await verifyEmailCode(emailForVerification, value);
          alert('이메일 인증이 완료되었습니다!');
          
          if (token && onVerifySuccess) {
            onVerifySuccess(token);
          }
        } else {
          console.error('검증할 이메일 주소가 전달되지 않았습니다.');
          alert('이메일을 먼저 입력해주세요.');
        }
      } else if (onButtonClick) {
        // 주소 찾기 등 다른 버튼 동작
        onButtonClick();
      }
    } catch (error: any) {
      console.error('인증 오류:', error);
      alert(error.message);
    }
  };

  const hasButton =
    variant === 'address' || variant === 'email' || variant === 'emailConfirm';

  return (
    <div className="flex flex-col w-full">
      <label htmlFor={name} className="mb-2 text-[15px] text-[#5B5B5B]">
        {label}
      </label>
      {hasButton ? (
        // 이메일/인증번호/주소 입력창 (버튼 포함)
        <div className="flex flex-col">
          <div className="flex flex-row gap-5">
            <input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              readOnly={readOnly}
              className="text-[14px] border border-gray-300 pl-3 rounded-[10px] w-full h-[48px] transition-all"
            />
            <button
              type="button"
              onClick={handleButtonClick}
              className="w-[68px] h-[48px] bg-[var(--fill-color1)] rounded-[10px] text-[12px] text-[#5B5B5B] shrink-0 cursor-pointer hover:bg-gray-300 active:bg-[var(--fill-color3)] transition-colors"
            >
              {variant === 'email' && (
                <>
                  인증번호
                  <br />
                  전송
                </>
              )}
              {variant === 'emailConfirm' && '확인'}
              {variant === 'address' && '주소 찾기'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      ) : (
        // 기본 입력창 (버튼 없음)
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