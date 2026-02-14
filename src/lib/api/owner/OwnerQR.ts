import axios from 'axios';

export interface ScanResponse {
  timestamp: string;
  code: number;
  message: string;
  data: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * [Owner] 스탬프 적립 요청
 * 변경된 명세: POST /v1/qr/scan?storeId={storeId}&email={email}&stampCount={stampCount}
 */
export const requestStampEarn = async (
  storeId: number,
  email: string,
  stampCount: number
): Promise<ScanResponse> => {
  try {
    console.log(
      `[API] 적립 요청: storeId=${storeId}, email=${email}, count=${stampCount}`
    );

    // POST 요청이지만 파라미터는 쿼리 스트링으로 전달
    const response = await axios.post<ScanResponse>(
      `${BASE_URL}/v1/qr/scan`,
      {},
      {
        params: {
          storeId,
          email,
          stampCount,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('스탬프 적립 요청 실패:', error);
    throw error;
  }
};