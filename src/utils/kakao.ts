const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!; 

export const getKakaoLoginUrl = () =>
  `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;