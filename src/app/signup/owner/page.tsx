'use client' // ⭐ 필수! (useState, useEffect 사용)

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BackButton from '@/components/BackButton'
import SignupInput, {
  type OwnerSignupFormData,
} from '@/components/SignupInput'
import { AddressModal } from '@/components/AddressModal'

export default function OwnerSignupPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof OwnerSignupFormData, string>>>({})

  useEffect(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }, [])
  
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
  })

  const validateForm = () => {
    const newErrors: Partial<Record<keyof OwnerSignupFormData, string>> = {}
    let isValid = true

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.loginId) {
      newErrors.loginId = '필수 입력 사항입니다.'
      isValid = false
    }

    if (!formData.email) {
      newErrors.email = '필수 입력 사항입니다.'
      isValid = false
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = '필수 입력 사항입니다.'
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.'
      isValid = false
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
      isValid = false
    }

    if (!formData.emailVerificationToken) {
      newErrors.emailConfirm = '이메일 인증을 완료해주세요.'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleOwnerData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVerificationSuccess = (token: string) => {
    setFormData((prev) => ({
      ...prev,
      emailVerificationToken: token,
    }))
    setErrors((prev) => ({ ...prev, emailConfirm: undefined }))
    console.log('토큰 저장 완료:', token)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      console.log(errors, '폼 유효성 검사 실패')
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/manager/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            loginId: formData.loginId,
            password: formData.password,
            passwordConfirm: formData.passwordConfirm,
            email: formData.email,
            businessNum: formData.businessNumber,
            address: formData.location,
            latitude: formData.latitude,
            longitude: formData.longitude,
            emailVerificationToken: formData.emailVerificationToken,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('서버 에러 상세:', errorData)
        throw new Error(
          errorData.message ||
            '회원가입 요청이 거절되었습니다. 아이디나 이메일 중복을 확인해주세요.'
        )
      }

      alert('가입이 완료되었습니다!')
      router.push('/signup/owner/profile')
    } catch (error: any) {
      console.error('회원가입 오류:', error)
      alert(error.message)
    }
  }

  const handleAddressSearch = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleAddressSelect = (data: {
    address: string
    x: string
    y: string
  }) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      location: data.address,
      longitude: parseFloat(data.x),
      latitude: parseFloat(data.y),
    }))

    setErrors((prevErrors) => ({
      ...prevErrors,
      location: undefined,
    }))
    setIsModalOpen(false)
  }

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="w-full flex flex-row items-center self-start mt-3 gap-4 px-6">
        <BackButton />
        <p>점주 회원가입</p>
      </div>
      <div className="w-screen h-px mt-3 bg-gray-200" />

      {/* 입력 폼 */}
      <div className="flex items-start flex-col mt-10 gap-4 w-[332px]">
        {/* 1. 이메일 입력창 */}
        <SignupInput
          label="이메일"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleOwnerData}
          error={errors.email}
          variant="email"
          placeholder="이메일 주소 입력"
        />
        {/* 2. 인증번호 입력창 */}
        <SignupInput
          label=""
          name="emailConfirm"
          type="text"
          value={formData.emailConfirm}
          onChange={handleOwnerData}
          error={errors.emailConfirm}
          variant="emailConfirm"
          placeholder="인증번호"
          emailForVerification={formData.email}
          onVerifySuccess={handleVerificationSuccess}
        />
        <SignupInput
          label="아이디"
          name="loginId"
          type="text"
          value={formData.loginId}
          onChange={handleOwnerData}
          error={errors.loginId}
        />
        <SignupInput
          label="비밀번호"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleOwnerData}
          error={errors.password}
        />
        <SignupInput
          label="비밀번호 확인"
          name="passwordConfirm"
          type="password"
          value={formData.passwordConfirm}
          onChange={handleOwnerData}
          error={errors.passwordConfirm}
        />
        <SignupInput
          label="사업자등록번호"
          name="businessNumber"
          type="text"
          placeholder="꼭 하이픈('-')을 빼고 입력해주세요."
          value={formData.businessNumber}
          onChange={handleOwnerData}
          error={errors.businessNumber}
        />
        <SignupInput
          label="가게 주소"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleOwnerData}
          readOnly={true}
          error={errors.location}
          variant="address"
          onButtonClick={handleAddressSearch}
          placeholder="지번, 도로명, 건물명으로 검색"
        />
      </div>

      <div className="flex justify-center mt-6">
        <button
          className="bg-(--main-color) text-white rounded-[40px] w-[316px] h-[50px] font-bold mb-10"
          onClick={handleSubmit}
        >
          가입하기
        </button>
      </div>

      {isModalOpen && (
        <AddressModal
          onClose={handleCloseModal}
          onSelect={handleAddressSelect}
        />
      )}
    </div>
  )
}