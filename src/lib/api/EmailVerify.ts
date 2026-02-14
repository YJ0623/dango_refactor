/* eslint-disable @typescript-eslint/no-explicit-any */

type EmailVerifyResponse = {
  timestamp: string;
  code: number;
  message: string;
  data?: {
    emailVerificationToken?: string;
  };
};

export async function sendEmailVerificationCode(email: string) {
  if (!email) {
    alert('이메일을 입력해주세요.');
    return;
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/email/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );
    if (!response.ok) {
      throw new Error('인증번호 전송에 실패했습니다. 다시 시도해주세요.');
    }
    alert('인증번호가 전송되었습니다!');
  } catch (error: any) {
    console.error('인증번호 전송 오류:', error);
    alert(error.message);
  }
}

/**
 * 이메일 + 인증코드를 서버에 검증시키고, 성공 시 emailVerificationToken을 반환.
 * 실패하거나 토큰이 없으면 null 반환.
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<string | null> {
  if (!email || !code) {
    alert('이메일과 인증번호를 모두 확인해주세요.');
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/email/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      }
    );

    if (!response.ok) {
      let message = '인증에 실패했습니다. 인증번호를 확인해주세요.';

      try {
        const errorData = (await response.json()) as Partial<EmailVerifyResponse>;
        if (errorData?.message) message = errorData.message;
      } catch {
      }

      throw new Error(message);
    }

    const result = (await response.json()) as EmailVerifyResponse;

    console.log('email/verify 응답:', result);

    const token = result?.data?.emailVerificationToken;

    if (!token) {
      alert(
        '이메일 인증은 되었으나 토큰을 받지 못했습니다. 관리자에게 문의해주세요.'
      );
      return null;
    }

    alert('이메일 인증이 완료되었습니다!');
    return token;
  } catch (error: any) {
    console.error('이메일 인증 오류:', error);
    alert(error.message);
    return null;
  }
}
