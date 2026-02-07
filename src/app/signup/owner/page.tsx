'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import SignupInput, { type OwnerSignupFormData } from '@/components/SignupInput';

export default function OwnerSignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<OwnerSignupFormData>({
    loginId: '',
    password: '',
    passwordConfirm: '',
    email: '',
    emailConfirm: '',
    businessNumber: '',
    location: '',
    latitude: 0,
    longitude: 0,
    emailVerificationToken: '',
  });

  const [isBusinessVerified, setIsBusinessVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 입력 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'businessNumber') setIsBusinessVerified(false);
    if (name === 'email') setFormData(prev => ({ ...prev, emailVerificationToken: '' }));
  };

  // 사업자 조회 및 이메일 인증 핸들러 (기존과 동일)
  const handleBusinessCheck = async () => {
    if (!formData.businessNumber) return alert('사업자 번호를 입력해주세요.');
    try {
      const response = await fetch('/api/external/nts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessNumber: formData.businessNumber }),
      });
      const result = await response.json();
      if (result.valid) {
        alert('유효한 사업자 번호입니다.');
        setIsBusinessVerified(true);
      } else {
        alert('유효하지 않거나 휴/폐업된 사업자 번호입니다.');
        setIsBusinessVerified(false);
      }
    } catch (error) {
      alert('사업자 조회 중 오류가 발생했습니다.');
    }
  };

  const handleVerificationSuccess = (token: string) => {
    setFormData(prev => ({ ...prev, emailVerificationToken: token }));
  };

  // [핵심 변경] 다음 버튼 클릭 시 -> "회원가입 + 로그인" 수행
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.loginId || !formData.password || !formData.email) return alert('필수 정보를 입력해주세요.');
    if (formData.password !== formData.passwordConfirm) return alert('비밀번호가 일치하지 않습니다.');
    if (!isBusinessVerified) return alert('사업자 번호 조회를 완료해주세요.');
    if (!formData.emailVerificationToken) return alert('이메일 인증을 완료해주세요.');

    if (isSubmitting) return;
    setIsSubmitting(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      // 1. 회원가입 요청
      const joinResponse = await fetch(`${apiUrl}/v1/auth/manager/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: formData.loginId,
          password: formData.password,
          email: formData.email,
          name: formData.loginId, // 이름 필드 대체
          role: 'MANAGER',
          businessNumber: formData.businessNumber
        }),
      });

      if (!joinResponse.ok && joinResponse.status !== 409) {
        const errorText = await joinResponse.text();
        throw new Error(errorText);
      }

      // 2. 로그인 요청 (토큰 발급)
      const loginResponse = await fetch(`${apiUrl}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: formData.loginId,
          password: formData.password
        }),
      });

      if (!loginResponse.ok) throw new Error('회원가입 후 로그인 실패');

      const loginResult = await loginResponse.json();
      const accessToken = loginResult.data?.accessToken || loginResult.accessToken;

      if (!accessToken) throw new Error('토큰을 받아오지 못했습니다.');

      // 3. 토큰 저장 및 페이지 이동
      localStorage.setItem('accessToken', accessToken);
      alert('기본 정보 등록이 완료되었습니다. 매장 정보를 입력해주세요.');
      router.push('/signup/owner/profile'); // 2단계 페이지로 이동

    } catch (error: any) {
      console.error('Error:', error);
      alert(`오류 발생: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmailVerified = !!formData.emailVerificationToken;

  return (
    <div className="flex flex-col items-center min-h-screen bg-white pb-10">
      <div className="flex flex-row items-center self-start mt-3 gap-4 px-6 w-full">
        <BackButton />
        <p className="font-medium">사장님 회원가입</p>
      </div>
      <div className="w-full h-px mt-3 bg-gray-200" />

      <form onSubmit={handleNext} className="flex flex-col items-center w-full max-w-[332px] px-4 mt-10">
        <div className="w-full gap-2.5 flex flex-col">
            <SignupInput label="아이디" name="loginId" type="text" value={formData.loginId} onChange={handleInputChange} />
            <SignupInput label="비밀번호" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="10-20자의 영문, 숫자 포함" />
            <SignupInput label="비밀번호 확인" name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleInputChange} />
        </div>

        <div className="w-full mt-4 gap-2.5 flex flex-col">
            <SignupInput label="이메일" name="email" type="email" value={formData.email} onChange={handleInputChange} variant="email" buttonDisabled={isEmailVerified} />
            <SignupInput label="" name="emailConfirm" type="text" value={formData.emailConfirm} onChange={handleInputChange} variant="emailConfirm" emailForVerification={formData.email} onVerifySuccess={handleVerificationSuccess} placeholder="인증번호 입력" buttonDisabled={isEmailVerified} />
        </div>

        <div className="w-full mt-4">
            <SignupInput label="사업자 등록번호" name="businessNumber" type="text" value={formData.businessNumber} onChange={handleInputChange} variant="business" onButtonClick={handleBusinessCheck} placeholder="- 없이 숫자만 입력" buttonDisabled={isBusinessVerified} />
            {isBusinessVerified && <p className="text-blue-500 text-xs mt-1">✅ 인증되었습니다.</p>}
        </div>

        <button
            type="submit"
            className="mt-12 bg-[var(--main-color)] text-white rounded-[40px] w-full h-[50px] font-bold disabled:opacity-50"
            disabled={isSubmitting}
        >
            {isSubmitting ? '처리 중...' : '다음'}
        </button>
      </form>
    </div>
  );
}