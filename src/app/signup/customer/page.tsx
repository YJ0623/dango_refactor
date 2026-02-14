'use client'; // 1. 클라이언트 컴포넌트 선언

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import SignupInput, { type CustomerSignupFormData } from '@/components/SignupInput';

export default function CustomerSignUpPage() {
  const router = useRouter();

  // 토큰 초기화 로직
  useEffect(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerSignupFormData, string>>>({}); // 유효성 검사 오류 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 상태 관리
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 여부
  const [isIdChecked, setIsIdChecked] = useState(false);       // 아이디 중복 확인 여부

  const [formData, setFormData] = useState<CustomerSignupFormData>({
    loginId: '',
    password: '',
    passwordConfirm: '',
    email: '',
    emailConfirm: '',
    nickname: '',
    emailVerificationToken: '',
  });

  // 유효성 검사 로직
  const validateForm = () => {
    const newErrors: Partial<Record<keyof CustomerSignupFormData, string>> = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.loginId) {
      newErrors.loginId = '필수 입력 사항입니다.';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = '필수 입력 사항입니다.';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = '필수 입력 사항입니다.';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
      isValid = false;
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
      isValid = false;
    }

    if (!formData.emailVerificationToken) {
      newErrors.emailConfirm = '이메일 인증을 완료해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'loginId') {
      setIsIdChecked(false);
      setErrors((prev) => ({ ...prev, loginId: undefined }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerificationSuccess = (token: string) => {
    setFormData((prev) => ({ ...prev, emailVerificationToken: token }));
    setErrors((prev) => ({ ...prev, emailConfirm: undefined }));
    setIsEmailVerified(true); // 인증 완료 상태 설정
  };
  
  const handleCheckDuplicate = async () => {
    // 1. 아이디 입력 확인
    if (!formData.loginId) {
      setErrors((prev) => ({ ...prev, loginId: '아이디를 입력해주세요.' }));
      return;
    }

    try {
      // 2. 백엔드 API 호출 (GET 방식)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/check-id?loginId=${formData.loginId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // 3. 서버 응답 처리
      if (response.ok) {
        const jsonResponse = await response.json();
        // ApplicationResponse 구조: { code: ..., message: ..., data: boolean }
        const isDuplicate = jsonResponse.data; 

        if (isDuplicate) {
          setIsIdChecked(false); // 체크 실패 상태로 유지
          setErrors((prev) => ({ 
            ...prev, 
            loginId: '이미 사용 중인 아이디입니다.' 
          }));
        } else {
          // [CASE 2] 사용 가능한 아이디 (data: false)
          setIsIdChecked(true); 
          alert('사용 가능한 아이디입니다.');
          setErrors((prev) => ({ ...prev, loginId: undefined }));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || '중복 확인 중 오류가 발생했습니다.');
        setIsIdChecked(false);
      }
    } catch (error) {
      console.error('중복 확인 통신 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
      setIsIdChecked(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = {
        loginId: formData.loginId,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        email: formData.email,
        nickname: formData.nickname,
        emailVerificationToken: formData.emailVerificationToken,
      };

      // 3. 환경변수 변경 (Vite -> Next.js)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/user/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '회원가입 요청이 거절되었습니다.');
      }

      const responseData = await response.json();
      // 백엔드 응답 구조 유연하게 처리
      const resultData = responseData.result || responseData.data || responseData;
      const { accessToken, refreshToken } = resultData;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        alert('가입이 완료되었습니다!');
        // 4. 페이지 이동 변경
        router.push('/signup/customer/confirm');
      } else {
        throw new Error('토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white pb-10">
      <div className="flex flex-row items-center self-start mt-3 gap-4 px-6 w-full">
        <BackButton />
        <p className="font-medium">개인 회원가입</p>
      </div>
      
      <div className="w-full h-px mt-3 bg-gray-200" />

      <div className="flex items-start flex-col mt-10 w-full max-w-[332px] px-4">
        {/* 1. 이메일 입력창 */}
        <SignupInput
          label="이메일"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          variant="email"
          placeholder="이메일 주소 입력"
          buttonDisabled={isEmailVerified}
        />

        {/* 2. 인증번호 입력창 */}
        <SignupInput
          label=""
          name="emailConfirm"
          type="text"
          value={formData.emailConfirm}
          onChange={handleInputChange}
          error={errors.emailConfirm}
          variant="emailConfirm"
          placeholder="인증번호"
          emailForVerification={formData.email}
          onVerifySuccess={handleVerificationSuccess}
          buttonDisabled={isEmailVerified}
        />

        <div className="flex flex-col items-start w-full mt-10 gap-2.5">
          <SignupInput
            label="아이디"
            name="loginId"
            type="text"
            value={formData.loginId}
            onChange={handleInputChange}
            error={errors.loginId}
            variant="idCheck"
            onCheckDuplicate={handleCheckDuplicate}
            buttonDisabled={isIdChecked}
          />
          <SignupInput
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            placeholder="10-20자의 영문, 숫자 포함"
          />
          <SignupInput
            label="비밀번호 확인"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            error={errors.passwordConfirm}
          />
          <SignupInput
            label="닉네임"
            name="nickname"
            type="text"
            value={formData.nickname}
            onChange={handleInputChange}
            error={errors.nickname}
            placeholder="1-10자 이내"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
        <div className="flex justify-center mt-12 mb-10">
          <button
            type="submit"
            // 5. Tailwind CSS 변수 문법 수정 (안전한 방식)
            className="bg-[var(--main-color)] text-white rounded-[40px] w-[316px] h-[50px] font-bold disabled:opacity-50 transition-opacity"
            disabled={isSubmitting || !isEmailVerified || !isIdChecked}
          >
            {isSubmitting ? '처리 중...' : '가입하기'}
          </button>
        </div>
      </form>
    </div>
  );
}