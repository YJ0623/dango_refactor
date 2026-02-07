import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { businessNumber } = await request.json();
    const serviceKey = process.env.NTS_SERVICE_KEY;

    if (!businessNumber) {
      return NextResponse.json({ error: '사업자 번호가 필요합니다.' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${serviceKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          b_no: [businessNumber.replaceAll('-', '')] 
        }),
      }
    );

    if (!response.ok) {
      throw new Error('국세청 API 호출 실패');
    }

    const data = await response.json();
    const resultData = data.data?.[0];

    // "01": 계속사업자, "02": 휴업자, "03": 폐업자
    const isValid = resultData?.b_stt_cd === '01'; 
    
    return NextResponse.json({ 
      valid: isValid,
      data: resultData 
    });

  } catch (error: any) {
    console.error('Business check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}